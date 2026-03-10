import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

const MotionCard = motion(Card);
const PROGRESS_COMPLETION_DATE_KEY = 'gympro_progress_completion_date';

const getTodayIso = () => new Date().toISOString().split('T')[0];
const formatIsoToFull = (isoDate) => new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const formatIsoToShort = (isoDate) => new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});
const createPhotoSlots = () => Array.from({ length: 4 }, (_, index) => ({
  id: `slot-${index + 1}`,
  imageUrl: '',
}));

const METRIC_CARDS = [
  {
    id: 'weight',
    label: 'Current Weight',
    value: '179.0',
    unit: 'lbs',
    change: '-11 lbs',
    icon: MonitorWeightRoundedIcon,
    tone: '#2563eb',
  },
  {
    id: 'fat',
    label: 'Body Fat %',
    value: '19.5%',
    unit: '',
    change: '-2.5%',
    icon: TrendingUpRoundedIcon,
    tone: '#9333ea',
  },
  {
    id: 'streak',
    label: 'Workout Streak',
    value: '12 Days',
    unit: '',
    change: 'On Fire!',
    icon: EmojiEventsRoundedIcon,
    tone: '#d97706',
  },
];

const MEASUREMENT_LABELS = {
  chest: 'Chest',
  waist: 'Waist',
  arms: 'Arms',
  thighs: 'Thighs',
};

