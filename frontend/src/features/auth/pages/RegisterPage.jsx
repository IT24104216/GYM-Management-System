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
  useTheme,
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.USER,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: isDark ? '#172846' : '#f2f6fd',
      color: isDark ? '#e2e8f0' : '#1f2a3a',
      '& fieldset': {
        borderColor: isDark ? '#375278' : '#d5dfed',
      },
      '&:hover fieldset': {
        borderColor: isDark ? '#4f709f' : '#b8c9e0',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2b8eff',
        borderWidth: '1px',
      },
    },
    '& .MuiSelect-icon': {
      color: isDark ? '#d1deef' : '#66758c',
    },
    '& .MuiInputLabel-root': {
      color: isDark ? '#9fb3d0' : '#66758c',
      fontWeight: 500,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#5ba8ff',
    },
  };

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
        background: 'linear-gradient(180deg, #edf4ff 0%, #f8fbff 72%, #ffffff 100%)',
        ...(isDark && { background: 'linear-gradient(180deg, #06122a 0%, #081a39 72%, #091b3f 100%)' }),
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 460,
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
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 3.2 }}>
          <FitnessCenterIcon sx={{ fontSize: 36, color: '#2b8eff' }} />
          <Typography sx={{ color: isDark ? '#eef4ff' : '#0e1a2e', fontSize: '2rem', fontWeight: 800, mt: 0.5 }}>
            Create your account
          </Typography>
          <Typography sx={{ color: isDark ? '#9eb3cf' : '#8793a7', fontSize: '0.98rem', mt: 0.5 }}>
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
            sx={inputSx}
            autoFocus
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            sx={inputSx}
          />
          <TextField
            label="Role"
            name="role"
            select
            value={form.role}
            onChange={handleChange}
            required
            sx={inputSx}
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
            sx={inputSx}
          />
          <TextField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            sx={{ ...inputSx, mb: 2.5 }}
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
              fontSize: '1rem',
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
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3.4 }}>
            <Typography sx={{ color: '#7f8ba0', fontSize: '0.95rem' }}>
              Already have an account?
              {' '}
              <Box
                component="button"
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                sx={{
                  border: 0,
                  p: 0,
                  m: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#2b8eff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                Sign in
              </Box>
            </Typography>
          </Box>
        </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default RegisterPage;
