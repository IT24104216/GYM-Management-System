import { Box, Typography } from '@mui/material';
import PageHeader from '@/shared/components/ui/PageHeader';

function CoachWorkoutPlans() {
  return (
    <Box>
      <PageHeader title="Workout Plans" subtitle="Create and manage workout plans for your clients." />
      <Typography color="text.secondary">
        Workout plan management will appear here.
      </Typography>
    </Box>
  );
}

export default CoachWorkoutPlans;
