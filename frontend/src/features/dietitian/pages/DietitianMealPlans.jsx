import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PageHeader from '@/shared/components/ui/PageHeader';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  createMealLibraryItem,
  deleteMealLibraryItem,
  getMealLibraryItems,
  updateMealLibraryItem,
} from '../api/dietitian.api';

const CATEGORY_OPTIONS = [
  { value: 'weight_gain', label: 'Weight Gaining' },
  { value: 'weight_loss', label: 'Weight Losing' },
  { value: 'other', label: 'Other' },
];

const emptyMealForm = {
  category: 'weight_gain',
  mealName: '',
  calories: '',
  protein: '',
  carbs: '',
  lipids: '',
  vitamins: '',
  description: '',
};

function DietitianMealPlans() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#1a2a47' : '#ffffff';
  const panelBorder = isDark ? '#2b4268' : '#dbe7f6';
  const mutedText = isDark ? '#88a1c7' : '#607aa5';
  const sectionTitleColor = isDark ? '#e6f0ff' : '#0f172a';
  const mealTitleColor = isDark ? '#f8fafc' : '#0f172a';
  const mealMetaColor = isDark ? '#cfe0fb' : '#475569';
  const tagColor = isDark ? '#93c5fd' : '#1d4ed8';
  const tagBg = isDark ? '#2563eb1f' : '#dbeafe';

  const [activeCategory, setActiveCategory] = useState('weight_gain');
  const { user } = useAuth();
  const dietitianId = String(user?.id || user?._id || '');
  const [meals, setMeals] = useState([]);
  const [mealForm, setMealForm] = useState(emptyMealForm);
  const [editState, setEditState] = useState({ open: false, meal: null });
  const [deleteState, setDeleteState] = useState({ open: false, meal: null });
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);

  const mealsByCategory = useMemo(
    () => meals.filter((meal) => meal.category === activeCategory),
    [meals, activeCategory],
  );

  const mealSuggestionLibrary = useMemo(() => meals, [meals]);

  const loadMeals = async () => {
    if (!dietitianId) return;
    setIsLoading(true);
    try {
      const { data } = await getMealLibraryItems({ dietitianId });
      setMeals(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Failed to load meals.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, [dietitianId]);

  const handleAddMeal = async () => {
    if (!dietitianId) {
      setFeedback({
        open: true,
        message: 'Dietitian account is required.',
        severity: 'error',
      });
      return;
    }

    if (!mealForm.mealName.trim() || !mealForm.calories || !mealForm.protein) {
      setFeedback({
        open: true,
        message: 'Meal name, calories, and protein are required.',
        severity: 'warning',
      });
      return;
    }

    try {
      const payload = {
        ...mealForm,
        dietitianId,
      };
      const { data } = await createMealLibraryItem(payload);
      setMeals((prev) => [data?.data, ...prev]);
      setMealForm({ ...emptyMealForm, category: mealForm.category });
      setFeedback({ open: true, message: 'Meal added successfully.', severity: 'success' });
    } catch (error) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Failed to add meal.',
        severity: 'error',
      });
    }
  };

  const openEditMeal = (meal) => {
    setEditState({ open: true, meal: { ...meal } });
  };

  const applySuggestionToAddForm = (selected) => {
    if (!selected) return;
    setMealForm((prev) => ({
      ...prev,
      mealName: selected.mealName,
      category: selected.category || prev.category,
      calories: selected.calories,
      protein: selected.protein,
      carbs: selected.carbs,
      lipids: selected.lipids,
      vitamins: selected.vitamins,
      description: selected.description,
    }));
  };

  const applySuggestionToEditForm = (selected) => {
    if (!selected || !editState.meal) return;
    setEditState((prev) => ({
      ...prev,
      meal: {
        ...prev.meal,
        mealName: selected.mealName,
        category: selected.category || prev.meal.category,
        calories: selected.calories,
        protein: selected.protein,
        carbs: selected.carbs,
        lipids: selected.lipids,
        vitamins: selected.vitamins,
        description: selected.description,
      },
    }));
  };

  const saveEditedMeal = async () => {
    if (!editState.meal?.mealName?.trim() || !dietitianId) return;
    try {
      const { data } = await updateMealLibraryItem(
        editState.meal._id || editState.meal.id,
        editState.meal,
        dietitianId,
      );
      setMeals((prev) =>
        prev.map((meal) =>
          String(meal._id || meal.id) === String(data?.data?._id || data?.data?.id) ? data.data : meal),
      );
      setEditState({ open: false, meal: null });
      setFeedback({ open: true, message: 'Meal updated successfully.', severity: 'success' });
    } catch (error) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Failed to update meal.',
        severity: 'error',
      });
    }
  };

  const deleteMeal = async () => {
    if (!deleteState.meal) return;
    try {
      const id = deleteState.meal._id || deleteState.meal.id;
      await deleteMealLibraryItem(id, dietitianId);
      setMeals((prev) => prev.filter((meal) => String(meal._id || meal.id) !== String(id)));
      setDeleteState({ open: false, meal: null });
      setFeedback({ open: true, message: 'Meal deleted successfully.', severity: 'success' });
    } catch (error) {
      setFeedback({
        open: true,
        message: error?.response?.data?.message || 'Failed to delete meal.',
        severity: 'error',
      });
    }
  };

  const getCategoryLabel = (value) =>
    CATEGORY_OPTIONS.find((option) => option.value === value)?.label || 'Other';

  return (
    <Box sx={{ pb: 3 }}>
      <PageHeader
        title="Meal Plans"
        subtitle="Add, edit, and delete meals with calories, protein, and macro details across categories."
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {CATEGORY_OPTIONS.map((category) => (
          <Button
            key={category.value}
            onClick={() => setActiveCategory(category.value)}
            variant={activeCategory === category.value ? 'contained' : 'outlined'}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            {category.label}
          </Button>
        ))}
      </Stack>

      <Box
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: panelBorder,
          borderRadius: 2,
          background: panelBg,
          mb: 2,
        }}
      >
        <Typography sx={{ color: sectionTitleColor, fontWeight: 800, fontSize: '1.05rem', mb: 1.2 }}>
          Add Meal
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          <TextField
            select
            label="Category"
            value={mealForm.category}
            onChange={(e) => setMealForm((prev) => ({ ...prev, category: e.target.value }))}
            size="small"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Autocomplete
            freeSolo
            options={mealSuggestionLibrary}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.mealName || ''
            }
            value={mealForm.mealName}
            onInputChange={(_, value) =>
              setMealForm((prev) => ({ ...prev, mealName: value }))
            }
            onChange={(_, selected) => applySuggestionToAddForm(selected)}
            renderInput={(params) => (
              <TextField {...params} label="Meal Name" size="small" />
            )}
          />
          <TextField
            label="Calories"
            type="number"
            value={mealForm.calories}
            onChange={(e) => setMealForm((prev) => ({ ...prev, calories: e.target.value }))}
            size="small"
          />
          <TextField
            label="Protein (g)"
            type="number"
            value={mealForm.protein}
            onChange={(e) => setMealForm((prev) => ({ ...prev, protein: e.target.value }))}
            size="small"
          />
          <TextField
            label="Carbs (g)"
            type="number"
            value={mealForm.carbs}
            onChange={(e) => setMealForm((prev) => ({ ...prev, carbs: e.target.value }))}
            size="small"
          />
          <TextField
            label="Lipids (g)"
            type="number"
            value={mealForm.lipids}
            onChange={(e) => setMealForm((prev) => ({ ...prev, lipids: e.target.value }))}
            size="small"
          />
          <TextField
            label="Vitamins"
            value={mealForm.vitamins}
            onChange={(e) => setMealForm((prev) => ({ ...prev, vitamins: e.target.value }))}
            size="small"
          />
          <TextField
            label="Description"
            value={mealForm.description}
            onChange={(e) => setMealForm((prev) => ({ ...prev, description: e.target.value }))}
            size="small"
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddMeal}
          sx={{
            mt: 1.3,
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 1.5,
            backgroundColor: '#f30612',
            '&:hover': { backgroundColor: '#cf0812' },
          }}
        >
          Add Meal
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {isLoading && (
          <Typography sx={{ color: mutedText, mb: 1 }}>Loading meals...</Typography>
        )}
        {mealsByCategory.map((meal) => (
          <Box
            key={meal._id || meal.id}
            sx={{
              p: 1.7,
              border: '1px solid',
              borderColor: panelBorder,
              borderRadius: 2,
              background: panelBg,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
              <Typography sx={{ color: mealTitleColor, fontWeight: 800, fontSize: '1.05rem' }}>
                {meal.mealName}
              </Typography>
              <Chip
                size="small"
                label={getCategoryLabel(meal.category)}
                sx={{ bgcolor: tagBg, color: tagColor, fontWeight: 700 }}
              />
            </Stack>
            <Typography sx={{ color: mutedText, fontSize: '0.9rem', mb: 1 }}>
              {meal.description || 'No description added.'}
            </Typography>
            <Typography sx={{ color: mealMetaColor, fontSize: '0.88rem', lineHeight: 1.7 }}>
              Calories: {meal.calories || 0}
              <br />
              Protein: {meal.protein || 0} g
              <br />
              Carbs: {meal.carbs || 0} g
              <br />
              Lipids: {meal.lipids || 0} g
              <br />
              Vitamins: {meal.vitamins || '-'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={() => openEditMeal(meal)}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={() => setDeleteState({ open: true, meal })}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        ))}
      </Box>

      <Dialog open={editState.open} onClose={() => setEditState({ open: false, meal: null })} fullWidth maxWidth="sm">
        <DialogTitle>Edit Meal</DialogTitle>
        <DialogContent>
          <Stack spacing={1.1} sx={{ mt: 0.7 }}>
            <TextField
              select
              label="Category"
              value={editState.meal?.category || 'weight_gain'}
              onChange={(e) =>
                setEditState((prev) => ({ ...prev, meal: { ...prev.meal, category: e.target.value } }))
              }
              size="small"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <Autocomplete
              freeSolo
              options={mealSuggestionLibrary}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.mealName || ''
              }
              value={editState.meal?.mealName || ''}
              onInputChange={(_, value) =>
                setEditState((prev) => ({ ...prev, meal: { ...prev.meal, mealName: value } }))
              }
              onChange={(_, selected) => applySuggestionToEditForm(selected)}
              renderInput={(params) => (
                <TextField {...params} label="Meal Name" size="small" />
              )}
            />
            <TextField
              label="Description"
              value={editState.meal?.description || ''}
              onChange={(e) =>
                setEditState((prev) => ({ ...prev, meal: { ...prev.meal, description: e.target.value } }))
              }
              size="small"
              multiline
              minRows={2}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <TextField
                label="Calories"
                type="number"
                value={editState.meal?.calories || ''}
                onChange={(e) =>
                  setEditState((prev) => ({ ...prev, meal: { ...prev.meal, calories: e.target.value } }))
                }
                size="small"
              />
              <TextField
                label="Protein (g)"
                type="number"
                value={editState.meal?.protein || ''}
                onChange={(e) =>
                  setEditState((prev) => ({ ...prev, meal: { ...prev.meal, protein: e.target.value } }))
                }
                size="small"
              />
              <TextField
                label="Carbs (g)"
                type="number"
                value={editState.meal?.carbs || ''}
                onChange={(e) =>
                  setEditState((prev) => ({ ...prev, meal: { ...prev.meal, carbs: e.target.value } }))
                }
                size="small"
              />
              <TextField
                label="Lipids (g)"
                type="number"
                value={editState.meal?.lipids || ''}
                onChange={(e) =>
                  setEditState((prev) => ({ ...prev, meal: { ...prev.meal, lipids: e.target.value } }))
                }
                size="small"
              />
            </Box>
            <TextField
              label="Vitamins"
              value={editState.meal?.vitamins || ''}
              onChange={(e) =>
                setEditState((prev) => ({ ...prev, meal: { ...prev.meal, vitamins: e.target.value } }))
              }
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditState({ open: false, meal: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveEditedMeal}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteState.open} onClose={() => setDeleteState({ open: false, meal: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Meal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteState.meal?.mealName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState({ open: false, meal: null })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteMeal}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={2500}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DietitianMealPlans;
