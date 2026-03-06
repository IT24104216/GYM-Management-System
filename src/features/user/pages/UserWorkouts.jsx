import { Box, Typography } from '@mui/material';
import PageHeader from '@/shared/components/ui/PageHeader';

function UserWorkouts() {
  return (
    <Box>
      <PageHeader title="My Workouts" subtitle="View and track your assigned workout plans." />
      <Typography color="text.secondary">
        Your workout plans will appear here once your coach assigns them.
      </Typography>
    </Box>
  );
}

export default UserWorkouts;
