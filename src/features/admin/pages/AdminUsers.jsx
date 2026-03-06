import { Box, Typography } from '@mui/material';
import PageHeader from '@/shared/components/ui/PageHeader';

function AdminUsers() {
  return (
    <Box>
      <PageHeader title="User Management" subtitle="View, edit, and manage all platform users." />
      <Typography color="text.secondary">
        User list and management tools will appear here.
      </Typography>
    </Box>
  );
}

export default AdminUsers;
