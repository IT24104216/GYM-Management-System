import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  MenuItem,
  Divider,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROLE_HOME, ROLES, ROUTES } from '@/shared/utils/constants';

const ROLE_OPTIONS = [
  { value: ROLES.USER,      label: 'Member / User' },
  { value: ROLES.COACH,     label: 'Coach' },
  { value: ROLES.DIETITIAN, label: 'Dietitian' },
];

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.USER,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = form;
      const newUser = await register(payload);
      navigate(ROLE_HOME[newUser.role], { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
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
      <Paper sx={{ p: 4, width: '100%', maxWidth: 440 }}>
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <FitnessCenterIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
          <Typography variant="h5" fontWeight={700} color="primary" mt={0.5}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Join GymPro today
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Role"
            name="role"
            select
            value={form.role}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          >
            {ROLE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Already have an account?
          </Typography>
          <Button variant="text" onClick={() => navigate(ROUTES.LOGIN)}>
            Sign in
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default RegisterPage;
