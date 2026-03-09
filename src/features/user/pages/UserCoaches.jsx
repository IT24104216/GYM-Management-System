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
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROUTES } from '@/shared/utils/constants';

const MotionCard = motion(Card);

const COACHES = [
  {
    id: 'c1',
    name: 'Emma Carter',
    specialty: 'Strength and Conditioning',
    experience: '8 years',
    rating: 4.9,
    slots: 'Mon - Fri, 6:00 AM - 10:00 AM',
    qualification: 'BSc Sports Science',
    certificates: 'NASM-CPT, TRX Certified',
    avatar: 'EC',
    tags: ['Fat Loss', 'Strength', 'Mobility'],
  },
  {
    id: 'c2',
    name: 'Noah Bennett',
    specialty: 'Functional Training',
    experience: '6 years',
    rating: 4.8,
    slots: 'Mon - Sat, 5:00 PM - 9:00 PM',
    qualification: 'BSc Exercise Physiology',
    certificates: 'ACE-CPT, Kettlebell L1',
    avatar: 'NB',
    tags: ['Athletic', 'Core', 'Endurance'],
  },
  {
    id: 'c3',
    name: 'Sophia Reed',
    specialty: 'Beginner Transformation',
    experience: '5 years',
    rating: 4.7,
    slots: 'Tue - Sun, 7:00 AM - 1:00 PM',
    qualification: 'Diploma in Fitness Coaching',
    certificates: 'ISSA CPT, Mobility Coach',
    avatar: 'SR',
    tags: ['Beginner', 'Weight Training', 'Form'],
  },
  {
    id: 'c4',
    name: 'Liam Hayes',
    specialty: 'Power and Muscle Gain',
    experience: '9 years',
    rating: 5.0,
    slots: 'Mon - Fri, 1:00 PM - 7:00 PM',
    qualification: 'MSc Strength and Conditioning',
    certificates: 'NSCA-CSCS, Nutrition Specialist',
    avatar: 'LH',
    tags: ['Bulking', 'Powerlifting', 'Nutrition'],
  },
];

const BOOKINGS = [
  {
    id: 'b1',
    coachName: 'Emma Carter',
    date: '2026-03-08',
    time: '07:30 AM',
    fromTime: '07:30',
    toTime: '08:30',
    appointmentType: 'In-person',
    goal: 'Weight Reducing',
    status: 'upcoming',
    progressStatus: 'confirmed',
  },
  {
    id: 'b2',
    coachName: 'Noah Bennett',
    date: '2026-03-19',
    time: '06:00 PM',
    fromTime: '18:00',
    toTime: '19:00',
    appointmentType: 'Online',
    goal: 'Weight Gaining',
    status: 'upcoming',
    progressStatus: 'pending',
  },
  {
    id: 'b3',
    coachName: 'Sophia Reed',
    date: '2026-02-22',
    time: '09:00 AM',
    fromTime: '09:00',
    toTime: '10:00',
    appointmentType: 'In-person',
    goal: 'Weight Reducing',
    status: 'past',
    progressStatus: 'completed',
  },
  {
    id: 'b4',
    coachName: 'Liam Hayes',
    date: '2026-02-10',
    time: '05:30 PM',
    fromTime: '17:30',
    toTime: '18:30',
    appointmentType: 'Online',
    goal: 'Weight Gaining',
    status: 'past',
    progressStatus: 'cancelled',
  },
];

const buildInitialCoachStats = () => {
  const stats = {};
  COACHES.forEach((coach) => {
    stats[coach.id] = { average: coach.rating, count: 0 };
  });
  return stats;
};

const STATUS_STEPS = ['pending', 'confirmed', 'completed'];
const FEEDBACK_STORAGE_KEY = 'gympro_feedbacks';

const BOOKING_PROGRESS_META = {
  pending: { label: 'Pending', step: 0, color: '#16a34a' },
  confirmed: { label: 'Confirmed', step: 1, color: '#16a34a' },
  completed: { label: 'Completed', step: 2, color: '#16a34a' },
  cancelled: { label: 'Cancelled', step: -1, color: '#ef4444' },
};

