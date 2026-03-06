import { Box, Typography } from '@mui/material';
import PageHeader from '@/shared/components/ui/PageHeader';

function CoachClients() {
  return (
    <Box>
      <PageHeader title="My Clients" subtitle="View and manage your assigned clients." />
      <Typography color="text.secondary">
        Client list will appear here.
      </Typography>
    </Box>
  );
}

export default CoachClients;
