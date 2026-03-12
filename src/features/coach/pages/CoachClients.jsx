import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';

const MotionBox = motion(Box);

const INITIAL_APPOINTMENTS = [
  {
    id: 101,
    name: 'Ryan Martinez',
    age: 30,
    goal: 'Weight Loss',
    requestedAt: '2026-03-13 08:00 AM',
    priority: 'Urgent',
    avatar: 'RM',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
  },
  {
    id: 102,
    name: 'Lisa Chen',
    age: 27,
    goal: 'Mobility',
    requestedAt: '2026-03-13 11:00 AM',
    priority: 'High',
    avatar: 'LC',
    gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
  },
  {
    id: 103,
    name: 'Tom Bradley',
    age: 25,
    goal: 'Strength',
    requestedAt: '2026-03-14 02:00 PM',
    priority: 'Normal',
    avatar: 'TB',
    gradient: 'linear-gradient(135deg, #3B82F6, #0D9488)',
  },
  {
    id: 104,
    name: 'Priya Sharma',
    age: 29,
    goal: 'Body Recomp',
    requestedAt: '2026-03-15 09:30 AM',
    priority: 'Normal',
    avatar: 'PS',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  },
];

const INITIAL_MEMBERS = [
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
    status: 'Active',
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
    status: 'Active',
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

  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  const updatePriority = (id, priority) => {
    setAppointments((prev) => prev.map((item) => (item.id === id ? { ...item, priority } : item)));
  };

  const approveRequest = (request) => {
    setAppointments((prev) => prev.filter((item) => item.id !== request.id));
    setMembers((prev) => [
      {
        id: `new-${request.id}`,
        name: request.name,
        age: request.age,
        goal: request.goal,
        score: 0,
        progress: 0,
        lastActive: 'Just approved',
        avatar: request.avatar,
        gradient: request.gradient,
        status: 'New Member',
      },
      ...prev,
    ]);
  };

  const rejectRequest = (id) => {
    setAppointments((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Box sx={{ pb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.85rem' }, fontWeight: 900, color: 'text.primary' }}>
          Coach Clients
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.4 }}>
          Review appointment requests and track progress of approved members.
        </Typography>
      </Box>

      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          background: panelBg,
          borderRadius: 2.2,
          border: '1px solid',
          borderColor: panelBorder,
          p: 2,
          mb: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
          <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>Appointments</Typography>
          <Chip label={`${appointments.length} pending`} size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Requested Time</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!appointments.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography sx={{ color: 'text.secondary', py: 1 }}>No pending requests.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {appointments.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', background: row.gradient }}>
                        {row.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{row.name}</Typography>
                        <Typography sx={{ color: muted, fontSize: '0.76rem' }}>Age {row.age}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.84rem', color: 'text.primary' }}>{row.goal}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.84rem', color: muted }}>{row.requestedAt}</Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={row.priority}
                      onChange={(e) => updatePriority(row.id, e.target.value)}
                      sx={{ minWidth: 110, '& .MuiSelect-select': { py: 0.6 } }}
                    >
                      <MenuItem value="Urgent">Urgent</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Normal">Normal</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => approveRequest(row)}
                        sx={{ textTransform: 'none', borderRadius: 1.4, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => rejectRequest(row.id)}
                        sx={{ textTransform: 'none', borderRadius: 1.4 }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MotionBox>

      <Box sx={{ mb: 1.1 }}>
        <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.06rem' }}>Members Progress</Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {members.map((client, index) => (
          <MotionBox
            key={client.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.28 }}
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
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 + index * 0.05 }}
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
                label={client.status}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: client.status === 'New Member' ? '#2563eb20' : '#16a34a20',
                  color: client.status === 'New Member' ? '#2563eb' : '#16a34a',
                }}
              />
            </Stack>
          </MotionBox>
        ))}
      </Box>
    </Box>
  );
}

export default CoachClients;
