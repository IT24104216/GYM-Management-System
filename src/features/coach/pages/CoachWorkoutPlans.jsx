import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Pagination,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import PageHeader from '@/shared/components/ui/PageHeader';

const PRIORITY_ORDER = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const REQUESTED_USERS = [
  {
    id: 301,
    name: 'Ryan Martinez',
    avatar: 'RM',
    age: 30,
    goal: 'Fat Loss',
    priority: 'High',
    requestedOn: '2026-03-12',
    sessionsPerWeek: 4,
    notes: 'Needs gym-based plan with progressive overload and cardio split.',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
  },
  {
    id: 302,
    name: 'Lisa Chen',
    avatar: 'LC',
    age: 27,
    goal: 'Mobility + Strength',
    priority: 'High',
    requestedOn: '2026-03-11',
    sessionsPerWeek: 3,
    notes: 'Knee-sensitive. Prefers low-impact movements.',
    gradient: 'linear-gradient(135deg, #f97316, #fb7185)',
  },
  {
    id: 303,
    name: 'Tom Bradley',
    avatar: 'TB',
    age: 25,
    goal: 'Lean Muscle',
    priority: 'Medium',
    requestedOn: '2026-03-10',
    sessionsPerWeek: 5,
    notes: 'Beginner-friendly strength split needed.',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  },
  {
    id: 304,
    name: 'Priya Sharma',
    avatar: 'PS',
    age: 29,
    goal: 'Body Recomposition',
    priority: 'Low',
    requestedOn: '2026-03-09',
    sessionsPerWeek: 4,
    notes: 'Needs hybrid plan: strength + conditioning.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
];

const newExercise = () => ({ name: '', amount: '', description: '' });
const newCategoryExercise = () => ({ name: '', amount: '', description: '' });

const INITIAL_CATEGORY_LIBRARY = {
  weightGain: [
    { name: 'Barbell Squat', amount: '4 x 8 reps', description: 'Primary compound for lower-body strength and mass.' },
    { name: 'Deadlift', amount: '4 x 6 reps', description: 'Posterior-chain builder with progressive load.' },
  ],
  weightLoss: [
    { name: 'Incline Walk Intervals', amount: '20 min', description: 'Alternate 2 min brisk + 1 min recovery.' },
    { name: 'Kettlebell Circuit', amount: '4 rounds', description: 'Swings, goblet squats, rows with short rest.' },
  ],
};

function CoachWorkoutPlans() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#0f1b34' : '#ffffff';
  const panelBorder = isDark ? '#24344f' : '#e5e7eb';
  const mutedText = isDark ? '#94a3b8' : '#6b7280';

  const pageSize = 9;
  const [users] = useState(REQUESTED_USERS);
  const [plansByUser, setPlansByUser] = useState({});
  const [openUser, setOpenUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState('requests');
  const [categoryLibrary, setCategoryLibrary] = useState(INITIAL_CATEGORY_LIBRARY);
  const [categoryDrafts, setCategoryDrafts] = useState({
    weightGain: newCategoryExercise(),
    weightLoss: newCategoryExercise(),
  });
  const [planForm, setPlanForm] = useState({
    planTitle: '',
    planNote: '',
    exercises: [newExercise()],
  });

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [users],
  );
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);
  const showingFrom = sortedUsers.length ? startIndex + 1 : 0;
  const showingTo = Math.min(startIndex + pageSize, sortedUsers.length);

  const openPlanDialog = (user) => {
    const existing = plansByUser[user.id];
    setOpenUser(user);
    setPlanForm(
      existing || {
        planTitle: '',
        planNote: '',
        exercises: [newExercise()],
      },
    );
  };

  const closePlanDialog = () => {
    setOpenUser(null);
    setPlanForm({ planTitle: '', planNote: '', exercises: [newExercise()] });
  };

  const updateExercise = (index, field, value) => {
    setPlanForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise,
      ),
    }));
  };

  const addExercise = () => {
    setPlanForm((prev) => ({ ...prev, exercises: [...prev.exercises, newExercise()] }));
  };

  const removeExercise = (index) => {
    setPlanForm((prev) => {
      if (prev.exercises.length === 1) return prev;
      return { ...prev, exercises: prev.exercises.filter((_, i) => i !== index) };
    });
  };

  const savePlan = () => {
    if (!openUser) return;
    setPlansByUser((prev) => ({
      ...prev,
      [openUser.id]: {
        ...planForm,
        createdAt: new Date().toISOString(),
      },
    }));
    closePlanDialog();
  };

  const updateCategoryDraft = (categoryKey, field, value) => {
    setCategoryDrafts((prev) => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], [field]: value },
    }));
  };

  const addCategoryExercise = (categoryKey) => {
    const draft = categoryDrafts[categoryKey];
    if (!draft.name.trim() || !draft.amount.trim()) return;
    setCategoryLibrary((prev) => ({
      ...prev,
      [categoryKey]: [...prev[categoryKey], draft],
    }));
    setCategoryDrafts((prev) => ({
      ...prev,
      [categoryKey]: newCategoryExercise(),
    }));
  };

  return (
    <Box sx={{ pb: 3 }}>
      <PageHeader
        title="Workout Plans"
        subtitle="Build personalized exercise plans for users who requested coaching. Priority is ordered from high to low."
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant={activeView === 'requests' ? 'contained' : 'outlined'}
          onClick={() => setActiveView('requests')}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
        >
          User Workout Requests
        </Button>
        <Button
          variant={activeView === 'categories' ? 'contained' : 'outlined'}
          onClick={() => setActiveView('categories')}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
        >
          Exercise Categories
        </Button>
      </Stack>

      {activeView === 'requests' && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {paginatedUsers.map((user) => {
              const hasPlan = Boolean(plansByUser[user.id]);
              return (
                <Box
                  key={user.id}
                  sx={{
                    background: panelBg,
                    border: '1px solid',
                    borderColor: panelBorder,
                    borderRadius: 2.5,
                    p: { xs: 2, md: 2.5 },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    minHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          fontWeight: 800,
                          color: '#fff',
                          background: user.gradient,
                        }}
                      >
                        {user.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{user.name}</Typography>
                        <Typography sx={{ color: mutedText, fontSize: '0.84rem' }}>
                          Age {user.age} | Goal: {user.goal} | {user.sessionsPerWeek} sessions/week
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={`${user.priority} Priority`}
                        sx={{
                          fontWeight: 700,
                          bgcolor:
                            user.priority === 'High'
                              ? '#ef44441a'
                              : user.priority === 'Medium'
                                ? '#f59e0b1a'
                                : '#10b9811a',
                          color:
                            user.priority === 'High'
                              ? '#ef4444'
                              : user.priority === 'Medium'
                                ? '#f59e0b'
                                : '#10b981',
                        }}
                      />
                      {hasPlan && (
                        <Chip
                          size="small"
                          icon={<AssignmentTurnedInRoundedIcon />}
                          label="Plan Ready"
                          sx={{ fontWeight: 700, bgcolor: '#16a34a1a', color: '#16a34a' }}
                        />
                      )}
                    </Stack>
                  </Stack>

                  <Typography sx={{ mt: 1.4, color: mutedText, fontSize: '0.86rem' }}>
                    Request note: {user.notes}
                  </Typography>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mt: 1.6 }}
                  >
                    <Typography sx={{ color: mutedText, fontSize: '0.8rem' }}>
                      Requested on: {user.requestedOn}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<FitnessCenterRoundedIcon />}
                      onClick={() => openPlanDialog(user)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        fontWeight: 700,
                        bgcolor: hasPlan ? '#0284c7' : '#0d9488',
                        '&:hover': { bgcolor: hasPlan ? '#0369a1' : '#0f766e' },
                      }}
                    >
                      {hasPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Box>

          {sortedUsers.length > pageSize && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mt: 2 }}
            >
              <Typography sx={{ color: mutedText, fontSize: '0.84rem' }}>
                Showing {showingFrom}-{showingTo} of {sortedUsers.length} users
              </Typography>
              <Pagination
                page={safePage}
                count={totalPages}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 700,
                    borderRadius: 1.6,
                  },
                }}
              />
            </Stack>
          )}
        </>
      )}

      {activeView === 'categories' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          {[
            { key: 'weightGain', title: 'Weight Gaining Exercises', tone: '#16a34a' },
            { key: 'weightLoss', title: 'Weight Reducing Exercises', tone: '#0284c7' },
          ].map((category) => (
            <Box
              key={category.key}
              sx={{
                background: panelBg,
                border: '1px solid',
                borderColor: panelBorder,
                borderRadius: 2.5,
                p: 2,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', mb: 1.5, color: category.tone }}>
                {category.title}
              </Typography>

              <Stack spacing={1} sx={{ mb: 1.5, maxHeight: 260, overflowY: 'auto', pr: 0.5 }}>
                {categoryLibrary[category.key].map((exercise, idx) => (
                  <Box
                    key={`${category.key}-${idx}`}
                    sx={{
                      p: 1.2,
                      border: '1px solid',
                      borderColor: panelBorder,
                      borderRadius: 1.5,
                      background: isDark ? '#0b1530' : '#f8fafc',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{exercise.name}</Typography>
                    <Typography sx={{ color: mutedText, fontSize: '0.8rem' }}>{exercise.amount}</Typography>
                    <Typography sx={{ color: mutedText, fontSize: '0.8rem', mt: 0.4 }}>
                      {exercise.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <Stack spacing={1}>
                <TextField
                  label="Exercise Name"
                  size="small"
                  value={categoryDrafts[category.key].name}
                  onChange={(e) => updateCategoryDraft(category.key, 'name', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Amount"
                  size="small"
                  value={categoryDrafts[category.key].amount}
                  onChange={(e) => updateCategoryDraft(category.key, 'amount', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Description"
                  size="small"
                  value={categoryDrafts[category.key].description}
                  onChange={(e) => updateCategoryDraft(category.key, 'description', e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => addCategoryExercise(category.key)}
                  sx={{
                    alignSelf: 'flex-start',
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 700,
                    bgcolor: category.tone,
                  }}
                >
                  Add To Category
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={Boolean(openUser)}
        onClose={closePlanDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: panelBorder,
            background: panelBg,
          },
        }}
      >
        <DialogTitle sx={{ pr: 7 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
            {openUser ? `Workout Plan: ${openUser.name}` : 'Workout Plan'}
          </Typography>
          <IconButton onClick={closePlanDialog} sx={{ position: 'absolute', top: 10, right: 10 }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Plan Title"
              value={planForm.planTitle}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, planTitle: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Plan Notes"
              value={planForm.planNote}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, planNote: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />

            <Divider />
            <Typography sx={{ fontWeight: 700 }}>Exercise Library Builder</Typography>
            <Typography sx={{ color: mutedText, fontSize: '0.82rem' }}>
              Add as many exercises as needed. Use Exercise Name, Amount, and Description for each row.
            </Typography>

            <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
              <Stack spacing={1.2}>
                {planForm.exercises.map((exercise, index) => (
                  <Box
                    key={`exercise-${index}`}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: panelBorder,
                      borderRadius: 2,
                      background: isDark ? '#0b1530' : '#f8fafc',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        size="small"
                        icon={<FormatListNumberedRoundedIcon />}
                        label={`Exercise ${index + 1}`}
                        sx={{ fontWeight: 700 }}
                      />
                      <IconButton
                        onClick={() => removeExercise(index)}
                        disabled={planForm.exercises.length === 1}
                        size="small"
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                      <TextField
                        label="Exercise Name"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Amount"
                        value={exercise.amount}
                        onChange={(e) => updateExercise(index, 'amount', e.target.value)}
                        placeholder="3 x 12 reps / 20 min / 5 rounds"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ color: mutedText, fontSize: '0.75rem' }}>Qty</Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Stack>

                    <TextField
                      sx={{ mt: 1.2 }}
                      label="Description"
                      value={exercise.description}
                      onChange={(e) => updateExercise(index, 'description', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder="Coaching cues, tempo, rest time, and safety notes."
                    />
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={addExercise}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Add New Exercise
              </Button>
              <Button
                variant="contained"
                onClick={savePlan}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 800, px: 2.5, bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
              >
                Save Workout Plan
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default CoachWorkoutPlans;
