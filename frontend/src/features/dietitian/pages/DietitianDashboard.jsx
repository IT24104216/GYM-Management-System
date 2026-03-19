import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/utils/constants';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  deleteMealPlan,
  createDietitianSchedulingSlot,
  deleteDietitianSchedulingSlot,
  submitMealPlan,
  upsertDietitianClientPlan,
  updateDietitianAppointmentStatus,
  updateDietitianSchedulingSlot,
} from '../api/dietitian.api';
import {
  createDietPlanForm,
  getWeekdayLabel,
  hasAnyMealName,
  mealSections,
  sanitizePlanSection,
  tabItems,
  to12Hour,
} from '../utils/dietitianDashboard.utils';
import {
  useDietitianAppointmentsData,
  useDietitianMealsAndPlans,
  useDietitianTimeSlots,
} from '../hooks/useDietitianDashboardData';
import DietitianStatsGrid from '../components/DietitianStatsGrid';
import DietitianDashboardHeaderControls from '../components/DietitianDashboardHeaderControls';
import DietitianAppointmentsTable from '../components/DietitianAppointmentsTable';

const mockMembers = [];
const mockAppointments = [];


function DietitianDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const dietitianId = String(user?.id || user?._id || '');
  const dietitianName = String(user?.name || '').trim().toLowerCase();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState('Members');
  const [searchText, setSearchText] = useState('');
  const [slotForm, setSlotForm] = useState({
    date: '2026-03-08',
    startTime: '08:00',
    endTime: '08:15',
  });
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
  const [dietPlanModal, setDietPlanModal] = useState({
    open: false,
    member: null,
  });
  const [dietPlanForm, setDietPlanForm] = useState(createDietPlanForm());

  const { timeSlots, isSlotsLoading, loadTimeSlots } = useDietitianTimeSlots(dietitianId, setSlotError);
  const { mealSuggestions, savedDietPlans, loadDietitianMealsAndPlans } = useDietitianMealsAndPlans(
    dietitianId,
    setSlotError,
  );
  const { appointments, members, loadDietitianAppointments } = useDietitianAppointmentsData(
    dietitianId,
    dietitianName,
    setSlotError,
    mockAppointments,
    mockMembers,
  );
  const pageBg = isDark
    ? 'radial-gradient(circle at 15% 10%, #1b355b 0%, #0f1e3d 60%, #0b1731 100%)'
    : 'linear-gradient(180deg, #f8fbff 0%, #edf3fb 100%)';
  const panelBg = isDark ? '#1a2a47' : '#ffffff';
  const panelBorder = isDark ? '#2b4268' : '#dbe7f6';
  const subtitleColor = isDark ? '#8ea7cb' : '#5b7398';
  const mutedText = isDark ? '#88a1c7' : '#607aa5';
  const sectionTitleColor = isDark ? '#e6f0ff' : '#0f172a';
  const inputTextColor = isDark ? '#cfe0fb' : '#334155';
  const cardTitleColor = isDark ? '#ffffff' : '#0f172a';
  const cardBodyColor = isDark ? '#b7cce8' : '#64748b';
  const linkColor = isDark ? '#93c5fd' : '#2563eb';
  const slotTitleColor = isDark ? '#dbeafe' : '#0f172a';

  const filteredMembers = useMemo(
    () =>
      members.filter((m) =>
        m.name.toLowerCase().includes(searchText.trim().toLowerCase()),
      ),
    [members, searchText],
  );
  const displayedMembers = filteredMembers.slice(0, 3);

  const stats = [
    { label: 'Total Members', value: members.length, icon: GroupRoundedIcon },
    { label: 'Diet Plans', value: Object.keys(savedDietPlans).length, icon: FavoriteBorderRoundedIcon },
    { label: 'Available Slots', value: timeSlots.length, icon: AccessTimeRoundedIcon },
    { label: 'Appointments', value: appointments.length, icon: CalendarMonthRoundedIcon },
  ];

  const approveAppointment = async (appointment) => {
    try {
      await updateDietitianAppointmentStatus(appointment.id, { status: 'approved' });
      await loadDietitianAppointments();
      setSlotNotice({ open: true, message: 'Appointment approved successfully!' });
      setActiveTab('Members');
      setSearchText('');
    } catch (error) {
      setSlotError(error?.response?.data?.message || 'Failed to approve appointment.');
    }
  };

  const rejectAppointment = async (appointment) => {
    try {
      await updateDietitianAppointmentStatus(appointment.id, { status: 'rejected' });
      await loadDietitianAppointments();
      setSlotNotice({ open: true, message: 'Appointment rejected successfully!' });
    } catch (error) {
      setSlotError(error?.response?.data?.message || 'Failed to reject appointment.');
    }
  };

  const addTimeSlot = async () => {
    if (!dietitianId) {
      setSlotError('Dietitian account is required.');
      return;
    }

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
    try {
      await createDietitianSchedulingSlot(String(dietitianId), {
        date: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
      });
      await loadTimeSlots();
      setSlotNotice({ open: true, message: 'Time slot created successfully!' });
    } catch (error) {
      setSlotError(error?.response?.data?.message || 'Failed to create time slot.');
    }
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

  const saveEditedSlot = async () => {
    if (!dietitianId) {
      setSlotError('Dietitian account is required.');
      return;
    }

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
    try {
      await updateDietitianSchedulingSlot(String(dietitianId), String(id), {
        date,
        startTime,
        endTime,
      });
      await loadTimeSlots();
      setEditSlotState({ open: false, id: null, date: '', startTime: '', endTime: '' });
      setSlotNotice({ open: true, message: 'Time slot updated successfully!' });
    } catch (error) {
      setSlotError(error?.response?.data?.message || 'Failed to update time slot.');
    }
  };

  const openDeleteSlot = (slot) => {
    setDeleteSlotState({
      open: true,
      id: slot.id,
      label: `${slot.day}, ${slot.date} (${to12Hour(slot.startTime)} - ${to12Hour(slot.endTime)})`,
    });
  };

  const confirmDeleteSlot = async () => {
    if (!dietitianId) {
      setSlotError('Dietitian account is required.');
      return;
    }

    try {
      await deleteDietitianSchedulingSlot(String(dietitianId), String(deleteSlotState.id));
      await loadTimeSlots();
      setDeleteSlotState({ open: false, id: null, label: '' });
      setSlotNotice({ open: true, message: 'Time slot deleted successfully!' });
    } catch (error) {
      setSlotError(error?.response?.data?.message || 'Failed to delete time slot.');
    }
  };

  const openDietPlanModal = (member) => {
    const existingPlan = savedDietPlans[member.id]?.data;
    setDietPlanForm(existingPlan || createDietPlanForm());
    setDietPlanModal({ open: true, member });
  };

  const closeDietPlanModal = () => {
    setDietPlanModal({ open: false, member: null });
  };

  const upsertAndMaybeSubmitDietPlan = async (submitted = false) => {
    const memberId = dietPlanModal.member?.id;
    if (!memberId) return;
    if (!dietitianId) {
      setSlotError('Dietitian account is required.');
      return;
    }
    if (!hasAnyMealName(dietPlanForm)) {
      setSlotError('Add at least one meal name before submitting the diet plan.');
      return;
    }
    try {
      const payload = {
        dietitianId,
        userId: memberId,
        memberName: dietPlanModal.member?.name || '',
        breakfast: sanitizePlanSection(dietPlanForm.breakfast),
        lunch: sanitizePlanSection(dietPlanForm.lunch),
        dinner: sanitizePlanSection(dietPlanForm.dinner),
        snacks: sanitizePlanSection(dietPlanForm.snacks),
        additionalNotes: dietPlanForm.additionalNotes,
      };
      const { data } = await upsertDietitianClientPlan(payload);
      const plan = data?.data;
      const planId = String(plan?._id || plan?.id || savedDietPlans[memberId]?.id || '');
      if (!planId) throw new Error('Plan id is missing after save');
      await submitMealPlan(planId, dietitianId, submitted);
      await loadDietitianMealsAndPlans();
      closeDietPlanModal();
      setSlotNotice({
        open: true,
        message: submitted ? 'Diet plan published successfully!' : 'Diet plan saved as draft.',
      });
    } catch (error) {
      const apiMessage = error?.response?.data?.message || '';
      if (error?.response?.status === 409) {
        setSlotError('This client plan is already submitted and locked. Create for another client or unlock workflow first.');
        return;
      }
      setSlotError(apiMessage || (submitted ? 'Failed to publish diet plan.' : 'Failed to save draft.'));
    }
  };

  const saveDietPlanDraft = async () => {
    await upsertAndMaybeSubmitDietPlan(false);
  };

  const publishDietPlan = async () => {
    await upsertAndMaybeSubmitDietPlan(true);
  };

  const deleteDraftDietPlan = async () => {
    const memberId = dietPlanModal.member?.id;
    const existingPlan = memberId ? savedDietPlans[memberId] : null;
    if (!existingPlan?.id || existingPlan?.isSubmitted) return;
    try {
      await deleteMealPlan(existingPlan.id, dietitianId);
      await loadDietitianMealsAndPlans();
      closeDietPlanModal();
      setSlotNotice({ open: true, message: 'Draft diet plan deleted successfully.' });
    } catch (error) {
      setSlotError(error?.response?.data?.message || 'Failed to delete draft diet plan.');
    }
  };

  const updateMealField = (sectionKey, index, field, value) => {
    setDietPlanForm((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((option, i) =>
        i === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  const applySuggestedMealToOption = (sectionKey, index, selectedMeal) => {
    if (!selectedMeal || typeof selectedMeal === 'string') return;
    setDietPlanForm((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((option, i) =>
        i === index
          ? {
            ...option,
            mealName: selectedMeal.mealName || option.mealName,
            description: selectedMeal.description ?? option.description,
            calories: selectedMeal.calories ?? option.calories,
            protein: selectedMeal.protein ?? option.protein,
            carbs: selectedMeal.carbs ?? option.carbs,
            lipids: selectedMeal.lipids ?? option.lipids,
            vitamins: selectedMeal.vitamins ?? option.vitamins,
          }
          : option,
      ),
    }));
  };

  const getSectionAverageCalories = (sectionKey) => {
    const calories = dietPlanForm[sectionKey]
      .map((option) => Number(option.calories))
      .filter((value) => !Number.isNaN(value) && value > 0);
    if (!calories.length) return 0;
    return Math.round(calories.reduce((sum, value) => sum + value, 0) / calories.length);
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
      <DietitianStatsGrid
        stats={stats}
        panelBg={panelBg}
        panelBorder={panelBorder}
        subtitleColor={subtitleColor}
        cardTitleColor={cardTitleColor}
      />

      <DietitianDashboardHeaderControls
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inputTextColor={inputTextColor}
        isDark={isDark}
        mutedText={mutedText}
        panelBg={panelBg}
        panelBorder={panelBorder}
        searchText={searchText}
        setSearchText={setSearchText}
        subtitleColor={subtitleColor}
        tabItems={tabItems}
      />

      {activeTab === 'Members' && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.3 }}>
            <Typography sx={{ color: sectionTitleColor, fontWeight: 700, fontSize: '1rem' }}>
              Members
            </Typography>
            <Button
              onClick={() => navigate(ROUTES.DIETITIAN_CLIENTS)}
              sx={{
                textTransform: 'none',
                color: linkColor,
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
          {displayedMembers.map((member) => {
            const memberPlan = savedDietPlans[member.id];
            return (
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
              <Typography sx={{ color: cardTitleColor, fontWeight: 800, fontSize: '1.85rem', mb: 0.5 }}>
                {member.name}
              </Typography>
              <Typography sx={{ color: mutedText, fontSize: '1.02rem', mb: 2.2 }}>
                Member since {member.joinedDate}
              </Typography>

              <Typography sx={{ color: cardBodyColor, fontSize: '1.03rem', lineHeight: 1.6 }}>
                Age: {member.age} years
                <br />
                Weight: {member.weight} kg
                <br />
                Height: {member.height} cm
                <br />
                Goal: {member.goal}
              </Typography>

              {memberPlan && (
                <Chip
                  label={memberPlan.isSubmitted ? 'Published' : 'Draft'}
                  size="small"
                  sx={{
                    mt: 1.2,
                    alignSelf: 'flex-start',
                    fontWeight: 800,
                    bgcolor: memberPlan.isSubmitted ? '#22c55e1f' : '#f59e0b1f',
                    color: memberPlan.isSubmitted ? '#22c55e' : '#f59e0b',
                  }}
                />
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={() => openDietPlanModal(member)}
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
                {memberPlan ? (memberPlan.isSubmitted ? 'View Plan' : 'Edit Draft') : 'Create Diet Plan'}
              </Button>
            </Box>
            );
          })}
          </Box>
        </>
      )}

      {activeTab === 'Appointments' && (
        <DietitianAppointmentsTable
          appointments={appointments}
          mutedText={mutedText}
          onApprove={approveAppointment}
          onReject={rejectAppointment}
          panelBg={panelBg}
          panelBorder={panelBorder}
          subtitleColor={subtitleColor}
        />
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
                color: sectionTitleColor,
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
            <Typography sx={{ color: sectionTitleColor, fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, mb: 1.2 }}>
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
              {isSlotsLoading ? (
                <Typography sx={{ color: mutedText, textAlign: 'center', mt: 2, fontSize: '1rem' }}>
                  Loading time slots...
                </Typography>
              ) : timeSlots.length === 0 ? (
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
                          <Typography sx={{ color: slotTitleColor, fontWeight: 700, fontSize: '1.05rem' }}>
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
        <DialogTitle>Success</DialogTitle>
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
              value={editSlotState.startTime}
              onChange={(e) => setEditSlotState((prev) => ({ ...prev, startTime: e.target.value }))}
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
              value={editSlotState.endTime}
              onChange={(e) => setEditSlotState((prev) => ({ ...prev, endTime: e.target.value }))}
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

      <Dialog
        open={dietPlanModal.open}
        onClose={closeDietPlanModal}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: '#1f2f4a',
            border: '1px solid',
            borderColor: '#334d73',
            color: '#e6f0ff',
            maxHeight: '92vh',
          },
        }}
      >
        {(() => {
          const currentPlan = savedDietPlans[dietPlanModal.member?.id];
          const isSubmittedPlan = Boolean(currentPlan?.isSubmitted);
          const isDraftPlan = Boolean(currentPlan?.id) && !isSubmittedPlan;

          return (
            <>
        <DialogTitle sx={{ pr: 6 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#f8fafc' }}>
            Create Diet Plan
          </Typography>
          <Typography sx={{ color: '#9fb3cf', fontSize: '1.35rem', mt: 0.4 }}>
            Creating plan for: <Box component="span" sx={{ color: '#f8fafc', fontWeight: 700 }}>{dietPlanModal.member?.name}</Box>
          </Typography>
          <Button
            onClick={closeDietPlanModal}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              minWidth: 0,
              p: 0.6,
              borderRadius: 1,
              color: '#94a3b8',
            }}
          >
            <CloseRoundedIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ overflowY: 'auto', pb: 2 }}>
          <Box component="fieldset" disabled={isSubmittedPlan} sx={{ m: 0, p: 0, border: 'none' }}>
            <Stack spacing={2}>
            {mealSections.map((section) => (
              <Box key={section.key}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '2rem' }}>
                    <Box component="span" sx={{ mr: 1 }}>{section.icon}</Box>
                    {section.title}
                  </Typography>
                  <Typography sx={{ color: '#aac2e0', fontWeight: 700, fontSize: '1.2rem' }}>
                    Total: {getSectionAverageCalories(section.key)} cal (avg per option)
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 1.2,
                  }}
                >
                  {dietPlanForm[section.key].map((option, index) => (
                    <Box
                      key={`${section.key}-${index}`}
                      sx={{
                        p: 1.4,
                        borderRadius: 1.7,
                        border: '1px solid',
                        borderColor: '#415a82',
                        background: '#354a6b',
                      }}
                    >
                      <Typography sx={{ color: '#f8fafc', fontWeight: 800, mb: 1, fontSize: '1.45rem' }}>
                        Option {index + 1}
                      </Typography>

                      <Autocomplete
                        freeSolo
                        options={mealSuggestions}
                        getOptionLabel={(mealOption) =>
                          typeof mealOption === 'string' ? mealOption : mealOption.mealName || ''
                        }
                        value={option.mealName || ''}
                        onInputChange={(_, value) =>
                          updateMealField(section.key, index, 'mealName', value)
                        }
                        onChange={(_, selected) =>
                          applySuggestedMealToOption(section.key, index, selected)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Meal Name"
                            placeholder="e.g., Grilled"
                            fullWidth
                            size="small"
                            sx={{
                              mb: 0.8,
                              '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.15rem', fontWeight: 700 },
                              '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                            }}
                          />
                        )}
                      />

                      <TextField
                        label="Description"
                        placeholder="Brief description"
                        value={option.description}
                        onChange={(e) => updateMealField(section.key, index, 'description', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{
                          mb: 0.8,
                          '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.15rem', fontWeight: 700 },
                          '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                        }}
                      />

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
                        <TextField
                          label="Calories"
                          type="number"
                          value={option.calories}
                          onChange={(e) => updateMealField(section.key, index, 'calories', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                        <TextField
                          label="Protein (g)"
                          type="number"
                          value={option.protein}
                          onChange={(e) => updateMealField(section.key, index, 'protein', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                        <TextField
                          label="Carbs (g)"
                          type="number"
                          value={option.carbs}
                          onChange={(e) => updateMealField(section.key, index, 'carbs', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                        <TextField
                          label="Lipids (g)"
                          type="number"
                          value={option.lipids}
                          onChange={(e) => updateMealField(section.key, index, 'lipids', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                      </Box>

                      <TextField
                        label="Vitamins"
                        placeholder="e.g., A, C, D"
                        value={option.vitamins}
                        onChange={(e) => updateMealField(section.key, index, 'vitamins', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{
                          mt: 0.8,
                          '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.15rem', fontWeight: 700 },
                          '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            <Box>
              <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.45rem', mb: 0.6 }}>
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Any special instructions or dietary restrictions..."
                value={dietPlanForm.additionalNotes}
                onChange={(e) =>
                  setDietPlanForm((prev) => ({ ...prev, additionalNotes: e.target.value }))
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#edf5ff',
                    background: '#3d5275',
                    borderRadius: 1.3,
                  },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#627ca4' },
                }}
              />
            </Box>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
            {!isSubmittedPlan && (
              <>
                <Button
                  variant="outlined"
                  onClick={saveDietPlanDraft}
                  fullWidth
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.2, py: 1 }}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={publishDietPlan}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 1.2,
                    py: 1,
                    fontSize: '1rem',
                    backgroundColor: '#f30612',
                    '&:hover': { backgroundColor: '#cf0812' },
                  }}
                >
                  Publish Plan
                </Button>
              </>
            )}
            {isSubmittedPlan && (
              <Button
                variant="contained"
                onClick={closeDietPlanModal}
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.2, py: 1 }}
              >
                Close
              </Button>
            )}
            {isDraftPlan && (
              <Button
                color="error"
                variant="outlined"
                onClick={deleteDraftDietPlan}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.2, py: 1, minWidth: { sm: 150 } }}
              >
                Delete Draft
              </Button>
            )}
          </Stack>
        </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}

export default DietitianDashboard;
