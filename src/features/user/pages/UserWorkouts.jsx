import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  Snackbar,
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
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import FlipRoundedIcon from '@mui/icons-material/FlipRounded';

const MotionBox = motion(Box);
const SESSION_LIMIT_SECONDS = 60 * 60;
const TODAY_MOCK_DATE = new Date().toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const MOCK_WORKOUT_SESSION = {
  id: 'session-push-day-1',
  title: 'Push Day - Chest and Shoulders',
  estimatedDurationMinutes: 60,
  status: 'in-progress',
  summary: 'Coach-assigned workout with progressive overload focus for upper body pressing strength.',
  exercises: [
    {
      id: 'w1',
      name: 'Upper Body Power',
      setsReps: '4x8',
      focusArea: 'Chest, Back, Shoulders',
      instruction: 'Perform controlled reps with full range and keep your core braced throughout each set.',
      duration: '60 min',
      level: 'Advanced',
      rating: 4.8,
      gradient: 'linear-gradient(135deg, #65a30d 0%, #0ea5a5 100%)',
      scheduledDate: TODAY_MOCK_DATE,
      completedDate: null,
      done: false,
    },
    {
      id: 'w2',
      name: 'Lower Body Hypertrophy',
      setsReps: '3x10',
      focusArea: 'Quads, Hamstrings, Glutes',
      instruction: 'Use moderate tempo and consistent depth to maximize time under tension for each movement.',
      duration: '75 min',
      level: 'Intermediate',
      rating: 4.9,
      gradient: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
      scheduledDate: null,
      completedDate: 'Mar 05, 2026',
      done: true,
    },
    {
      id: 'w3',
      name: 'Core and Cardio Blast',
      setsReps: '3x12',
      focusArea: 'Abs, Obliques, Heart',
      instruction: 'Keep transitions short and maintain steady breathing to sustain intensity across rounds.',
      duration: '45 min',
      level: 'Beginner',
      rating: 4.6,
      gradient: 'linear-gradient(135deg, #b45309 0%, #ea580c 100%)',
      scheduledDate: null,
      completedDate: 'Mar 03, 2026',
      done: true,
    },
    {
      id: 'w4',
      name: 'Active Recovery Yoga',
      setsReps: '3x15',
      focusArea: 'Full Body',
      instruction: 'Move slowly through each posture and prioritize breath control to improve recovery.',
      duration: '30 min',
      level: 'All Levels',
      rating: 4.7,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
      scheduledDate: 'Mar 16, 2026',
      completedDate: null,
      done: false,
    },
  ],
};

