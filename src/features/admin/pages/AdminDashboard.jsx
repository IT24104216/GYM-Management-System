import { Grid, Box } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PageHeader from '@/shared/components/ui/PageHeader';
import StatCard from '@/shared/components/ui/StatCard';

function AdminDashboard() {
  return (
    <Box>
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide statistics and overview." />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={GroupIcon}
            label="Total Users"
            value="1,284"
            trend="up"
            trendLabel="+48 this month"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={TrendingUpIcon}
            label="Active Subscriptions"
            value="972"
            trend="up"
            trendLabel="+12% vs last month"
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={AttachMoneyIcon}
            label="Monthly Revenue"
            value="$18,540"
            trend="up"
            trendLabel="+8% vs last month"
            color="success.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;
