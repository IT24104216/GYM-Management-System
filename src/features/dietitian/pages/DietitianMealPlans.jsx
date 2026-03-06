import { Box, Typography } from '@mui/material';
import PageHeader from '@/shared/components/ui/PageHeader';

function DietitianMealPlans() {
  return (
    <Box>
      <PageHeader title="Meal Plans" subtitle="Create and manage meal plans for your clients." />
      <Typography color="text.secondary">
        Meal plan management will appear here.
      </Typography>
    </Box>
  );
}

export default DietitianMealPlans;
