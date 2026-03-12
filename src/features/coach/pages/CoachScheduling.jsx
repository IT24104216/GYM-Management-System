import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { useAuth } from '@/shared/hooks/useAuth';

const MotionBox = motion(Box);
const SLOT_TYPES = ['In-Person', 'Online', 'Hybrid'];

const initialForm = {
  date: '',
  startTime: '',
  endTime: '',
  type: 'In-Person',
  notes: '',
};

const toDateTime = (date, time) => new Date(`${date}T${time}:00`);
const stripToDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfWeek = (date) => {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return stripToDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff));
};
const endOfWeek = (date) => {
  const start = startOfWeek(date);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
};

function CoachScheduling() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth();
  const storageKey = `coach_scheduling_slots_v1_${user?.id || 'guest'}`;

  const [slots, setSlots] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewMode, setViewMode] = useState('weekly');

  const saveSlots = (next) => {
    setSlots(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const orderedSlots = useMemo(() => {
    return [...slots].sort((a, b) => toDateTime(a.date, a.startTime) - toDateTime(b.date, b.startTime));
  }, [slots]);

  const filteredSlots = useMemo(() => {
    const now = new Date();
    const today = stripToDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    if (viewMode === 'daily') {
      return orderedSlots.filter((slot) => stripToDay(new Date(`${slot.date}T00:00:00`)).getTime() === today.getTime());
    }
    if (viewMode === 'weekly') {
      return orderedSlots.filter((slot) => {
        const day = new Date(`${slot.date}T00:00:00`);
        return day >= weekStart && day <= weekEnd;
      });
    }
    return orderedSlots.filter((slot) => {
      const day = new Date(`${slot.date}T00:00:00`);
      return day.getFullYear() === now.getFullYear() && day.getMonth() === now.getMonth();
    });
  }, [orderedSlots, viewMode]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const upcoming = slots.filter((s) => toDateTime(s.date, s.endTime) >= now).length;
    const todayCount = slots.filter((s) => s.date === today).length;
    return {
      total: slots.length,
      today: todayCount,
      upcoming,
    };
  }, [slots]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const onChange = (field) => (event) => {
    setError('');
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    if (!form.date || !form.startTime || !form.endTime) {
      return 'Please complete date and time fields.';
    }

    const start = toDateTime(form.date, form.startTime);
    const end = toDateTime(form.date, form.endTime);
    if (end <= start) {
      return 'End time must be after start time.';
    }

    const duplicate = slots.some((s) => (
      s.id !== editingId
      && s.date === form.date
      && s.startTime === form.startTime
      && s.endTime === form.endTime
    ));
    if (duplicate) {
      return 'This time slot already exists.';
    }

    return '';
  };

  const onSubmit = () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    const payload = {
      id: editingId || Date.now(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      type: form.type,
      notes: form.notes.trim(),
    };

    if (editingId) {
      saveSlots(slots.map((item) => (item.id === editingId ? payload : item)));
    } else {
      saveSlots([...slots, payload]);
    }

    resetForm();
  };

  const onEdit = (slot) => {
    setEditingId(slot.id);
    setForm({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
      notes: slot.notes || '',
    });
  };

  const onDelete = () => {
    if (!deleteId) return;
    saveSlots(slots.filter((s) => s.id !== deleteId));
    setDeleteId(null);
    if (editingId === deleteId) resetForm();
  };

  const slotStatus = (slot) => {
    const now = new Date();
    const start = toDateTime(slot.date, slot.startTime);
    const end = toDateTime(slot.date, slot.endTime);
    if (end < now) return { label: 'Completed', color: '#64748b' };
    if (start <= now && end >= now) return { label: 'Ongoing', color: '#0d9488' };
    return { label: 'Upcoming', color: '#16a34a' };
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      sx={{ pb: 3 }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 900, color: 'text.primary' }}>
          Coach Scheduling
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.3 }}>
          Manage your available consultation and training slots professionally.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          mb: 2.2,
          width: '100%',
        }}
      >
        {[{ label: 'Total Slots', value: stats.total, icon: <CalendarMonthRoundedIcon /> }, { label: 'Today', value: stats.today, icon: <AccessTimeRoundedIcon /> }, { label: 'Upcoming', value: stats.upcoming, icon: <EventAvailableRoundedIcon /> }].map((item) => (
          <Card key={item.label} sx={{ borderRadius: 2.6, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', minHeight: 130, width: '100%' }}>
            <CardContent sx={{ p: 2.2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>{item.label}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: 'text.primary', lineHeight: 1.1 }}>{item.value}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 1.7, display: 'grid', placeItems: 'center', bgcolor: isDark ? '#173155' : '#e6f0ff', color: isDark ? '#93c5fd' : '#2563eb' }}>
                  {item.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(340px, 0.42fr) minmax(0, 1fr)' },
          gap: 2,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Card sx={{ borderRadius: 2.8, border: '1px solid', borderColor: 'divider', minHeight: 560 }}>
            <CardContent sx={{ p: 2.4 }}>
              <Typography sx={{ fontWeight: 800, mb: 1.2, color: 'text.primary' }}>
                {editingId ? 'Edit Slot' : 'Add Availability Slot'}
              </Typography>

              <Stack spacing={1.2}>
                <TextField label="Date" type="date" value={form.date} onChange={onChange('date')} InputLabelProps={{ shrink: true }} size="small" fullWidth />
                <Stack direction="row" spacing={1.2}>
                  <TextField label="Start" type="time" value={form.startTime} onChange={onChange('startTime')} InputLabelProps={{ shrink: true }} size="small" fullWidth />
                  <TextField label="End" type="time" value={form.endTime} onChange={onChange('endTime')} InputLabelProps={{ shrink: true }} size="small" fullWidth />
                </Stack>
                <TextField select label="Session Type" value={form.type} onChange={onChange('type')} size="small" fullWidth>
                  {SLOT_TYPES.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
                <TextField label="Notes (optional)" value={form.notes} onChange={onChange('notes')} multiline minRows={4} size="small" fullWidth />

                {error && <Alert severity="error">{error}</Alert>}

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={onSubmit}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.6, bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
                  >
                    {editingId ? 'Update Slot' : 'Add Slot'}
                  </Button>
                  {editingId && (
                    <Button variant="text" onClick={resetForm} sx={{ textTransform: 'none' }}>Cancel</Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Card sx={{ borderRadius: 2.8, border: '1px solid', borderColor: 'divider', minHeight: 560 }}>
            <CardContent sx={{ p: 2.4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} justifyContent="space-between" sx={{ mb: 1.4 }}>
                <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>Available Time Slots</Typography>
                <Stack direction="row" spacing={0.8}>
                  {[
                    { key: 'daily', label: 'Daily' },
                    { key: 'weekly', label: 'Weekly' },
                    { key: 'monthly', label: 'Monthly' },
                  ].map((mode) => (
                    <Button
                      key={mode.key}
                      size="small"
                      onClick={() => setViewMode(mode.key)}
                      variant={viewMode === mode.key ? 'contained' : 'outlined'}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.5,
                        fontWeight: 700,
                        minWidth: 80,
                        ...(viewMode === mode.key
                          ? { bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }
                          : {}),
                      }}
                    >
                      {mode.label}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              {!filteredSlots.length && (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, py: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {viewMode === 'daily' && 'No slots for today.'}
                    {viewMode === 'weekly' && 'No slots for this week.'}
                    {viewMode === 'monthly' && 'No slots for this month.'}
                  </Typography>
                </Box>
              )}

              <Stack spacing={1.1}>
                {filteredSlots.map((slot) => {
                  const status = slotStatus(slot);
                  return (
                    <Box key={slot.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.8, px: 1.5, py: 1.2, bgcolor: 'background.paper' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {slot.date} | {slot.startTime} - {slot.endTime}
                          </Typography>
                          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip label={slot.type} size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 700 }} />
                            <Chip label={status.label} size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 700, bgcolor: `${status.color}20`, color: status.color }} />
                          </Stack>
                          {!!slot.notes && (
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.6 }}>{slot.notes}</Typography>
                          )}
                        </Box>

                        <Stack direction="row" spacing={0.8}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => onEdit(slot)}
                            sx={{ textTransform: 'none', borderRadius: 1.4 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteOutlineRoundedIcon />}
                            onClick={() => setDeleteId(slot.id)}
                            sx={{ textTransform: 'none', borderRadius: 1.4 }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Slot</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this slot?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={onDelete} color="error" variant="contained" sx={{ textTransform: 'none' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </MotionBox>
  );
}

export default CoachScheduling;
