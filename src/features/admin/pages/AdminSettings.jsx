import { Box, Typography } from '@mui/material';
import PageHeader from '@/shared/components/ui/PageHeader';

function AdminSettings() {
  return (
    <Box>
      <PageHeader title="Platform Settings" subtitle="Configure platform-wide settings." />
      <Typography color="text.secondary">
        Settings panels will appear here.
      </Typography>
    </Box>
  );
}

export default AdminSettings;
