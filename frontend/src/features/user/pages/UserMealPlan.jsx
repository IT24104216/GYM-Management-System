import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FreeBreakfastRoundedIcon from '@mui/icons-material/FreeBreakfastRounded';
import LunchDiningRoundedIcon from '@mui/icons-material/LunchDiningRounded';
import DinnerDiningRoundedIcon from '@mui/icons-material/DinnerDiningRounded';
import IcecreamRoundedIcon from '@mui/icons-material/IcecreamRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import { useAuth } from '@/shared/hooks/useAuth';
import { getUserDietitianMealPlan } from '../api/user.api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const fallbackMacroData = [
  { name: 'Protein', value: 140, color: '#0D9488' },
  { name: 'Carbs', value: 220, color: '#F59E0B' },
  { name: 'Fat', value: 65, color: '#8B5CF6' },
];

const fallbackWeeklyCals = [
  { day: 'M', cals: 2100 },
  { day: 'T', cals: 2300 },
  { day: 'W', cals: 1950 },
  { day: 'T', cals: 2400 },
  { day: 'F', cals: 2150 },
  { day: 'S', cals: 2600 },
  { day: 'S', cals: 2200 },
];

const fallbackMeals = [
  {
    type: 'Breakfast',
    icon: FreeBreakfastRoundedIcon,
    tone: '#d97706',
    bg: '#fef3c7',
    items: [
      { name: 'Oatmeal with Berries', cals: 350, p: 12, c: 60, f: 6 },
      { name: 'Whey Protein Shake', cals: 120, p: 24, c: 3, f: 1 },
    ],
    total: 470,
  },
  {
    type: 'Lunch',
    icon: LunchDiningRoundedIcon,
    tone: '#059669',
    bg: '#d1fae5',
    items: [
      { name: 'Grilled Chicken Salad', cals: 450, p: 45, c: 15, f: 22 },
      { name: 'Apple', cals: 95, p: 0, c: 25, f: 0 },
    ],
    total: 545,
  },
  {
    type: 'Dinner',
    icon: DinnerDiningRoundedIcon,
    tone: '#2563eb',
    bg: '#dbeafe',
    items: [
      { name: 'Salmon & Asparagus', cals: 520, p: 38, c: 12, f: 32 },
      { name: 'Quinoa', cals: 220, p: 8, c: 39, f: 4 },
    ],
    total: 740,
  },
  {
    type: 'Snacks',
    icon: IcecreamRoundedIcon,
    tone: '#7c3aed',
    bg: '#ede9fe',
    items: [
      { name: 'Greek Yogurt', cals: 120, p: 15, c: 8, f: 0 },
    ],
    total: 120,
  },
];

const yAxisTicks = [650, 1300, 1950, 2600];

function CalorieTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        px: 1.5,
        py: 1.1,
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.14)',
      }}
    >
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.45, fontSize: '0.88rem', fontWeight: 800, color: '#84cc16', lineHeight: 1.2 }}>
        cals : {payload[0].value}
      </Typography>
    </Box>
  );
}

