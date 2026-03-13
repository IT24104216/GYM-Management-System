import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Chip,
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
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/utils/constants';

const mockMembers = [
  {
    id: 1,
    name: 'John Doe',
    joinedDate: '2025-01-15',
    age: 28,
    weight: 75,
    height: 175,
    goal: 'Build muscle and increase strength',
  },
];
const mockAppointments = [
  {
    id: 201,
    member: 'John Doe',
    date: '2026-03-15',
    time: '10:00 AM',
    goal: 'Weight Management',
    status: 'Pending',
  },
  {
    id: 202,
    member: 'Jane Silva',
    date: '2026-03-16',
    time: '02:30 PM',
    goal: 'Muscle Gain Nutrition',
    status: 'Pending',
  },
  {
    id: 203,
    member: 'Kavindu Perera',
    date: '2026-03-17',
    time: '09:15 AM',
    goal: 'Fat Loss Meal Plan',
    status: 'Pending',
  },
];

const tabItems = ['Members', 'Appointments', 'Time Slots'];

function DietitianDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState('Members');
  const [searchText, setSearchText] = useState('');
  const [appointments, setAppointments] = useState(mockAppointments);
  const [members, setMembers] = useState(mockMembers);
  const [slotForm, setSlotForm] = useState({
    date: '2026-03-08',
    startTime: '08:00',
    endTime: '08:15',
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotNotice, setSlotNotice] = useState({ open: false, message: '' });
  const [slotError, setSlotError] = useState('');
  const [editSlotState, setEditSlotState] = useState({
    open: false,
    id: null,
    date: '',
    startTime: '',
    endTime: '',
  });
  const [deleteSlotState, setDeleteSlotState] = useState({
    open: false,
    id: null,
    label: '',
  });

  const pageBg = isDark
    ? 'radial-gradient(circle at 15% 10%, #1b355b 0%, #0f1e3d 60%, #0b1731 100%)'
    : 'linear-gradient(180deg, #f8fbff 0%, #edf3fb 100%)';
  const panelBg = isDark ? '#1a2a47' : '#ffffff';
  const panelBorder = isDark ? '#2b4268' : '#dbe7f6';
  const subtitleColor = isDark ? '#8ea7cb' : '#5b7398';
  const mutedText = isDark ? '#88a1c7' : '#607aa5';

  const filteredMembers = useMemo(
    () =>
      members.filter((m) =>
        m.name.toLowerCase().includes(searchText.trim().toLowerCase()),
      ),
    [members, searchText],
  );

  const stats = [
    { label: 'Total Members', value: filteredMembers.length, icon: GroupRoundedIcon },
    { label: 'Diet Plans', value: 0, icon: FavoriteBorderRoundedIcon },
    { label: 'Available Slots', value: 0, icon: AccessTimeRoundedIcon },
    { label: 'Appointments', value: 0, icon: CalendarMonthRoundedIcon },
  ];

  const approveAppointment = (appointment) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointment.id ? { ...item, status: 'Approved' } : item,
      ),
    );

    setMembers((prev) => {
      const exists = prev.some(
        (member) => member.name.toLowerCase() === appointment.member.toLowerCase(),
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          id: Date.now(),
          name: appointment.member,
          joinedDate: appointment.date,
          age: 27,
          weight: 70,
          height: 170,
          goal: appointment.goal,
        },
      ];
    });

    setActiveTab('Members');
    setSearchText('');
  };

  const getWeekdayLabel = (isoDate) => {
    if (!isoDate) return '';
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const to12Hour = (time24) => {
    const [hoursRaw, minsRaw] = (time24 || '').split(':');
    const hours = Number(hoursRaw);
    const mins = Number(minsRaw);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return '';
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const converted = hours % 12 || 12;
    return `${String(converted).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${suffix}`;
  };

  const addTimeSlot = () => {
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      setSlotError('Please fill date, start time, and end time.');
      return;
    }
    const selectedDate = new Date(slotForm.date);
    const day = selectedDate.getDay();
    if (day !== 0 && day !== 6) {
      setSlotError('Time slots can be created only for Saturday and Sunday.');
      return;
    }
    setSlotError('');
    setTimeSlots((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: slotForm.date,
        day: getWeekdayLabel(slotForm.date),
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
      },
    ]);
    setSlotNotice({ open: true, message: 'Time slot created successfully!' });
  };

  const openEditSlot = (slot) => {
    setEditSlotState({
      open: true,
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const saveEditedSlot = () => {
    const { id, date, startTime, endTime } = editSlotState;
    if (!date || !startTime || !endTime) {
      setSlotError('Please fill date, start time, and end time.');
      return;
    }
    const selectedDate = new Date(date);
    const day = selectedDate.getDay();
    if (day !== 0 && day !== 6) {
      setSlotError('Time slots can be created only for Saturday and Sunday.');
      return;
    }
    setSlotError('');
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === id
          ? { ...slot, date, day: getWeekdayLabel(date), startTime, endTime }
          : slot,
      ),
    );
    setEditSlotState({ open: false, id: null, date: '', startTime: '', endTime: '' });
    setSlotNotice({ open: true, message: 'Time slot updated successfully!' });
  };

  const openDeleteSlot = (slot) => {
    setDeleteSlotState({
      open: true,
      id: slot.id,
      label: `${slot.day}, ${slot.date} (${to12Hour(slot.startTime)} - ${to12Hour(slot.endTime)})`,
    });
  };

  const confirmDeleteSlot = () => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== deleteSlotState.id));
    setDeleteSlotState({ open: false, id: null, label: '' });
    setSlotNotice({ open: true, message: 'Time slot deleted successfully!' });
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: 'calc(100vh - 120px)',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: panelBorder,
        background: pageBg,
      }}
    >
      <Typography sx={{ color: '#f8fafc', fontWeight: 800, fontSize: { xs: '1.8rem', md: '2rem' } }}>
        Dietician Dashboard
      </Typography>
      <Typography sx={{ color: subtitleColor, fontSize: '1.05rem', mb: 2.5 }}>
        Manage diet plans and consultations
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box
              key={stat.label}
              sx={{
                background: panelBg,
                border: '1px solid',
                borderColor: panelBorder,
                borderRadius: 2,
                p: 2.2,
                minHeight: 126,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ color: subtitleColor, fontWeight: 600, fontSize: '1.05rem' }}>
                  {stat.label}
                </Typography>
                <Icon sx={{ color: '#ff3048', fontSize: 18 }} />
              </Stack>
              <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '2.2rem', lineHeight: 1 }}>
                {stat.value}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" spacing={0.4} sx={{ mb: 2.5, width: 'fit-content', background: panelBg, borderRadius: 99, p: 0.45 }}>
        {tabItems.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              textTransform: 'none',
              borderRadius: 99,
              px: 1.7,
              py: 0.45,
              minWidth: 0,
              fontWeight: 600,
              color: activeTab === tab ? '#0f172a' : '#a4bad9',
              backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
            }}
          >
            {tab}
          </Button>
        ))}
      </Stack>

      <TextField
        fullWidth
        placeholder="Search member by name..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{
          mb: 2.1,
          '& .MuiOutlinedInput-root': {
            color: '#cfe0fb',
            borderRadius: 1.5,
            background: isDark ? '#1a2a47' : '#f7fbff',
            '& fieldset': { borderColor: panelBorder },
            '&:hover fieldset': { borderColor: panelBorder },
            '&.Mui-focused fieldset': { borderColor: '#4f77b6' },
          },
          '& .MuiInputBase-input::placeholder': { color: mutedText, opacity: 1 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: mutedText, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {activeTab === 'Members' && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.3 }}>
            <Typography sx={{ color: '#e6f0ff', fontWeight: 700, fontSize: '1rem' }}>
              Members
            </Typography>
            <Button
              onClick={() => navigate(ROUTES.DIETITIAN_CLIENTS)}
              sx={{
                textTransform: 'none',
                color: '#93c5fd',
                fontWeight: 700,
                p: 0,
                minWidth: 0,
              }}
              endIcon={<ChevronRightRoundedIcon sx={{ fontSize: 16 }} />}
            >
              View all
            </Button>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
          {filteredMembers.map((member) => (
            <Box
              key={member.id}
              sx={{
                background: panelBg,
                border: '1px solid',
                borderColor: panelBorder,
                borderRadius: 2,
                p: 2.4,
                minHeight: 330,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1.85rem', mb: 0.5 }}>
                {member.name}
              </Typography>
              <Typography sx={{ color: mutedText, fontSize: '1.02rem', mb: 2.2 }}>
                Member since {member.joinedDate}
              </Typography>

              <Typography sx={{ color: '#b7cce8', fontSize: '1.03rem', lineHeight: 1.6 }}>
                Age: {member.age} years
                <br />
                Weight: {member.weight} kg
                <br />
                Height: {member.height} cm
                <br />
                Goal: {member.goal}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 'auto',
                  pt: 1.9,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 1.8,
                  backgroundColor: '#f30612',
                  '&:hover': { backgroundColor: '#cf0812' },
                }}
              >
                Create Diet Plan
              </Button>
            </Box>
          ))}
          </Box>
        </>
      )}

      {activeTab === 'Appointments' && (
        <Box
          sx={{
            p: 1.2,
            border: '1px solid',
            borderColor: panelBorder,
            borderRadius: 2,
            background: panelBg,
          }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: subtitleColor, borderBottomColor: panelBorder }}>Member</TableCell>
                  <TableCell sx={{ color: subtitleColor, borderBottomColor: panelBorder }}>Date</TableCell>
                  <TableCell sx={{ color: subtitleColor, borderBottomColor: panelBorder }}>Time</TableCell>
                  <TableCell sx={{ color: subtitleColor, borderBottomColor: panelBorder }}>Goal</TableCell>
                  <TableCell sx={{ color: subtitleColor, borderBottomColor: panelBorder }}>Status</TableCell>
                  <TableCell sx={{ color: subtitleColor, borderBottomColor: panelBorder }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ color: '#e7f0ff', borderBottomColor: panelBorder, fontWeight: 600 }}>
                      {row.member}
                    </TableCell>
                    <TableCell sx={{ color: mutedText, borderBottomColor: panelBorder }}>{row.date}</TableCell>
                    <TableCell sx={{ color: mutedText, borderBottomColor: panelBorder }}>{row.time}</TableCell>
                    <TableCell sx={{ color: mutedText, borderBottomColor: panelBorder }}>{row.goal}</TableCell>
                    <TableCell sx={{ borderBottomColor: panelBorder }}>
                      <Chip
                        size="small"
                        label={row.status}
                        sx={{
                          fontWeight: 700,
                          color:
                            row.status === 'Approved'
                              ? '#22c55e'
                              : row.status === 'Rejected'
                                ? '#ef4444'
                                : '#f59e0b',
                          bgcolor:
                            row.status === 'Approved'
                              ? '#22c55e1a'
                              : row.status === 'Rejected'
                                ? '#ef44441a'
                                : '#f59e0b1a',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottomColor: panelBorder }}>
                      <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => approveAppointment(row)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            minWidth: 84,
                            bgcolor: '#16a34a',
                            '&:hover': { bgcolor: '#15803d' },
                            visibility: row.status === 'Approved' ? 'hidden' : 'visible',
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            setAppointments((prev) =>
                              prev.map((item) =>
                                item.id === row.id ? { ...item, status: 'Rejected' } : item,
                              ),
                            )
                          }
                          sx={{ textTransform: 'none', fontWeight: 700, minWidth: 76 }}
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
        </Box>
      )}

      {activeTab === 'Time Slots' && (
        <Stack spacing={2.5}>
          <Box
            sx={{
              background: panelBg,
              border: '1px solid',
              borderColor: panelBorder,
              borderRadius: 2,
              p: { xs: 1.8, md: 2.3 },
            }}
          >
            <Typography
              sx={{
                color: '#e6f0ff',
                fontWeight: 800,
                fontSize: { xs: '1.35rem', md: '1.75rem' },
              }}
            >
              Create Consultation Time Slot
            </Typography>
            <Typography sx={{ color: subtitleColor, fontSize: { xs: '0.98rem', md: '1.1rem' }, mb: 2.1 }}>
              Available only on Saturday and Sunday
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 1.6,
              }}
            >
              <TextField
                label="Date"
                type="date"
                value={slotForm.date}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#d8e7ff',
                    borderRadius: 1.5,
                    background: isDark ? '#253a5d' : '#f3f8ff',
                    '& fieldset': { borderColor: panelBorder },
                  },
                  '& .MuiInputLabel-root': {
                    color: subtitleColor,
                    fontSize: '0.9rem',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.98rem',
                    fontWeight: 600,
                  },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: isDark ? 'invert(1) brightness(1.5)' : 'none',
                    opacity: 0.95,
                    cursor: 'pointer',
                  },
                }}
              />
              <TextField
                label="Start Time"
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, startTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#d8e7ff',
                    borderRadius: 1.5,
                    background: isDark ? '#253a5d' : '#f3f8ff',
                    '& fieldset': { borderColor: panelBorder },
                  },
                  '& .MuiInputLabel-root': {
                    color: subtitleColor,
                    fontSize: '0.9rem',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.98rem',
                    fontWeight: 600,
                  },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: isDark ? 'invert(1) brightness(1.5)' : 'none',
                    opacity: 0.95,
                    cursor: 'pointer',
                  },
                }}
              />
              <TextField
                label="End Time"
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, endTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#d8e7ff',
                    borderRadius: 1.5,
                    background: isDark ? '#253a5d' : '#f3f8ff',
                    '& fieldset': { borderColor: panelBorder },
                  },
                  '& .MuiInputLabel-root': {
                    color: subtitleColor,
                    fontSize: '0.9rem',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.98rem',
                    fontWeight: 600,
                  },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: isDark ? 'invert(1) brightness(1.5)' : 'none',
                    opacity: 0.95,
                    cursor: 'pointer',
                  },
                }}
              />
            </Box>

            <Typography sx={{ color: subtitleColor, fontSize: '0.98rem', mt: 0.8 }}>
              {getWeekdayLabel(slotForm.date)}
            </Typography>

            {!!slotError && (
              <Typography sx={{ color: '#f87171', mt: 0.8, fontSize: '0.92rem' }}>
                {slotError}
              </Typography>
            )}

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={addTimeSlot}
              sx={{
                mt: 1.5,
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 1.4,
                px: 2,
                py: 0.8,
                fontSize: '0.98rem',
                backgroundColor: '#f30612',
                '&:hover': { backgroundColor: '#cf0812' },
              }}
            >
              Add Time Slot
            </Button>
          </Box>

          <Box>
            <Typography sx={{ color: '#e6f0ff', fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, mb: 1.2 }}>
              Your Time Slots
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: panelBorder,
                borderRadius: 2,
                background: panelBg,
                p: 2,
                minHeight: 92,
              }}
            >
              {timeSlots.length === 0 ? (
                <Typography sx={{ color: mutedText, textAlign: 'center', mt: 2, fontSize: '1rem' }}>
                  No time slots created yet. Add one to get started!
                </Typography>
              ) : (
                <Stack spacing={1.1}>
                  {timeSlots.map((slot) => (
                    <Box
                      key={slot.id}
                      sx={{
                        border: '1px solid',
                        borderColor: panelBorder,
                        borderRadius: 1.5,
                        p: 1.2,
                        background: isDark ? '#203456' : '#f8fbff',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Box>
                          <Typography sx={{ color: '#dbeafe', fontWeight: 700, fontSize: '1.05rem' }}>
                            {slot.day}, {slot.date}
                          </Typography>
                          <Typography sx={{ color: mutedText, fontSize: '0.95rem' }}>
                            {to12Hour(slot.startTime)} - {to12Hour(slot.endTime)}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.8}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditRoundedIcon sx={{ fontSize: 14 }} />}
                            onClick={() => openEditSlot(slot)}
                            sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1.1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
                            onClick={() => openDeleteSlot(slot)}
                            sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1.1 }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>
      )}
      <Dialog open={slotNotice.open} onClose={() => setSlotNotice((prev) => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle>Figma</DialogTitle>
        <DialogContent>
          <Typography>{slotNotice.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotNotice((prev) => ({ ...prev, open: false }))}>OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editSlotState.open}
        onClose={() => setEditSlotState({ open: false, id: null, date: '', startTime: '', endTime: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Time Slot</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2} sx={{ mt: 0.5 }}>
            <TextField
              label="Date"
              type="date"
              value={editSlotState.date}
              onChange={(e) => setEditSlotState((prev) => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Start Time"
              type="time"
              value={editSlotState.startTime}
              onChange={(e) => setEditSlotState((prev) => ({ ...prev, startTime: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Time"
              type="time"
              value={editSlotState.endTime}
              onChange={(e) => setEditSlotState((prev) => ({ ...prev, endTime: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditSlotState({ open: false, id: null, date: '', startTime: '', endTime: '' })}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={saveEditedSlot}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteSlotState.open}
        onClose={() => setDeleteSlotState({ open: false, id: null, label: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Time Slot</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this slot?</Typography>
          <Typography sx={{ mt: 0.8, color: mutedText, fontSize: '0.9rem' }}>
            {deleteSlotState.label}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSlotState({ open: false, id: null, label: '' })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteSlot}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DietitianDashboard;
