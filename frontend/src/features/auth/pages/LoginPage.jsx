import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROLE_HOME, ROUTES } from '@/shared/utils/constants';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const FEATURE_CARDS = [
  {
    title: 'Easy Booking',
    subtitle: 'Reserve your spot instantly',
    icon: CalendarMonthRoundedIcon,
  },
  {
    title: 'Track Progress',
    subtitle: 'Visualize your gains',
    icon: ShowChartRoundedIcon,
  },
];

const COMMUNITY_AVATARS = [
  { label: 'A', tone: '#2b8eff' },
  { label: 'K', tone: '#f97316' },
  { label: 'R', tone: '#0ea5e9' },
];

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect to role home
  if (isAuthenticated && user) {
    const from = location.state?.from || ROLE_HOME[user.role];
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(form);
      const from = location.state?.from || (loggedInUser?.role === 'user' ? ROUTES.USER_DASHBOARD : ROLE_HOME[loggedInUser.role]);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #06122a 0%, #081a39 72%, #091b3f 100%)'
          : 'linear-gradient(180deg, #eef5ff 0%, #f9fbff 72%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1120,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 3 },
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            alignItems: 'center',
            gap: { xs: 3, md: 5 },
            width: '100%',
          }}
        >
          <MotionBox
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            sx={{ pr: { md: 2 } }}
          >
            <Typography
              sx={{
                color: '#1c7edd',
                fontWeight: 700,
                letterSpacing: 1.2,
                fontSize: '0.72rem',
                mb: 2,
              }}
            >
              MEMBER PORTAL
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.35rem' },
                lineHeight: 1.05,
                fontWeight: 800,
                color: '#0e1a2e',
                maxWidth: 520,
                mb: 2,
              }}
            >
              Welcome back to your{' '}
              <Box component="span" sx={{ color: '#1f8ef3' }}>
                fitness journey
              </Box>
              .
            </Typography>
            <Typography
              sx={{
                color: '#6b768a',
                fontSize: { xs: '1rem', md: '1.1rem' },
                maxWidth: 510,
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              Track your progress and stay connected with your Coaches. Your
              goals are just a login away.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                maxWidth: 530,
              }}
            >
              {FEATURE_CARDS.map((card, index) => {
                const Icon = card.icon;
                return (
                  <MotionPaper
                    key={card.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, delay: 0.14 + index * 0.09 }}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1px solid #e8edf5',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.3,
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0.2,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: '#e8f3ff',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#1c7edd',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 17 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#1c2738', fontSize: '1rem' }}>
                        {card.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c7688' }}>
                        {card.subtitle}
                      </Typography>
                    </Box>
                  </MotionPaper>
                );
              })}
            </Box>

            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.34 }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.3, mt: 3.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {COMMUNITY_AVATARS.map((avatar, idx) => (
                  <Box
                    key={avatar.label}
                    sx={{
                      ml: idx === 0 ? 0 : -1.1,
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: avatar.tone,
                      border: '2px solid #ffffff',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 6px 14px rgba(20, 43, 76, 0.18)',
                    }}
                  >
                    {avatar.label}
                  </Box>
                ))}
              </Box>
              <Typography sx={{ color: '#5f6e83', fontSize: '0.96rem' }}>
                +2k Join our active community
              </Typography>
            </MotionBox>
          </MotionBox>

          <MotionPaper
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.56, ease: 'easeOut', delay: 0.08 }}
            sx={{
              maxWidth: 450,
              width: '100%',
              justifySelf: 'center',
              borderRadius: 4,
              border: `1px solid ${isDark ? '#27446f' : '#dbe7f5'}`,
              bgcolor: isDark ? '#0f1f3f' : '#ffffff',
              boxShadow: isDark
                ? '0 30px 70px rgba(3, 9, 20, 0.58)'
                : '0 30px 70px rgba(52, 85, 140, 0.16)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: 4,
                background: 'linear-gradient(90deg, #8fc8ff 0%, #2789f8 55%, #8fc8ff 100%)',
              }}
            />
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography
                component="h2"
                sx={{
                  textAlign: 'center',
                  color: isDark ? '#eef4ff' : '#0e1a2e',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', sm: '2.4rem' },
                  lineHeight: 1,
                }}
              >
                Login
              </Typography>
              <Typography
                sx={{
                  mt: 1.25,
                  mb: 3,
                  textAlign: 'center',
                  color: isDark ? '#9eb3cf' : '#8793a7',
                  fontSize: '0.94rem',
                }}
              >
                Enter your details to access your account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                  {successMessage}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography sx={{ mb: 1, color: isDark ? '#c8d6eb' : '#384559', fontWeight: 700, fontSize: '0.95rem' }}>
                  Username or Email
                </Typography>
                <TextField
                  placeholder="Enter username or email"
                  name="identifier"
                  type="text"
                  value={form.identifier}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  autoFocus
                  sx={{ mb: 2.2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineRoundedIcon sx={{ color: '#a5afbf', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ color: isDark ? '#c8d6eb' : '#384559', fontWeight: 700, fontSize: '0.95rem' }}>
                    Password
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    underline="none"
                    sx={{ color: '#2b8eff', fontWeight: 700, fontSize: '0.84rem' }}
                  >
                    Forgot password?
                  </Link>
                </Box>
                <TextField
                  placeholder="........"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  sx={{ mb: 1.2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#a5afbf', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ color: '#9ba8bc' }} />
                          ) : (
                            <Visibility sx={{ color: '#9ba8bc' }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: '#bfccdc',
                        '&.Mui-checked': { color: '#2b8eff' },
                      }}
                    />
                  )}
                  label={
                    <Typography sx={{ color: '#728095', fontSize: '0.95rem' }}>
                      Keep me logged in
                    </Typography>
                  }
                  sx={{ mt: 0.1, mb: 2.1 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 3,
                    background: 'linear-gradient(180deg, #2b91ff 0%, #0f79ed 100%)',
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    '&:hover': {
                      background: 'linear-gradient(180deg, #2386ef 0%, #0a6cd4 100%)',
                    },
                    '&.Mui-disabled': {
                      background: '#b6d5fb',
                      color: '#ffffff',
                    },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Typography
                  sx={{
                    mt: { xs: 5, sm: 7 },
                    textAlign: 'center',
                    color: '#7f8ba0',
                    fontSize: '0.95rem',
                  }}
                >
                  Don&apos;t have an account yet?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate(ROUTES.REGISTER)}
                    underline="none"
                    sx={{ color: '#2b8eff', fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    Create new account
                  </Link>
                </Typography>

                <Box
                  sx={{
                    mt: 3.5,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2.2,
                    color: '#98a2b3',
                    fontSize: '0.8rem',
                  }}
                >
                  <Typography sx={{ fontSize: 'inherit' }}>Privacy Policy</Typography>
                  <Typography sx={{ fontSize: 'inherit' }}>.</Typography>
                  <Typography sx={{ fontSize: 'inherit' }}>Terms of Service</Typography>
                  <Typography sx={{ fontSize: 'inherit' }}>.</Typography>
                  <Typography sx={{ fontSize: 'inherit' }}>Help Center</Typography>
                </Box>
              </Box>
            </Box>
          </MotionPaper>
        </Box>
      </Box>

      <Box
        sx={{
          borderTop: '1px solid #e9eef6',
          backgroundColor: '#ffffff',
          py: 1.6,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1120,
            mx: 'auto',
            display: 'grid',
            alignItems: 'center',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#7c8799' }}>
            <FitnessCenterIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Muscle Lab</Typography>
          </Box>
          <Typography
            sx={{
              justifySelf: 'center',
              color: '#97a2b4',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          >
            {new Date().getFullYear()} FitPulse Gym. All rights reserved.
          </Typography>
          <Box
            sx={{
              justifySelf: { xs: 'center', md: 'end' },
              display: 'flex',
              gap: 1.1,
              color: '#9aa5b6',
            }}
          >
            <InstagramIcon sx={{ fontSize: 20 }} />
            <XIcon sx={{ fontSize: 18 }} />
            <FacebookRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;