const isBookingCompletedByTime = (booking) => {
  if (!booking?.date || !booking?.toTime) return false;
  const bookingEnd = new Date(`${booking.date}T${booking.toTime}:00`);
  if (Number.isNaN(bookingEnd.getTime())) return false;
  return Date.now() >= bookingEnd.getTime();
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const DAY_TO_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

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

const getCoachSlotRange = (coach) => {
  const slotPart = coach?.slots?.split(',')?.[1]?.trim() || '';
  const [startRaw, endRaw] = slotPart.split('-').map((t) => t.trim());
  return {
    start: normalizeTimeTo24h(startRaw),
    end: normalizeTimeTo24h(endRaw),
  };
};

const isDateWithinCoachSchedule = (coach, dateValue) => {
  if (!coach?.slots || !dateValue) return false;

  const dayPart = coach.slots.split(',')?.[0]?.trim() || '';
  const [fromRaw, toRaw] = dayPart.split('-').map((item) => item.trim().slice(0, 3).toLowerCase());
  const fromIndex = DAY_TO_INDEX[fromRaw];
  const toIndex = DAY_TO_INDEX[toRaw];

  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') return false;

  const selectedDay = new Date(`${dateValue}T00:00:00`).getDay();
  if (Number.isNaN(selectedDay)) return false;

  if (fromIndex <= toIndex) {
    return selectedDay >= fromIndex && selectedDay <= toIndex;
  }

  // Supports wrapped ranges like Fri - Mon
  return selectedDay >= fromIndex || selectedDay <= toIndex;
};

function UserCoaches() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [bookingView, setBookingView] = useState('upcoming');
  const [toastState, setToastState] = useState({ open: false, message: '' });
  const [bookings, setBookings] = useState(BOOKINGS);
  const [coachStats, setCoachStats] = useState(buildInitialCoachStats);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [slotError, setSlotError] = useState('');
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

  const handleOpenBooking = (coach) => {
    setSelectedCoach(coach);
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
    setSlotError('');
    setIsBookingOpen(true);
  };

  const handleEditBooking = (booking) => {
    const coach = COACHES.find((item) => item.name === booking.coachName) || null;
    setSelectedCoach(coach);
    setBookingForm({
      userName: user?.name || '',
      userEmail: user?.email || '',
      mobileNumber: user?.mobileNumber || user?.mobile || user?.phone || '',
      date: booking.date || getTodayDate(),
      fromTime: booking.fromTime || normalizeTimeTo24h(booking.time),
      toTime: booking.toTime || '',
      appointmentType: booking.appointmentType?.toLowerCase() === 'in-person' ? 'inperson' : 'online',
      goal: booking.goal?.toLowerCase().includes('reducing') ? 'weight-reducing' : 'weight-gaining',
      description: booking.description || '',
      medicalConditions: booking.medicalConditions || '',
    });
    setEditingBookingId(booking.id);
    setSlotError('');
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedCoach(null);
    setEditingBookingId(null);
    setSlotError('');
  };

  const handleFieldChange = (field) => (event) => {
    setBookingForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmitBooking = (event) => {
    event.preventDefault();

    const isDateAvailable = isDateWithinCoachSchedule(selectedCoach, bookingForm.date);
    if (!isDateAvailable) {
      setSlotError('Unavailable on selected date. Please choose an available date.');
      return;
    }

    const fromMinutes = toMinuteValue(bookingForm.fromTime);
    const toMinutes = toMinuteValue(bookingForm.toTime);
    if (Number.isNaN(fromMinutes) || Number.isNaN(toMinutes) || fromMinutes >= toMinutes) {
      setSlotError('Unavailable at that time. Please choose an available time slot.');
      return;
    }

    const selectedRange = getCoachSlotRange(selectedCoach);
    const coachStart = toMinuteValue(selectedRange.start);
    const coachEnd = toMinuteValue(selectedRange.end);
    const isWithinCoachRange = (
      !Number.isNaN(coachStart)
      && !Number.isNaN(coachEnd)
      && fromMinutes >= coachStart
      && toMinutes <= coachEnd
    );

    if (!isWithinCoachRange) {
      setSlotError('Unavailable at that time. Please choose an available time slot.');
      return;
    }

    setSlotError('');

    const nextBookingPayload = {
      coachName: selectedCoach?.name || '',
      date: bookingForm.date,
      fromTime: bookingForm.fromTime,
      toTime: bookingForm.toTime,
      time: toDisplayTime(bookingForm.fromTime),
      appointmentType: bookingForm.appointmentType === 'inperson' ? 'In-person' : 'Online',
      goal: bookingForm.goal === 'weight-gaining' ? 'Weight Gaining' : 'Weight Reducing',
      description: bookingForm.description,
      medicalConditions: bookingForm.medicalConditions,
      status: 'upcoming',
      progressStatus: editingBookingId ? 'pending' : 'pending',
    };

    if (editingBookingId) {
      setBookings((prev) => prev.map((item) => (
        item.id === editingBookingId
          ? { ...item, ...nextBookingPayload }
          : item
      )));
    } else {
      setBookings((prev) => [
        {
          id: `b${Date.now()}`,
          ...nextBookingPayload,
        },
        ...prev,
      ]);
    }

    // Placeholder until API integration is added in the next step.
    console.log('Booking payload:', {
      coachId: selectedCoach?.id,
      coachName: selectedCoach?.name,
      ...bookingForm,
    });

    handleCloseBooking();
    setToastState({
      open: true,
      message: editingBookingId ? 'Booking updated successfully' : 'Booking confirmed successfully',
    });
  };

  const handleCloseSuccess = (_, reason) => {
    if (reason === 'clickaway') return;
    setToastState((prev) => ({ ...prev, open: false }));
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

  const handleFeedbackFieldChange = (field) => (event) => {
    setFeedbackForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();
    if (!feedbackForm.rating) {
      setFeedbackError('Please select a rating before submitting.');
      return;
    }

    console.log('Feedback payload:', {
      bookingId: feedbackTarget?.id,
      coachName: feedbackTarget?.coachName,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
    });

    const newFeedback = {
      id: `f-${Date.now()}`,
      user: user?.name || 'Member',
      authorEmail: user?.email || '',
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
      date: getTodayDate(),
    };

    const rawFeedbacks = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    let storedFeedbacks = {};
    try {
      storedFeedbacks = rawFeedbacks ? JSON.parse(rawFeedbacks) : {};
    } catch {
      storedFeedbacks = {};
    }

    const coachKey = feedbackTarget?.coachName || 'Coach';
    const coachFeedbacks = Array.isArray(storedFeedbacks[coachKey]) ? storedFeedbacks[coachKey] : [];
    localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify({
        ...storedFeedbacks,
        [coachKey]: [newFeedback, ...coachFeedbacks],
      }),
    );

    const targetCoach = COACHES.find((item) => item.name === feedbackTarget?.coachName);
    if (targetCoach) {
      setCoachStats((prev) => {
        const current = prev[targetCoach.id] || { average: targetCoach.rating, count: 0 };
        const nextCount = current.count + 1;
        const nextAverage = ((current.average * current.count) + feedbackForm.rating) / nextCount;

        return {
          ...prev,
          [targetCoach.id]: {
            average: Number(nextAverage.toFixed(1)),
            count: nextCount,
          },
        };
      });
    }

    handleCloseFeedback();
    setToastState({ open: true, message: 'Feedback submitted successfully' });
  };

  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.map((item) => (
      item.id === bookingId
        ? { ...item, progressStatus: 'cancelled' }
        : item
    )));
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
            Choose Your Coach
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.02rem' }}>
            Select a coach for your workout planning. Compare specialties, ratings, and available slots.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          {COACHES.map((coach, index) => (
            (() => {
              const coachStat = coachStats[coach.id] || { average: coach.rating, count: 0 };

              return (
            <MotionCard
              key={coach.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              onClick={() => handleOpenBooking(coach)}
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
                    {coach.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.2}>
                      <Typography sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                        {coach.name}
                      </Typography>
                      <VerifiedRoundedIcon sx={{ color: '#2b8eff', fontSize: 18 }} />
                    </Stack>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.94rem' }}>
                      {coach.specialty}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {coach.tags.map((tag) => (
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
                        navigate(`${ROUTES.USER_COACH_FEEDBACKS}?coach=${encodeURIComponent(coach.name)}`);
                      }}
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.93rem',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline', color: theme.palette.primary.main },
                      }}
                    >
                      Rating {coachStat.average.toFixed(1)}
                      {coachStat.count > 0 ? ` (${coachStat.count})` : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FitnessCenterRoundedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      Experience {coach.experience}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeRoundedIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      {coach.slots}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.2}>
                  <Button
                    variant="contained"
                    startIcon={<CalendarMonthRoundedIcon />}
                    onClick={() => navigate(ROUTES.USER_WORKOUTS)}
                    sx={{
                      borderRadius: 2,
                      px: 2.2,
                      fontWeight: 700,
                      background: 'linear-gradient(180deg, #2b91ff 0%, #0f79ed 100%)',
                      '&:hover': { background: 'linear-gradient(180deg, #2386ef 0%, #0a6cd4 100%)' },
                    }}
                  >
                    Book Session
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(ROUTES.USER_PROFILE)}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    View Profile
                  </Button>
                </Stack>
              </CardContent>
            </MotionCard>
              );
            })()
          ))}
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
              )
                ? 'completed'
                : booking.progressStatus;
              const progress = BOOKING_PROGRESS_META[effectiveStatus] || BOOKING_PROGRESS_META.pending;
              const isCancelled = effectiveStatus === 'cancelled';
              const isCompleted = effectiveStatus === 'completed';
              const stepKeys = isCancelled ? ['pending', 'confirmed', 'cancelled'] : STATUS_STEPS;
              const displayTime = booking.fromTime && booking.toTime
                ? `${toDisplayTime(booking.fromTime)} - ${toDisplayTime(booking.toTime)}`
                : booking.time;

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
                          {booking.coachName}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                          {booking.date} at {displayTime}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                        <Chip label={booking.appointmentType} size="small" />
                        <Chip label={booking.goal} size="small" />
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 1.4 }}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Status Tracking
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" sx={{ mb: 0.8 }}>
                          {stepKeys.map((stepKey, index) => {
                            const isDone = index <= progress.step;
                            const isCancelledStep = isCancelled && stepKey === 'cancelled';
                            const circleBg = isCancelledStep
                              ? '#ef4444'
                              : (isDone ? '#16a34a' : '#d9de9e');
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
          {editingBookingId ? 'Edit Booking' : 'Book Appointment'} {selectedCoach ? `with ${selectedCoach.name}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0.5 }}>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Coach"
              value={selectedCoach?.name || ''}
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
              placeholder="Enter your mobile number"
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

            <Typography sx={{ fontSize: '0.82rem', color: theme.palette.text.secondary }}>
              Available slot: {selectedCoach?.slots || 'N/A'}
            </Typography>

            {slotError && (
              <Typography sx={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                {slotError}
              </Typography>
            )}

            <FormControl fullWidth required>
              <InputLabel id="appointment-type-label">Appointment Type</InputLabel>
              <Select
                labelId="appointment-type-label"
                label="Appointment Type"
                value={bookingForm.appointmentType}
                onChange={handleFieldChange('appointmentType')}
              >
                <MenuItem value="inperson">In-person</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="goal-label">Goal</InputLabel>
              <Select
                labelId="goal-label"
                label="Goal"
                value={bookingForm.goal}
                onChange={handleFieldChange('goal')}
              >
                <MenuItem value="weight-gaining">Weight Gaining</MenuItem>
                <MenuItem value="weight-reducing">Weight Reducing</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={bookingForm.description}
              onChange={handleFieldChange('description')}
              multiline
              minRows={3}
              required
              placeholder="Share your expectations for this appointment"
            />

            <TextField
              label="Medical Conditions"
              value={bookingForm.medicalConditions}
              onChange={handleFieldChange('medicalConditions')}
              multiline
              minRows={3}
              placeholder="Mention injuries, allergies, or ongoing conditions"
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

      <Snackbar
        open={toastState.open}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        message={toastState.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        action={(
          <Button color="inherit" size="small" onClick={handleCloseSuccess}>
            Close
          </Button>
        )}
      />

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
        <DialogTitle sx={{ fontWeight: 800 }}>
          Rate Coach
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0.5 }}>
          <Stack spacing={1.8} sx={{ mt: 0.5 }}>
            <TextField
              label="Coach"
              value={feedbackTarget?.coachName || ''}
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
              onChange={handleFeedbackFieldChange('comment')}
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
    </Box>
  );
}

export default UserCoaches;
