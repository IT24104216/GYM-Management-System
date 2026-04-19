import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  delegateAppointment,
  getCoachAppointments,
  getMyTeam,
  updateCoachAppointmentStatus,
} from '@/features/coach/api/coach.api';

const MotionBox = motion(Box);

const PRIORITY_GRADIENT = {
  urgent: 'linear-gradient(135deg, #EF4444, #DC2626)',
  normal: 'linear-gradient(135deg, #F59E0B, #D97706)',
  low: 'linear-gradient(135deg, #22C55E, #15803D)',
};
const PRIORITY_RANK = { urgent: 0, normal: 1, low: 2 };
const normalizePriority = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'urgent' || normalized === 'low') return normalized;
  return 'normal';
};
const priorityBadgeMeta = {
  urgent: { label: 'URGENT', fg: '#dc2626', bg: '#fee2e2' },
  normal: { label: 'NORMAL', fg: '#d97706', bg: '#fef3c7' },
  low: { label: 'LOW', fg: '#15803d', bg: '#dcfce7' },
};

const getInitials = (name = '') => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() || '')
  .join('') || 'NA';

const toDateTimeLabel = (rawDate) => {
  if (!rawDate) return 'N/A';
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const datePart = date.toISOString().split('T')[0];
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${timePart}`;
};

const getNoteValue = (notes, key) => {
  if (!notes) return '';
  const pattern = new RegExp(`${key}:\\s*([^|]+)`, 'i');
  const match = notes.match(pattern);
  return match?.[1]?.trim() || '';
};

const parseNoteTags = (notes) =>
  String(getNoteValue(notes, 'Priority Tags') || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

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
  const { user } = useAuth();
  const coachId = String(user?.id || user?._id || '');
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#0f1b34' : '#ffffff';
  const panelBorder = isDark ? '#24344f' : '#e5e7eb';
  const muted = isDark ? '#94a3b8' : '#6b7280';
  const isHeadCoach = String(user?.coachRole || 'head').toLowerCase() === 'head';
  const isSubCoach = String(user?.coachRole || 'head').toLowerCase() === 'sub';

  const [appointments, setAppointments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [queuePriorityFilter, setQueuePriorityFilter] = useState('all');
  const [queueSortMode, setQueueSortMode] = useState('priority');
  const [flippedMemberIds, setFlippedMemberIds] = useState({});
  const [toast, setToast] = useState({ open: false, message: '' });
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    appointment: null,
    reason: '',
    error: '',
    isSubmitting: false,
  });
  const [delegateDialog, setDelegateDialog] = useState({
    open: false,
    appointment: null,
    subCoachId: '',
    error: '',
    isSubmitting: false,
  });

  const mapAppointmentRow = useCallback((item) => {
    const name = getNoteValue(item.notes, 'User Name') || `User ${String(item.userId).slice(0, 6)}`;
    const priority = normalizePriority(item.priority);
    return {
      id: item._id,
      userId: item.userId,
      name,
      age: '-',
      goal: getNoteValue(item.notes, 'Goal') || item.sessionType || 'General',
      priorityTags: parseNoteTags(item.notes),
      requestedAt: toDateTimeLabel(item.startsAt),
      priority,
      avatar: getInitials(name),
      gradient: PRIORITY_GRADIENT[priority] || PRIORITY_GRADIENT.normal,
      email: getNoteValue(item.notes, 'User Email') || '-',
      branchUserId: getNoteValue(item.notes, 'Branch User ID') || '-',
      phone: getNoteValue(item.notes, 'Mobile') || '-',
      notes: getNoteValue(item.notes, 'Description') || item.notes || '-',
      rawNotes: item.notes || '',
      status: item.status,
      startsAt: item.startsAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      delegatedByCoachId: String(item.delegatedByCoachId || ''),
      delegatedByCoachName: String(item.delegatedByCoachName || ''),
      delegatedAt: item.delegatedAt || null,
    };
  }, []);

  const loadAppointments = useCallback(async () => {
    if (!coachId) return;
    try {
      const [{ data }, teamPayload] = await Promise.all([
        getCoachAppointments({
          page: 1,
          limit: 200,
        }),
        isHeadCoach ? getMyTeam().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
      ]);
      const all = Array.isArray(data?.data) ? data.data : [];
      const coachName = String(user?.name || '').trim().toLowerCase();
      const mine = all.filter((item) => {
        const byId = String(item.coachId || '') === coachId;
        const byNoteId = String(getNoteValue(item.notes, 'CoachId') || '') === coachId;
        const noteCoach = getNoteValue(item.notes, 'Coach').toLowerCase();
        const byName = coachName && noteCoach && noteCoach === coachName;
        const isCoachBooking = item.sessionType !== 'nutrition';
        return isCoachBooking && (byId || byNoteId || byName);
      });

      setAppointments(mine);
      setTeamMembers(Array.isArray(teamPayload?.data?.data) ? teamPayload.data.data : []);
    } catch (error) {
      setAppointments([]);
      setTeamMembers([]);
      const message = error?.response?.data?.message || 'Failed to load appointments';
      setToast({ open: true, message });
    }
  }, [coachId, isHeadCoach, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAppointments();
    }, 0);
    const interval = setInterval(() => {
      void loadAppointments();
    }, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadAppointments]);

  const pendingRows = useMemo(
    () => appointments.filter((item) => item.status === 'pending').map(mapAppointmentRow),
    [appointments, mapAppointmentRow],
  );
  const queueSummary = useMemo(() => {
    const counts = { urgent: 0, normal: 0, low: 0 };
    pendingRows.forEach((row) => {
      counts[row.priority] += 1;
    });
    return counts;
  }, [pendingRows]);
  const visiblePendingRows = useMemo(() => {
    const filtered = queuePriorityFilter === 'all'
      ? [...pendingRows]
      : pendingRows.filter((row) => row.priority === queuePriorityFilter);
    if (queueSortMode === 'date') {
      return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return filtered.sort((a, b) => {
      const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (rankDiff !== 0) return rankDiff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [pendingRows, queuePriorityFilter, queueSortMode]);

  const members = useMemo(() => {
    const accepted = appointments.filter((item) => item.status === 'approved' || item.status === 'completed');
    const byUser = new Map();

    accepted.forEach((item) => {
      const prev = byUser.get(item.userId);
      if (!prev || new Date(item.updatedAt).getTime() > new Date(prev.updatedAt).getTime()) {
        byUser.set(item.userId, item);
      }
    });

    return Array.from(byUser.values()).map((item) => {
      const name = getNoteValue(item.notes, 'User Name') || `User ${String(item.userId).slice(0, 6)}`;
      const goal = getNoteValue(item.notes, 'Goal') || item.sessionType || 'General';
      return {
        id: item.userId,
        name,
        age: '-',
        goal,
        score: item.status === 'completed' ? 65 : 0,
        progress: item.status === 'completed' ? 100 : 0,
        lastActive: item.status === 'completed' ? 'Completed session' : 'Recently approved',
        avatar: getInitials(name),
        gradient: 'linear-gradient(135deg, #3B82F6, #0D9488)',
        status: item.status === 'completed' ? 'Completed' : 'Active',
        branchUserId: getNoteValue(item.notes, 'Branch User ID') || '-',
        priorityTags: parseNoteTags(item.notes),
        email: getNoteValue(item.notes, 'User Email') || '-',
        phone: getNoteValue(item.notes, 'Mobile') || '-',
        preferredSlot: toDateTimeLabel(item.startsAt),
        trainingDays: 'To be scheduled',
        notes: getNoteValue(item.notes, 'Description') || item.notes || '-',
        priority: normalizePriority(item.priority),
      };
    });
  }, [appointments]);

  const approveRequest = async (request) => {
    try {
      await updateCoachAppointmentStatus(request.id, { status: 'approved' });
      await loadAppointments();
      setToast({ open: true, message: 'Appointment approved' });
    } catch (error) {
      setToast({ open: true, message: error?.response?.data?.message || 'Failed to approve appointment' });
    }
  };

  const openRejectDialog = (request) => {
    setRejectDialog({
      open: true,
      appointment: request,
      reason: '',
      error: '',
      isSubmitting: false,
    });
  };

  const closeRejectDialog = () => {
    setRejectDialog({
      open: false,
      appointment: null,
      reason: '',
      error: '',
      isSubmitting: false,
    });
  };

  const rejectRequest = async () => {
    const request = rejectDialog.appointment;
    const reason = rejectDialog.reason.trim();
    if (!request?.id) return;
    if (!reason) {
      setRejectDialog((prev) => ({ ...prev, error: 'Please add a reject reason.' }));
      return;
    }

    const existingSegments = String(request.rawNotes || '')
      .split('|')
      .map((segment) => segment.trim())
      .filter((segment) => segment && !/^Reject Reason\s*:/i.test(segment));
    const notesWithRejectReason = [...existingSegments, `Reject Reason: ${reason}`].join(' | ');

    setRejectDialog((prev) => ({ ...prev, error: '', isSubmitting: true }));
    try {
      await updateCoachAppointmentStatus(request.id, {
        status: 'rejected',
        notes: notesWithRejectReason,
      });
      await loadAppointments();
      setToast({ open: true, message: 'Appointment rejected' });
      closeRejectDialog();
    } catch (error) {
      setRejectDialog((prev) => ({
        ...prev,
        isSubmitting: false,
        error: error?.response?.data?.message || 'Failed to reject appointment',
      }));
    }
  };

  const openDelegateDialog = (request) => {
    setDelegateDialog({
      open: true,
      appointment: request,
      subCoachId: '',
      error: '',
      isSubmitting: false,
    });
  };

  const closeDelegateDialog = () => {
    setDelegateDialog({
      open: false,
      appointment: null,
      subCoachId: '',
      error: '',
      isSubmitting: false,
    });
  };

  const submitDelegate = async () => {
    if (!delegateDialog.appointment?.id) return;
    if (!delegateDialog.subCoachId) {
      setDelegateDialog((prev) => ({ ...prev, error: 'Please select a sub-coach.' }));
      return;
    }

    setDelegateDialog((prev) => ({ ...prev, error: '', isSubmitting: true }));
    try {
      await delegateAppointment(delegateDialog.appointment.id, delegateDialog.subCoachId);
      await loadAppointments();
      setToast({ open: true, message: 'Appointment delegated successfully.' });
      closeDelegateDialog();
    } catch (error) {
      setDelegateDialog((prev) => ({
        ...prev,
        isSubmitting: false,
        error: error?.response?.data?.message || 'Failed to delegate appointment',
      }));
    }
  };

  const toggleMemberCard = (id) => {
    setFlippedMemberIds((prev) => ({ ...prev, [id]: !prev[id] }));
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
          <Chip label={`${visiblePendingRows.length} pending`} size="small" sx={{ fontWeight: 700 }} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1.2 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'normal', label: 'Normal' },
              { value: 'low', label: 'Low' },
            ].map((option) => (
              <Button
                key={option.value}
                size="small"
                variant={queuePriorityFilter === option.value ? 'contained' : 'outlined'}
                onClick={() => setQueuePriorityFilter(option.value)}
                sx={{ textTransform: 'none', borderRadius: 99, fontWeight: 700 }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setQueueSortMode((prev) => (prev === 'priority' ? 'date' : 'priority'))}
            sx={{ textTransform: 'none', borderRadius: 99, fontWeight: 700, alignSelf: { xs: 'flex-start', md: 'center' } }}
          >
            {queueSortMode === 'priority' ? 'Priority Order' : 'Date Order'}
          </Button>
        </Stack>
        <Typography sx={{ color: muted, fontSize: '0.84rem', fontWeight: 700, mb: 1 }}>
          {`🔴 ${queueSummary.urgent} Urgent  🟡 ${queueSummary.normal} Normal  🟢 ${queueSummary.low} Low`}
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Branch ID</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Requested Time</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!pendingRows.length && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ color: 'text.secondary', py: 1 }}>No pending requests.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {visiblePendingRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', background: row.gradient }}>
                        {row.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{row.name}</Typography>
                        <Typography sx={{ color: muted, fontSize: '0.76rem' }}>Age {row.age}</Typography>
                        {isSubCoach && row.delegatedByCoachName && (
                          <Typography sx={{ color: '#0d9488', fontSize: '0.72rem', fontWeight: 700 }}>
                            Delegated by {row.delegatedByCoachName}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.84rem', color: muted, fontWeight: 700 }}>{row.branchUserId}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.84rem', color: 'text.primary' }}>{row.goal}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                      {row.priorityTags.length
                        ? row.priorityTags.map((tag) => <Chip key={`${row.id}-${tag}`} label={tag} size="small" />)
                        : <Typography sx={{ fontSize: '0.82rem', color: muted }}>-</Typography>}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.84rem', color: muted }}>{row.requestedAt}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={priorityBadgeMeta[row.priority]?.label || 'NORMAL'}
                      sx={{
                        fontWeight: 800,
                        color: priorityBadgeMeta[row.priority]?.fg || '#d97706',
                        bgcolor: priorityBadgeMeta[row.priority]?.bg || '#fef3c7',
                      }}
                    />
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
                        onClick={() => openRejectDialog(row)}
                        sx={{ textTransform: 'none', borderRadius: 1.4 }}
                      >
                        Reject
                      </Button>
                      {isHeadCoach && teamMembers.length > 0 && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openDelegateDialog(row)}
                          sx={{ textTransform: 'none', borderRadius: 1.4 }}
                        >
                          Delegate
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {pendingRows.length > 0 && visiblePendingRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ color: 'text.secondary', py: 1 }}>
                      No requests match the selected priority filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
            sx={{ perspective: '1200px' }}
          >
            <Box
              sx={{
                position: 'relative',
                minHeight: 258,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s ease',
                transform: flippedMemberIds[client.id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 2.2,
                  p: 2,
                  border: '1px solid',
                  borderColor: panelBorder,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  background: panelBg,
                  backfaceVisibility: 'hidden',
                }}
              >
                <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mb: 1.7 }}>
                  <Avatar sx={{ width: 46, height: 46, fontWeight: 800, fontSize: '1.05rem', color: '#fff', background: client.gradient }}>
                    {client.avatar}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.02rem' }}>{client.name}</Typography>
                    <Typography sx={{ color: muted, fontSize: '0.84rem' }}>
                      Age {client.age} - {client.goal}
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
                  <Button
                    size="small"
                    onClick={() => toggleMemberCard(client.id)}
                    sx={{ textTransform: 'none', color: '#0d9488', fontWeight: 700, p: 0, minWidth: 0 }}
                  >
                    View Profile
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 2.2,
                  p: 2,
                  border: '1px solid',
                  borderColor: panelBorder,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  background: panelBg,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>Client Details</Typography>
                  <Typography sx={{ color: muted, fontSize: '0.84rem', mb: 0.5 }}><strong>Branch ID:</strong> {client.branchUserId}</Typography>
                  <Typography sx={{ color: muted, fontSize: '0.84rem', mb: 0.5 }}><strong>Email:</strong> {client.email}</Typography>
                  <Typography sx={{ color: muted, fontSize: '0.84rem', mb: 0.5 }}><strong>Phone:</strong> {client.phone}</Typography>
                  <Typography sx={{ color: muted, fontSize: '0.84rem', mb: 0.5 }}><strong>Preferred Slot:</strong> {client.preferredSlot}</Typography>
                  <Typography sx={{ color: muted, fontSize: '0.84rem', mb: 0.5 }}><strong>Training Days:</strong> {client.trainingDays}</Typography>
                  <Typography sx={{ color: muted, fontSize: '0.84rem', mb: 0.5 }}><strong>Tags:</strong></Typography>
                  <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mb: 0.7 }}>
                    {client.priorityTags.length
                      ? client.priorityTags.map((tag) => <Chip key={`${client.id}-${tag}`} label={tag} size="small" />)
                      : <Typography sx={{ color: muted, fontSize: '0.84rem' }}>-</Typography>}
                  </Stack>
                  <Typography sx={{ color: muted, fontSize: '0.84rem', mb: 0.5 }}>
                    <strong>Priority:</strong> {priorityBadgeMeta[client.priority]?.label || 'NORMAL'}
                  </Typography>
                  <Typography sx={{ color: muted, fontSize: '0.84rem' }}><strong>Notes:</strong> {client.notes}</Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => toggleMemberCard(client.id)}
                  sx={{ textTransform: 'none', color: '#0d9488', fontWeight: 700, alignSelf: 'flex-start', p: 0, minWidth: 0 }}
                >
                  Back
                </Button>
              </Box>
            </Box>
          </MotionBox>
        ))}
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />

      <Dialog
        open={rejectDialog.open}
        onClose={closeRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Appointment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1, color: muted, fontSize: '0.9rem' }}>
            Add a reason for rejection. This will be shown in user booking history.
          </Typography>
          <Typography sx={{ mb: 1, color: 'text.primary', fontSize: '0.9rem', fontWeight: 700 }}>
            {rejectDialog.appointment?.name || ''}
          </Typography>
          <TextField
            fullWidth
            required
            label="Reject Reason"
            multiline
            minRows={3}
            value={rejectDialog.reason}
            onChange={(event) =>
              setRejectDialog((prev) => ({ ...prev, reason: event.target.value, error: '' }))
            }
          />
          {rejectDialog.error && (
            <Typography sx={{ mt: 1, color: '#ef4444', fontSize: '0.84rem', fontWeight: 600 }}>
              {rejectDialog.error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={rejectRequest}
            disabled={rejectDialog.isSubmitting}
          >
            {rejectDialog.isSubmitting ? 'Submitting...' : 'Submit Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={delegateDialog.open} onClose={closeDelegateDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delegate Appointment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1, color: muted, fontSize: '0.9rem' }}>
            Select a sub-coach to reassign this pending booking.
          </Typography>
          <Typography sx={{ mb: 1.2, color: 'text.primary', fontSize: '0.9rem', fontWeight: 700 }}>
            {delegateDialog.appointment?.name || ''}
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="delegate-subcoach-label">Sub-Coach</InputLabel>
            <Select
              labelId="delegate-subcoach-label"
              label="Sub-Coach"
              value={delegateDialog.subCoachId}
              onChange={(event) =>
                setDelegateDialog((prev) => ({
                  ...prev,
                  subCoachId: event.target.value,
                  error: '',
                }))
              }
            >
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {`${member.name} (${Number(member.pendingCount || 0)} pending)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {delegateDialog.error && (
            <Typography sx={{ mt: 1, color: '#ef4444', fontSize: '0.84rem', fontWeight: 600 }}>
              {delegateDialog.error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelegateDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitDelegate} disabled={delegateDialog.isSubmitting}>
            {delegateDialog.isSubmitting ? 'Delegating...' : 'Delegate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CoachClients;
