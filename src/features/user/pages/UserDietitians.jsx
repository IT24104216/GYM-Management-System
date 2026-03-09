import { motion } from 'framer-motion';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTES } from '@/shared/utils/constants';

const MotionCard = motion(Card);

const DIETITIANS = [
  {
    id: 'd1',
    name: 'Olivia Martin',
    specialty: 'Clinical Nutrition and Weight Management',
    experience: '7 years',
    rating: 4.9,
    slots: 'Mon - Fri, 8:00 AM - 12:00 PM',
    qualification: 'BSc Human Nutrition and Dietetics',
    certificates: 'CDE, Sports Nutrition Specialist',
    avatar: 'OM',
    tags: ['Weight Loss', 'PCOS', 'Meal Planning'],
  },
  {
    id: 'd2',
    name: 'Daniel Perera',
    specialty: 'Sports and Performance Nutrition',
    experience: '6 years',
    rating: 4.8,
    slots: 'Mon - Sat, 2:00 PM - 7:00 PM',
    qualification: 'MSc Sports Nutrition',
    certificates: 'ISSN-Certified, Precision Nutrition L2',
    avatar: 'DP',
    tags: ['Muscle Gain', 'Endurance', 'Supplements'],
  },
  {
    id: 'd3',
    name: 'Ayesha Fernando',
    specialty: 'Lifestyle and Therapeutic Diet Plans',
    experience: '5 years',
    rating: 4.7,
    slots: 'Tue - Sun, 9:00 AM - 3:00 PM',
    qualification: 'BSc Nutrition and Food Science',
    certificates: 'Diabetes Educator, Clinical Dietetics',
    avatar: 'AF',
    tags: ['Diabetes', 'Heart Health', 'Balanced Diet'],
  },
  {
    id: 'd4',
    name: 'Michael Silva',
    specialty: 'Gut Health and Medical Nutrition Therapy',
    experience: '8 years',
    rating: 5.0,
    slots: 'Mon - Fri, 4:00 PM - 9:00 PM',
    qualification: 'MSc Clinical Dietetics',
    certificates: 'GI Nutrition Specialist, Renal Nutrition',
    avatar: 'MS',
    tags: ['Gut Health', 'Hormonal Balance', 'Medical Diet'],
  },
];

const BOOKINGS = [
  {
    id: 'db1',
    dietitianName: 'Olivia Martin',
    date: '2026-03-08',
    fromTime: '09:00',
    toTime: '10:00',
    appointmentType: 'In-person',
    goal: 'Meal Planning',
    status: 'upcoming',
    progressStatus: 'confirmed',
  },
  {
    id: 'db2',
    dietitianName: 'Daniel Perera',
    date: '2026-03-19',
    fromTime: '16:00',
    toTime: '17:00',
    appointmentType: 'Online',
    goal: 'Health Consultation',
    status: 'upcoming',
    progressStatus: 'pending',
  },
  {
    id: 'db3',
    dietitianName: 'Ayesha Fernando',
    date: '2026-02-21',
    fromTime: '10:00',
    toTime: '11:00',
    appointmentType: 'In-person',
    goal: 'Meal Planning',
    status: 'past',
    progressStatus: 'completed',
  },
  {
    id: 'db4',
    dietitianName: 'Michael Silva',
    date: '2026-02-14',
    fromTime: '17:00',
    toTime: '18:00',
    appointmentType: 'Online',
    goal: 'Health Consultation',
    status: 'past',
    progressStatus: 'cancelled',
  },
];

const buildInitialDietitianStats = () => {
  const stats = {};
  DIETITIANS.forEach((dietitian) => {
    stats[dietitian.id] = { average: dietitian.rating, count: 0 };
  });
  return stats;
};

const STATUS_STEPS = ['pending', 'confirmed', 'completed'];
const DIETITIAN_FEEDBACK_STORAGE_KEY = 'gympro_dietitian_feedbacks';

const BOOKING_PROGRESS_META = {
  pending: { label: 'Pending', step: 0 },
  confirmed: { label: 'Confirmed', step: 1 },
  completed: { label: 'Completed', step: 2 },
  cancelled: { label: 'Cancelled', step: -1 },
};

