import { motion } from 'framer-motion';
import {
  Avatar,
  Box,
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';

const MotionBox = motion(Box);

const APPOINTMENT_CLIENTS = [
  {
    id: 1,
    name: 'Mike Torres',
    age: 28,
    goal: 'Muscle Gain',
    score: 92,
    progress: 78,
    lastActive: 'Today',
    avatar: 'MT',
    gradient: 'linear-gradient(135deg, #84CC16, #0D9488)',
    appointment: 'Today, 8:00 AM',
    status: 'Confirmed',
  },
  {
    id: 2,
    name: 'Emma Wilson',
    age: 34,
    goal: 'Weight Loss',
    score: 85,
    progress: 65,
    lastActive: 'Today',
    avatar: 'EW',
    gradient: 'linear-gradient(135deg, #0D9488, #0284C7)',
    appointment: 'Today, 9:30 AM',
    status: 'Confirmed',
  },
  {
    id: 3,
    name: 'James Park',
    age: 22,
    goal: 'Endurance',
    score: 78,
    progress: 45,
    lastActive: '2h ago',
    avatar: 'JP',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    appointment: 'Tomorrow, 11:00 AM',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Sofia Reyes',
    age: 31,
    goal: 'Strength',
    score: 95,
    progress: 90,
    lastActive: 'Yesterday',
    avatar: 'SR',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    appointment: 'Fri, 1:00 PM',
    status: 'Confirmed',
  },
  {
    id: 5,
    name: 'Chris Lee',
    age: 26,
    goal: 'Body Recomp',
    score: 71,
    progress: 30,
    lastActive: '3h ago',
    avatar: 'CL',
    gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
    appointment: 'Sat, 3:00 PM',
    status: 'Pending',
  },
  {
    id: 6,
    name: 'Aisha Brown',
    age: 29,
    goal: 'Flexibility',
    score: 88,
    progress: 55,
    lastActive: 'Today',
    avatar: 'AB',
    gradient: 'linear-gradient(135deg, #10B981, #0D9488)',
    appointment: 'Sun, 5:00 PM',
    status: 'Confirmed',
  },
];

function CircularScore({ score, id, isDark }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const gradId = `clientScoreGrad-${id}`;

  return (
    <Box sx={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke={isDark ? '#334155' : '#E5E7EB'} strokeWidth="5" />
        <motion.circle
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
          transition={{ duration: 1.1, ease: 'easeOut' }}
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

function CoachClients() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#0f1b34' : '#ffffff';
  const panelBorder = isDark ? '#24344f' : '#e5e7eb';
  const muted = isDark ? '#94a3b8' : '#6b7280';

  return (
    <Box sx={{ pb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.85rem' }, fontWeight: 900, color: 'text.primary' }}>
          Appointment Clients
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.4 }}>
          Track the progress of users who sent appointments to you.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {APPOINTMENT_CLIENTS.map((client, index) => (
          <MotionBox
            key={client.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -4 }}
            sx={{
              background: panelBg,
              borderRadius: 2.2,
              p: 2,
              border: '1px solid',
              borderColor: panelBorder,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mb: 1.7 }}>
              <Avatar sx={{ width: 46, height: 46, fontWeight: 800, fontSize: '1.05rem', color: '#fff', background: client.gradient }}>
                {client.avatar}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.02rem' }}>{client.name}</Typography>
                <Typography sx={{ color: muted, fontSize: '0.84rem' }}>
                  Age {client.age} · {client.goal}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                <CircularScore score={client.score} id={client.id} isDark={isDark} />
              </Box>
            </Stack>

            <Typography sx={{ color: muted, fontSize: '0.84rem' }}>Program Progress</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.65, mb: 1.2 }}>
              <Box sx={{ flex: 1, height: 7, borderRadius: 999, overflow: 'hidden', bgcolor: isDark ? '#1f2937' : '#e5e7eb' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${client.progress}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 + index * 0.06 }}
                  style={{ height: '100%', borderRadius: 999, background: client.gradient }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: 'text.primary' }}>{client.progress}%</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: muted, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                <MonitorHeartRoundedIcon sx={{ fontSize: 13 }} /> {client.lastActive}
              </Typography>
              <Chip
                icon={<CalendarMonthRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
                label={client.appointment}
                size="small"
                sx={{
                  height: 26,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#173155' : '#e8f1ff',
                  color: isDark ? '#bfdbfe' : '#1d4ed8',
                }}
              />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.05 }}>
              <Chip
                label={client.status}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: client.status === 'Confirmed' ? '#16a34a20' : '#f59e0b20',
                  color: client.status === 'Confirmed' ? '#16a34a' : '#f59e0b',
                }}
              />
              <Typography sx={{ color: '#0d9488', fontWeight: 700, fontSize: '0.9rem' }}>
                View Profile ?
              </Typography>
            </Stack>
          </MotionBox>
        ))}
      </Box>
    </Box>
  );
}

export default CoachClients;
