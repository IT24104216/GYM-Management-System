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
import { useAuth } from '@/shared/hooks/useAuth';

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

  if (fromIndex <= toIndex) {
    return selectedDay >= fromIndex && selectedDay <= toIndex;
  }

  return selectedDay >= fromIndex || selectedDay <= toIndex;
};

function UserDietitians() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDietitian, setSelectedDietitian] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');
  const [bookingSuccessOpen, setBookingSuccessOpen] = useState(false);
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
    setAvailabilityError('');
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedDietitian(null);
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

    setAvailabilityError('');
    handleCloseBooking();
    setBookingSuccessOpen(true);
  };

  const handleCloseSuccess = (_, reason) => {
    if (reason === 'clickaway') return;
    setBookingSuccessOpen(false);
  };

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
          {DIETITIANS.map((dietitian, index) => (
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
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      Rating {dietitian.rating}
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
          ))}
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
          Book Appointment {selectedDietitian ? `with ${selectedDietitian.name}` : ''}
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
          <Button onClick={handleCloseBooking} variant="outlined" sx={{ borderRadius: 3, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              background: 'linear-gradient(180deg, #2b91ff 0%, #0f79ed 100%)',
              '&:hover': { background: 'linear-gradient(180deg, #2386ef 0%, #0a6cd4 100%)' },
            }}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={bookingSuccessOpen}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        message="Dietitian appointment booked successfully"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        action={(
          <Button color="inherit" size="small" onClick={handleCloseSuccess}>
            Close
          </Button>
        )}
      />
    </Box>
  );
}

export default UserDietitians;
