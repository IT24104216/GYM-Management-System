import { useState } from 'react';
import {
  Alert,
  Button,
  AppBar,
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { ROUTES, ROLES } from '@/shared/utils/constants';

const DRAWER_WIDTH = 240;
const DIETITIAN_PROFILE_STORAGE_KEY = 'dietitian.profile.v1';

const defaultDietitianProfile = {
  qualifications: '',
  specialization: '',
  experienceYears: '0',
  licenseNumber: '',
  phone: '',
  joinDate: '',
};

const hasProfileData = (profile) =>
  Boolean(
    profile?.qualifications
      || profile?.specialization
      || profile?.experienceYears
      || profile?.licenseNumber
      || profile?.phone
      || profile?.joinDate,
  );

function Topbar({ onMenuClick, showSidebarButton = false, onShowSidebar, sidebarHidden = false }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [deleteFeedbackOpen, setDeleteFeedbackOpen] = useState(false);
  const [dietitianProfile, setDietitianProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(DIETITIAN_PROFILE_STORAGE_KEY);
      return saved ? { ...defaultDietitianProfile, ...JSON.parse(saved) } : defaultDietitianProfile;
    } catch {
      return defaultDietitianProfile;
    }
  });
  const [editDietitianProfile, setEditDietitianProfile] = useState(defaultDietitianProfile);
  const isUserRoute = location.pathname.startsWith('/user/');
  const isDietitian = user?.role === ROLES.DIETITIAN;

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const openDietitianProfile = () => {
    handleMenuClose();
    setProfileDetailsOpen(true);
  };

  const openProfileSettingsForm = () => {
    setEditDietitianProfile(dietitianProfile);
    setProfileDetailsOpen(false);
    setProfileFormOpen(true);
  };

  const closeDietitianProfileDetails = () => {
    setProfileDetailsOpen(false);
  };

  const closeProfileSettingsForm = () => {
    setProfileFormOpen(false);
  };

  const saveDietitianProfile = () => {
    setDietitianProfile(editDietitianProfile);
    localStorage.setItem(DIETITIAN_PROFILE_STORAGE_KEY, JSON.stringify(editDietitianProfile));
    setProfileFormOpen(false);
    setProfileDetailsOpen(true);
    setFeedbackOpen(true);
  };

  const deleteDietitianProfile = () => {
    setDietitianProfile(defaultDietitianProfile);
    setEditDietitianProfile(defaultDietitianProfile);
    localStorage.removeItem(DIETITIAN_PROFILE_STORAGE_KEY);
    setDeleteFeedbackOpen(true);
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        width: { sm: isUserRoute || sidebarHidden ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: isUserRoute || sidebarHidden ? 0 : `${DRAWER_WIDTH}px` },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: isUserRoute ? 'none' : { sm: 'none' } }}
          aria-label="open sidebar"
        >
          <MenuIcon />
        </IconButton>

        {!isUserRoute && showSidebarButton && (
          <IconButton
            edge="start"
            onClick={onShowSidebar}
            sx={{ mr: 1.5, display: { xs: 'none', sm: 'inline-flex' } }}
            aria-label="reopen sidebar"
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          noWrap
          component="button"
          onClick={() => navigate(ROUTES.USER_DASHBOARD)}
          sx={{
            flexGrow: 1,
            border: 0,
            p: 0,
            m: 0,
            background: 'transparent',
            textAlign: 'left',
            fontWeight: 700,
            color: 'text.primary',
            cursor: 'pointer',
          }}
        >
          GymPro
        </Typography>

        <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
          </MenuItem>
          {isDietitian && (
            <MenuItem onClick={openDietitianProfile}>Dietician Profile</MenuItem>
          )}
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>

        <Dialog
          open={profileDetailsOpen}
          onClose={closeDietitianProfileDetails}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: '#1f2f4a',
              border: '1px solid',
              borderColor: '#334d73',
              color: '#e6f0ff',
            },
          }}
        >
          <DialogTitle sx={{ pr: 6 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.8rem' }, color: '#f8fafc' }}>
              Dietician Profile
            </Typography>
            <Typography sx={{ color: '#9fb3cf', fontSize: '1rem', mt: 0.4 }}>
              Profile details
            </Typography>
            <IconButton
              onClick={closeDietitianProfileDetails}
              sx={{
                position: 'absolute',
                right: 10,
                top: 10,
                color: '#94a3b8',
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={1}>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>Name:</strong> {user?.name || '-'}
              </Typography>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>Email:</strong> {user?.email || '-'}
              </Typography>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>Qualifications:</strong> {dietitianProfile.qualifications || '-'}
              </Typography>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>Specialization:</strong> {dietitianProfile.specialization || '-'}
              </Typography>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>Experience:</strong> {dietitianProfile.experienceYears || '0'} years
              </Typography>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>License Number:</strong> {dietitianProfile.licenseNumber || '-'}
              </Typography>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>Phone:</strong> {dietitianProfile.phone || '-'}
              </Typography>
              <Typography sx={{ color: '#d7e6fb', fontSize: '0.95rem' }}>
                <strong>Join Date:</strong> {dietitianProfile.joinDate || '-'}
              </Typography>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.2 }}>
            {!hasProfileData(dietitianProfile) ? (
              <Button
                variant="contained"
                onClick={openProfileSettingsForm}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 1.2,
                  py: 1,
                  fontSize: '1rem',
                  backgroundColor: '#f30612',
                  '&:hover': { backgroundColor: '#cf0812' },
                }}
              >
                Add
              </Button>
            ) : (
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                <Button
                  variant="outlined"
                  onClick={openProfileSettingsForm}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 1.2,
                    py: 1,
                    fontSize: '1rem',
                    color: '#dbeafe',
                    borderColor: '#4f668f',
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={deleteDietitianProfile}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 1.2,
                    py: 1,
                    fontSize: '1rem',
                  }}
                >
                  Delete
                </Button>
              </Stack>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={profileFormOpen}
          onClose={closeProfileSettingsForm}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: '#1f2f4a',
              border: '1px solid',
              borderColor: '#334d73',
              color: '#e6f0ff',
            },
          }}
        >
          <DialogTitle sx={{ pr: 6 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, color: '#f8fafc' }}>
              Dietician Profile
            </Typography>
            <Typography sx={{ color: '#9fb3cf', fontSize: { xs: '1rem', md: '1.15rem' }, mt: 0.4 }}>
              Update your professional information
            </Typography>
            <IconButton
              onClick={closeProfileSettingsForm}
              sx={{
                position: 'absolute',
                right: 10,
                top: 10,
                color: '#94a3b8',
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 1.2,
              }}
            >
              <TextField
                label="Qualifications"
                placeholder="e.g., MSc in Nutrition"
                value={editDietitianProfile.qualifications}
                onChange={(e) =>
                  setEditDietitianProfile((prev) => ({ ...prev, qualifications: e.target.value }))
                }
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#c6d6ef', fontWeight: 700 },
                  '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#3b4f70', borderRadius: 1.2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                }}
              />
              <TextField
                label="Specialization"
                placeholder="e.g., Sports Nutrition"
                value={editDietitianProfile.specialization}
                onChange={(e) =>
                  setEditDietitianProfile((prev) => ({ ...prev, specialization: e.target.value }))
                }
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#c6d6ef', fontWeight: 700 },
                  '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#3b4f70', borderRadius: 1.2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                }}
              />
              <TextField
                label="Experience (Years)"
                type="number"
                value={editDietitianProfile.experienceYears}
                onChange={(e) =>
                  setEditDietitianProfile((prev) => ({ ...prev, experienceYears: e.target.value }))
                }
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#c6d6ef', fontWeight: 700 },
                  '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#3b4f70', borderRadius: 1.2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                }}
              />
              <TextField
                label="License Number"
                placeholder="LIC12345"
                value={editDietitianProfile.licenseNumber}
                onChange={(e) =>
                  setEditDietitianProfile((prev) => ({ ...prev, licenseNumber: e.target.value }))
                }
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#c6d6ef', fontWeight: 700 },
                  '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#3b4f70', borderRadius: 1.2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                }}
              />
              <TextField
                label="Phone"
                placeholder="+1234567890"
                value={editDietitianProfile.phone}
                onChange={(e) =>
                  setEditDietitianProfile((prev) => ({ ...prev, phone: e.target.value }))
                }
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#c6d6ef', fontWeight: 700 },
                  '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#3b4f70', borderRadius: 1.2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                }}
              />
              <TextField
                label="Join Date"
                type="date"
                value={editDietitianProfile.joinDate}
                onChange={(e) =>
                  setEditDietitianProfile((prev) => ({ ...prev, joinDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#c6d6ef', fontWeight: 700 },
                  '& .MuiOutlinedInput-root': { color: '#edf5ff', background: '#3b4f70', borderRadius: 1.2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6f86aa' },
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1) brightness(1.6)',
                    opacity: 1,
                    cursor: 'pointer',
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1.5,
                background: '#3b4f70',
                border: '1px solid',
                borderColor: '#4f668f',
              }}
            >
              <Typography sx={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.05rem', mb: 1 }}>
                Working Days
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="Saturday" sx={{ bgcolor: '#2563eb', color: '#eaf2ff', fontWeight: 700 }} />
                <Chip label="Sunday" sx={{ bgcolor: '#2563eb', color: '#eaf2ff', fontWeight: 700 }} />
              </Stack>
              <Typography sx={{ color: '#afc2de', fontSize: '0.95rem', mt: 1.1 }}>
                You can only create consultation slots on Saturday and Sunday
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.2 }}>
            <Button
              variant="contained"
              onClick={saveDietitianProfile}
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 1.2,
                py: 1,
                fontSize: '1rem',
                backgroundColor: '#f30612',
                '&:hover': { backgroundColor: '#cf0812' },
              }}
            >
              Save Profile
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={feedbackOpen}
          autoHideDuration={2500}
          onClose={() => setFeedbackOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setFeedbackOpen(false)}
            sx={{ width: '100%' }}
          >
            Profile saved successfully.
          </Alert>
        </Snackbar>

        <Snackbar
          open={deleteFeedbackOpen}
          autoHideDuration={2500}
          onClose={() => setDeleteFeedbackOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setDeleteFeedbackOpen(false)}
            sx={{ width: '100%' }}
          >
            Profile deleted successfully.
          </Alert>
        </Snackbar>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