const parseWorkoutDate = (dateValue) => {
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const sameDay = (leftDate, rightDate) => (
  leftDate.getFullYear() === rightDate.getFullYear()
  && leftDate.getMonth() === rightDate.getMonth()
  && leftDate.getDate() === rightDate.getDate()
);

const formatCounter = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getDurationInMinutes = (durationText, fallbackMinutes) => {
  const matched = String(durationText || '').match(/(\d+)/);
  const parsed = matched ? Number(matched[1]) : NaN;
  if (Number.isNaN(parsed) || parsed <= 0) return fallbackMinutes;
  return parsed;
};

const EXERCISE_LIBRARY = MOCK_WORKOUT_SESSION.exercises.map((exercise) => ({
  id: exercise.id,
  title: exercise.name,
  muscles: exercise.focusArea,
  workoutDate: exercise.done ? exercise.completedDate : exercise.scheduledDate,
  duration: exercise.duration,
  level: exercise.level,
  rating: exercise.rating,
  gradient: exercise.gradient,
  done: exercise.done,
  sessionRuntime: {
    completed: exercise.done,
    flipped: false,
  },
  sessionExerciseMeta: {
    setsReps: exercise.setsReps,
    instruction: exercise.instruction,
  },
}));

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
        borderRadius: 2.5,
        overflow: 'hidden',
        border: `1px solid ${isDark ? '#223149' : '#e2e8f0'}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: isDark
          ? '0 14px 28px rgba(3, 8, 20, 0.5)'
          : '0 14px 28px rgba(16, 24, 40, 0.08)',
      }}
    >
      <Box sx={{ height: 108, background: workout.gradient, position: 'relative' }}>
        {workout.done && (
          <Chip
            icon={<GradeRoundedIcon sx={{ fontSize: 15, color: isDark ? '#ff9f1c !important' : undefined }} />}
            label="Done"
            size="small"
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              fontWeight: 700,
              color: isDark ? '#ffd6a0' : '#047857',
              bgcolor: isDark ? '#3a2200' : '#dcfce7',
              border: isDark ? '1px solid #7a3e00' : 'none',
            }}
          />
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack spacing={0.35} mb={1.4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.08rem', md: '1.26rem' }, color: theme.palette.text.primary }}>
              {workout.title}
            </Typography>
            <Chip
              icon={<GradeRoundedIcon sx={{ color: '#f59e0b !important', fontSize: 16 }} />}
              label={workout.rating.toFixed(1)}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: isDark ? '#3a2200' : '#fff7e6',
                color: isDark ? '#ff9f1c' : '#f59e0b',
                border: isDark ? '1px solid #7a3e00' : 'none',
              }}
            />
          </Stack>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.94rem', md: '1rem' } }}>
            {workout.muscles}
          </Typography>
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.84rem', md: '0.88rem' },
              fontWeight: 600,
            }}
          >
            {workout.done ? 'Completed on' : 'Scheduled for'}: {workout.workoutDate}
          </Typography>
        </Stack>

        <Box
          sx={{
            pt: 1,
            borderTop: `1px solid ${isDark ? '#1f2c41' : '#e5eaf1'}`,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Stack direction="row" spacing={1.4} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <AccessTimeRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 16 }} />
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.92rem' }}>
                {workout.duration}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.6} alignItems="center">
              <FitnessCenterRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 15 }} />
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.92rem' }}>
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
  const today = new Date();
  const [isWorkoutSessionOpen, setIsWorkoutSessionOpen] = useState(false);
  const [activeSessionWorkout, setActiveSessionWorkout] = useState(null);
  const [elapsedSessionSeconds, setElapsedSessionSeconds] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('idle');
  const [sessionToast, setSessionToast] = useState({ open: false, message: '' });
  const [sessionExercises, setSessionExercises] = useState(
    MOCK_WORKOUT_SESSION.exercises.map((exercise) => ({ ...exercise, flipped: false })),
  );

  const upcomingExercises = EXERCISE_LIBRARY
    .filter((item) => !item.done)
    .map((item) => {
      const parsed = parseWorkoutDate(item.workoutDate);
      return {
        ...item,
        workoutDateObject: parsed,
        workoutDateValue: parsed ? parsed.getTime() : Number.POSITIVE_INFINITY,
      };
    })
    .sort((a, b) => a.workoutDateValue - b.workoutDateValue);

  const todayWorkout = upcomingExercises.find((item) => (
    item.workoutDateObject && sameDay(item.workoutDateObject, today)
  ));

  const fallbackWorkout = upcomingExercises[0] || null;
  const activeTopWorkout = todayWorkout || fallbackWorkout;
  const topDateLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const visibleUpcomingExercises = todayWorkout
    ? upcomingExercises.filter((item) => item.id !== todayWorkout.id)
    : upcomingExercises;

  const activeSessionDurationMinutes = getDurationInMinutes(
    activeSessionWorkout?.duration,
    MOCK_WORKOUT_SESSION.estimatedDurationMinutes,
  );
  const activeSessionLimitSeconds = activeSessionDurationMinutes * 60;

  const handleOpenWorkoutSession = () => {
    if (!todayWorkout) return;
    setActiveSessionWorkout(todayWorkout);
    setElapsedSessionSeconds(0);
    setSessionStarted(false);
    setSessionStatus('idle');
    setSessionExercises(MOCK_WORKOUT_SESSION.exercises.map((exercise) => ({ ...exercise, flipped: false })));
    setIsWorkoutSessionOpen(true);
  };

  const handleCloseWorkoutSession = () => {
    setIsWorkoutSessionOpen(false);
    setActiveSessionWorkout(null);
    setElapsedSessionSeconds(0);
    setSessionStarted(false);
    setSessionStatus('idle');
  };

  const handleMarkSessionFinish = () => {
    setSessionStarted(false);
    setSessionStatus('finished');
    setSessionToast({ open: true, message: 'Workout session marked as finished.' });
  };

  const handleCloseSessionToast = (_, reason) => {
    if (reason === 'clickaway') return;
    setSessionToast((prev) => ({ ...prev, open: false }));
  };

  const handleToggleExerciseDone = (exerciseId) => {
    setSessionExercises((prev) => prev.map((exercise) => (
      exercise.id === exerciseId
        ? { ...exercise, done: !exercise.done }
        : exercise
    )));
  };

  const handleToggleExerciseFlip = (exerciseId) => {
    setSessionExercises((prev) => prev.map((exercise) => (
      exercise.id === exerciseId
        ? { ...exercise, flipped: !exercise.flipped }
        : exercise
    )));
  };

  useEffect(() => {
    if (!isWorkoutSessionOpen) return undefined;
    if (!sessionStarted) return undefined;
    if (elapsedSessionSeconds >= activeSessionLimitSeconds) return undefined;

    const timerId = setInterval(() => {
      setElapsedSessionSeconds((prev) => {
        if (prev >= activeSessionLimitSeconds) return activeSessionLimitSeconds;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isWorkoutSessionOpen, elapsedSessionSeconds, sessionStarted, activeSessionLimitSeconds]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 3.8 },
      }}
    >
      <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${isDark ? '#23344d' : '#e3eaf3'}`,
            bgcolor: theme.palette.background.paper,
            boxShadow: isDark
              ? '0 16px 28px rgba(3, 9, 20, 0.52)'
              : '0 16px 28px rgba(17, 24, 39, 0.08)',
            p: { xs: 1.8, md: 2.4 },
            mb: 3,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1.1}>
            <Chip
              label="TODAY'S PLAN"
              sx={{
                bgcolor: isDark ? '#243b1a' : '#e7f5c8',
                color: '#65a30d',
                fontWeight: 800,
                letterSpacing: 0.2,
                height: 28,
              }}
            />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarMonthRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 17 }} />
              <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.92rem' }}>
                {topDateLabel}
              </Typography>
            </Stack>
          </Stack>

          <Typography sx={{ fontSize: { xs: '1.55rem', md: '2rem' }, fontWeight: 850, color: theme.palette.text.primary, mb: 0.8 }}>
            {todayWorkout ? todayWorkout.title : 'No Workouts for Today'}
          </Typography>

          <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.96rem', md: '1.03rem' }, maxWidth: 780, mb: 1.8, lineHeight: 1.6 }}>
            {todayWorkout
              ? `Your coach assigned this workout for today. Target muscles: ${todayWorkout.muscles}.`
              : 'No workouts are scheduled for today. Please check upcoming exercises.'}
          </Typography>

          {todayWorkout && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.8 }}>
              <Chip icon={<AccessTimeRoundedIcon sx={{ fontSize: 17 }} />} label={todayWorkout.duration} size="small" sx={{ borderRadius: 2, bgcolor: isDark ? '#1c2a3f' : '#f1f5f9', fontWeight: 600 }} />
              <Chip icon={<FitnessCenterRoundedIcon sx={{ fontSize: 16 }} />} label={todayWorkout.level} size="small" sx={{ borderRadius: 2, bgcolor: isDark ? '#1c2a3f' : '#f1f5f9', fontWeight: 600 }} />
              <Chip icon={<EmojiEventsRoundedIcon sx={{ fontSize: 17 }} />} label={`Coach Assigned • ${todayWorkout.workoutDate}`} size="small" sx={{ borderRadius: 2, bgcolor: isDark ? '#1c2a3f' : '#f1f5f9', fontWeight: 600 }} />
            </Stack>
          )}

          {todayWorkout && (
            <Button
              variant="contained"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={handleOpenWorkoutSession}
              sx={{
                borderRadius: 2.2,
                px: 2.4,
                py: 0.8,
                fontWeight: 800,
                fontSize: '0.92rem',
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
          )}
        </MotionBox>

        <Stack spacing={0.6} mb={1.4}>
          <Typography sx={{ fontSize: { xs: '1.18rem', md: '1.45rem' }, fontWeight: 850, color: theme.palette.text.primary }}>
            Upcoming Exercises
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.92rem', md: '0.98rem' } }}>
            Coach-assigned plans that are ready for your next session.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.6,
            mb: 2.6,
          }}
        >
          {visibleUpcomingExercises.map((workout, index) => (
            <ExerciseCard key={workout.id} workout={workout} index={index} />
          ))}
        </Box>

        <Stack spacing={0.6} mb={1.4}>
          <Typography sx={{ fontSize: { xs: '1.18rem', md: '1.45rem' }, fontWeight: 850, color: theme.palette.text.primary }}>
            Previous Exercises
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: '0.92rem', md: '0.98rem' } }}>
            Completed workouts are marked with a Done badge.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 1.6,
          }}
        >
          {previousExercises.map((workout, index) => (
            <ExerciseCard key={workout.id} workout={workout} index={index + upcomingExercises.length} />
          ))}
        </Box>
      </Box>

      <Dialog
        open={isWorkoutSessionOpen}
        onClose={handleCloseWorkoutSession}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${isDark ? '#263752' : '#e1e8f2'}`,
          },
        }}
      >
        <Box sx={{ p: { xs: 2, md: 2.6 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.65rem' }, color: theme.palette.text.primary }}>
                {activeSessionWorkout?.title || MOCK_WORKOUT_SESSION.title}
              </Typography>
              <Typography sx={{ color: theme.palette.text.secondary, mt: 0.4, fontSize: '0.98rem' }}>
                {MOCK_WORKOUT_SESSION.exercises.length} exercises • ~{MOCK_WORKOUT_SESSION.estimatedDurationMinutes} min
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                onClick={() => {
                  setSessionStarted(true);
                  setSessionStatus('ongoing');
                }}
                disabled={sessionStarted || sessionStatus === 'finished'}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 1.4,
                  py: 0.45,
                  minWidth: 72,
                  fontWeight: 800,
                  textTransform: 'none',
                  background: 'linear-gradient(180deg, #0f1f3b 0%, #0b1730 100%)',
                  '&:hover': {
                    background: 'linear-gradient(180deg, #0f2954 0%, #0b1f40 100%)',
                  },
                }}
              >
                {sessionStatus === 'finished' ? 'Finished' : (sessionStarted ? 'Started' : 'Start')}
              </Button>
              <Box
                sx={{
                  px: 1.4,
                  py: 0.55,
                  borderRadius: 2,
                  border: `1px solid ${isDark ? '#385277' : '#d9e4f2'}`,
                  bgcolor: isDark ? '#111c31' : '#f8fbff',
                  minWidth: 126,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontWeight: 800, letterSpacing: 0.4, color: theme.palette.text.primary }}>
                  {formatCounter(elapsedSessionSeconds)} / {formatCounter(activeSessionLimitSeconds)}
                </Typography>
              </Box>
              {sessionStatus !== 'idle' && (
                <Chip
                  label={sessionStatus === 'ongoing' ? 'Ongoing' : 'Finished'}
                  sx={{
                    bgcolor: sessionStatus === 'ongoing' ? '#16a34a' : '#2563eb',
                    color: '#fff',
                    fontWeight: 800,
                  }}
                />
              )}
              <IconButton onClick={handleCloseWorkoutSession} size="small">
                <CloseRoundedIcon sx={{ color: theme.palette.text.secondary }} />
              </IconButton>
            </Stack>
          </Stack>

          <Stack spacing={1.2} sx={{ mt: 2.2 }}>
            {sessionExercises.map((exercise, index) => (
              <MotionBox
                key={exercise.id}
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: index * 0.09 }}
                sx={{
                  borderRadius: 2.2,
                  border: `1px solid ${isDark ? '#2a3d5b' : '#e3eaf2'}`,
                  bgcolor: exercise.flipped
                    ? (isDark ? '#0f2333' : '#eaf7f4')
                    : theme.palette.background.default,
                  px: { xs: 1.4, md: 2 },
                  py: { xs: 1.2, md: 1.4 },
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 1.2,
                }}
              >
                <IconButton
                  onClick={() => handleToggleExerciseDone(exercise.id)}
                  size="small"
                  sx={{ p: 0.2 }}
                >
                  {exercise.done ? (
                    <CheckCircleRoundedIcon sx={{ color: '#10b981', fontSize: 26 }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon sx={{ color: isDark ? '#8ea1bf' : '#b6c1d1', fontSize: 26 }} />
                  )}
                </IconButton>

                <Box>
                  {exercise.flipped ? (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.02rem',
                          color: isDark ? '#a7f3d0' : '#0f766e',
                        }}
                      >
                        {exercise.name} - Instructions
                      </Typography>
                      <Typography
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.95rem',
                          fontWeight: 500,
                        }}
                      >
                        {exercise.instruction}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.02rem',
                          color: theme.palette.text.primary,
                          textDecoration: exercise.done ? 'line-through' : 'none',
                          opacity: exercise.done ? 0.6 : 1,
                        }}
                      >
                        {exercise.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.95rem',
                          fontWeight: 600,
                        }}
                      >
                        {exercise.setsReps} - {exercise.focusArea}
                      </Typography>
                    </>
                  )}
                </Box>

                <Button
                  variant="text"
                  startIcon={<FlipRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handleToggleExerciseFlip(exercise.id)}
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    fontWeight: 700,
                    minWidth: 'auto',
                    px: 0.4,
                  }}
                >
                  Flip
                </Button>
              </MotionBox>
            ))}
          </Stack>

          <Button
            variant="contained"
            onClick={handleMarkSessionFinish}
            sx={{
              mt: 2.2,
              width: '100%',
              borderRadius: 2.2,
              py: 1.05,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              background: 'linear-gradient(90deg, #65a30d 0%, #0d9488 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #5b940d 0%, #0b8578 100%)',
              },
            }}
          >
            Mark as Finish
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={sessionToast.open}
        onClose={handleCloseSessionToast}
        autoHideDuration={2800}
        message={sessionToast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}

export default UserWorkouts;
