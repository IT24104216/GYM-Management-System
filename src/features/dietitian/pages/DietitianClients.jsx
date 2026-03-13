import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Chip,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PageHeader from '@/shared/components/ui/PageHeader';
import { loadDietitianMeals } from '@/features/dietitian/utils/mealPlanStorage';

const allClientsMock = [
  { id: 1, name: 'John Doe', joinedDate: '2025-01-15', age: 28, weight: 75, height: 175, goal: 'Build muscle and increase strength' },
  { id: 2, name: 'Jane Silva', joinedDate: '2026-03-16', age: 27, weight: 70, height: 170, goal: 'Muscle Gain Nutrition' },
  { id: 3, name: 'Kavindu Perera', joinedDate: '2026-03-17', age: 31, weight: 82, height: 178, goal: 'Fat Loss Meal Plan' },
  { id: 4, name: 'Mila Fernando', joinedDate: '2026-03-11', age: 25, weight: 61, height: 165, goal: 'Lean maintenance diet' },
  { id: 5, name: 'Sahan Wickram', joinedDate: '2026-03-10', age: 34, weight: 89, height: 182, goal: 'Reduce body fat percentage' },
  { id: 6, name: 'Rashmi De Alwis', joinedDate: '2026-03-08', age: 29, weight: 66, height: 168, goal: 'High-protein muscle support' },
  { id: 7, name: 'Nadeesha Wijeratne', joinedDate: '2026-03-07', age: 30, weight: 71, height: 171, goal: 'Balanced fat-loss meal plan' },
  { id: 8, name: 'Anjalika Senanayake', joinedDate: '2026-03-06', age: 26, weight: 58, height: 162, goal: 'Healthy weight gain and energy' },
  { id: 9, name: 'Dilan Fernando', joinedDate: '2026-03-05', age: 33, weight: 84, height: 180, goal: 'Reduce sugar intake and cut fat' },
  { id: 10, name: 'Hasini Perera', joinedDate: '2026-03-04', age: 24, weight: 55, height: 160, goal: 'Sports nutrition meal structure' },
  { id: 11, name: 'Tharindu Mendis', joinedDate: '2026-03-03', age: 36, weight: 92, height: 183, goal: 'Macro based meal planning' },
  { id: 12, name: 'Ishara Rodrigo', joinedDate: '2026-03-02', age: 28, weight: 63, height: 167, goal: 'Lean muscle nutrition strategy' },
];

const CLIENTS_PER_PAGE = 6;

const mealSections = [
  { key: 'breakfast', title: 'Breakfast Options', icon: '🌅' },
  { key: 'lunch', title: 'Lunch Options', icon: '🌞' },
  { key: 'dinner', title: 'Dinner Options', icon: '🌙' },
  { key: 'snacks', title: 'Snacks Options', icon: '🍎' },
];

const createMealOption = () => ({
  mealName: '',
  description: '',
  calories: '',
  protein: '',
  carbs: '',
  lipids: '',
  vitamins: '',
});

const createDietPlanForm = () => ({
  breakfast: [createMealOption(), createMealOption(), createMealOption()],
  lunch: [createMealOption(), createMealOption(), createMealOption()],
  dinner: [createMealOption(), createMealOption(), createMealOption()],
  snacks: [createMealOption(), createMealOption(), createMealOption()],
  additionalNotes: '',
});

