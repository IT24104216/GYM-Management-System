import { createElement } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { NAV_CONFIG } from '@/shared/config/navConfig';
import { ROLE_HOME } from '@/shared/utils/constants';

const DRAWER_WIDTH = 240;

function SidebarContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = NAV_CONFIG[user?.role] || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Toolbar
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate(ROLE_HOME[user?.role])}
      >
        <FitnessCenterIcon sx={{ color: 'secondary.main', mr: 1 }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          GymPro
        </Typography>
      </Toolbar>

      {/* Nav links */}
      <List sx={{ flex: 1, px: 1 }}>
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {createElement(Icon, { fontSize: 'small' })}
                </ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

function Sidebar({ mobileOpen, onClose }) {
  return (
    <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
}

export default Sidebar;
