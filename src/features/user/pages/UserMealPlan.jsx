import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);

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

const macroData = [
  { name: 'Protein', value: 140, color: '#0D9488' },
  { name: 'Carbs', value: 220, color: '#F59E0B' },
  { name: 'Fat', value: 65, color: '#8B5CF6' },
];

const weeklyCals = [
  { day: 'M', cals: 2100 },
  { day: 'T', cals: 2300 },
  { day: 'W', cals: 1950 },
  { day: 'T', cals: 2400 },
  { day: 'F', cals: 2150 },
  { day: 'S', cals: 2600 },
  { day: 'S', cals: 2200 },
];

const meals = [
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

const toConicGradient = (data) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let current = 0;
  const segments = data.map((item) => {
    const start = (current / total) * 360;
    current += item.value;
    const end = (current / total) * 360;
    return `${item.color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${segments.join(', ')})`;
};

const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + (radius * Math.cos(angleInRadians)),
    y: cy + (radius * Math.sin(angleInRadians)),
  };
};

const describeArc = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

function UserMealPlan() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [planMode, setPlanMode] = useState('dietitian');
  const [hoveredMacro, setHoveredMacro] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  const totalConsumed = useMemo(() => meals.reduce((sum, meal) => sum + meal.total, 0), []);
  const maxCals = useMemo(() => Math.max(...weeklyCals.map((item) => item.cals)), []);
  const yAxisTicks = useMemo(() => [650, 1300, 1950, 2600], []);
  const barChartData = useMemo(() => {
    const chartTop = 28;
    const chartBottom = 180;
    const barWidth = 52;
    const gap = 42;

    return weeklyCals.map((item, index) => {
      const x = 84 + (index * (barWidth + gap));
      const barHeight = Math.max((item.cals / maxCals) * (chartBottom - chartTop), 8);
      const y = chartBottom - barHeight;
      return {
        ...item,
        index,
        x,
        y,
        barWidth,
        barHeight,
      };
    });
  }, [maxCals]);
  const pieSegments = useMemo(() => {
    const total = macroData.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;

    return macroData.map((item) => {
      const sweep = (item.value / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sweep;
      cumulativeAngle = endAngle;

      return {
        ...item,
        path: describeArc(100, 100, 72, startAngle, endAngle),
      };
    });
  }, []);

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
                    borderRadius: '50%',
                    background: toConicGradient(macroData),
                    display: 'grid',
                    placeItems: 'center',
                    position: 'relative',
                  }}
                >
                  <svg viewBox="0 0 200 200" width="200" height="200" style={{ position: 'absolute', inset: 0 }}>
                    {pieSegments.map((segment, index) => (
                      <motion.path
                        key={segment.name}
                        d={segment.path}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="28"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0.45 }}
                        animate={{ pathLength: 1, opacity: hoveredMacro === segment.name ? 1 : 0.88 }}
                        transition={{ duration: 0.7, delay: 0.1 + (index * 0.12), ease: 'easeOut' }}
                        onHoverStart={() => setHoveredMacro(segment.name)}
                        onHoverEnd={() => setHoveredMacro(null)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </svg>

                  <Box
                    sx={{
                      width: 128,
                      height: 128,
                      borderRadius: '50%',
                      bgcolor: theme.palette.background.paper,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <MotionTypography
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.45, duration: 0.35 }}
                      sx={{ fontWeight: 900, fontSize: '2.2rem', lineHeight: 1 }}
                    >
                      {totalConsumed.toLocaleString()}
                    </MotionTypography>
                    <MotionTypography
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.58, duration: 0.3 }}
                      sx={{ color: theme.palette.text.secondary, fontSize: '0.82rem' }}
                    >
                      kcal consumed
                    </MotionTypography>
                  </Box>
                </MotionBox>

                <Stack direction="row" spacing={2.2}>
                  {macroData.map((item) => (
                    <Stack key={item.name} alignItems="center" spacing={0.3}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name}</Typography>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.86rem' }}>{item.value}g</Typography>
                    </Stack>
                  ))}
                </Stack>
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
                <svg viewBox="0 0 760 240" width="100%" height="240" role="img" aria-label="Weekly calorie trend">
                  <line x1="56" y1="28" x2="736" y2="28" stroke="#e2e8f0" strokeDasharray="3 4" />
                  <line x1="56" y1="104" x2="736" y2="104" stroke="#e2e8f0" strokeDasharray="3 4" />
                  <line x1="56" y1="180" x2="736" y2="180" stroke="#e2e8f0" strokeDasharray="3 4" />

                  {yAxisTicks.map((tickValue) => {
                    const y = 180 - ((tickValue / maxCals) * (180 - 28));
                    return (
                      <text key={tickValue} x="48" y={y + 5} textAnchor="end" fill="#94a3b8" fontSize="14">
                        {tickValue}
                      </text>
                    );
                  })}
                  <text x="48" y="209" textAnchor="end" fill="#94a3b8" fontSize="14">0</text>

                  {barChartData.map((item) => {
                    return (
                      <g key={`${item.day}-${item.index}`}>
                        <motion.rect
                          x={item.x}
                          y={item.y}
                          width={item.barWidth}
                          height={item.barHeight}
                          rx="7"
                          fill={hoveredBar === item.index ? '#65a30d' : '#84cc16'}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.55, delay: 0.08 + (item.index * 0.07), ease: 'easeOut' }}
                          onHoverStart={() => setHoveredBar(item.index)}
                          onHoverEnd={() => setHoveredBar(null)}
                          style={{
                            cursor: 'pointer',
                            transformBox: 'fill-box',
                            transformOrigin: 'center bottom',
                          }}
                        />
                        <text x={item.x + (item.barWidth / 2)} y="204" textAnchor="middle" fill="#94a3b8" fontSize="14">{item.day}</text>
                      </g>
                    );
                  })}

                  {hoveredBar !== null && barChartData[hoveredBar] && (
                    <g>
                      <rect
                        x={Math.min(Math.max(barChartData[hoveredBar].x + (barChartData[hoveredBar].barWidth / 2) - 74, 64), 612)}
                        y={Math.max(barChartData[hoveredBar].y - 92, 34)}
                        width="148"
                        height="94"
                        rx="16"
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        filter="drop-shadow(0px 8px 20px rgba(15, 23, 42, 0.10))"
                      />
                      <text
                        x={Math.min(Math.max(barChartData[hoveredBar].x + (barChartData[hoveredBar].barWidth / 2) - 56, 82), 630)}
                        y={Math.max(barChartData[hoveredBar].y - 58, 68)}
                        fill="#0f172a"
                        fontSize="36"
                        fontWeight="700"
                      >
                        {barChartData[hoveredBar].day}
                      </text>
                      <text
                        x={Math.min(Math.max(barChartData[hoveredBar].x + (barChartData[hoveredBar].barWidth / 2) - 56, 82), 630)}
                        y={Math.max(barChartData[hoveredBar].y - 16, 110)}
                        fill="#84cc16"
                        fontSize="40"
                        fontWeight="700"
                      >
                        cals : {barChartData[hoveredBar].cals}
                      </text>
                    </g>
                  )}
                </svg>
              </Box>
            </CardContent>
          </MotionCard>
        </Box>

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
            {meals.map((meal, index) => {
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
