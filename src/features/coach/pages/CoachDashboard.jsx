import { motion as Motion } from 'framer-motion';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/utils/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MotionBox = Motion(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const stats = [
  {
    label: 'Active Clients',
    value: '24',
    Icon: GroupsRoundedIcon,
    gradient: 'linear-gradient(135deg, #84CC16, #0D9488)',
    change: '+3 this month',
  },
  {
    label: 'Sessions Today',
    value: '6',
    Icon: CalendarMonthRoundedIcon,
    gradient: 'linear-gradient(135deg, #0D9488, #0284C7)',
    change: '2 remaining',
  },
  {
    label: 'Avg Client Score',
    value: '87%',
    Icon: StarBorderRoundedIcon,
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    change: '+4% vs last month',
  },
  {
    label: 'Revenue MTD',
    value: '$4,280',
    Icon: AttachMoneyRoundedIcon,
    gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
    change: '+12% vs last month',
  },
];

const schedule = [
  { time: '8:00 AM', client: 'Mike Torres', type: 'Assessment', typeColor: '#84CC16', status: 'done' },
  { time: '9:30 AM', client: 'Emma Wilson', type: 'Training', typeColor: '#0D9488', status: 'done' },
  { time: '11:00 AM', client: 'James Park', type: 'Check-in', typeColor: '#8B5CF6', status: 'current' },
  { time: '1:00 PM', client: 'Sofia Reyes', type: 'Nutrition', typeColor: '#F59E0B', status: 'upcoming' },
  { time: '3:00 PM', client: 'Chris Lee', type: 'Training', typeColor: '#0D9488', status: 'upcoming' },
  { time: '5:00 PM', client: 'Aisha Brown', type: 'Assessment', typeColor: '#84CC16', status: 'upcoming' },
];

const consultations = [
  {
    name: 'Ryan Martinez',
    issue: 'Plateau in weight loss for 3 weeks',
    priority: 'URGENT',
    wait: '2 days',
    avatar: 'RM',
    priorityGrad: 'linear-gradient(135deg, #EF4444, #DC2626)',
  },
  {
    name: 'Lisa Chen',
    issue: 'Knee pain during squats',
    priority: 'HIGH',
    wait: '1 day',
    avatar: 'LC',
    priorityGrad: 'linear-gradient(135deg, #F97316, #EF4444)',
  },
  {
    name: 'Tom Bradley',
    issue: 'New program request',
    priority: 'NORMAL',
    wait: '3 hours',
    avatar: 'TB',
    priorityGrad: 'linear-gradient(135deg, #3B82F6, #0D9488)',
  },
  {
    name: 'Priya Sharma',
    issue: 'Nutrition plan adjustment',
    priority: 'NORMAL',
    wait: '5 hours',
    avatar: 'PS',
    priorityGrad: 'linear-gradient(135deg, #3B82F6, #0D9488)',
  },
];

const members = [
  { name: 'Mike Torres', age: 28, goal: 'Muscle Gain', score: 92, program: 78, lastActive: 'Today', avatar: 'MT', grad: 'linear-gradient(135deg, #84CC16, #0D9488)' },
  { name: 'Emma Wilson', age: 34, goal: 'Weight Loss', score: 85, program: 65, lastActive: 'Today', avatar: 'EW', grad: 'linear-gradient(135deg, #0D9488, #0284C7)' },
  { name: 'James Park', age: 22, goal: 'Endurance', score: 78, program: 45, lastActive: '2h ago', avatar: 'JP', grad: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { name: 'Sofia Reyes', age: 31, goal: 'Strength', score: 95, program: 90, lastActive: 'Yesterday', avatar: 'SR', grad: 'linear-gradient(135deg, #8B5CF6, #EC4899)' },
  { name: 'Chris Lee', age: 26, goal: 'Body Recomp', score: 71, program: 30, lastActive: '3h ago', avatar: 'CL', grad: 'linear-gradient(135deg, #06B6D4, #3B82F6)' },
  { name: 'Aisha Brown', age: 29, goal: 'Flexibility', score: 88, program: 55, lastActive: 'Today', avatar: 'AB', grad: 'linear-gradient(135deg, #10B981, #0D9488)' },
];

const weeklyData = [
  { day: 'Mon', sessions: 5 },
  { day: 'Tue', sessions: 7 },
  { day: 'Wed', sessions: 4 },
  { day: 'Thu', sessions: 8 },
  { day: 'Fri', sessions: 6 },
  { day: 'Sat', sessions: 3 },
  { day: 'Sun', sessions: 2 },
];

function CircularScore({ score, id, isDark }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const gradId = `scoreGrad-${id}`;

  return (
    <Box sx={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke={isDark ? '#334155' : '#F1F5F9'} strokeWidth="5" />
        <Motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
        </defs>
      </svg>
      <Typography sx={{ position: 'absolute', fontSize: '0.875rem', fontWeight: 900, color: isDark ? '#f8fafc' : '#111827' }}>{score}</Typography>
    </Box>
  );
}

function CoachDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#0f1b34' : '#ffffff';
  const panelBorder = isDark ? '#24344f' : '#f3f4f6';
  const primaryText = theme.palette.text.primary;
  const secondaryText = theme.palette.text.secondary;
  const mutedText = isDark ? '#94a3b8' : '#9ca3af';
  const hoverRowBg = isDark ? 'rgba(148,163,184,0.08)' : '#f9fafb';
  const currentRowBg = isDark
    ? 'linear-gradient(90deg, rgba(132,204,22,0.12) 0%, rgba(13,148,136,0.16) 100%)'
    : 'linear-gradient(90deg, #ecfccb 0%, #ccfbf1 100%)';
  const currentRowBorder = isDark ? '#2dd4bf' : '#99f6e4';
  const barBg = isDark ? '#1f2937' : '#f3f4f6';
  const chartGrid = isDark ? '#23324b' : '#F1F5F9';

  return (
    <Motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}>
      <MotionBox
        variants={itemVariants}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {stats.map((s) => {
          const Icon = s.Icon;
          return (
            <MotionBox
              key={s.label}
              whileHover={{ y: -2 }}
              sx={{
                background: panelBg,
                borderRadius: 2,
                p: 2,
                border: '1px solid',
                borderColor: panelBorder,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: s.gradient }}>
                  <Icon sx={{ fontSize: 20 }} />
                </div>
                <TrendingUpRoundedIcon sx={{ color: '#10b981', fontSize: 14 }} />
              </div>
              <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: primaryText, lineHeight: 1.2 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '1rem', color: secondaryText, mt: 0.4 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500, mt: 1 }}>{s.change}</Typography>
            </MotionBox>
          );
        })}
      </MotionBox>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        <Motion.div variants={itemVariants}>
          <Box sx={{ background: panelBg, borderRadius: 2, p: 2.5, border: '1px solid', borderColor: panelBorder, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: primaryText, fontSize: '1.25rem' }}>Today's Schedule</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: mutedText }}>Mon, Feb 21</Typography>
            </Stack>
            <Stack spacing={1}>
              {schedule.map((s, i) => (
                <Motion.div key={`${s.time}-${s.client}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (i * 0.07) }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1.5,
                      transition: 'background-color 0.2s ease',
                      ...(s.status === 'current'
                        ? {
                            background: currentRowBg,
                            border: '1px solid',
                            borderColor: currentRowBorder,
                          }
                        : s.status === 'done'
                          ? { opacity: 0.5 }
                          : { '&:hover': { backgroundColor: hoverRowBg } }),
                    }}
                  >
                    <Typography sx={{ width: 72, flexShrink: 0, fontSize: '0.82rem', color: mutedText, fontFamily: 'monospace' }}>{s.time}</Typography>
                    {s.status === 'current' && <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #84CC16, #0D9488)' }} />}
                    <Typography sx={{ flex: 1, minWidth: 0, fontSize: '1.05rem', fontWeight: 700, color: primaryText }}>{s.client}</Typography>
                    <Box component="span" sx={{ px: 1.2, py: 0.55, borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, color: '#fff', backgroundColor: s.typeColor }}>
                      {s.type}
                    </Box>
                  </Box>
                </Motion.div>
              ))}
            </Stack>
          </Box>
        </Motion.div>

        <Motion.div variants={itemVariants}>
          <Box sx={{ background: panelBg, borderRadius: 2, p: 2.5, border: '1px solid', borderColor: panelBorder, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: primaryText, fontSize: '1.25rem' }}>Consultation Queue</Typography>
              <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 999, color: '#fff', fontWeight: 700, fontSize: '0.75rem', background: 'linear-gradient(135deg, #EF4444, #F97316)' }}>
                {consultations.length} pending
              </Box>
            </Stack>
            <Stack spacing={1.5}>
              {consultations.map((c, i) => (
                <Motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: panelBorder, '&:hover': { borderColor: isDark ? '#334155' : '#e5e7eb' } }}>
                    <Avatar sx={{ width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: c.priorityGrad }}>{c.avatar}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: primaryText }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: mutedText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.issue}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.7 }}>
                        <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 999, color: '#fff', fontWeight: 700, fontSize: '0.75rem', background: c.priorityGrad }}>
                          {c.priority}
                        </Box>
                        <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, fontSize: '0.75rem', color: mutedText }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 10 }} /> {c.wait}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box component="button" type="button" style={{ padding: '6px 12px', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, border: 0, background: 'linear-gradient(135deg, #84CC16, #0D9488)', cursor: 'pointer', flexShrink: 0 }}>
                      Start
                    </Box>
                  </Box>
                </Motion.div>
              ))}
            </Stack>
          </Box>
        </Motion.div>
      </Box>

      <Motion.div variants={itemVariants}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, color: primaryText, fontSize: '1.25rem' }}>Active Members</Typography>
          <Box
            component="button"
            type="button"
            onClick={() => navigate(ROUTES.COACH_CLIENTS)}
            style={{ border: 0, background: 'transparent', color: '#0d9488', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          >
            View all <ChevronRightRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
          {members.map((m, i) => (
            <Motion.div key={m.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} whileHover={{ y: -3 }}>
              <Box sx={{ background: panelBg, borderRadius: 2, p: 2, border: '1px solid', borderColor: panelBorder, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ width: 44, height: 44, color: '#fff', fontWeight: 700, background: m.grad }}>{m.avatar}</Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: primaryText, fontWeight: 700 }}>{m.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: mutedText }}>Age {m.age} · {m.goal}</Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <CircularScore score={m.score} id={m.avatar} isDark={isDark} />
                  </Box>
                </Stack>

                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: secondaryText }}>Program Progress</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: primaryText, fontWeight: 600 }}>{m.program}%</Typography>
                  </Stack>
                  <Box sx={{ height: 6, borderRadius: 999, bgcolor: barBg, overflow: 'hidden' }}>
                    <Motion.div
                      style={{ height: '100%', borderRadius: 999, background: m.grad }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.program}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + i * 0.1 }}
                    />
                  </Box>
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.75rem', color: mutedText, display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
                    <MonitorHeartRoundedIcon sx={{ fontSize: 11 }} /> {m.lastActive}
                  </Typography>
                  <Box component="button" type="button" style={{ border: 0, background: 'transparent', color: '#0d9488', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    View Profile →
                  </Box>
                </Stack>
              </Box>
            </Motion.div>
          ))}
        </Box>
      </Motion.div>

      <Motion.div variants={itemVariants}>
        <Box sx={{ background: panelBg, borderRadius: 2, p: 2.5, border: '1px solid', borderColor: panelBorder, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: primaryText, mb: 2 }}>Sessions This Week</Typography>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84CC16" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: mutedText }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: mutedText }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${panelBorder}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  fontSize: 12,
                  background: panelBg,
                  color: primaryText,
                }}
              />
              <Bar dataKey="sessions" fill="url(#sessGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Motion.div>
    </Motion.div>
  );
}

export default CoachDashboard;

