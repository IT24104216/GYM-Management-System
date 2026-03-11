import { motion } from 'framer-motion';
import {
  alpha,
  Box,
  Button,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const MotionBox = motion.create(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

function AdminSettings() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardBg = isDark ? alpha(theme.palette.background.paper, 0.9) : '#ffffff';
  const cardBorder = isDark ? alpha(theme.palette.common.white, 0.14) : '#e6e9ee';
  const labelColor = isDark ? alpha(theme.palette.common.white, 0.72) : '#64748b';
  const inputBg = isDark ? alpha(theme.palette.common.white, 0.06) : '#f8fafc';
  const inputBorder = isDark ? alpha(theme.palette.common.white, 0.18) : '#e2e8f0';
  const inputBorderHover = isDark ? alpha(theme.palette.common.white, 0.34) : '#cbd5e1';
  const sectionTitleColor = isDark ? theme.palette.common.white : '#111827';
  const headingColor = isDark ? theme.palette.common.white : '#0f172a';

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        maxWidth: 920,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        pb: 2,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: headingColor,
        }}
      >
        Settings
      </Typography>

      <MotionBox variants={itemVariants}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
            border: `1px solid ${cardBorder}`,
            backgroundColor: cardBg,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
            <PersonOutlineRoundedIcon sx={{ color: '#17a398', fontSize: 20 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: sectionTitleColor }}>
              Profile Information
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: labelColor, mb: 0.75 }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                value="Admin User"
                slotProps={{
                  input: { readOnly: true },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: inputBg,
                    fontSize: '0.875rem',
                    color: isDark ? alpha(theme.palette.common.white, 0.82) : 'inherit',
                    '& fieldset': {
                      borderColor: inputBorder,
                    },
                    '&:hover fieldset': {
                      borderColor: inputBorderHover,
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: labelColor, mb: 0.75 }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                value="admin@gympro.com"
                slotProps={{
                  input: { readOnly: true },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: inputBg,
                    fontSize: '0.875rem',
                    color: isDark ? alpha(theme.palette.common.white, 0.82) : 'inherit',
                    '& fieldset': {
                      borderColor: inputBorder,
                    },
                    '&:hover fieldset': {
                      borderColor: inputBorderHover,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Paper>
      </MotionBox>

      <MotionBox variants={itemVariants}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
            border: `1px solid ${cardBorder}`,
            backgroundColor: cardBg,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
            <NotificationsNoneRoundedIcon sx={{ color: '#17a398', fontSize: 20 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: sectionTitleColor }}>
              Notifications
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontWeight: 600, color: sectionTitleColor, fontSize: '0.875rem' }}>
                  Email Notifications
                </Typography>
                <Typography sx={{ color: labelColor, fontSize: '0.75rem' }}>
                  Receive daily summaries and alerts
                </Typography>
              </Box>
              <Switch
                defaultChecked
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#ffffff',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#17a398',
                    opacity: 1,
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: isDark ? alpha(theme.palette.common.white, 0.25) : '#cbd5e1',
                    opacity: 1,
                  },
                }}
              />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontWeight: 600, color: sectionTitleColor, fontSize: '0.875rem' }}>
                  Push Notifications
                </Typography>
                <Typography sx={{ color: labelColor, fontSize: '0.75rem' }}>
                  Receive real-time updates on your device
                </Typography>
              </Box>
              <Switch
                defaultChecked
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#ffffff',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#17a398',
                    opacity: 1,
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: isDark ? alpha(theme.palette.common.white, 0.25) : '#cbd5e1',
                    opacity: 1,
                  },
                }}
              />
            </Stack>
          </Stack>
        </Paper>
      </MotionBox>

      <MotionBox variants={itemVariants}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
            border: `1px solid ${cardBorder}`,
            backgroundColor: cardBg,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
            <ShieldOutlinedIcon sx={{ color: '#17a398', fontSize: 20 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: sectionTitleColor }}>
              Security
            </Typography>
          </Stack>

          <Button
            variant="text"
            startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              p: 0,
              minWidth: 0,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#17a398',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            Change Password
          </Button>
        </Paper>
      </MotionBox>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
        <Button
          variant="contained"
          sx={{
            px: 3.5,
            py: 1.2,
            borderRadius: 2.5,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 800,
            backgroundColor: isDark ? '#e5e7eb' : '#0f172a',
            color: isDark ? '#111827' : '#ffffff',
            boxShadow: isDark
              ? '0 10px 22px rgba(0, 0, 0, 0.32)'
              : '0 10px 22px rgba(15, 23, 42, 0.18)',
            '&:hover': {
              backgroundColor: isDark ? '#f3f4f6' : '#111827',
            },
          }}
        >
          Save Changes
        </Button>
      </Box>
    </MotionBox>
  );
}

export default AdminSettings;
