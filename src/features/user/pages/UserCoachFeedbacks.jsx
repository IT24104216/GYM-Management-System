import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const MOCK_FEEDBACKS = {
  'Emma Carter': [
    {
      id: 'f1',
      user: 'Nimal Perera',
      rating: 5,
      comment: 'Very supportive coaching and clear workout guidance.',
      date: '2026-03-02',
    },
    {
      id: 'f2',
      user: 'Kavindi Silva',
      rating: 4,
      comment: 'Great coach. Sessions are well structured and practical.',
      date: '2026-02-18',
    },
  ],
  'Noah Bennett': [
    {
      id: 'f3',
      user: 'Ayesha Fernando',
      rating: 5,
      comment: 'Excellent functional training plan and good motivation.',
      date: '2026-03-01',
    },
    {
      id: 'f4',
      user: 'Ruwan Jayasuriya',
      rating: 4,
      comment: 'Helpful trainer with clear instructions and follow-up.',
      date: '2026-02-14',
    },
  ],
  'Sophia Reed': [
    {
      id: 'f5',
      user: 'Shani Wickramasinghe',
      rating: 5,
      comment: 'Perfect for beginners. I gained confidence quickly.',
      date: '2026-02-10',
    },
  ],
  'Liam Hayes': [
    {
      id: 'f6',
      user: 'Dilan Mendis',
      rating: 4,
      comment: 'Very knowledgeable for muscle gain strategy and form.',
      date: '2026-01-28',
    },
  ],
};

function UserCoachFeedbacks() {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const coachName = searchParams.get('coach') || 'Coach';

  const feedbacks = useMemo(
    () => MOCK_FEEDBACKS[coachName] || [],
    [coachName],
  );

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, item) => sum + item.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

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
    </Box>
  );
}

export default UserCoachFeedbacks;
