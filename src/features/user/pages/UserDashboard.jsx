import { Grid, Typography, Box } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useAuth } from '@/shared/hooks/useAuth';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';

function UserDashboard() {
  const { user } = useAuth();

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'}`}
        subtitle="Here is your fitness overview for today."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={FitnessCenterIcon}
            label="Workouts Completed"
            value="12"
            trend="up"
            trendLabel="+3 this week"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={DirectionsRunIcon}
            label="Active Streak"
            value="7 days"
            trend="up"
            trendLabel="Personal best!"
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={LocalFireDepartmentIcon}
            label="Calories Burned"
            value="4,320"
            trend="up"
            trendLabel="+240 vs last week"
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" mt={4} mb={2}>
        Recent Workouts
      </Typography>
      <Typography color="text.secondary">
        Your recent workouts will appear here.
      </Typography>
    </Box>
  );
}

export default UserDashboard;
