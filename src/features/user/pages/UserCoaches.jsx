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
  Select,
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
    date: '2026-03-15',
    time: '07:30 AM',
    appointmentType: 'In-person',
    goal: 'Weight Reducing',
    status: 'upcoming',
  },
  {
    id: 'b2',
    coachName: 'Noah Bennett',
    date: '2026-03-19',
    time: '06:00 PM',
    appointmentType: 'Online',
    goal: 'Weight Gaining',
    status: 'upcoming',
  },
  {
    id: 'b3',
    coachName: 'Sophia Reed',
    date: '2026-02-22',
    time: '09:00 AM',
    appointmentType: 'In-person',
    goal: 'Weight Reducing',
    status: 'past',
  },
  {
    id: 'b4',
    coachName: 'Liam Hayes',
    date: '2026-02-10',
    time: '05:30 PM',
    appointmentType: 'Online',
    goal: 'Weight Gaining',
    status: 'past',
  },
];

function UserCoaches() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [bookingView, setBookingView] = useState('upcoming');
  const [bookingForm, setBookingForm] = useState({
    userName: '',
    userEmail: '',
    mobileNumber: '',
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
      appointmentType: '',
      goal: '',
      description: '',
      medicalConditions: '',
    });
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedCoach(null);
  };

  const handleFieldChange = (field) => (event) => {
    setBookingForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmitBooking = (event) => {
    event.preventDefault();

    // Placeholder until API integration is added in the next step.
    console.log('Booking payload:', {
      coachId: selectedCoach?.id,
      coachName: selectedCoach?.name,
      ...bookingForm,
    });

    handleCloseBooking();
  };

  const filteredBookings = BOOKINGS.filter((booking) => booking.status === bookingView);

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
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      Rating {coach.rating}
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
            {filteredBookings.map((booking) => (
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
                        {booking.date} at {booking.time}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                      <Chip label={booking.appointmentType} size="small" />
                      <Chip label={booking.goal} size="small" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}

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
          Book Appointment {selectedCoach ? `with ${selectedCoach.name}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0.5 }}>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
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
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserCoaches;
