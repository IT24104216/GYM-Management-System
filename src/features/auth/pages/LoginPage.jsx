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
  Divider,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROLE_HOME, ROUTES } from '@/shared/utils/constants';

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
      const from = location.state?.from || ROLE_HOME[loggedInUser.role];
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <FitnessCenterIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
          <Typography variant="h5" fontWeight={700} color="primary" mt={0.5}>
            GymPro
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            autoComplete="email"
            autoFocus
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Don&apos;t have an account?
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(ROUTES.REGISTER)}
          >
            Create new account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;
