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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useTheme } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

const DIETITIAN_FEEDBACK_STORAGE_KEY = 'gympro_dietitian_feedbacks';

const MOCK_DIETITIAN_FEEDBACKS = {
  'Olivia Martin': [
    {
      id: 'df1',
      user: 'Nimal Perera',
      authorEmail: 'nimal@gmail.com',
      rating: 5,
      comment: 'Practical meal plan and excellent follow-up support.',
      date: '2026-03-04',
    },
    {
      id: 'df2',
      user: 'Kavindi Silva',
      authorEmail: 'kavindi@gmail.com',
      rating: 4,
      comment: 'Good nutrition guidance and easy recipes to follow.',
      date: '2026-02-22',
    },
  ],
  'Daniel Perera': [
    {
      id: 'df3',
      user: 'Ayesha Fernando',
      authorEmail: 'ayesha@gmail.com',
      rating: 5,
      comment: 'Great advice for performance nutrition and recovery.',
      date: '2026-03-01',
    },
    {
      id: 'df4',
      user: 'Ruwan Jayasuriya',
      authorEmail: 'ruwan@gmail.com',
      rating: 4,
      comment: 'Clear supplement and macro strategy for training days.',
      date: '2026-02-16',
    },
  ],
  'Ayesha Fernando': [
    {
      id: 'df5',
      user: 'Shani Wickramasinghe',
      authorEmail: 'shani@gmail.com',
      rating: 5,
      comment: 'Perfect plan for diabetes-friendly meals and habits.',
      date: '2026-02-11',
    },
  ],
  'Michael Silva': [
    {
      id: 'df6',
      user: 'Dilan Mendis',
      authorEmail: 'dilan@gmail.com',
      rating: 4,
      comment: 'Very knowledgeable on gut health and food intolerance.',
      date: '2026-01-30',
    },
  ],
};

function UserDietitianFeedbacks() {
  const { user } = useAuth();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const dietitianName = searchParams.get('dietitian') || 'Dietitian';
  const [feedbacksByDietitian, setFeedbacksByDietitian] = useState(() => {
    const rawFeedbacks = localStorage.getItem(DIETITIAN_FEEDBACK_STORAGE_KEY);
    let storedFeedbacks = {};
    try {
      storedFeedbacks = rawFeedbacks ? JSON.parse(rawFeedbacks) : {};
    } catch {
      storedFeedbacks = {};
    }

    const merged = { ...MOCK_DIETITIAN_FEEDBACKS };
    Object.keys(storedFeedbacks).forEach((dietitianKey) => {
      const persisted = Array.isArray(storedFeedbacks[dietitianKey]) ? storedFeedbacks[dietitianKey] : [];
      const base = Array.isArray(merged[dietitianKey]) ? merged[dietitianKey] : [];
      merged[dietitianKey] = [...persisted, ...base];
    });
    return merged;
  });
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editingForm, setEditingForm] = useState({ rating: 0, comment: '' });
  const [editingError, setEditingError] = useState('');

  const feedbacks = useMemo(
    () => feedbacksByDietitian[dietitianName] || [],
    [dietitianName, feedbacksByDietitian],
  );

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, item) => sum + item.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const handleDeleteFeedback = (feedbackId) => {
    setFeedbacksByDietitian((prev) => ({
      ...prev,
      [dietitianName]: (prev[dietitianName] || []).filter((item) => item.id !== feedbackId),
    }));
  };

  const handleOpenEdit = (feedback) => {
    setEditingFeedback(feedback);
    setEditingForm({ rating: feedback.rating, comment: feedback.comment });
    setEditingError('');
  };

  const handleCloseEdit = () => {
    setEditingFeedback(null);
    setEditingError('');
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editingForm.rating) {
      setEditingError('Please select a rating.');
      return;
    }

    setFeedbacksByDietitian((prev) => ({
      ...prev,
      [dietitianName]: (prev[dietitianName] || []).map((item) => (
        item.id === editingFeedback?.id
          ? { ...item, rating: editingForm.rating, comment: editingForm.comment }
          : item
      )),
    }));

    handleCloseEdit();
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
      <Box sx={{ maxWidth: 980, mx: 'auto' }}>
        <Stack spacing={1} mb={3.5}>
          <Typography
            sx={{
              fontSize: { xs: '1.7rem', md: '2.2rem' },
              fontWeight: 800,
              color: theme.palette.text.primary,
            }}
          >
            {dietitianName} Feedbacks
          </Typography>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Chip label={`Average Rating ${averageRating || '0.0'}`} />
            <Chip label={`Total Feedbacks ${feedbacks.length}`} />
          </Stack>
        </Stack>

        <Stack spacing={1.4}>
          {feedbacks.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      {item.user}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                      {item.date}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={0.3} alignItems="center">
                    <StarRoundedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 700 }}>{item.rating}.0</Typography>
                  </Stack>

                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    {item.comment}
                  </Typography>

                  {item.authorEmail === user?.email && (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenEdit(item)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteFeedback(item.id)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}

          {!feedbacks.length && (
            <Card sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  No feedbacks found for this dietitian.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Box>

      <Dialog
        open={Boolean(editingFeedback)}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          component: 'form',
          onSubmit: handleEditSubmit,
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Feedback</DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0.5 }}>
          <Stack spacing={1.8} sx={{ mt: 0.5 }}>
            <Box>
              <Typography sx={{ mb: 0.6, fontSize: '0.88rem', color: theme.palette.text.secondary }}>
                Rating
              </Typography>
              <Rating
                value={editingForm.rating}
                onChange={(_, value) => {
                  setEditingForm((prev) => ({ ...prev, rating: value || 0 }));
                  setEditingError('');
                }}
                precision={1}
              />
            </Box>

            <TextField
              label="Comment"
              value={editingForm.comment}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, comment: event.target.value }))}
              multiline
              minRows={3}
            />

            {editingError && (
              <Typography sx={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                {editingError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button onClick={handleCloseEdit} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>
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

export default UserDietitianFeedbacks;
