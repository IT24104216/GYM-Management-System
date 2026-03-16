import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Pagination,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  createCoachExerciseCategory,
  createCoachWorkoutPlan,
  deleteCoachExerciseCategory,
  deleteCoachWorkoutPlan,
  getCoachExerciseCategories,
  getCoachWorkoutPlans,
  getCoachWorkoutRequests,
  updateCoachExerciseCategory,
  updateCoachWorkoutPlan,
} from '../api/coach.api';

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
const PRIORITY_GRADIENTS = {
  High: 'linear-gradient(135deg, #ef4444, #f97316)',
  Medium: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  Low: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
};
const CATEGORY_LABELS = { weightGain: 'Weight Gaining', weightLoss: 'Weight Reducing' };
const blankExercise = () => ({ name: '', amount: '', description: '' });

function CoachWorkoutPlans() {
  const theme = useTheme();
  const { user } = useAuth();
  const coachId = String(user?.id || '');
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#0f1b34' : '#ffffff';
  const panelBorder = isDark ? '#24344f' : '#e5e7eb';
  const mutedText = isDark ? '#94a3b8' : '#6b7280';

  const [activeView, setActiveView] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [plansByUser, setPlansByUser] = useState({});
  const [categories, setCategories] = useState([]);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [openPlan, setOpenPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ id: '', appointmentId: '', planTitle: '', planNote: '', exercises: [blankExercise()] });
  const [drafts, setDrafts] = useState({ weightGain: blankExercise(), weightLoss: blankExercise() });
  const [editCategory, setEditCategory] = useState({ open: false, id: '', categoryKey: '', name: '', amount: '', description: '' });

  const showToast = (message, severity = 'success') => setFeedback({ open: true, message, severity });

  const loadData = async () => {
    if (!coachId) return;
    try {
      const [reqRes, planRes, catRes] = await Promise.all([
        getCoachWorkoutRequests(coachId),
        getCoachWorkoutPlans(coachId),
        getCoachExerciseCategories(coachId),
      ]);
      const reqItems = Array.isArray(reqRes?.data?.data) ? reqRes.data.data : [];
      const planItems = Array.isArray(planRes?.data?.data) ? planRes.data.data : [];
      const catItems = Array.isArray(catRes?.data?.data) ? catRes.data.data : [];

      setRequests(
        reqItems.map((item) => ({
          ...item,
          gradient: PRIORITY_GRADIENTS[item.priority] || PRIORITY_GRADIENTS.Medium,
        })),
      );
      const byUser = {};
      planItems.forEach((plan) => {
        const key = String(plan.userId);
        if (!byUser[key]) byUser[key] = plan;
      });
      setPlansByUser(byUser);
      setCategories(catItems);
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to load workout data', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, [coachId]);

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)),
    [requests],
  );

  const groupedCategories = useMemo(() => {
    const grouped = { weightGain: [], weightLoss: [] };
    categories.forEach((item) => {
      if (grouped[item.categoryKey]) grouped[item.categoryKey].push(item);
    });
    return grouped;
  }, [categories]);

  const suggestionOptions = useMemo(
    () => categories.map((item) => ({ id: item._id, label: `${CATEGORY_LABELS[item.categoryKey]} - ${item.name}`, item })),
    [categories],
  );

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
  const current = Math.min(page, totalPages);
  const currentItems = sortedRequests.slice((current - 1) * pageSize, current * pageSize);

  const openPlanDialog = (request) => {
    const existing = plansByUser[String(request.userId)];
    setOpenPlan(request);
    if (!existing) {
      setPlanForm({ id: '', appointmentId: String(request.appointmentId || ''), planTitle: '', planNote: '', exercises: [blankExercise()] });
      return;
    }
    setPlanForm({
      id: String(existing._id),
      appointmentId: String(existing.appointmentId || request.appointmentId || ''),
      planTitle: existing.planTitle || '',
      planNote: existing.planNote || '',
      exercises: Array.isArray(existing.exercises) && existing.exercises.length ? existing.exercises : [blankExercise()],
    });
  };

  const savePlan = async () => {
    if (!openPlan) return;
    if (!planForm.planTitle.trim()) return showToast('Plan title is required', 'warning');
    if (planForm.exercises.some((x) => !x.name?.trim() || !x.amount?.trim())) return showToast('Exercise name and amount are required', 'warning');

    const payload = {
      coachId,
      userId: String(openPlan.userId),
      appointmentId: String(planForm.appointmentId || openPlan.appointmentId || ''),
      planTitle: planForm.planTitle.trim(),
      planNote: planForm.planNote.trim(),
      exercises: planForm.exercises.map((x) => ({ ...x, name: x.name.trim(), amount: x.amount.trim(), description: (x.description || '').trim() })),
    };

    try {
      if (planForm.id) await updateCoachWorkoutPlan(planForm.id, payload);
      else await createCoachWorkoutPlan(payload);
      showToast(planForm.id ? 'Workout plan updated' : 'Workout plan created');
      setOpenPlan(null);
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to save workout plan', 'error');
    }
  };

  const removePlan = async (request) => {
    const existing = plansByUser[String(request.userId)];
    if (!existing?._id) return;
    try {
      await deleteCoachWorkoutPlan(String(existing._id));
      showToast('Workout plan deleted');
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to delete workout plan', 'error');
    }
  };

  const addCategory = async (categoryKey) => {
    const draft = drafts[categoryKey];
    if (!draft.name.trim() || !draft.amount.trim()) return showToast('Exercise name and amount are required', 'warning');
    try {
      await createCoachExerciseCategory({ coachId, categoryKey, name: draft.name.trim(), amount: draft.amount.trim(), description: (draft.description || '').trim() });
      setDrafts((prev) => ({ ...prev, [categoryKey]: blankExercise() }));
      showToast('Exercise added');
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to add exercise', 'error');
    }
  };

  const saveCategoryEdit = async () => {
    if (!editCategory.name.trim() || !editCategory.amount.trim()) return showToast('Exercise name and amount are required', 'warning');
    try {
      await updateCoachExerciseCategory(editCategory.id, {
        categoryKey: editCategory.categoryKey,
        name: editCategory.name.trim(),
        amount: editCategory.amount.trim(),
        description: (editCategory.description || '').trim(),
      });
      setEditCategory({ open: false, id: '', categoryKey: '', name: '', amount: '', description: '' });
      showToast('Exercise updated');
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to update exercise', 'error');
    }
  };

  const removeCategory = async (id) => {
    try {
      await deleteCoachExerciseCategory(String(id));
      showToast('Exercise deleted');
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to delete exercise', 'error');
    }
  };

  return (
    <Box sx={{ pb: 3 }}>
      <PageHeader title="Workout Plans" subtitle="Build personalized exercise plans for users who requested coaching. Priority is ordered from high to low." />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant={activeView === 'requests' ? 'contained' : 'outlined'} onClick={() => setActiveView('requests')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>User Workout Requests</Button>
        <Button variant={activeView === 'categories' ? 'contained' : 'outlined'} onClick={() => setActiveView('categories')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Exercise Categories</Button>
      </Stack>

      {activeView === 'requests' && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' }, gap: 2 }}>
            {currentItems.map((request) => {
              const hasPlan = Boolean(plansByUser[String(request.userId)]);
              return (
                <Box key={request.appointmentId || request.userId} sx={{ background: panelBg, border: '1px solid', borderColor: panelBorder, borderRadius: 2.5, p: 2.5, minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 48, height: 48, fontWeight: 800, color: '#fff', background: request.gradient }}>{request.avatar || 'U'}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{request.name}</Typography>
                        <Typography sx={{ color: mutedText, fontSize: '0.84rem' }}>Age {request.age} | Goal: {request.goal}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" label={`${request.priority} Priority`} />
                      {hasPlan && <Chip size="small" label="Plan Ready" icon={<AssignmentTurnedInRoundedIcon />} />}
                    </Stack>
                  </Stack>
                  <Typography sx={{ mt: 1.2, color: mutedText, fontSize: '0.86rem' }}>Request note: {request.notes || '-'}</Typography>
                  <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 1.2 }}>
                    <Typography sx={{ color: mutedText, fontSize: '0.8rem' }}>Requested on: {request.requestedOn}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" onClick={() => openPlanDialog(request)} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>{hasPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}</Button>
                      {hasPlan && <Button variant="outlined" color="error" onClick={() => removePlan(request)} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Delete</Button>}
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Box>
          {sortedRequests.length > pageSize && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mt: 2 }}>
              <Typography sx={{ color: mutedText, fontSize: '0.84rem' }}>Showing {(current - 1) * pageSize + 1}-{Math.min(current * pageSize, sortedRequests.length)} of {sortedRequests.length} users</Typography>
              <Pagination page={current} count={totalPages} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
            </Stack>
          )}
        </>
      )}

      {activeView === 'categories' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          {['weightGain', 'weightLoss'].map((categoryKey) => (
            <Box key={categoryKey} sx={{ background: panelBg, border: '1px solid', borderColor: panelBorder, borderRadius: 2.5, p: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', mb: 1.5 }}>{CATEGORY_LABELS[categoryKey]} Exercises</Typography>
              <Stack spacing={1} sx={{ mb: 1.5, maxHeight: 260, overflowY: 'auto', pr: 0.5 }}>
                {(groupedCategories[categoryKey] || []).map((exercise) => (
                  <Box key={exercise._id} sx={{ p: 1.2, border: '1px solid', borderColor: panelBorder, borderRadius: 1.5, background: isDark ? '#0b1530' : '#f8fafc' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontWeight: 700 }}>{exercise.name}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => setEditCategory({ open: true, id: exercise._id, categoryKey, name: exercise.name, amount: exercise.amount, description: exercise.description || '' })}>Edit</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => removeCategory(exercise._id)}>Delete</Button>
                      </Stack>
                    </Stack>
                    <Typography sx={{ color: mutedText, fontSize: '0.8rem' }}>{exercise.amount}</Typography>
                    <Typography sx={{ color: mutedText, fontSize: '0.8rem' }}>{exercise.description}</Typography>
                  </Box>
                ))}
              </Stack>
              <Stack spacing={1}>
                <TextField size="small" label="Exercise Name" value={drafts[categoryKey].name} onChange={(e) => setDrafts((prev) => ({ ...prev, [categoryKey]: { ...prev[categoryKey], name: e.target.value } }))} />
                <TextField size="small" label="Amount" value={drafts[categoryKey].amount} onChange={(e) => setDrafts((prev) => ({ ...prev, [categoryKey]: { ...prev[categoryKey], amount: e.target.value } }))} />
                <TextField size="small" label="Description" value={drafts[categoryKey].description} onChange={(e) => setDrafts((prev) => ({ ...prev, [categoryKey]: { ...prev[categoryKey], description: e.target.value } }))} multiline minRows={2} />
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => addCategory(categoryKey)} sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Add To Category</Button>
              </Stack>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={Boolean(openPlan)} onClose={() => setOpenPlan(null)} fullWidth maxWidth="md">
        <DialogTitle>{openPlan ? `Workout Plan: ${openPlan.name}` : 'Workout Plan'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Plan Title" value={planForm.planTitle} onChange={(e) => setPlanForm((prev) => ({ ...prev, planTitle: e.target.value }))} fullWidth />
            <TextField label="Plan Notes" value={planForm.planNote} onChange={(e) => setPlanForm((prev) => ({ ...prev, planNote: e.target.value }))} fullWidth multiline minRows={2} />
            {planForm.exercises.map((exercise, index) => (
              <Box key={`exercise-${index}`} sx={{ p: 1.5, border: '1px solid', borderColor: panelBorder, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Chip size="small" label={`Exercise ${index + 1}`} />
                  <Button size="small" color="error" onClick={() => setPlanForm((prev) => ({ ...prev, exercises: prev.exercises.length === 1 ? prev.exercises : prev.exercises.filter((_, i) => i !== index) }))}>Remove</Button>
                </Stack>
                <TextField
                  select
                  label="Suggest from Categories"
                  value=""
                  onChange={(e) => {
                    const selected = suggestionOptions.find((x) => x.id === e.target.value);
                    if (!selected) return;
                    setPlanForm((prev) => ({ ...prev, exercises: prev.exercises.map((x, i) => (i === index ? { ...x, name: selected.item.name, amount: selected.item.amount, description: selected.item.description || '' } : x)) }));
                  }}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                >
                  {suggestionOptions.map((option) => <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>)}
                </TextField>
                <Stack spacing={1}>
                  <TextField label="Exercise Name" value={exercise.name} onChange={(e) => setPlanForm((prev) => ({ ...prev, exercises: prev.exercises.map((x, i) => (i === index ? { ...x, name: e.target.value } : x)) }))} fullWidth />
                  <TextField label="Amount" value={exercise.amount} onChange={(e) => setPlanForm((prev) => ({ ...prev, exercises: prev.exercises.map((x, i) => (i === index ? { ...x, amount: e.target.value } : x)) }))} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">Qty</InputAdornment> }} />
                  <TextField label="Description" value={exercise.description} onChange={(e) => setPlanForm((prev) => ({ ...prev, exercises: prev.exercises.map((x, i) => (i === index ? { ...x, description: e.target.value } : x)) }))} fullWidth multiline minRows={2} />
                </Stack>
              </Box>
            ))}
            <Stack direction="row" justifyContent="space-between">
              <Button variant="outlined" onClick={() => setPlanForm((prev) => ({ ...prev, exercises: [...prev.exercises, blankExercise()] }))}>Add New Exercise</Button>
              <Button variant="contained" onClick={savePlan}>Save Workout Plan</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={editCategory.open} onClose={() => setEditCategory({ open: false, id: '', categoryKey: '', name: '', amount: '', description: '' })} fullWidth maxWidth="sm">
        <DialogTitle>Edit Exercise</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2} sx={{ mt: 0.5 }}>
            <TextField label="Exercise Name" value={editCategory.name} onChange={(e) => setEditCategory((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="Amount" value={editCategory.amount} onChange={(e) => setEditCategory((prev) => ({ ...prev, amount: e.target.value }))} fullWidth />
            <TextField label="Description" value={editCategory.description} onChange={(e) => setEditCategory((prev) => ({ ...prev, description: e.target.value }))} multiline minRows={3} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditCategory({ open: false, id: '', categoryKey: '', name: '', amount: '', description: '' })}>Cancel</Button>
          <Button onClick={saveCategoryEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={feedback.open} autoHideDuration={2500} onClose={() => setFeedback((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CoachWorkoutPlans;
