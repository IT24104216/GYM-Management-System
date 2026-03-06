import { Grid, Box } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';

function CoachDashboard() {
  return (
    <Box>
      <PageHeader title="Coach Dashboard" subtitle="Overview of your clients and training sessions." />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={GroupIcon}
            label="Active Clients"
            value="18"
            trend="up"
            trendLabel="+2 this month"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={FitnessCenterIcon}
            label="Workout Plans"
            value="31"
            trend="up"
            trendLabel="+4 this week"
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={EventNoteIcon}
            label="Sessions This Week"
            value="14"
            color="warning.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default CoachDashboard;
