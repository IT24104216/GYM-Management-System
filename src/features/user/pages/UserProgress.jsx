import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';

const MotionCard = motion(Card);
const PROGRESS_COMPLETION_DATE_KEY = 'gympro_progress_completion_date';

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

const WEIGHT_HISTORY = [189, 187, 186, 184, 183, 181, 180, 178];
const WEIGHT_LABELS = ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20'];

const BODY_MEASUREMENTS = [
  { id: 'chest', area: 'Chest', value: '42.5"', delta: '+0.5"', trend: 'up' },
  { id: 'waist', area: 'Waist', value: '32.0"', delta: '-1.2"', trend: 'down' },
  { id: 'arms', area: 'Arms', value: '15.5"', delta: '+0.2"', trend: 'up' },
  { id: 'thighs', area: 'Thighs', value: '24.0"', delta: '0.0"', trend: 'flat' },
];

const INITIAL_PHOTOS = [
  { id: 'p1', date: 'Oct 15', imageUrl: '' },
  { id: 'p2', date: 'Oct 10', imageUrl: '' },
  { id: 'p3', date: 'Oct 5', imageUrl: '' },
  { id: 'p4', date: 'Oct 1', imageUrl: '' },
];

function UserProgress() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [photoToast, setPhotoToast] = useState({ open: false, message: '' });
  const uploadInputRef = useRef(null);
  const completionDate = localStorage.getItem(PROGRESS_COMPLETION_DATE_KEY) || '';
  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const canUploadToday = Boolean(completionDate) && completionDate === todayDate;

  const chartPoints = useMemo(() => {
    const max = Math.max(...WEIGHT_HISTORY);
    const min = Math.min(...WEIGHT_HISTORY);
    const width = 620;
    const height = 220;
    return WEIGHT_HISTORY.map((value, index) => {
      const x = (index / (WEIGHT_HISTORY.length - 1)) * width;
      const normalized = (value - min) / Math.max(1, max - min);
      const y = height - normalized * height;
      return `${x},${y}`;
    }).join(' ');
  }, []);

  const handleUploadClick = () => {
    if (!completionDate) {
      setPhotoToast({ open: true, message: 'Complete a workout session first to upload progress photos.' });
      return;
    }
    if (!canUploadToday) {
      setPhotoToast({ open: true, message: `Photo upload is available on completion day (${completionDate}).` });
      return;
    }
    uploadInputRef.current?.click();
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const photoUrl = URL.createObjectURL(file);
    const todayDateShort = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    setPhotos((prev) => {
      const available = prev.find((item) => !item.imageUrl);
      if (!available) {
        return [{ id: `p${Date.now()}`, date: todayDateShort, imageUrl: photoUrl }, ...prev.slice(0, 3)];
      }

      return prev.map((item) => (
        item.id === available.id
          ? { ...item, date: todayDateShort, imageUrl: photoUrl }
          : item
      ));
    });

    event.target.value = '';
    setPhotoToast({ open: true, message: 'Progress photo uploaded for today.' });
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
        <Stack spacing={0.8} mb={2.3}>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', md: '2rem' }, color: theme.palette.text.primary }}>
            Progress Tracking
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            Track body changes, workout consistency, and visual transformation over time.
          </Typography>
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

                  <text x="34" y="30" fill="#94a3b8" fontSize="18">195</text>
                  <text x="34" y="150" fill="#94a3b8" fontSize="18">186</text>
                  <text x="34" y="250" fill="#94a3b8" fontSize="18">174</text>

                  <polyline
                    points={`70,244 ${chartPoints.split(' ').map((point) => {
                      const [x, y] = point.split(',').map(Number);
                      return `${70 + x},${24 + y}`;
                    }).join(' ')}`}
                    fill="rgba(13, 148, 136, 0.16)"
                    stroke="none"
                  />

                  <polyline
                    points={chartPoints.split(' ').map((point) => {
                      const [x, y] = point.split(',').map(Number);
                      return `${70 + x},${24 + y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {WEIGHT_LABELS.map((label, index) => {
                    const x = 70 + (index / (WEIGHT_LABELS.length - 1)) * 620;
                    return <text key={label} x={x - 18} y="268" fill="#94a3b8" fontSize="16">{label}</text>;
                  })}
                </svg>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2.4, border: `1px solid ${isDark ? '#263851' : '#e3eaf2'}` }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', mb: 1.2 }}>Body Measurements</Typography>
              <Stack spacing={1.05}>
                {BODY_MEASUREMENTS.map((item) => (
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
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem' }}>Last measured: Today</Typography>
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
                  disabled={!canUploadToday}
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
                label={canUploadToday ? 'Upload Window: Open today' : 'Upload Window: Closed'}
                color={canUploadToday ? 'success' : 'default'}
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
              {photos.map((photo, index) => (
                <MotionCard
                  key={photo.id}
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
                    <Box
                      component="img"
                      src={photo.imageUrl}
                      alt={`Progress ${index + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
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

                  <Chip
                    label={photo.date}
                    sx={{
                      position: 'absolute',
                      left: 10,
                      bottom: 10,
                      fontWeight: 700,
                      bgcolor: 'rgba(17, 24, 39, 0.7)',
                      color: '#fff',
                      backdropFilter: 'blur(2px)',
                    }}
                  />
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
    </Box>
  );
}

export default UserProgress;