function DietitianClients() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchText, setSearchText] = useState('');
  const [dietPlanModal, setDietPlanModal] = useState({ open: false, client: null });
  const [dietPlanForm, setDietPlanForm] = useState(createDietPlanForm());
  const [savedPlans, setSavedPlans] = useState({});
  const [feedback, setFeedback] = useState({ open: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, client: null });
  const [mealSuggestions, setMealSuggestions] = useState(() => loadDietitianMeals());
  const [page, setPage] = useState(1);

  const panelBg = isDark ? '#1a2a47' : '#ffffff';
  const panelBorder = isDark ? '#2b4268' : '#dbe7f6';
  const mutedText = isDark ? '#88a1c7' : '#607aa5';

  const visibleClients = useMemo(
    () =>
      allClientsMock.filter((client) =>
        client.name.toLowerCase().includes(searchText.trim().toLowerCase()),
      ),
    [searchText],
  );

  const totalPages = Math.max(1, Math.ceil(visibleClients.length / CLIENTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * CLIENTS_PER_PAGE;
    return visibleClients.slice(start, start + CLIENTS_PER_PAGE);
  }, [visibleClients, currentPage]);

  const openDietPlanModal = (client) => {
    setMealSuggestions(loadDietitianMeals());
    setDietPlanForm(savedPlans[client.id] || createDietPlanForm());
    setDietPlanModal({ open: true, client });
  };

  const closeDietPlanModal = () => {
    setDietPlanModal({ open: false, client: null });
  };

  const updateMealField = (sectionKey, index, field, value) => {
    setDietPlanForm((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((option, i) =>
        i === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  const applySuggestedMealToOption = (sectionKey, index, selectedMeal) => {
    if (!selectedMeal || typeof selectedMeal === 'string') return;
    setDietPlanForm((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((option, i) =>
        i === index
          ? {
            ...option,
            mealName: selectedMeal.mealName || option.mealName,
            description: selectedMeal.description ?? option.description,
            calories: selectedMeal.calories ?? option.calories,
            protein: selectedMeal.protein ?? option.protein,
            carbs: selectedMeal.carbs ?? option.carbs,
            lipids: selectedMeal.lipids ?? option.lipids,
            vitamins: selectedMeal.vitamins ?? option.vitamins,
          }
          : option,
      ),
    }));
  };

  const getSectionAverageCalories = (sectionKey) => {
    const calories = dietPlanForm[sectionKey]
      .map((option) => Number(option.calories))
      .filter((value) => !Number.isNaN(value) && value > 0);
    if (!calories.length) return 0;
    return Math.round(calories.reduce((sum, value) => sum + value, 0) / calories.length);
  };

  const saveDietPlan = () => {
    const clientId = dietPlanModal.client?.id;
    if (!clientId) return;
    setSavedPlans((prev) => ({ ...prev, [clientId]: dietPlanForm }));
    setDietPlanModal({ open: false, client: null });
    setFeedback({ open: true, message: 'Diet plan saved successfully.' });
  };

  const deleteDietPlan = () => {
    const clientId = confirmDelete.client?.id;
    if (!clientId) return;
    setSavedPlans((prev) => {
      const copy = { ...prev };
      delete copy[clientId];
      return copy;
    });
    setConfirmDelete({ open: false, client: null });
    setFeedback({ open: true, message: 'Diet plan deleted successfully.' });
  };

  return (
    <Box>
      <PageHeader title="My Clients" subtitle="View all assigned members with the same dashboard card format." />

      <TextField
        fullWidth
        placeholder="Search client by name..."
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setPage(1);
        }}
        sx={{
          mb: 2.1,
          '& .MuiOutlinedInput-root': {
            color: '#cfe0fb',
            borderRadius: 1.5,
            background: isDark ? '#1a2a47' : '#f7fbff',
            '& fieldset': { borderColor: panelBorder },
            '&:hover fieldset': { borderColor: panelBorder },
            '&.Mui-focused fieldset': { borderColor: '#4f77b6' },
          },
          '& .MuiInputBase-input::placeholder': { color: mutedText, opacity: 1 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: mutedText, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {paginatedClients.map((client) => (
          <Box
            key={client.id}
            sx={{
              background: panelBg,
              border: '1px solid',
              borderColor: panelBorder,
              borderRadius: 2,
              p: 2.4,
              minHeight: 330,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1.85rem', mb: 0.5 }}>
              {client.name}
            </Typography>
            <Typography sx={{ color: mutedText, fontSize: '1.02rem', mb: 2.2 }}>
              Member since {client.joinedDate}
            </Typography>

            <Typography sx={{ color: '#b7cce8', fontSize: '1.03rem', lineHeight: 1.6 }}>
              Age: {client.age} years
              <br />
              Weight: {client.weight} kg
              <br />
              Height: {client.height} cm
              <br />
              Goal: {client.goal}
            </Typography>

            {savedPlans[client.id] && (
              <Chip
                label="Done"
                size="small"
                sx={{
                  mt: 1.2,
                  alignSelf: 'flex-start',
                  fontWeight: 800,
                  bgcolor: '#22c55e1f',
                  color: '#22c55e',
                }}
              />
            )}

            {savedPlans[client.id] ? (
              <Stack direction="row" spacing={0.9} sx={{ mt: 'auto' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => openDietPlanModal(client)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#5e789f',
                    color: '#d4e2f8',
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => setConfirmDelete({ open: true, client })}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Delete
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={() => openDietPlanModal(client)}
                sx={{
                  mt: 'auto',
                  pt: 1.9,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 1.8,
                  backgroundColor: '#f30612',
                  '&:hover': { backgroundColor: '#cf0812' },
                }}
              >
                Create Diet Plan
              </Button>
            )}
          </Box>
        ))}
      </Box>

      {visibleClients.length > CLIENTS_PER_PAGE && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2.4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            siblingCount={0}
            boundaryCount={1}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#d4e2f8',
                borderColor: panelBorder,
                backgroundColor: isDark ? '#1a2a47' : '#ffffff',
                fontWeight: 700,
              },
              '& .Mui-selected': {
                backgroundColor: '#2563eb !important',
                color: '#ffffff !important',
              },
            }}
          />
        </Stack>
      )}

      <Dialog
        open={dietPlanModal.open}
        onClose={closeDietPlanModal}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: '#1f2f4a',
            border: '1px solid',
            borderColor: '#334d73',
            color: '#e6f0ff',
            maxHeight: '92vh',
          },
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#f8fafc' }}>
            Create Diet Plan
          </Typography>
          <Typography sx={{ color: '#9fb3cf', fontSize: '1.35rem', mt: 0.4 }}>
            Creating plan for: <Box component="span" sx={{ color: '#f8fafc', fontWeight: 700 }}>{dietPlanModal.client?.name}</Box>
          </Typography>
          <Button
            onClick={closeDietPlanModal}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              minWidth: 0,
              p: 0.6,
              borderRadius: 1,
              color: '#94a3b8',
            }}
          >
            <CloseRoundedIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ overflowY: 'auto', pb: 2 }}>
          <Stack spacing={2}>
            {mealSections.map((section) => (
              <Box key={section.key}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '2rem' }}>
                    <Box component="span" sx={{ mr: 1 }}>{section.icon}</Box>
                    {section.title}
                  </Typography>
                  <Typography sx={{ color: '#aac2e0', fontWeight: 700, fontSize: '1.2rem' }}>
                    Total: {getSectionAverageCalories(section.key)} cal (avg per option)
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 1.2,
                  }}
                >
                  {dietPlanForm[section.key].map((option, index) => (
                    <Box
                      key={`${section.key}-${index}`}
                      sx={{
                        p: 1.4,
                        borderRadius: 1.7,
                        border: '1px solid',
                        borderColor: '#415a82',
                        background: '#354a6b',
                      }}
                    >
                      <Typography sx={{ color: '#f8fafc', fontWeight: 800, mb: 1, fontSize: '1.45rem' }}>
                        Option {index + 1}
                      </Typography>

                      <Autocomplete
                        freeSolo
                        options={mealSuggestions}
                        getOptionLabel={(mealOption) =>
                          typeof mealOption === 'string' ? mealOption : mealOption.mealName || ''
                        }
                        value={option.mealName || ''}
                        onInputChange={(_, value) =>
                          updateMealField(section.key, index, 'mealName', value)
                        }
                        onChange={(_, selected) =>
                          applySuggestedMealToOption(section.key, index, selected)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Meal Name"
                            placeholder="e.g., Grilled"
                            fullWidth
                            size="small"
                            sx={{
                              mb: 0.8,
                              '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.15rem', fontWeight: 700 },
                              '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                            }}
                          />
                        )}
                      />

                      <TextField
                        label="Description"
                        placeholder="Brief description"
                        value={option.description}
                        onChange={(e) => updateMealField(section.key, index, 'description', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{
                          mb: 0.8,
                          '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.15rem', fontWeight: 700 },
                          '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                        }}
                      />

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
                        <TextField
                          label="Calories"
                          type="number"
                          value={option.calories}
                          onChange={(e) => updateMealField(section.key, index, 'calories', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                        <TextField
                          label="Protein (g)"
                          type="number"
                          value={option.protein}
                          onChange={(e) => updateMealField(section.key, index, 'protein', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                        <TextField
                          label="Carbs (g)"
                          type="number"
                          value={option.carbs}
                          onChange={(e) => updateMealField(section.key, index, 'carbs', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                        <TextField
                          label="Lipids (g)"
                          type="number"
                          value={option.lipids}
                          onChange={(e) => updateMealField(section.key, index, 'lipids', e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.05rem', fontWeight: 700 },
                            '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                          }}
                        />
                      </Box>

                      <TextField
                        label="Vitamins"
                        placeholder="e.g., A, C, D"
                        value={option.vitamins}
                        onChange={(e) => updateMealField(section.key, index, 'vitamins', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{
                          mt: 0.8,
                          '& .MuiInputLabel-root': { color: '#c6d6ef', fontSize: '1.15rem', fontWeight: 700 },
                          '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#4b6286', borderRadius: 1.2 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            <Box>
              <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.45rem', mb: 0.6 }}>
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Any special instructions or dietary restrictions..."
                value={dietPlanForm.additionalNotes}
                onChange={(e) =>
                  setDietPlanForm((prev) => ({ ...prev, additionalNotes: e.target.value }))
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#edf5ff',
                    background: '#3d5275',
                    borderRadius: 1.3,
                  },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#627ca4' },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={saveDietPlan}
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 1.2,
              py: 1,
              fontSize: '1rem',
              backgroundColor: '#f30612',
              '&:hover': { backgroundColor: '#cf0812' },
            }}
          >
            Create Diet Plan
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, client: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Diet Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete plan for <strong>{confirmDelete.client?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, client: null })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteDietPlan}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={2500}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
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

export default DietitianClients;
