import { motion } from 'framer-motion';
import { Box, Card, CardContent, Typography } from '@mui/material';

function AdminReports() {
  return (
    <Box>
      <Typography sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 900, mb: 1 }}>
        Admin Reports
      </Typography>
      <Typography sx={{ color: '#64748b', mb: 2.2 }}>
        Reports module layout will be expanded in upcoming updates.
      </Typography>

      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ borderRadius: 2.2, border: '1px solid #e5edf6' }}
      >
        <CardContent>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
            Coming Soon
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 0.7 }}>
            KPI trend reports and export features will be available here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminReports;
