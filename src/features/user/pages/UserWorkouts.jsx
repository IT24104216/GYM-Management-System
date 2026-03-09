import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

const MotionBox = motion(Box);

const TODAY_PLAN = {
  title: 'Upper Body Power',
  dateLabel: 'Oct 24',
  description: 'Focus on compound movements to build raw strength. Keep rest periods between 3-5 minutes for main lifts.',
  duration: '60 min',
  intensity: 'Heavy Load',
  xp: '500 XP',
};

const EXERCISE_LIBRARY = [
  {
    id: 'w1',
    title: 'Upper Body Power',
    muscles: 'Chest, Back, Shoulders',
    duration: '60 min',
    level: 'Advanced',
    rating: 4.8,
    gradient: 'linear-gradient(135deg, #65a30d 0%, #0ea5a5 100%)',
    done: false,
  },
  {
    id: 'w2',
    title: 'Lower Body Hypertrophy',
    muscles: 'Quads, Hamstrings, Glutes',
    duration: '75 min',
    level: 'Intermediate',
    rating: 4.9,
    gradient: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
    done: true,
  },
  {
    id: 'w3',
    title: 'Core and Cardio Blast',
    muscles: 'Abs, Obliques, Heart',
    duration: '45 min',
    level: 'Beginner',
    rating: 4.6,
    gradient: 'linear-gradient(135deg, #b45309 0%, #ea580c 100%)',
    done: true,
  },
  {
    id: 'w4',
    title: 'Active Recovery Yoga',
    muscles: 'Full Body',
    duration: '30 min',
    level: 'All Levels',
    rating: 4.7,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    done: false,
  },
];

const upcomingExercises = EXERCISE_LIBRARY.filter((item) => !item.done);
const previousExercises = EXERCISE_LIBRARY.filter((item) => item.done);

function ExerciseCard({ workout, index }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${isDark ? '#223149' : '#e2e8f0'}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: isDark
          ? '0 14px 28px rgba(3, 8, 20, 0.5)'
          : '0 14px 28px rgba(16, 24, 40, 0.08)',
      }}
    >
      <Box sx={{ height: 128, background: workout.gradient, position: 'relative' }}>
        {workout.done && (
          <Chip
            icon={<GradeRoundedIcon sx={{ fontSize: 15 }} />}
            label="Done"
            size="small"
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              fontWeight: 700,
              color: '#047857',
              bgcolor: '#dcfce7',
            }}
          />
        )}
      </Box>

      <Box sx={{ p: 2.4 }}>
        <Stack spacing={0.5} mb={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.8rem' }, color: theme.palette.text.primary }}>
              {workout.title}
            </Typography>
            <Chip
              icon={<GradeRoundedIcon sx={{ color: '#f59e0b !important', fontSize: 16 }} />}
              label={workout.rating.toFixed(1)}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: isDark ? '#1f2937' : '#fff7e6',
                color: '#f59e0b',
              }}
            />
          </Stack>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.15rem' }}>
            {workout.muscles}
          </Typography>
        </Stack>

        <Box
          sx={{
            pt: 1.4,
            borderTop: `1px solid ${isDark ? '#1f2c41' : '#e5eaf1'}`,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <AccessTimeRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 17 }} />
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                {workout.duration}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.6} alignItems="center">
              <FitnessCenterRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 16 }} />
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                {workout.level}
              </Typography>
            </Stack>
          </Stack>

          <ChevronRightRoundedIcon sx={{ color: theme.palette.text.secondary }} />
        </Box>
      </Box>
    </MotionBox>
  );
}

function UserWorkouts() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 3 },
        py: { xs: 3.5, md: 4.5 },
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          sx={{
            borderRadius: 3,
            border: `1px solid ${isDark ? '#23344d' : '#e3eaf3'}`,
            bgcolor: theme.palette.background.paper,
            boxShadow: isDark
              ? '0 16px 28px rgba(3, 9, 20, 0.52)'
              : '0 16px 28px rgba(17, 24, 39, 0.08)',
            p: { xs: 2, md: 3.2 },
            mb: 4,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center" mb={1.6}>
            <Chip
              label="TODAY'S PLAN"
              sx={{
                bgcolor: isDark ? '#243b1a' : '#e7f5c8',
                color: '#65a30d',
                fontWeight: 800,
                letterSpacing: 0.2,
              }}
            />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarMonthRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 19 }} />
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                {TODAY_PLAN.dateLabel}
              </Typography>
            </Stack>
          </Stack>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, color: theme.palette.text.primary, mb: 1 }}>
            {TODAY_PLAN.title}
          </Typography>

          <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: '1.1rem', md: '1.9rem' }, maxWidth: 980, mb: 2.2 }}>
            {TODAY_PLAN.description}
          </Typography>

          <Stack direction="row" spacing={1.1} flexWrap="wrap" useFlexGap sx={{ mb: 2.3 }}>
            <Chip icon={<AccessTimeRoundedIcon />} label={TODAY_PLAN.duration} sx={{ borderRadius: 2, bgcolor: isDark ? '#1c2a3f' : '#f1f5f9', fontWeight: 600 }} />
            <Chip icon={<FitnessCenterRoundedIcon />} label={TODAY_PLAN.intensity} sx={{ borderRadius: 2, bgcolor: isDark ? '#1c2a3f' : '#f1f5f9', fontWeight: 600 }} />
            <Chip icon={<EmojiEventsRoundedIcon />} label={TODAY_PLAN.xp} sx={{ borderRadius: 2, bgcolor: isDark ? '#1c2a3f' : '#f1f5f9', fontWeight: 600 }} />
          </Stack>

          <Button
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            sx={{
              borderRadius: 2.2,
              px: 3,
              py: 1,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              background: 'linear-gradient(180deg, #0f1f3b 0%, #0b1730 100%)',
              boxShadow: '0 8px 20px rgba(11, 23, 48, 0.4)',
              '&:hover': {
                background: 'linear-gradient(180deg, #0f2954 0%, #0b1f40 100%)',
              },
            }}
          >
            Start Workout
          </Button>
        </MotionBox>

        <Stack spacing={1} mb={2}>
          <Typography sx={{ fontSize: { xs: '1.3rem', md: '2.5rem' }, fontWeight: 900, color: theme.palette.text.primary }}>
            Upcoming Exercises
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: '1rem', md: '1.5rem' } }}>
            Coach-assigned plans that are ready for your next session.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            mb: 3.8,
          }}
        >
          {upcomingExercises.map((workout, index) => (
            <ExerciseCard key={workout.id} workout={workout} index={index} />
          ))}
        </Box>

        <Stack spacing={1} mb={2}>
          <Typography sx={{ fontSize: { xs: '1.3rem', md: '2.5rem' }, fontWeight: 900, color: theme.palette.text.primary }}>
            Previous Exercises
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: '1rem', md: '1.5rem' } }}>
            Completed workouts are marked with a Done badge.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {previousExercises.map((workout, index) => (
            <ExerciseCard key={workout.id} workout={workout} index={index + upcomingExercises.length} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default UserWorkouts;
