import { Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useTheme } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

const MOCK_FEEDBACKS = {
  'Emma Carter': [
    {
      id: 'f1',
      user: 'Nimal Perera',
      authorEmail: 'nimal@gmail.com',
      rating: 5,
      comment: 'Very supportive coaching and clear workout guidance.',
      date: '2026-03-02',
    },
    {
      id: 'f2',
      user: 'Kavindi Silva',
      authorEmail: 'kavindi@gmail.com',
      rating: 4,
      comment: 'Great coach. Sessions are well structured and practical.',
      date: '2026-02-18',
    },
  ],
  'Noah Bennett': [
    {
      id: 'f3',
      user: 'Ayesha Fernando',
      authorEmail: 'ayesha@gmail.com',
      rating: 5,
      comment: 'Excellent functional training plan and good motivation.',
      date: '2026-03-01',
    },
    {
      id: 'f4',
      user: 'Ruwan Jayasuriya',
      authorEmail: 'ruwan@gmail.com',
      rating: 4,
      comment: 'Helpful trainer with clear instructions and follow-up.',
      date: '2026-02-14',
    },
  ],
  'Sophia Reed': [
    {
      id: 'f5',
      user: 'Shani Wickramasinghe',
      authorEmail: 'shani@gmail.com',
      rating: 5,
      comment: 'Perfect for beginners. I gained confidence quickly.',
      date: '2026-02-10',
    },
  ],
  'Liam Hayes': [
    {
      id: 'f6',
      user: 'Dilan Mendis',
      authorEmail: 'dilan@gmail.com',
      rating: 4,
      comment: 'Very knowledgeable for muscle gain strategy and form.',
      date: '2026-01-28',
    },
  ],
};

function UserCoachFeedbacks() {
  const { user } = useAuth();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const coachName = searchParams.get('coach') || 'Coach';
  const [feedbacksByCoach, setFeedbacksByCoach] = useState(MOCK_FEEDBACKS);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editingForm, setEditingForm] = useState({ rating: 0, comment: '' });
  const [editingError, setEditingError] = useState('');

  const feedbacks = useMemo(
    () => feedbacksByCoach[coachName] || [],
    [coachName, feedbacksByCoach],
  );

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, item) => sum + item.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const handleDeleteFeedback = (feedbackId) => {
    setFeedbacksByCoach((prev) => ({
      ...prev,
      [coachName]: (prev[coachName] || []).filter((item) => item.id !== feedbackId),
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

    setFeedbacksByCoach((prev) => ({
      ...prev,
      [coachName]: (prev[coachName] || []).map((item) => (
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
            {coachName} Feedbacks
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
                  No feedbacks found for this coach.
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

export default UserCoachFeedbacks;