function UserProgress() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const todayIso = getTodayIso();
  const previousIso = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  const twoDaysAgoIso = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [photosByDate, setPhotosByDate] = useState(() => ({
    [todayIso]: createPhotoSlots(),
    [previousIso]: [
      {
        id: `mock-${previousIso}-1`,
        imageUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=900&q=80',
      },
      ...createPhotoSlots().slice(1),
    ],
    [twoDaysAgoIso]: [
      {
        id: `mock-${twoDaysAgoIso}-1`,
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: `mock-${twoDaysAgoIso}-2`,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
      },
      ...createPhotoSlots().slice(2),
    ],
  }));
  const [photoToast, setPhotoToast] = useState({ open: false, message: '' });
  const [editingPhotoIndex, setEditingPhotoIndex] = useState(null);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [measurementForm, setMeasurementForm] = useState({
    chest: '',
    waist: '',
    arms: '',
    thighs: '',
    weight: '',
  });
  const uploadInputRef = useRef(null);
  const [weightHistoryByDate, setWeightHistoryByDate] = useState(() => ({
    [twoDaysAgoIso]: 189,
    [previousIso]: 184,
    [todayIso]: 179,
  }));
  const [measurementsByDate, setMeasurementsByDate] = useState(() => ({
    [twoDaysAgoIso]: { chest: 41.8, waist: 33.5, arms: 15.2, thighs: 24.1 },
    [previousIso]: { chest: 42.0, waist: 33.2, arms: 15.3, thighs: 24.0 },
    [todayIso]: { chest: 42.5, waist: 32.0, arms: 15.5, thighs: 24.0 },
  }));
  const completionDate = localStorage.getItem(PROGRESS_COMPLETION_DATE_KEY) || '';
  const selectedDateFull = formatIsoToFull(selectedDate);
  const selectedDateShort = formatIsoToShort(selectedDate);
  const canUploadSelectedDate = Boolean(completionDate) && completionDate === selectedDateFull;
  const selectedDatePhotos = photosByDate[selectedDate] || createPhotoSlots();

  const chartData = useMemo(() => {
    const entries = Object.entries(weightHistoryByDate)
      .map(([isoDate, weight]) => ({ isoDate, weight }))
      .sort((left, right) => new Date(`${left.isoDate}T00:00:00`) - new Date(`${right.isoDate}T00:00:00`));

    const labels = entries.map((item) => formatIsoToShort(item.isoDate));
    const values = entries.map((item) => item.weight);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const yTop = Math.ceil(maxValue + 2);
    const yBottom = Math.floor(minValue - 2);
    const yMiddle = Math.round((yTop + yBottom) / 2);
    const width = 620;
    const height = 220;

    const points = values.map((value, index) => {
      const x = values.length > 1 ? (index / (values.length - 1)) * width : width / 2;
      const normalized = (value - yBottom) / Math.max(1, yTop - yBottom);
      const y = height - (normalized * height);
      return { x, y };
    });

    return {
      points,
      labels,
      yTop,
      yMiddle,
      yBottom,
      polylinePoints: points.map((point) => `${70 + point.x},${24 + point.y}`).join(' '),
      fillPoints: `70,244 ${points.map((point) => `${70 + point.x},${24 + point.y}`).join(' ')}`,
    };
  }, [weightHistoryByDate]);

  const measurementRows = useMemo(() => {
    const sortedDates = Object.keys(measurementsByDate)
      .sort((left, right) => new Date(`${left}T00:00:00`) - new Date(`${right}T00:00:00`));

    const selectedMeasurements = measurementsByDate[selectedDate] || { chest: 0, waist: 0, arms: 0, thighs: 0 };
    const previousDate = [...sortedDates]
      .reverse()
      .find((dateValue) => new Date(`${dateValue}T00:00:00`) < new Date(`${selectedDate}T00:00:00`));
    const previousMeasurements = previousDate ? measurementsByDate[previousDate] : null;

    return Object.keys(MEASUREMENT_LABELS).map((key) => {
      const currentValue = Number(selectedMeasurements[key] || 0);
      const previousValue = Number(previousMeasurements?.[key] || currentValue);
      const diff = currentValue - previousValue;
      const trend = diff > 0 ? 'up' : (diff < 0 ? 'down' : 'flat');
      const deltaText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}"`;

      return {
        id: key,
        area: MEASUREMENT_LABELS[key],
        value: `${currentValue.toFixed(1)}"`,
        delta: deltaText,
        trend,
      };
    });
  }, [measurementsByDate, selectedDate]);

  const handleOpenMeasurementDialog = () => {
    const selectedMeasurements = measurementsByDate[selectedDate] || { chest: '', waist: '', arms: '', thighs: '' };
    setMeasurementForm({
      chest: selectedMeasurements.chest === '' ? '' : String(selectedMeasurements.chest),
      waist: selectedMeasurements.waist === '' ? '' : String(selectedMeasurements.waist),
      arms: selectedMeasurements.arms === '' ? '' : String(selectedMeasurements.arms),
      thighs: selectedMeasurements.thighs === '' ? '' : String(selectedMeasurements.thighs),
      weight: weightHistoryByDate[selectedDate] ? String(weightHistoryByDate[selectedDate]) : '',
    });
    setIsMeasurementDialogOpen(true);
  };

  const handleCloseMeasurementDialog = () => {
    setIsMeasurementDialogOpen(false);
  };

  const handleMeasurementFieldChange = (field) => (event) => {
    setMeasurementForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmitMeasurements = (event) => {
    event.preventDefault();

    const chestValue = Number(measurementForm.chest);
    const waistValue = Number(measurementForm.waist);
    const armsValue = Number(measurementForm.arms);
    const thighsValue = Number(measurementForm.thighs);
    const weightValue = Number(measurementForm.weight);

    if ([chestValue, waistValue, armsValue, thighsValue, weightValue].some((value) => Number.isNaN(value) || value <= 0)) {
      setPhotoToast({ open: true, message: 'Please enter valid measurement and weight values.' });
      return;
    }

    setMeasurementsByDate((prev) => ({
      ...prev,
      [selectedDate]: {
        chest: chestValue,
        waist: waistValue,
        arms: armsValue,
        thighs: thighsValue,
      },
    }));

    setWeightHistoryByDate((prev) => ({
      ...prev,
      [selectedDate]: weightValue,
    }));

    setIsMeasurementDialogOpen(false);
    setPhotoToast({ open: true, message: `Measurements and weight saved for ${selectedDateFull}.` });
  };

  const handleUploadClick = () => {
    if (!completionDate) {
      setPhotoToast({ open: true, message: 'Complete a workout session first to upload progress photos.' });
      return;
    }
    if (!canUploadSelectedDate) {
      setPhotoToast({ open: true, message: `Photo upload is available on completion day (${completionDate}).` });
      return;
    }
    uploadInputRef.current?.click();
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const photoUrl = URL.createObjectURL(file);
    setPhotosByDate((prev) => {
      const dayPhotos = prev[selectedDate] || createPhotoSlots();
      const targetIndex = editingPhotoIndex !== null
        ? editingPhotoIndex
        : dayPhotos.findIndex((item) => !item.imageUrl);

      if (targetIndex === -1) return prev;

      const nextDayPhotos = dayPhotos.map((item, index) => (
        index === targetIndex
          ? { id: `p-${Date.now()}`, imageUrl: photoUrl }
          : item
      ));

      return {
        ...prev,
        [selectedDate]: nextDayPhotos,
      };
    });

    event.target.value = '';
    setEditingPhotoIndex(null);
    setPhotoToast({ open: true, message: `Progress photo uploaded for ${selectedDateShort}.` });
  };

  const handleEditPhoto = (index) => {
    setEditingPhotoIndex(index);
    uploadInputRef.current?.click();
  };

  const handleDeletePhoto = (index) => {
    setPhotosByDate((prev) => {
      const dayPhotos = prev[selectedDate] || createPhotoSlots();
      const nextDayPhotos = dayPhotos.map((item, itemIndex) => (
        itemIndex === index
          ? { id: `slot-${index + 1}`, imageUrl: '' }
          : item
      ));

      return {
        ...prev,
        [selectedDate]: nextDayPhotos,
      };
    });
    setPhotoToast({ open: true, message: 'Photo deleted from selected date.' });
  };

  const handleClosePhotoToast = (_, reason) => {
    if (reason === 'clickaway') return;
    setPhotoToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'flex-start', md: 'flex-end' }} justifyContent="space-between" mb={2.3}>
          <Stack spacing={0.8}>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', md: '2rem' }, color: theme.palette.text.primary }}>
              Progress Tracking
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary }}>
              Track body changes, workout consistency, and visual transformation over time.
            </Typography>
          </Stack>

          <TextField
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: { xs: '100%', md: 240 } }}
          />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 1.6,
            mb: 2,
          }}
        >
          {METRIC_CARDS.map((item, index) => {
            const Icon = item.icon;
            return (
              <MotionCard
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                sx={{
                  borderRadius: 2.4,
                  border: `1px solid ${isDark ? '#263851' : '#e3eaf2'}`,
                  boxShadow: isDark ? '0 12px 26px rgba(3, 10, 22, 0.45)' : '0 12px 26px rgba(18, 31, 53, 0.07)',
                }}
              >
                <CardContent sx={{ py: 1.6 }}>
                  <Stack direction="row" spacing={1.3} alignItems="center">
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 2,
                        bgcolor: isDark ? '#1b2a40' : '#edf4ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color: item.tone }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="baseline">
                        <Typography sx={{ fontSize: '1.95rem', fontWeight: 900, lineHeight: 1.1 }}>
                          {item.value}
                        </Typography>
                        {item.unit && <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>{item.unit}</Typography>}
                        <Typography sx={{ color: item.id === 'streak' ? '#f59e0b' : '#10b981', fontWeight: 800 }}>
                          {item.change}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 1.6,
            mb: 2,
          }}
        >
          <Card sx={{ borderRadius: 2.4, border: `1px solid ${isDark ? '#263851' : '#e3eaf2'}` }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', mb: 1.2 }}>Weight History</Typography>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 680 280" width="100%" height="280" role="img" aria-label="Weight history chart">
                  <line x1="70" y1="24" x2="650" y2="24" stroke="#d7e0ec" strokeDasharray="3 5" />
                  <line x1="70" y1="144" x2="650" y2="144" stroke="#d7e0ec" strokeDasharray="3 5" />
                  <line x1="70" y1="244" x2="650" y2="244" stroke="#d7e0ec" strokeDasharray="3 5" />

                  <text x="34" y="30" fill="#94a3b8" fontSize="18">{chartData.yTop}</text>
                  <text x="34" y="150" fill="#94a3b8" fontSize="18">{chartData.yMiddle}</text>
                  <text x="34" y="250" fill="#94a3b8" fontSize="18">{chartData.yBottom}</text>

                  <polyline
                    points={chartData.fillPoints}
                    fill="rgba(13, 148, 136, 0.16)"
                    stroke="none"
                  />

                  <polyline
                    points={chartData.polylinePoints}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {chartData.labels.map((label, index) => {
                    const x = 70 + ((chartData.labels.length > 1 ? index / (chartData.labels.length - 1) : 0.5) * 620);
                    return <text key={label} x={x - 18} y="268" fill="#94a3b8" fontSize="16">{label}</text>;
                  })}
                </svg>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2.4, border: `1px solid ${isDark ? '#263851' : '#e3eaf2'}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.2}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.7rem' }}>Body Measurements</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleOpenMeasurementDialog}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 800,
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#111827' },
                  }}
                >
                  Add
                </Button>
              </Stack>
              <Stack spacing={1.05}>
                {measurementRows.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      borderRadius: 2,
                      p: 1.35,
                      bgcolor: isDark ? '#14233a' : '#f7f9fc',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: 1.1,
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        border: `1px solid ${isDark ? '#334c70' : '#e5ebf3'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StraightenRoundedIcon sx={{ color: '#9aa7bd' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.5rem' }}>{item.area}</Typography>
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem' }}>
                        Last measured: {selectedDateFull}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>{item.value}</Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: item.trend === 'up' ? '#10b981' : (item.trend === 'down' ? '#10b981' : '#94a3b8'),
                        }}
                      >
                        {item.trend === 'up' ? '↗' : (item.trend === 'down' ? '↘' : '−')} {item.delta}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ borderRadius: 2.4, border: `1px solid ${isDark ? '#263851' : '#e3eaf2'}` }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.3}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.75rem' }}>Progress Photos</Typography>
              <>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddAPhotoRoundedIcon />}
                  onClick={handleUploadClick}
                  disabled={!canUploadSelectedDate}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 800,
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#111827' },
                  }}
                >
                  Add Photo
                </Button>
              </>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={1.2}>
              <Chip
                label={completionDate ? `Workout Completion Date: ${completionDate}` : 'Workout Completion Date: Not available yet'}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`Viewing Date: ${selectedDateFull}`}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={canUploadSelectedDate ? 'Upload Window: Open today' : 'Upload Window: Closed'}
                color={canUploadSelectedDate ? 'success' : 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                gap: 1.2,
              }}
            >
              {selectedDatePhotos.map((photo, index) => (
                <MotionCard
                  key={`${selectedDate}-${photo.id}-${index}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  sx={{
                    height: 320,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: isDark ? '#101b2f' : '#f2f4f8',
                  }}
                >
                  {photo.imageUrl ? (
                    <>
                      <Box
                        component="img"
                        src={photo.imageUrl}
                        alt={`Progress ${index + 1}`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Stack direction="row" spacing={0.8} sx={{ position: 'absolute', right: 10, bottom: 10 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEditPhoto(index)}
                          sx={{
                            minWidth: 'auto',
                            px: 1.2,
                            py: 0.3,
                            textTransform: 'none',
                            fontWeight: 700,
                            bgcolor: 'rgba(15, 23, 42, 0.8)',
                            '&:hover': { bgcolor: 'rgba(2, 6, 23, 0.9)' },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleDeletePhoto(index)}
                          sx={{
                            minWidth: 'auto',
                            px: 1.2,
                            py: 0.3,
                            textTransform: 'none',
                            fontWeight: 700,
                            bgcolor: 'rgba(185, 28, 28, 0.85)',
                            '&:hover': { bgcolor: 'rgba(127, 29, 29, 0.95)' },
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ fontWeight: 900, color: '#c2c8d2', fontSize: '1.7rem' }}>
                        PHOTO {index + 1}
                      </Typography>
                    </Box>
                  )}
                </MotionCard>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={photoToast.open}
        onClose={handleClosePhotoToast}
        autoHideDuration={2600}
        message={photoToast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />

      <Dialog
        open={isMeasurementDialogOpen}
        onClose={handleCloseMeasurementDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmitMeasurements,
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Add Measurements</DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0.5 }}>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField label="Chest" value={measurementForm.chest} onChange={handleMeasurementFieldChange('chest')} required />
            <TextField label="Waist" value={measurementForm.waist} onChange={handleMeasurementFieldChange('waist')} required />
            <TextField label="Arms" value={measurementForm.arms} onChange={handleMeasurementFieldChange('arms')} required />
            <TextField label="Thighs" value={measurementForm.thighs} onChange={handleMeasurementFieldChange('thighs')} required />
            <TextField label="Weight" value={measurementForm.weight} onChange={handleMeasurementFieldChange('weight')} required />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button onClick={handleCloseMeasurementDialog} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserProgress;