function UserMealPlan() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();
  const userId = String(user?.id || user?._id || '');
  const [planMode, setPlanMode] = useState('dietitian');
  const [dietitianPlan, setDietitianPlan] = useState(null);
  const [planError, setPlanError] = useState('');
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  useEffect(() => {
    const loadDietitianPlan = async () => {
      if (!userId) return;
      try {
        setIsPlanLoading(true);
        setPlanError('');
        const { data } = await getUserDietitianMealPlan(userId);
        setDietitianPlan(data?.data || null);
      } catch (error) {
        setDietitianPlan(null);
        setPlanError(error?.response?.data?.message || 'Failed to load dietitian plan');
      } finally {
        setIsPlanLoading(false);
      }
    };

    loadDietitianPlan();
  }, [userId]);

  const meals = useMemo(() => {
    if (!dietitianPlan?.sections?.length) return [];
    const iconMap = {
      Breakfast: FreeBreakfastRoundedIcon,
      Lunch: LunchDiningRoundedIcon,
      Dinner: DinnerDiningRoundedIcon,
      Snacks: IcecreamRoundedIcon,
    };
    const colorMap = {
      Breakfast: { tone: '#d97706', bg: '#fef3c7' },
      Lunch: { tone: '#059669', bg: '#d1fae5' },
      Dinner: { tone: '#2563eb', bg: '#dbeafe' },
      Snacks: { tone: '#7c3aed', bg: '#ede9fe' },
    };
    return dietitianPlan.sections.map((section) => ({
      type: section.type,
      icon: iconMap[section.type] || RestaurantRoundedIcon,
      tone: colorMap[section.type]?.tone || '#2563eb',
      bg: colorMap[section.type]?.bg || '#dbeafe',
      items: Array.isArray(section.items) ? section.items : [],
      total: Number(section.total || 0),
    }));
  }, [dietitianPlan]);

  const macroData = useMemo(() => {
    if (!dietitianPlan?.summary) {
      return [
        { name: 'Protein', value: 0, color: '#0D9488' },
        { name: 'Carbs', value: 0, color: '#F59E0B' },
        { name: 'Fat', value: 0, color: '#8B5CF6' },
      ];
    }
    return [
      { name: 'Protein', value: Number(dietitianPlan.summary.protein || 0), color: '#0D9488' },
      { name: 'Carbs', value: Number(dietitianPlan.summary.carbs || 0), color: '#F59E0B' },
      { name: 'Fat', value: Number(dietitianPlan.summary.fat || 0), color: '#8B5CF6' },
    ];
  }, [dietitianPlan]);

  const weeklyCals = useMemo(() => {
    const total = Number(dietitianPlan?.summary?.totalCalories || 0);
    if (!total) {
      return [
        { day: 'M', cals: 0 },
        { day: 'T', cals: 0 },
        { day: 'W', cals: 0 },
        { day: 'T', cals: 0 },
        { day: 'F', cals: 0 },
        { day: 'S', cals: 0 },
        { day: 'S', cals: 0 },
      ];
    }
    const base = Math.round(total);
    return [
      { day: 'M', cals: Math.max(0, base - 180) },
      { day: 'T', cals: Math.max(0, base - 60) },
      { day: 'W', cals: Math.max(0, base - 220) },
      { day: 'T', cals: Math.max(0, base + 40) },
      { day: 'F', cals: Math.max(0, base - 80) },
      { day: 'S', cals: Math.max(0, base + 120) },
      { day: 'S', cals: Math.max(0, base - 30) },
    ];
  }, [dietitianPlan]);

  const displayMeals = planMode === 'dietitian' ? meals : fallbackMeals;
  const displayMacroData = planMode === 'dietitian' ? macroData : fallbackMacroData;
  const displayWeeklyCals = planMode === 'dietitian' ? weeklyCals : fallbackWeeklyCals;

  const totalConsumed = useMemo(
    () => displayMeals.reduce((sum, meal) => sum + Number(meal.total || 0), 0),
    [displayMeals],
  );

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
        <MotionBox variants={itemVariants} mb={2.2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.2}>
            <Box>
              <Typography sx={{ fontSize: { xs: '1.6rem', md: '1.95rem' }, fontWeight: 900, color: theme.palette.text.primary }}>
                Meal Plan Hub
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                View dietitian recommendations or build your own daily meal plan.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label="Dietitian Plan"
                clickable
                onClick={() => setPlanMode('dietitian')}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  bgcolor: planMode === 'dietitian' ? '#84cc16' : (isDark ? '#17253a' : '#eef2f7'),
                  color: planMode === 'dietitian' ? '#0f172a' : theme.palette.text.primary,
                }}
              />
              <Chip
                label="My Plan"
                clickable
                onClick={() => setPlanMode('custom')}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  bgcolor: planMode === 'custom' ? '#0D9488' : (isDark ? '#17253a' : '#eef2f7'),
                  color: planMode === 'custom' ? '#ffffff' : theme.palette.text.primary,
                }}
              />
            </Stack>
          </Stack>
        </MotionBox>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 1.8, mb: 2.4 }}>
          <MotionCard variants={itemVariants} sx={{ borderRadius: 2.4, border: `1px solid ${isDark ? '#27384f' : '#e7edf6'}` }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', mb: 2 }}>Daily Summary</Typography>
              <Stack alignItems="center" spacing={2}>
                <MotionBox
                  initial={{ opacity: 0, scale: 0.92, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  sx={{
                    width: 200,
                    height: 200,
                    position: 'relative',
                    mb: 0.5,
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayMacroData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={4}
                        stroke="none"
                        isAnimationActive
                        animationDuration={900}
                      >
                        {displayMacroData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <Box
                    sx={{
                      width: 128,
                      height: 128,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      bgcolor: theme.palette.background.paper,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 900, fontSize: '2.2rem', lineHeight: 1 }}
                    >
                      {totalConsumed.toLocaleString()}
                    </Typography>
                    <Typography
                      sx={{ color: theme.palette.text.secondary, fontSize: '0.82rem' }}
                    >
                      kcal consumed
                    </Typography>
                  </Box>
                </MotionBox>

                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 1,
                  }}
                >
                  {displayMacroData.map((item) => (
                    <Stack key={item.name} alignItems="center" spacing={0.3} sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name}</Typography>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.86rem' }}>{item.value}g</Typography>
                    </Stack>
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} sx={{ borderRadius: 2.4, border: `1px solid ${isDark ? '#27384f' : '#e7edf6'}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.6}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>Calorie Trend</Typography>
                <Chip label="Last 7 Days" sx={{ borderRadius: 1.8, fontWeight: 700 }} />
              </Stack>

              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box sx={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayWeeklyCals} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 4" stroke="#cbd5e1" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 14 }}
                      />
                      <YAxis
                        domain={[0, 2600]}
                        ticks={[0, ...yAxisTicks]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 14 }}
                        width={46}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={<CalorieTooltip />}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Bar
                        dataKey="cals"
                        fill="#84cc16"
                        radius={[8, 8, 0, 0]}
                        barSize={52}
                        isAnimationActive
                        animationDuration={650}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </CardContent>
          </MotionCard>
        </Box>

        {planMode === 'dietitian' && (
          <MotionCard
            variants={itemVariants}
            sx={{
              mb: 2.2,
              borderRadius: 2.2,
              border: `1px solid ${isDark ? '#27384f' : '#e7edf6'}`,
              background: isDark
                ? 'linear-gradient(135deg, #13213a 0%, #0f1b31 100%)'
                : 'linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%)',
            }}
          >
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.4}>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#84cc16',
                      color: '#0f172a',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <VerifiedRoundedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.05rem' }}>Dietitian Plan</Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }}>
                      {dietitianPlan
                        ? `Assigned by ${dietitianPlan?.dietitian?.name || 'Dietitian'}`
                        : 'No submitted plan yet'}
                    </Typography>
                  </Box>
                </Stack>
                {dietitianPlan && (
                  <Chip
                    label={`${Number(dietitianPlan?.summary?.totalCalories || 0)} kcal/day`}
                    sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#84cc16', color: '#0f172a' }}
                  />
                )}
              </Stack>

              {!dietitianPlan && (
                <Typography sx={{ mt: 1.1, color: planError ? '#ef4444' : theme.palette.text.secondary, fontSize: '0.92rem' }}>
                  {isPlanLoading
                    ? 'Loading dietitian plan...'
                    : (planError || 'Your dietitian has not submitted a meal plan yet.')}
                </Typography>
              )}

              {dietitianPlan && (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.4} sx={{ mt: 1.2 }}>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.92rem' }}>
                    Focus: <Box component="span" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>{dietitianPlan?.dietitian?.specialization || 'Nutrition'}</Box>
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.92rem' }}>
                    Updated: <Box component="span" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                      {dietitianPlan?.submittedAt ? new Date(dietitianPlan.submittedAt).toLocaleDateString() : '-'}
                    </Box>
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </MotionCard>
        )}

        <MotionBox variants={itemVariants}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.3}>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: theme.palette.text.primary }}>
              {planMode === 'dietitian' ? "Today's Meals" : 'My Meal Builder'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 800,
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#111827' },
              }}
            >
              {planMode === 'dietitian' ? 'Log Food' : 'Create Meal'}
            </Button>
          </Stack>

          <Stack spacing={1.3}>
            {planMode === 'dietitian' && !isPlanLoading && displayMeals.length === 0 && (
              <MotionCard variants={itemVariants} sx={{ borderRadius: 2.2, border: `1px solid ${isDark ? '#27384f' : '#e7edf6'}` }}>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    No dietitian meals available yet.
                  </Typography>
                </Box>
              </MotionCard>
            )}
            {displayMeals.map((meal, index) => {
              const Icon = meal.icon;
              return (
                <MotionCard
                  key={meal.type}
                  variants={itemVariants}
                  transition={{ delay: index * 0.03 }}
                  sx={{ borderRadius: 2.2, border: `1px solid ${isDark ? '#27384f' : '#e7edf6'}` }}
                >
                  <Box sx={{ p: 1.5, bgcolor: isDark ? '#121f34' : '#f8fafc', borderBottom: `1px solid ${isDark ? '#27384f' : '#edf2f7'}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 40, height: 40, borderRadius: 1.4, bgcolor: meal.bg, color: meal.tone, display: 'grid', placeItems: 'center' }}>
                          <Icon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{meal.type}</Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: theme.palette.text.secondary }}>{meal.total} kcal</Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ p: 1.2 }}>
                    {meal.items.map((item) => (
                      <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.2, borderRadius: 1.5, '&:hover': { bgcolor: isDark ? '#13233a' : '#f8fafc' } }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                          <Stack direction="row" spacing={0.9} sx={{ mt: 0.3 }}>
                            <Typography sx={{ color: theme.palette.text.secondary }}>{item.cals} kcal</Typography>
                            <Typography sx={{ color: '#9ca3af' }}>•</Typography>
                            <Typography sx={{ color: '#0D9488' }}>{item.p}g P</Typography>
                            <Typography sx={{ color: '#F59E0B' }}>{item.c}g C</Typography>
                            <Typography sx={{ color: '#8B5CF6' }}>{item.f}g F</Typography>
                          </Stack>
                        </Box>
                        <ChevronRightRoundedIcon sx={{ color: '#9ca3af' }} />
                      </Stack>
                    ))}

                    <Button
                      fullWidth
                      startIcon={<AddRoundedIcon />}
                      sx={{
                        mt: 0.6,
                        color: '#64748b',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 1.5,
                        '&:hover': {
                          bgcolor: isDark ? '#15253c' : '#ecfeff',
                          color: '#0D9488',
                        },
                      }}
                    >
                      Add Food
                    </Button>
                  </Box>
                </MotionCard>
              );
            })}
          </Stack>
        </MotionBox>
      </Box>
    </MotionBox>
  );
}

export default UserMealPlan;
