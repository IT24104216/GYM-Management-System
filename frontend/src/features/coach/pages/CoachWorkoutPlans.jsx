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
  Divider,
  InputAdornment,
  MenuItem,
  Pagination,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
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
  submitCoachWorkoutPlan,
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
const TIME_PERIOD_OPTIONS = ['Anytime', 'Morning', 'Afternoon', 'Evening'];
const blankExercise = () => ({ name: '', amount: '', description: '', timePeriod: 'Anytime' });
const PROGRAM_TEMPLATES = [
  {
    key: 'beginner-weight-gain-30',
    label: '30-Day Beginner Weight Gain',
    durationDays: 30,
    goal: 'Weight Gain',
    exercises: [
      { name: 'Barbell Squat', amount: '4 x 8', description: 'Lower body hypertrophy with progressive load', timePeriod: 'Anytime' },
      { name: 'Bench Press', amount: '4 x 8', description: 'Upper body strength and chest development', timePeriod: 'Anytime' },
      { name: 'Romanian Deadlift', amount: '3 x 10', description: 'Posterior chain and hamstring strength', timePeriod: 'Anytime' },
    ],
  },
  {
    key: 'fat-loss-60',
    label: '60-Day Fat Loss',
    durationDays: 60,
    goal: 'Fat Loss',
    exercises: [
      { name: 'Incline Walk Intervals', amount: '25 min', description: 'Alternating brisk pace and recovery', timePeriod: 'Anytime' },
      { name: 'Kettlebell Circuit', amount: '4 rounds', description: 'Full body conditioning and calorie burn', timePeriod: 'Anytime' },
      { name: 'Core Circuit', amount: '3 rounds', description: 'Core endurance and posture support', timePeriod: 'Anytime' },
    ],
  },
  {
    key: 'home-workout-30',
    label: '30-Day Home Workout',
    durationDays: 30,
    goal: 'General Fitness',
    exercises: [
      { name: 'Bodyweight Squats', amount: '4 x 15', description: 'Strength endurance for lower body', timePeriod: 'Anytime' },
      { name: 'Push-ups', amount: '4 x 12', description: 'Upper body pressing strength', timePeriod: 'Anytime' },
      { name: 'Plank Hold', amount: '3 x 45 sec', description: 'Core stability and control', timePeriod: 'Anytime' },
    ],
  },
];

const toIsoDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildProgramDaysDraft = ({ startDate, durationDays, daysPerWeek, planDurationMinutes, planTitle }, existing = []) => {
  if (Array.isArray(existing) && existing.length) {
    return existing.map((day, idx) => ({
      dayNumber: Number(day.dayNumber) || idx + 1,
      date: toIsoDate(day.date) || '',
      isRest: Boolean(day.isRest),
      title: day.title || '',
      muscles: day.muscles || planTitle || 'Coach Plan',
      durationMinutes: Number(day.durationMinutes) || Number(planDurationMinutes) || 45,
      level: day.level || 'Coach Plan',
      rating: Number(day.rating || 4.7),
      exerciseIndexes: Array.isArray(day.exerciseIndexes) ? day.exerciseIndexes : [],
      assigned: Boolean(day.assigned) || (Array.isArray(day.assignedExerciseIndexes) && day.assignedExerciseIndexes.length > 0),
      assignedAt: day.assignedAt || null,
      assignedExerciseIndexes: Array.isArray(day.assignedExerciseIndexes)
        ? day.assignedExerciseIndexes
        : (Array.isArray(day.exerciseIndexes) ? day.exerciseIndexes : []),
      done: Boolean(day.done),
    }));
  }

  const startIso = toIsoDate(startDate) || toIsoDate(new Date());
  const start = new Date(`${startIso}T00:00:00`);
  const total = Math.max(7, Math.min(120, Number(durationDays) || 30));
  const weekly = Math.max(1, Math.min(7, Number(daysPerWeek) || 4));

  return Array.from({ length: total }).map((_, idx) => {
    const date = new Date(start);
    date.setDate(start.getDate() + idx);
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    const isWorkout = dayOfWeek <= weekly;
    return {
      dayNumber: idx + 1,
      date: toIsoDate(date),
      isRest: !isWorkout,
      title: isWorkout ? `Day ${idx + 1} Workout` : 'Rest Day',
      muscles: planTitle || 'Coach Plan',
      durationMinutes: Number(planDurationMinutes) || 45,
      level: 'Coach Plan',
      rating: 4.7,
      exerciseIndexes: [],
      assigned: !isWorkout,
      assignedAt: !isWorkout ? new Date().toISOString() : null,
      assignedExerciseIndexes: [],
      done: false,
    };
  });
};

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
  const [allPlans, setAllPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [openPlan, setOpenPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    id: '',
    appointmentId: '',
    planTitle: '',
    planNote: '',
    planDurationMinutes: 45,
    durationDays: 30,
    daysPerWeek: 4,
    startDate: '',
    builderType: 'template',
    templateKey: PROGRAM_TEMPLATES[0].key,
    exercises: [blankExercise()],
  });
  const [programDaysDraft, setProgramDaysDraft] = useState([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [dayEditorExercises, setDayEditorExercises] = useState([blankExercise()]);
  const [publishSelectionByUser, setPublishSelectionByUser] = useState({});
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
      setAllPlans(planItems);
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

  const submittedPlans = useMemo(
    () => allPlans.filter((plan) => Boolean(plan.isSubmitted)),
    [allPlans],
  );

  const draftPlans = useMemo(
    () => allPlans.filter((plan) => !plan.isSubmitted),
    [allPlans],
  );

  const activePrograms = useMemo(
    () => submittedPlans.filter((plan) => plan.status !== 'completed'),
    [submittedPlans],
  );

  const workoutLibraryItems = useMemo(() => {
    const map = new Map();
    submittedPlans.forEach((plan) => {
      const key = `${(plan.planTitle || '').trim().toLowerCase()}-${plan.exercises?.length || 0}`;
      if (!map.has(key)) map.set(key, plan);
    });
    return Array.from(map.values()).slice(0, 12);
  }, [submittedPlans]);

  const suggestionOptions = useMemo(
    () => categories.map((item) => ({ id: item._id, label: `${CATEGORY_LABELS[item.categoryKey]} - ${item.name}`, item })),
    [categories],
  );

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
  const current = Math.min(page, totalPages);
  const currentItems = sortedRequests.slice((current - 1) * pageSize, current * pageSize);

  const getTotalWeeks = (durationDays) => Math.max(1, Math.ceil((Number(durationDays) || 30) / 7));
  const normalizePublishedWeeks = (weeks, durationDays) => {
    const totalWeeks = getTotalWeeks(durationDays);
    return [...new Set((Array.isArray(weeks) ? weeks : [])
      .map((w) => Number(w))
      .filter((w) => Number.isInteger(w) && w >= 1 && w <= totalWeeks))]
      .sort((a, b) => a - b);
  };

  const isWorkoutDayAssigned = (day) => (
    Boolean(day?.isRest)
    || (Boolean(day?.assigned) && Array.isArray(day?.assignedExerciseIndexes) && day.assignedExerciseIndexes.length > 0)
  );
  const getWeekDays = (days, weekNo) => (days || []).filter((day) => (Math.ceil(Number(day.dayNumber || 0) / 7) === Number(weekNo)));
  const isWeekCompleted = (days, weekNo) => {
    const weekDays = getWeekDays(days, weekNo);
    return weekDays.length > 0 && weekDays.every(isWorkoutDayAssigned);
  };

  const getMissingWorkoutDays = (days) => (days || [])
    .filter((day) => !day.isRest)
    .filter((day) => !isWorkoutDayAssigned(day));

  const findNextWorkoutDayNumber = (days, fromDayNumber = 1) => {
    const sorted = [...(days || [])].sort((a, b) => a.dayNumber - b.dayNumber);
    const next = sorted.find((day) => !day.isRest && !day.assigned && day.dayNumber >= fromDayNumber);
    if (next) return next.dayNumber;
    const first = sorted.find((day) => !day.isRest && !day.assigned);
    if (first) return first.dayNumber;
    const anyWorkout = sorted.find((day) => !day.isRest);
    return anyWorkout?.dayNumber || 1;
  };

  const loadDayEditor = (dayNumber, daysSource = programDaysDraft, exercisePool = planForm.exercises) => {
    const day = (daysSource || []).find((item) => Number(item.dayNumber) === Number(dayNumber));
    setSelectedDayNumber(Number(dayNumber));
    if (!day || day.isRest) {
      setDayEditorExercises([blankExercise()]);
      return;
    }
    const indexes = Array.isArray(day.assignedExerciseIndexes) && day.assignedExerciseIndexes.length
      ? day.assignedExerciseIndexes
      : (Array.isArray(day.exerciseIndexes) ? day.exerciseIndexes : []);
    const next = indexes
      .map((idx) => exercisePool[idx])
      .filter(Boolean)
      .map((exercise) => ({
        name: exercise.name || '',
        amount: exercise.amount || '',
        description: exercise.description || '',
        timePeriod: TIME_PERIOD_OPTIONS.includes(exercise.timePeriod) ? exercise.timePeriod : 'Anytime',
      }));
    setDayEditorExercises(next.length ? next : [blankExercise()]);
  };

  const openPlanDialog = (request) => {
    const existing = plansByUser[String(request.userId)];
    if (existing?.isSubmitted) {
      showToast('Submitted plans are locked and cannot be edited', 'info');
      return;
    }
    setOpenPlan(request);
    if (!existing) {
      const nextPlanForm = {
        id: '',
        appointmentId: String(request.appointmentId || ''),
        planTitle: '',
        planNote: '',
        planDurationMinutes: 45,
        durationDays: 30,
        daysPerWeek: Number(request.sessionsPerWeek) || 4,
        startDate: new Date().toISOString().slice(0, 10),
        builderType: 'template',
        templateKey: PROGRAM_TEMPLATES[0].key,
        exercises: [blankExercise()],
      };
      setPlanForm(nextPlanForm);
      const nextDays = buildProgramDaysDraft(nextPlanForm);
      setProgramDaysDraft(nextDays);
      const nextDayNumber = findNextWorkoutDayNumber(nextDays, 1);
      loadDayEditor(nextDayNumber, nextDays, nextPlanForm.exercises);
      return;
    }
    const nextPlanForm = {
      id: String(existing._id),
      appointmentId: String(existing.appointmentId || request.appointmentId || ''),
      planTitle: existing.planTitle || '',
      planNote: existing.planNote || '',
      planDurationMinutes: Number(existing.planDurationMinutes) > 0 ? Number(existing.planDurationMinutes) : 45,
      durationDays: Number(existing.durationDays) >= 60 ? 60 : 30,
      daysPerWeek: Number(request.sessionsPerWeek) || 4,
      startDate: toIsoDate(existing.startDate) || new Date().toISOString().slice(0, 10),
      builderType: 'template',
      templateKey: existing.templateKey || PROGRAM_TEMPLATES[0].key,
      exercises: Array.isArray(existing.exercises) && existing.exercises.length ? existing.exercises : [blankExercise()],
    };
    setPlanForm(nextPlanForm);
    const nextDays = buildProgramDaysDraft(nextPlanForm, existing.programDays);
    setProgramDaysDraft(nextDays);
    const nextDayNumber = findNextWorkoutDayNumber(nextDays, 1);
    loadDayEditor(nextDayNumber, nextDays, nextPlanForm.exercises);
  };

  const applyTemplate = (templateKey) => {
    const selected = PROGRAM_TEMPLATES.find((template) => template.key === templateKey);
    if (!selected) return;
    const nextForm = {
      ...planForm,
      templateKey,
      builderType: 'template',
      durationDays: selected.durationDays,
      planTitle: planForm.planTitle?.trim() ? planForm.planTitle : selected.label,
      exercises: [blankExercise()],
      planNote: planForm.planNote?.trim() ? planForm.planNote : `${selected.goal} template customized by coach.`,
    };
    setPlanForm((prev) => ({
      ...prev,
      templateKey,
      builderType: 'template',
      durationDays: selected.durationDays,
      planTitle: prev.planTitle?.trim() ? prev.planTitle : selected.label,
      exercises: [blankExercise()],
      planNote: prev.planNote?.trim() ? prev.planNote : `${selected.goal} template customized by coach.`,
    }));
    const nextDays = buildProgramDaysDraft(nextForm);
    setProgramDaysDraft(nextDays);
    const nextDayNumber = findNextWorkoutDayNumber(nextDays, 1);
    loadDayEditor(nextDayNumber, nextDays, nextForm.exercises);
  };

  const regenerateProgramDays = () => {
    const nextDays = buildProgramDaysDraft(planForm);
    setProgramDaysDraft(nextDays);
    const nextDayNumber = findNextWorkoutDayNumber(nextDays, selectedDayNumber || 1);
    loadDayEditor(nextDayNumber, nextDays, planForm.exercises);
  };

  const toggleProgramDayRest = (index) => {
    setProgramDaysDraft((prev) => prev.map((day, idx) => (
      idx === index
        ? {
          ...day,
          isRest: !day.isRest,
          title: day.isRest ? (day.title === 'Rest Day' ? `Day ${day.dayNumber} Workout` : day.title) : 'Rest Day',
          exerciseIndexes: [],
          assigned: !day.isRest,
          assignedAt: !day.isRest ? new Date().toISOString() : null,
          assignedExerciseIndexes: [],
        }
        : day
    )));
  };

  const savePlan = async () => {
    if (!openPlan) return;
    if (!planForm.planTitle.trim()) return showToast('Plan title is required', 'warning');
    if (!Number(planForm.planDurationMinutes) || Number(planForm.planDurationMinutes) < 1) {
      return showToast('Assigned time must be at least 1 minute', 'warning');
    }
    if (![30, 60].includes(Number(planForm.durationDays))) {
      return showToast('Duration must be 30 or 60 days', 'warning');
    }
    const cleanedPool = (planForm.exercises || [])
      .map((x) => ({
        ...x,
        name: String(x.name || '').trim(),
        amount: String(x.amount || '').trim(),
        description: String(x.description || '').trim(),
        timePeriod: TIME_PERIOD_OPTIONS.includes(x.timePeriod) ? x.timePeriod : 'Anytime',
      }))
      .filter((x) => x.name && x.amount);
    if (!cleanedPool.length) {
      return showToast('Add at least one exercise in day editor before saving', 'warning');
    }
    const payload = {
      coachId,
      userId: String(openPlan.userId),
      appointmentId: String(planForm.appointmentId || openPlan.appointmentId || ''),
      planTitle: planForm.planTitle.trim(),
      planNote: planForm.planNote.trim(),
      planDurationMinutes: Number(planForm.planDurationMinutes) || 45,
      durationDays: Number(planForm.durationDays) || 30,
      daysPerWeek: Number(planForm.daysPerWeek) || 4,
      startDate: toIsoDate(planForm.startDate) || '',
      builderType: 'template',
      templateKey: planForm.templateKey || '',
      exercises: cleanedPool,
      programDays: programDaysDraft.map((day) => ({
        ...day,
        date: toIsoDate(day.date),
        durationMinutes: Number(day.durationMinutes) || Number(planForm.planDurationMinutes) || 45,
      })),
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

  const saveSelectedDay = () => {
    const selected = programDaysDraft.find((day) => Number(day.dayNumber) === Number(selectedDayNumber));
    if (!selected) return showToast('Select a day first', 'warning');
    if (selected.isRest) return showToast('Rest day does not need exercises', 'info');

    const cleaned = dayEditorExercises
      .map((exercise) => ({
        name: String(exercise.name || '').trim(),
        amount: String(exercise.amount || '').trim(),
        description: String(exercise.description || '').trim(),
        timePeriod: TIME_PERIOD_OPTIONS.includes(exercise.timePeriod) ? exercise.timePeriod : 'Anytime',
      }))
      .filter((exercise) => exercise.name && exercise.amount);

    if (!cleaned.length) return showToast('Add at least one valid exercise for this day', 'warning');

    const nextPool = [...planForm.exercises];
    const indexes = cleaned.map((exercise) => {
      const existingIndex = nextPool.findIndex(
        (item) => (item.name || '').trim().toLowerCase() === exercise.name.toLowerCase()
          && (item.amount || '').trim().toLowerCase() === exercise.amount.toLowerCase()
          && (item.description || '').trim().toLowerCase() === exercise.description.toLowerCase()
          && (item.timePeriod || 'Anytime') === exercise.timePeriod,
      );
      if (existingIndex >= 0) return existingIndex;
      nextPool.push(exercise);
      return nextPool.length - 1;
    });

    const nowIso = new Date().toISOString();
    const summaryTitle = cleaned.length > 2
      ? `${cleaned[0].name}, ${cleaned[1].name} +${cleaned.length - 2}`
      : cleaned.map((x) => x.name).join(', ');
    const nextDays = programDaysDraft.map((day) => (
      Number(day.dayNumber) === Number(selectedDayNumber)
        ? {
          ...day,
          assigned: true,
          assignedAt: nowIso,
          assignedExerciseIndexes: indexes,
          exerciseIndexes: indexes,
          title: summaryTitle || `Day ${day.dayNumber} Workout`,
        }
        : day
    ));

    setPlanForm((prev) => ({ ...prev, exercises: nextPool }));
    setProgramDaysDraft(nextDays);

    const nextDayNumber = findNextWorkoutDayNumber(nextDays, Number(selectedDayNumber) + 1);
    loadDayEditor(nextDayNumber, nextDays, nextPool);
    showToast(`Day ${selectedDayNumber} workout applied`, 'success');
  };

  const removePlan = async (request) => {
    const existing = plansByUser[String(request.userId)];
    if (!existing?._id) return;
    if (existing?.isSubmitted) {
      showToast('Submitted plans cannot be deleted', 'warning');
      return;
    }
    try {
      await deleteCoachWorkoutPlan(String(existing._id));
      showToast('Workout plan deleted');
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to delete workout plan', 'error');
    }
  };

  const submitPlan = async (request, submitMode = 'all', weekNumber = null) => {
    const existing = plansByUser[String(request.userId)];
    if (!existing?._id) return;
    if (existing?.isSubmitted && submitMode === 'all') {
      showToast('Workout plan already submitted', 'info');
      return;
    }
    const totalWeeks = getTotalWeeks(existing.durationDays);
    const publishedWeeks = normalizePublishedWeeks(existing.publishedWeeks, existing.durationDays);
    if (submitMode === 'week') {
      const weekNo = Number(weekNumber);
      if (!Number.isInteger(weekNo) || weekNo < 1 || weekNo > totalWeeks) {
        return showToast('Select a valid week to publish', 'warning');
      }
      if (publishedWeeks.includes(weekNo)) {
        return showToast(`Week ${weekNo} already published`, 'info');
      }
    } else {
      const daysForValidation =
        openPlan && String(openPlan.userId) === String(request.userId)
          ? programDaysDraft
          : existing.programDays;
      const missing = getMissingWorkoutDays(daysForValidation);
      if (missing.length) {
        const sample = missing.slice(0, 6).map((day) => day.dayNumber).join(', ');
        return showToast(`Complete all workout days before publish. Missing: ${sample}${missing.length > 6 ? '...' : ''}`, 'warning');
      }
    }
    try {
      await submitCoachWorkoutPlan(String(existing._id), {
        submitted: true,
        mode: submitMode,
        ...(submitMode === 'week' ? { weekNumber: Number(weekNumber) } : {}),
      });
      showToast(submitMode === 'week' ? `Week ${weekNumber} published successfully` : 'Workout plan submitted successfully');
      await loadData();
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to submit workout plan', 'error');
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
        <Button variant={activeView === 'requests' ? 'contained' : 'outlined'} onClick={() => setActiveView('requests')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Requests</Button>
        <Button variant={activeView === 'activePrograms' ? 'contained' : 'outlined'} onClick={() => setActiveView('activePrograms')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Active Programs</Button>
        <Button variant={activeView === 'workoutLibrary' ? 'contained' : 'outlined'} onClick={() => setActiveView('workoutLibrary')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Workout Library</Button>
        <Button variant={activeView === 'exerciseLibrary' ? 'contained' : 'outlined'} onClick={() => setActiveView('exerciseLibrary')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Exercise Library</Button>
        <Button variant={activeView === 'draftPrograms' ? 'contained' : 'outlined'} onClick={() => setActiveView('draftPrograms')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Draft Programs</Button>
      </Stack>

      {activeView === 'requests' && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' }, gap: 2 }}>
            {currentItems.map((request) => {
              const existingPlan = plansByUser[String(request.userId)];
              const hasPlan = Boolean(existingPlan);
              const isSubmitted = Boolean(existingPlan?.isSubmitted);
              const totalWeeks = hasPlan ? getTotalWeeks(existingPlan.durationDays) : 0;
              const publishedWeeks = hasPlan ? normalizePublishedWeeks(existingPlan.publishedWeeks, existingPlan.durationDays) : [];
              const planDays = Array.isArray(existingPlan?.programDays) ? existingPlan.programDays : [];
              const isFullPlanCompleted = hasPlan && getMissingWorkoutDays(planDays).length === 0;
              const progressPercent = totalWeeks ? Math.round((publishedWeeks.length / totalWeeks) * 100) : 0;
              const weekStatuses = totalWeeks
                ? Array.from({ length: totalWeeks }, (_, i) => {
                  const weekNo = i + 1;
                  const isPublished = publishedWeeks.includes(weekNo);
                  const isCompleted = hasPlan ? isWeekCompleted(planDays, weekNo) : false;
                  const prevPublished = weekNo === 1 || publishedWeeks.includes(weekNo - 1);
                  const canPublish = !isPublished && isCompleted && prevPublished;
                  return { weekNo, isPublished, isCompleted, canPublish };
                })
                : [];
              const firstPublishableWeek = weekStatuses.find((item) => item.canPublish)?.weekNo || null;
              const publishAllEnabled = Boolean(isFullPlanCompleted && !isSubmitted);
              const selectedRaw = publishSelectionByUser[String(request.userId)] || '';
              const availableValues = [
                ...(publishAllEnabled ? ['all'] : []),
                ...weekStatuses.filter((item) => item.canPublish).map((item) => `week-${item.weekNo}`),
              ];
              const fallbackValue = publishAllEnabled ? 'all' : (firstPublishableWeek ? `week-${firstPublishableWeek}` : '');
              const publishSelectValue = availableValues.includes(selectedRaw) ? selectedRaw : fallbackValue;
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
                      {hasPlan && <Chip size="small" label={isSubmitted ? 'Plan Submitted' : 'Plan Ready'} icon={<AssignmentTurnedInRoundedIcon />} />}
                    </Stack>
                  </Stack>
                  <Typography sx={{ mt: 1.2, color: mutedText, fontSize: '0.86rem' }}>Request note: {request.notes || '-'}</Typography>
                  {hasPlan && (
                    <Box sx={{ mt: 1.1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography sx={{ color: mutedText, fontSize: '0.78rem' }}>Publish Progress</Typography>
                        <Typography sx={{ color: mutedText, fontSize: '0.78rem' }}>
                          {publishedWeeks.length}/{totalWeeks} weeks
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          bgcolor: isDark ? '#1e293b' : '#e5e7eb',
                        }}
                      />
                    </Box>
                  )}
                  <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 1.2 }}>
                    <Typography sx={{ color: mutedText, fontSize: '0.8rem' }}>Requested on: {request.requestedOn}</Typography>
                    <Stack direction="row" spacing={1}>
                      {!isSubmitted && (
                        <Button variant="contained" onClick={() => openPlanDialog(request)} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>{hasPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}</Button>
                      )}
                      {hasPlan && !isSubmitted && <Button variant="outlined" color="error" onClick={() => removePlan(request)} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Delete</Button>}
                      {hasPlan && !isSubmitted && (
                        <TextField
                          select
                          size="small"
                          value={publishSelectValue}
                          onChange={(e) => setPublishSelectionByUser((prev) => ({ ...prev, [String(request.userId)]: e.target.value }))}
                          sx={{
                            minWidth: 190,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: isDark ? '#111f3d' : '#f8fafc',
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select week to publish
                          </MenuItem>
                          {weekStatuses.map(({ weekNo, isPublished, isCompleted, canPublish }) => (
                            <MenuItem
                              key={`${request.userId}-week-${weekNo}`}
                              value={`week-${weekNo}`}
                              disabled={!canPublish}
                              sx={{
                                opacity: canPublish || isPublished ? 1 : 0.45,
                                filter: isCompleted || isPublished ? 'none' : 'blur(0.4px)',
                                fontWeight: isCompleted || isPublished ? 700 : 500,
                                color: isPublished ? 'success.main' : 'inherit',
                              }}
                            >
                              {isPublished ? `Week ${weekNo} Published` : `Publish Week ${weekNo}`}
                            </MenuItem>
                          ))}
                          {publishAllEnabled && (
                            <MenuItem value="all" sx={{ fontWeight: 800, color: 'success.main' }}>
                              Publish All Weeks
                            </MenuItem>
                          )}
                        </TextField>
                      )}
                      {hasPlan && !isSubmitted && (
                        <Button
                          variant="contained"
                          color="success"
                          disabled={!publishSelectValue}
                          onClick={() => {
                            const value = publishSelectValue;
                            if (!value) return showToast('Complete a week before publishing', 'info');
                            if (value === 'all') return submitPlan(request, 'all');
                            const weekNo = Number(String(value).replace('week-', ''));
                            return submitPlan(request, 'week', weekNo);
                          }}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 800,
                            px: 2.2,
                            background: 'linear-gradient(135deg, #1f8f3a, #2ba64f)',
                          }}
                        >
                          Publish
                        </Button>
                      )}
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

      {activeView === 'activePrograms' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          {activePrograms.map((plan) => (
            <Box key={plan._id} sx={{ background: panelBg, border: '1px solid', borderColor: panelBorder, borderRadius: 2.5, p: 2.2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 800 }}>{plan.planTitle}</Typography>
                <Chip size="small" color="success" label="Published" />
              </Stack>
              <Typography sx={{ color: mutedText, fontSize: '0.85rem', mt: 0.8 }}>
                User: {String(plan.userId)} • Exercises: {plan.exercises?.length || 0}
              </Typography>
              <Typography sx={{ color: mutedText, fontSize: '0.82rem', mt: 0.5 }}>
                Submitted: {plan.submittedAt ? new Date(plan.submittedAt).toLocaleDateString() : '-'}
              </Typography>
            </Box>
          ))}
          {!activePrograms.length && (
            <Typography sx={{ color: mutedText, fontSize: '0.9rem' }}>No active programs yet.</Typography>
          )}
        </Box>
      )}

      {activeView === 'workoutLibrary' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          {workoutLibraryItems.map((plan) => (
            <Box key={plan._id} sx={{ background: panelBg, border: '1px solid', borderColor: panelBorder, borderRadius: 2.5, p: 2.2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 800 }}>{plan.planTitle}</Typography>
                <Chip size="small" label={`${plan.exercises?.length || 0} workouts`} />
              </Stack>
              <Typography sx={{ color: mutedText, fontSize: '0.85rem', mt: 0.8, mb: 1 }}>
                Reusable program structure from submitted plans.
              </Typography>
              <Stack spacing={0.7}>
                {(plan.exercises || []).slice(0, 3).map((exercise, idx) => (
                  <Typography key={`${plan._id}-exercise-${idx}`} sx={{ color: mutedText, fontSize: '0.82rem' }}>
                    • {exercise.name} ({exercise.amount})
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
          {!workoutLibraryItems.length && (
            <Typography sx={{ color: mutedText, fontSize: '0.9rem' }}>No workout library programs yet.</Typography>
          )}
        </Box>
      )}

      {activeView === 'draftPrograms' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          {draftPlans.map((plan) => (
            <Box key={plan._id} sx={{ background: panelBg, border: '1px solid', borderColor: panelBorder, borderRadius: 2.5, p: 2.2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontWeight: 800 }}>{plan.planTitle}</Typography>
                <Chip size="small" color="warning" label="Draft" />
              </Stack>
              <Typography sx={{ color: mutedText, fontSize: '0.85rem', mt: 0.8 }}>
                User: {String(plan.userId)} • Exercises: {plan.exercises?.length || 0}
              </Typography>
              <Typography sx={{ color: mutedText, fontSize: '0.82rem', mt: 0.5 }}>
                Last updated: {plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : '-'}
              </Typography>
            </Box>
          ))}
          {!draftPlans.length && (
            <Typography sx={{ color: mutedText, fontSize: '0.9rem' }}>No draft programs.</Typography>
          )}
        </Box>
      )}

      {activeView === 'exerciseLibrary' && (
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
            <Typography sx={{ fontWeight: 800, fontSize: '0.98rem' }}>A. Program Info</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField label="Program Name" value={planForm.planTitle} onChange={(e) => setPlanForm((prev) => ({ ...prev, planTitle: e.target.value }))} fullWidth />
              <TextField
                select
                label="Duration (Days)"
                value={planForm.durationDays}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, durationDays: Number(e.target.value) === 60 ? 60 : 30 }))}
                fullWidth
              >
                <MenuItem value={30}>30 Days</MenuItem>
                <MenuItem value={60}>60 Days</MenuItem>
              </TextField>
              <TextField
                label="Days / Week"
                type="number"
                value={planForm.daysPerWeek}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, daysPerWeek: Math.max(1, Math.min(7, Number(e.target.value) || 4)) }))}
                inputProps={{ min: 1, max: 7 }}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                label="Start Date"
                type="date"
                value={planForm.startDate}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Assigned Time (minutes)"
                type="number"
                value={planForm.planDurationMinutes}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPlanForm((prev) => ({
                    ...prev,
                    planDurationMinutes: Number.isNaN(value) ? '' : Math.max(1, Math.min(600, value)),
                  }));
                }}
                inputProps={{ min: 1, max: 600 }}
                fullWidth
              />
            </Stack>
            <TextField label="Plan Notes" value={planForm.planNote} onChange={(e) => setPlanForm((prev) => ({ ...prev, planNote: e.target.value }))} fullWidth multiline minRows={2} />
            <Divider />
            <Typography sx={{ fontWeight: 800, fontSize: '0.98rem' }}>B. Build Method</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                label="Builder Option"
                value="Use Template Program"
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                select
                label="Template"
                value={planForm.templateKey}
                onChange={(e) => applyTemplate(e.target.value)}
                fullWidth
              >
                {PROGRAM_TEMPLATES.map((template) => (
                  <MenuItem key={template.key} value={template.key}>{template.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontWeight: 800, fontSize: '0.98rem' }}>Weekly Schedule</Typography>
              <Button size="small" variant="outlined" onClick={regenerateProgramDays}>
                Auto Generate Weeks
              </Button>
            </Stack>
            <Box
              sx={{
                maxHeight: 180,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: panelBorder,
                borderRadius: 2,
                p: 1.2,
                bgcolor: isDark ? '#111c31' : '#f8fafc',
              }}
            >
              <Stack spacing={0.8}>
                {programDaysDraft.map((day, index) => (
                  <Stack key={`${day.date}-${day.dayNumber}`} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontSize: '0.82rem', color: mutedText, minWidth: 150 }}>
                      Day {day.dayNumber} • {day.date}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: theme.palette.text.primary, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pr: 1 }}>
                      {day.title || (day.isRest ? 'Rest Day' : 'Workout Day')}
                    </Typography>
                    {!day.isRest && Boolean(day.assigned) && (
                      <Chip
                        size="small"
                        color="success"
                        icon={<CheckCircleRoundedIcon />}
                        label="Applied"
                        sx={{ transition: 'all 0.25s ease' }}
                      />
                    )}
                    <Button
                      size="small"
                      variant={day.isRest ? 'outlined' : 'contained'}
                      color={day.isRest ? 'warning' : 'success'}
                      onClick={() => (day.isRest ? toggleProgramDayRest(index) : loadDayEditor(day.dayNumber))}
                      sx={{
                        textTransform: 'none',
                        minWidth: 96,
                        transition: 'all 0.25s ease',
                        transform: selectedDayNumber === day.dayNumber ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      {day.isRest ? 'Rest' : (day.assigned ? 'Edit' : 'Workout')}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Divider />
            <Typography sx={{ fontWeight: 800, fontSize: '0.98rem' }}>C. Day Editor</Typography>
            <Typography sx={{ color: mutedText, fontSize: '0.82rem' }}>
              Editing Day {selectedDayNumber}
            </Typography>
            {dayEditorExercises.map((exercise, index) => (
              <Box key={`exercise-${index}`} sx={{ p: 1.5, border: '1px solid', borderColor: panelBorder, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Chip size="small" label={`Exercise ${index + 1}`} />
                  <Button size="small" color="error" onClick={() => setDayEditorExercises((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))}>Remove</Button>
                </Stack>
                <TextField
                  select
                  label="Categories"
                  value=""
                  onChange={(e) => {
                    const selected = suggestionOptions.find((x) => x.id === e.target.value);
                    if (!selected) return;
                    setDayEditorExercises((prev) => prev.map((x, i) => (i === index ? {
                      ...x,
                      name: selected.item.name,
                      amount: selected.item.amount,
                      description: selected.item.description || '',
                    } : x)));
                  }}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                >
                  {suggestionOptions.map((option) => <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>)}
                </TextField>
                <Stack spacing={1}>
                  <TextField label="Exercise Name" value={exercise.name} onChange={(e) => setDayEditorExercises((prev) => prev.map((x, i) => (i === index ? { ...x, name: e.target.value } : x)))} fullWidth />
                  <TextField
                    select
                    label="Time Period"
                    value={TIME_PERIOD_OPTIONS.includes(exercise.timePeriod) ? exercise.timePeriod : 'Anytime'}
                    onChange={(e) => setDayEditorExercises((prev) => prev.map((x, i) => (i === index ? { ...x, timePeriod: e.target.value } : x)))}
                    fullWidth
                  >
                    {TIME_PERIOD_OPTIONS.map((slot) => (
                      <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Amount" value={exercise.amount} onChange={(e) => setDayEditorExercises((prev) => prev.map((x, i) => (i === index ? { ...x, amount: e.target.value } : x)))} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">Qty</InputAdornment> }} />
                  <TextField label="Description" value={exercise.description} onChange={(e) => setDayEditorExercises((prev) => prev.map((x, i) => (i === index ? { ...x, description: e.target.value } : x)))} fullWidth multiline minRows={2} />
                </Stack>
              </Box>
            ))}
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setDayEditorExercises((prev) => [...prev, blankExercise()])}>Add New Exercise</Button>
                <Button variant="contained" color="info" onClick={saveSelectedDay}>Apply To Day</Button>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={savePlan}>Save Draft</Button>
                {planForm.id && getMissingWorkoutDays(programDaysDraft).length === 0 && (
                  <Button variant="contained" color="success" onClick={() => openPlan && submitPlan(openPlan, 'all')}>Publish All</Button>
                )}
              </Stack>
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
