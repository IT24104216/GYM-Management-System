import { Grid, Box } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';

function DietitianDashboard() {
  return (
    <Box>
      <PageHeader title="Dietitian Dashboard" subtitle="Overview of your clients and meal plans." />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={GroupIcon}
            label="Active Clients"
            value="24"
            trend="up"
            trendLabel="+3 this month"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={RestaurantMenuIcon}
            label="Meal Plans Created"
            value="38"
            trend="up"
            trendLabel="+5 this week"
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={EventNoteIcon}
            label="Upcoming Check-ins"
            value="6"
            color="warning.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default DietitianDashboard;
