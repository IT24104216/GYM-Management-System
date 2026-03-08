import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { ROUTES } from '@/shared/utils/constants';

const DRAWER_WIDTH = 240;

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const isUserRoute = location.pathname.startsWith('/user/');

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        width: { sm: isUserRoute ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: isUserRoute ? 0 : `${DRAWER_WIDTH}px` },
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
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