const DAY_TO_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const normalizeTimeTo24h = (rawTime) => {
  if (!rawTime) return '';
  if (rawTime.includes(':') && !rawTime.toUpperCase().includes('AM') && !rawTime.toUpperCase().includes('PM')) {
    return rawTime;
  }

  const [timePart, meridiemRaw] = rawTime.trim().split(' ');
  if (!timePart || !meridiemRaw) return '';
  const [hourRaw, minuteRaw] = timePart.split(':').map(Number);
  const meridiem = meridiemRaw.toUpperCase();

  let hour = hourRaw;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  if (meridiem === 'PM' && hour !== 12) hour += 12;

  const hh = String(hour).padStart(2, '0');
  const mm = String(minuteRaw || 0).padStart(2, '0');
  return `${hh}:${mm}`;
};

const toMinuteValue = (time24h) => {
  const [h, m] = (time24h || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
};

const toDisplayTime = (time24h) => {
  if (!time24h) return '';
  const [hRaw, mRaw] = time24h.split(':').map(Number);
  if (Number.isNaN(hRaw) || Number.isNaN(mRaw)) return '';
  const meridiem = hRaw >= 12 ? 'PM' : 'AM';
  const h12 = hRaw % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(mRaw).padStart(2, '0')} ${meridiem}`;
};

const getDietitianSlotRange = (dietitian) => {
  const slotPart = dietitian?.slots?.split(',')?.[1]?.trim() || '';
  const [startRaw, endRaw] = slotPart.split('-').map((t) => t.trim());
  return {
    start: normalizeTimeTo24h(startRaw),
    end: normalizeTimeTo24h(endRaw),
  };
};

const isDateWithinDietitianSchedule = (dietitian, dateValue) => {
  if (!dietitian?.slots || !dateValue) return false;

  const dayPart = dietitian.slots.split(',')?.[0]?.trim() || '';
  const [fromRaw, toRaw] = dayPart.split('-').map((item) => item.trim().slice(0, 3).toLowerCase());
  const fromIndex = DAY_TO_INDEX[fromRaw];
  const toIndex = DAY_TO_INDEX[toRaw];

  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') return false;

  const selectedDay = new Date(`${dateValue}T00:00:00`).getDay();
  if (Number.isNaN(selectedDay)) return false;

  if (fromIndex <= toIndex) return selectedDay >= fromIndex && selectedDay <= toIndex;

  return selectedDay >= fromIndex || selectedDay <= toIndex;
};

const isBookingCompletedByTime = (booking) => {
  if (!booking?.date || !booking?.toTime) return false;
  const bookingEnd = new Date(`${booking.date}T${booking.toTime}:00`);
  if (Number.isNaN(bookingEnd.getTime())) return false;
  return Date.now() >= bookingEnd.getTime();
};

function UserDietitians() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDietitian, setSelectedDietitian] = useState(null);
  const [bookingView, setBookingView] = useState('upcoming');
  const [bookings, setBookings] = useState(BOOKINGS);
  const [dietitianStats, setDietitianStats] = useState(buildInitialDietitianStats);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');
  const [toastState, setToastState] = useState({ open: false, message: '' });

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [feedbackError, setFeedbackError] = useState('');

  const [bookingForm, setBookingForm] = useState({
    userName: '',
    userEmail: '',
    mobileNumber: '',
    date: '',
    fromTime: '',
    toTime: '',
    appointmentType: '',
    goal: '',
    description: '',
    medicalConditions: '',
  });

  const handleOpenBooking = (dietitian) => {
    setSelectedDietitian(dietitian);
    setBookingForm({
      userName: user?.name || '',
      userEmail: user?.email || '',
      mobileNumber: user?.mobileNumber || user?.mobile || user?.phone || '',
      date: getTodayDate(),
      fromTime: '',
      toTime: '',
      appointmentType: '',
      goal: '',
      description: '',
      medicalConditions: '',
    });
    setEditingBookingId(null);
    setAvailabilityError('');
    setIsBookingOpen(true);
  };

  const handleEditBooking = (booking) => {
    const dietitian = DIETITIANS.find((item) => item.name === booking.dietitianName) || null;
    setSelectedDietitian(dietitian);
    setBookingForm({
      userName: user?.name || '',
      userEmail: user?.email || '',
      mobileNumber: user?.mobileNumber || user?.mobile || user?.phone || '',
      date: booking.date || getTodayDate(),
      fromTime: booking.fromTime || '',
      toTime: booking.toTime || '',
      appointmentType: booking.appointmentType?.toLowerCase() === 'in-person' ? 'inperson' : 'online',
      goal: booking.goal?.toLowerCase().includes('health') ? 'health-consultation' : 'meal-planning',
      description: booking.description || '',
      medicalConditions: booking.medicalConditions || '',
    });
    setEditingBookingId(booking.id);
    setAvailabilityError('');
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedDietitian(null);
    setEditingBookingId(null);
    setAvailabilityError('');
  };

  const handleFieldChange = (field) => (event) => {
    setBookingForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmitBooking = (event) => {
    event.preventDefault();

    const isDateAvailable = isDateWithinDietitianSchedule(selectedDietitian, bookingForm.date);
    if (!isDateAvailable) {
      setAvailabilityError('Unavailable on selected date. Please choose another available date.');
      return;
    }

    const fromMinutes = toMinuteValue(bookingForm.fromTime);
    const toMinutes = toMinuteValue(bookingForm.toTime);
    if (Number.isNaN(fromMinutes) || Number.isNaN(toMinutes) || fromMinutes >= toMinutes) {
      setAvailabilityError('Unavailable at selected time. Please choose another available time slot.');
      return;
    }

    const selectedRange = getDietitianSlotRange(selectedDietitian);
    const slotStart = toMinuteValue(selectedRange.start);
    const slotEnd = toMinuteValue(selectedRange.end);
    const isWithinSlot = (
      !Number.isNaN(slotStart)
      && !Number.isNaN(slotEnd)
      && fromMinutes >= slotStart
      && toMinutes <= slotEnd
    );

    if (!isWithinSlot) {
      setAvailabilityError('Unavailable at selected time. Please choose another available time slot.');
      return;
    }

    const nextPayload = {
      dietitianName: selectedDietitian?.name || '',
      date: bookingForm.date,
      fromTime: bookingForm.fromTime,
      toTime: bookingForm.toTime,
      appointmentType: bookingForm.appointmentType === 'inperson' ? 'In-person' : 'Online',
      goal: bookingForm.goal === 'health-consultation' ? 'Health Consultation' : 'Meal Planning',
      description: bookingForm.description,
      medicalConditions: bookingForm.medicalConditions,
      status: 'upcoming',
      progressStatus: 'pending',
    };

    if (editingBookingId) {
      setBookings((prev) => prev.map((item) => (
        item.id === editingBookingId ? { ...item, ...nextPayload } : item
      )));
    } else {
      setBookings((prev) => [{ id: `db${Date.now()}`, ...nextPayload }, ...prev]);
    }

    setAvailabilityError('');
    handleCloseBooking();
    setToastState({
      open: true,
      message: editingBookingId ? 'Dietitian booking updated successfully' : 'Dietitian appointment booked successfully',
    });
  };

  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.map((item) => (
      item.id === bookingId ? { ...item, progressStatus: 'cancelled' } : item
    )));
  };

  const handleOpenFeedback = (booking) => {
    setFeedbackTarget(booking);
    setFeedbackForm({ rating: 0, comment: '' });
    setFeedbackError('');
    setIsFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setIsFeedbackOpen(false);
    setFeedbackTarget(null);
    setFeedbackError('');
  };

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();
    if (!feedbackForm.rating) {
      setFeedbackError('Please select a rating before submitting.');
      return;
    }

    const newFeedback = {
      id: `df-${Date.now()}`,
      user: user?.name || 'Member',
      authorEmail: user?.email || '',
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
      date: getTodayDate(),
    };

    const rawFeedbacks = localStorage.getItem(DIETITIAN_FEEDBACK_STORAGE_KEY);
    let storedFeedbacks = {};
    try {
      storedFeedbacks = rawFeedbacks ? JSON.parse(rawFeedbacks) : {};
    } catch {
      storedFeedbacks = {};
    }

    const dietitianKey = feedbackTarget?.dietitianName || 'Dietitian';
    const dietitianFeedbacks = Array.isArray(storedFeedbacks[dietitianKey]) ? storedFeedbacks[dietitianKey] : [];
    localStorage.setItem(
      DIETITIAN_FEEDBACK_STORAGE_KEY,
      JSON.stringify({
        ...storedFeedbacks,
        [dietitianKey]: [newFeedback, ...dietitianFeedbacks],
      }),
    );

    const targetDietitian = DIETITIANS.find((item) => item.name === feedbackTarget?.dietitianName);
    if (targetDietitian) {
      setDietitianStats((prev) => {
        const current = prev[targetDietitian.id] || { average: targetDietitian.rating, count: 0 };
        const nextCount = current.count + 1;
        const nextAverage = ((current.average * current.count) + feedbackForm.rating) / nextCount;

        return {
          ...prev,
          [targetDietitian.id]: {
            average: Number(nextAverage.toFixed(1)),
            count: nextCount,
          },
        };
      });
    }

    handleCloseFeedback();
    setToastState({ open: true, message: 'Feedback submitted successfully' });
  };

  const handleCloseToast = (_, reason) => {
    if (reason === 'clickaway') return;
    setToastState((prev) => ({ ...prev, open: false }));
  };

  const filteredBookings = bookings.filter((booking) => booking.status === bookingView);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 3 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Stack spacing={1} mb={4.5}>
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.6rem' },
              fontWeight: 800,
              color: theme.palette.text.primary,
            }}
          >
            Choose Your Dietitian
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.02rem' }}>
            Select a dietitian for your nutrition planning. Compare specialties, ratings, and available slots.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          {DIETITIANS.map((dietitian, index) => {
            const dietitianStat = dietitianStats[dietitian.id] || { average: dietitian.rating, count: 0 };

            return (
            <MotionCard
              key={dietitian.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              onClick={() => handleOpenBooking(dietitian)}
              sx={{
                borderRadius: 3,
                border: `1px solid ${isDark ? '#2b3d58' : '#e5edf8'}`,
                bgcolor: theme.palette.background.paper,
                boxShadow: isDark
                  ? '0 12px 28px rgba(4, 11, 24, 0.45)'
                  : '0 12px 28px rgba(29, 58, 101, 0.11)',
                cursor: 'pointer',
              }}
            >
              <CardContent sx={{ p: 2.8 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={1.8}>
                  <Avatar sx={{ width: 54, height: 54, bgcolor: '#2b8eff', fontWeight: 700 }}>
                    {dietitian.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.2}>
                      <Typography sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                        {dietitian.name}
                      </Typography>
                      <VerifiedRoundedIcon sx={{ color: '#2b8eff', fontSize: 18 }} />
                    </Stack>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.94rem' }}>
                      {dietitian.specialty}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {dietitian.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: isDark ? '#18263c' : '#ecf4ff',
                        color: isDark ? '#bcd4f7' : '#2f4b72',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>

                <Stack spacing={1.2} mb={2.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StarRoundedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                    <Typography
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`${ROUTES.USER_DIETITIAN_FEEDBACKS}?dietitian=${encodeURIComponent(dietitian.name)}`);
                      }}
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.93rem',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline', color: theme.palette.primary.main },
                      }}
                    >
                      Rating {dietitianStat.average.toFixed(1)}
                      {dietitianStat.count > 0 ? ` (${dietitianStat.count})` : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <RestaurantMenuRoundedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      Experience {dietitian.experience}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeRoundedIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      {dietitian.slots}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack spacing={0.8}>
                  <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.92rem' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Qualification:</Box>{' '}
                    {dietitian.qualification}
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.92rem' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Certificates:</Box>{' '}
                    {dietitian.certificates}
                  </Typography>
                </Stack>
              </CardContent>
            </MotionCard>
            );
          })}
        </Box>

        <Box sx={{ mt: 5.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
            mb={2.2}
          >
            <Box>
              <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800 }}>
                My Bookings
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary }}>
                Switch between upcoming and past appointments.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant={bookingView === 'upcoming' ? 'contained' : 'outlined'}
                onClick={() => setBookingView('upcoming')}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Upcoming
              </Button>
              <Button
                variant={bookingView === 'past' ? 'contained' : 'outlined'}
                onClick={() => setBookingView('past')}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Past
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1.4}>
            {filteredBookings.map((booking) => {
              const effectiveStatus = (
                booking.progressStatus !== 'cancelled' && isBookingCompletedByTime(booking)
              ) ? 'completed' : booking.progressStatus;

              const progress = BOOKING_PROGRESS_META[effectiveStatus] || BOOKING_PROGRESS_META.pending;
              const isCancelled = effectiveStatus === 'cancelled';
              const isCompleted = effectiveStatus === 'completed';
              const stepKeys = isCancelled ? ['pending', 'confirmed', 'cancelled'] : STATUS_STEPS;

              return (
                <Card
                  key={booking.id}
                  sx={{
                    borderRadius: 2.5,
                    border: `1px solid ${isDark ? '#2b3d58' : '#e5edf8'}`,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      justifyContent="space-between"
                      spacing={1.2}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                          {booking.dietitianName}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                          {booking.date} at {toDisplayTime(booking.fromTime)} - {toDisplayTime(booking.toTime)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                        <Chip label={booking.appointmentType} size="small" />
                        <Chip label={booking.goal} size="small" />
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 1.4 }}>
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary, fontWeight: 600 }}>
                          Status Tracking
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" sx={{ mb: 0.8 }}>
                        {stepKeys.map((stepKey, index) => {
                          const isDone = index <= progress.step;
                          const isCancelledStep = isCancelled && stepKey === 'cancelled';
                          const circleBg = isCancelledStep ? '#ef4444' : (isDone ? '#16a34a' : '#d9de9e');
                          const connectorBg = isCancelled
                            ? (index === 0 ? '#16a34a' : '#ef4444')
                            : (index < progress.step ? '#16a34a' : '#d9de9e');

                          return (
                            <Stack key={stepKey} direction="row" alignItems="center" sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  bgcolor: circleBg,
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.92rem',
                                }}
                              >
                                {isCancelledStep ? '✓' : (isDone ? '✓' : '')}
                              </Box>
                              {index < stepKeys.length - 1 && (
                                <Box
                                  sx={{
                                    height: 4,
                                    flex: 1,
                                    mx: 0.7,
                                    borderRadius: 999,
                                    bgcolor: connectorBg,
                                  }}
                                />
                              )}
                            </Stack>
                          );
                        })}
                      </Stack>

                      <Stack direction="row" alignItems="flex-start" sx={{ mb: 1.1 }}>
                        {stepKeys.map((stepKey, index) => {
                          const isDone = index <= progress.step;
                          const isCancelledStep = isCancelled && stepKey === 'cancelled';

                          return (
                            <Stack key={`${stepKey}-label`} direction="row" alignItems="flex-start" sx={{ flex: 1 }}>
                              <Box sx={{ width: 28, display: 'flex', justifyContent: 'center' }}>
                                <Typography
                                  sx={{
                                    fontSize: '0.73rem',
                                    fontWeight: (isDone || isCancelledStep) ? 700 : 600,
                                    color: isCancelledStep
                                      ? '#ef4444'
                                      : (isDone ? '#16a34a' : theme.palette.text.secondary),
                                    textTransform: 'capitalize',
                                    textAlign: 'center',
                                  }}
                                >
                                  {BOOKING_PROGRESS_META[stepKey].label}
                                </Typography>
                              </Box>

                              {index < stepKeys.length - 1 && (
                                <Box sx={{ flex: 1, mx: 0.7 }} />
                              )}
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Box>

                    {booking.status === 'upcoming' && !isCancelled && !isCompleted && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.4 }}>
                        {effectiveStatus !== 'confirmed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditBooking(booking)}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleCancelBooking(booking.id)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEditBooking(booking)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Reschedule
                        </Button>
                      </Stack>
                    )}

                    {isCompleted && (
                      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.4 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenFeedback(booking)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Feedback
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredBookings.length === 0 && (
              <Card
                sx={{
                  borderRadius: 2.5,
                  border: `1px solid ${isDark ? '#2b3d58' : '#e5edf8'}`,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <CardContent>
                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    No {bookingView} bookings found.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={isBookingOpen}
        onClose={handleCloseBooking}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmitBooking,
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingBookingId ? 'Edit Booking' : 'Book Appointment'} {selectedDietitian ? `with ${selectedDietitian.name}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0.5 }}>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Coach"
              value={selectedDietitian?.name || ''}
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="User Name"
              value={bookingForm.userName}
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="User Email"
              value={bookingForm.userEmail}
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Mobile Number"
              value={bookingForm.mobileNumber}
              onChange={handleFieldChange('mobileNumber')}
              required
            />

            <TextField
              label="Date"
              type="date"
              value={bookingForm.date}
              onChange={handleFieldChange('date')}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTodayDate() }}
              required
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <TextField
                label="From Time"
                type="time"
                value={bookingForm.fromTime}
                onChange={handleFieldChange('fromTime')}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                label="To Time"
                type="time"
                value={bookingForm.toTime}
                onChange={handleFieldChange('toTime')}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Stack>

            <Typography sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary, fontWeight: 600 }}>
              Available slot: {selectedDietitian?.slots || 'N/A'}
            </Typography>

            {availabilityError && (
              <Typography sx={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 700 }}>
                {availabilityError}
              </Typography>
            )}

            <FormControl fullWidth required>
              <InputLabel id="dietitian-appointment-type-label">Appointment Type</InputLabel>
              <Select
                labelId="dietitian-appointment-type-label"
                label="Appointment Type"
                value={bookingForm.appointmentType}
                onChange={handleFieldChange('appointmentType')}
              >
                <MenuItem value="inperson">In-person</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="dietitian-goal-label">Goal</InputLabel>
              <Select
                labelId="dietitian-goal-label"
                label="Goal"
                value={bookingForm.goal}
                onChange={handleFieldChange('goal')}
              >
                <MenuItem value="meal-planning">Meal Planning</MenuItem>
                <MenuItem value="health-consultation">Health Consultation</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={bookingForm.description}
              onChange={handleFieldChange('description')}
              multiline
              minRows={3}
              required
            />

            <TextField
              label="Medical Conditions"
              value={bookingForm.medicalConditions}
              onChange={handleFieldChange('medicalConditions')}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button onClick={handleCloseBooking} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              background: 'linear-gradient(180deg, #2b91ff 0%, #0f79ed 100%)',
              '&:hover': { background: 'linear-gradient(180deg, #2386ef 0%, #0a6cd4 100%)' },
            }}
          >
            {editingBookingId ? 'Update Booking' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isFeedbackOpen}
        onClose={handleCloseFeedback}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          component: 'form',
          onSubmit: handleFeedbackSubmit,
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Rate Dietitian</DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0.5 }}>
          <Stack spacing={1.8} sx={{ mt: 0.5 }}>
            <TextField
              label="Dietitian"
              value={feedbackTarget?.dietitianName || ''}
              InputProps={{ readOnly: true }}
            />

            <Box>
              <Typography sx={{ mb: 0.6, fontSize: '0.88rem', color: theme.palette.text.secondary }}>
                Rating
              </Typography>
              <Rating
                value={feedbackForm.rating}
                onChange={(_, value) => {
                  setFeedbackForm((prev) => ({ ...prev, rating: value || 0 }));
                  setFeedbackError('');
                }}
                precision={1}
              />
            </Box>

            <TextField
              label="Comment (Optional)"
              value={feedbackForm.comment}
              onChange={(event) => setFeedbackForm((prev) => ({ ...prev, comment: event.target.value }))}
              multiline
              minRows={3}
            />

            {feedbackError && (
              <Typography sx={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                {feedbackError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button onClick={handleCloseFeedback} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>
            Give Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toastState.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        message={toastState.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        action={(
          <Button color="inherit" size="small" onClick={handleCloseToast}>
            Close
          </Button>
        )}
      />
    </Box>
  );
}

export default UserDietitians;
