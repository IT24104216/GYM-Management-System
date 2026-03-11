import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MOCK_USERS_KEY = 'gympro_mock_users';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const summaryCards = [
  {
    id: 'total',
    label: 'Total Accounts',
    value: '3,247',
    delta: '+127 this month',
    trend: '+4.1%',
    gradient: 'linear-gradient(135deg, #84CC16 0%, #0D9488 100%)',
    icon: PeopleAltRoundedIcon,
  },
  {
    id: 'staff',
    label: 'Staff Members',
    value: '156',
    delta: '+8 this month',
    trend: '+3.9%',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #0284C7 100%)',
    icon: FitnessCenterRoundedIcon,
  },
  {
    id: 'diet',
    label: 'Dietitian Accounts',
    value: '42',
    delta: '+3 this month',
    trend: '+6.2%',
    gradient: 'linear-gradient(135deg, #10B981 0%, #0D9488 100%)',
    icon: MenuBookRoundedIcon,
  },
  {
    id: 'verified',
    label: 'Verified Profiles',
    value: '2,986',
    delta: '91.9% verified',
    trend: '+2.1%',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
    icon: VerifiedUserRoundedIcon,
  },
];

const initialUsers = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Member', status: 'Active', joined: 'Jan 15, 2025', avatar: 'AJ' },
  { id: 2, name: 'Coach Marcus', email: 'marcus@example.com', role: 'Coach', status: 'Active', joined: 'Mar 2, 2024', avatar: 'CM' },
  { id: 3, name: 'Dr. Sarah Mitchell', email: 'sarah@example.com', role: 'Dietician', status: 'Active', joined: 'Feb 10, 2024', avatar: 'SM' },
  { id: 4, name: 'Tom Bradley', email: 'tom@example.com', role: 'Member', status: 'Inactive', joined: 'Nov 5, 2024', avatar: 'TB' },
  { id: 5, name: 'Lisa Chen', email: 'lisa@example.com', role: 'Coach', status: 'Active', joined: 'Apr 18, 2024', avatar: 'LC' },
  { id: 6, name: 'Admin User', email: 'admin@gympro.com', role: 'Admin', status: 'Active', joined: 'Jan 1, 2024', avatar: 'AU' },
  { id: 7, name: 'Ryan Martinez', email: 'ryan@example.com', role: 'Member', status: 'Suspended', joined: 'Dec 1, 2024', avatar: 'RM' },
  { id: 8, name: 'Priya Sharma', email: 'priya@example.com', role: 'Dietician', status: 'Active', joined: 'Jun 20, 2024', avatar: 'PS' },
];

const roleStyles = {
  Member: { bg: 'rgba(132, 204, 22, 0.14)', color: '#65A30D' },
  Coach: { bg: 'rgba(13, 148, 136, 0.14)', color: '#0F766E' },
  Dietician: { bg: 'rgba(245, 158, 11, 0.14)', color: '#B45309' },
  Admin: { bg: 'rgba(139, 92, 246, 0.14)', color: '#7C3AED' },
};

const statusStyles = {
  Active: { color: '#10B981', dot: '#10B981' },
  Inactive: { color: '#94A3B8', dot: '#94A3B8' },
  Suspended: { color: '#EF4444', dot: '#EF4444' },
};

const displayToAuthRole = {
  Member: 'user',
  Coach: 'coach',
  Dietician: 'dietitian',
  Admin: 'admin',
};

const authToDisplayRole = {
  user: 'Member',
  coach: 'Coach',
  dietitian: 'Dietician',
  admin: 'Admin',
};

const normalizeDisplayStatus = (status) => {
  if (!status) return 'Active';
  const normalized = String(status).trim().toLowerCase();
  if (normalized === 'inactive') return 'Inactive';
  if (normalized === 'suspended') return 'Suspended';
  return 'Active';
};

const getAvatar = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const readMockUsers = () => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getInitialUsers = () => {
  const stored = readMockUsers();
  if (!stored.length) return initialUsers;

  return stored
    .filter((item) => item?.email)
    .map((item, index) => {
      const fallback = initialUsers.find((entry) => entry.email === item.email);
      return {
        id: item.id || fallback?.id || (10000 + index),
        name: item.name || fallback?.name || 'Member',
        email: item.email,
        role: authToDisplayRole[item.role] || fallback?.role || 'Member',
        status: normalizeDisplayStatus(item.status),
        joined: fallback?.joined || 'Jan 1, 2025',
        avatar: fallback?.avatar || getAvatar(item.name || fallback?.name || 'Member'),
      };
    });
};

const persistUsersToMockStore = (uiUsers) => {
  const existing = readMockUsers();
  const existingByEmail = new Map(existing.map((item) => [item.email, item]));

  const nextMapped = uiUsers.map((user) => {
    const current = existingByEmail.get(user.email) || {};
    return {
      ...current,
      id: current.id || user.id,
      name: user.name,
      email: user.email,
      role: displayToAuthRole[user.role] || 'user',
      status: user.status.toLowerCase(),
      password: current.password || 'User@123',
    };
  });

  const visibleEmails = new Set(uiUsers.map((item) => item.email));
  const untouched = existing.filter((item) => !visibleEmails.has(item.email));
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([...nextMapped, ...untouched]));
};

function AdminUsers() {
  const [users, setUsers] = useState(() => getInitialUsers());
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [nextRole, setNextRole] = useState('Member');
  const [toast, setToast] = useState({ open: false, message: '' });

  const filters = ['All', 'Members', 'Coaches', 'Dieticians', 'Admins'];

  const filteredUsers = useMemo(() => users.filter((user) => {
    const roleMatch = filter === 'All' ? true : user.role === filter.slice(0, -1);
    const query = search.trim().toLowerCase();
    const searchMatch = !query
      || user.name.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query);
    return roleMatch && searchMatch;
  }), [filter, search]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const roleOptions = ['Member', 'Coach', 'Dietician', 'Admin'];

  useEffect(() => {
    persistUsersToMockStore(users);
  }, [users]);

  const handleOpenEditRole = (user) => {
    setEditingUser(user);
    setNextRole(user.role);
  };

  const handleCloseEditRole = () => {
    setEditingUser(null);
  };

  const handleSaveRole = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((item) => (
      item.id === editingUser.id ? { ...item, role: nextRole } : item
    )));
    setToast({ open: true, message: `${editingUser.name} promoted to ${nextRole}.` });
    setEditingUser(null);
  };

  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((prev) => prev.map((item) => (
      item.id === user.id ? { ...item, status: nextStatus } : item
    )));
    setToast({ open: true, message: `${user.name} marked as ${nextStatus}.` });
  };

  const handleDeleteUser = (user) => {
    if (user.status !== 'Inactive') {
      setToast({ open: true, message: 'Only inactive users can be deleted.' });
      return;
    }

    setUsers((prev) => prev.filter((item) => item.id !== user.id));
    setToast({ open: true, message: `${user.name} deleted.` });
  };

  const handleCloseToast = (_, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <MotionBox variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 2.5 }}>
      <MotionBox variants={itemVariants} mb={1.6}>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.45rem', md: '1.72rem' } }}>
          Users & Staff Management
        </Typography>
        <Typography sx={{ color: '#64748b', mt: 0.4 }}>
          Manage platform members, coaches, dieticians, and admin staff.
        </Typography>
      </MotionBox>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 1.9,
        }}
      >
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <MotionCard
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              sx={{
                borderRadius: 2.2,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                background: item.gradient,
              }}
            >
              <CardContent sx={{ p: 2.1, '&:last-child': { pb: 2.1 }, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.95}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1.7, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.22)' }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </Box>
                  <Chip
                    icon={<TrendingUpRoundedIcon sx={{ color: '#fff !important', fontSize: '15px !important' }} />}
                    label={item.trend}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.24)', color: '#fff', fontWeight: 700, height: 24 }}
                  />
                </Stack>

                <Typography sx={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1.05 }}>{item.value}</Typography>
                <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.9)', mt: 0.3 }}>{item.label}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.82)', mt: 0.45 }}>{item.delta}</Typography>
              </CardContent>
              <Box sx={{ position: 'absolute', right: -15, top: -16, width: 86, height: 86, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box sx={{ position: 'absolute', right: -12, bottom: -35, width: 76, height: 76, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
            </MotionCard>
          );
        })}
      </Box>

      <MotionCard variants={itemVariants} sx={{ borderRadius: 2.2, border: '1px solid #e5edf6', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
        <Box sx={{ p: { xs: 1.7, md: 2.1 }, borderBottom: '1px solid #edf2f7' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.3}>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.5rem' } }}>
              User Directory
            </Typography>

            <TextField
              size="small"
              placeholder="Search users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ minWidth: { xs: 1, sm: 250 }, '& .MuiOutlinedInput-root': { borderRadius: 2, height: 42 } }}
            />
          </Stack>

          <Stack direction="row" spacing={1} mt={1.6} useFlexGap flexWrap="wrap">
            {filters.map((item) => (
              <Chip
                key={item}
                label={item}
                clickable
                onClick={() => {
                  setFilter(item);
                  setPage(1);
                }}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  bgcolor: filter === item ? '#22c55e' : '#f1f5f9',
                  color: filter === item ? '#fff' : '#64748b',
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>USER</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>ROLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>JOINED</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedUsers.map((user, index) => {
                const role = roleStyles[user.role] || roleStyles.Member;
                const status = statusStyles[user.status] || statusStyles.Inactive;
                return (
                  <TableRow
                    key={user.id}
                    component={motion.tr}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, fontWeight: 800, fontSize: '0.9rem', bgcolor: '#22c55e' }}>{user.avatar}</Avatar>
                        <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip size="small" label={user.role} sx={{ fontWeight: 700, bgcolor: role.bg, color: role.color }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: status.dot }} />
                        <Typography sx={{ color: status.color, fontWeight: 700, fontSize: '0.9rem' }}>{user.status}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{user.joined}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.8} justifyContent="flex-end" useFlexGap flexWrap="wrap">
                        <Button
                          size="small"
                          onClick={() => handleOpenEditRole(user)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            minWidth: 'auto',
                            px: 1.1,
                          }}
                        >
                          Edit Role
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleToggleStatus(user)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            minWidth: 'auto',
                            px: 1.1,
                            color: user.status === 'Active' ? '#f59e0b' : '#10b981',
                          }}
                        >
                          {user.status === 'Active' ? 'Mark Inactive' : 'Mark Active'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.status !== 'Inactive'}
                          color="error"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            minWidth: 'auto',
                            px: 1.1,
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.1, py: 1.35, borderTop: '1px solid #edf2f7' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Showing {pagedUsers.length} of {filteredUsers.length} users
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="Prev"
              clickable
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#64748b' }}
            />
            <Typography sx={{ fontWeight: 800, color: '#334155', minWidth: 36, textAlign: 'center' }}>{safePage}</Typography>
            <Chip
              label="Next"
              clickable
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#64748b' }}
            />
          </Stack>
        </Stack>
      </MotionCard>

      <Dialog open={Boolean(editingUser)} onClose={handleCloseEditRole} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Edit User Role</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b', mb: 1.2 }}>
            Select new role for {editingUser?.name}.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="admin-user-role-label">Role</InputLabel>
            <Select
              labelId="admin-user-role-label"
              label="Role"
              value={nextRole}
              onChange={(event) => setNextRole(event.target.value)}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.2 }}>
          <Button onClick={handleCloseEditRole} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveRole} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Save Role
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        onClose={handleCloseToast}
        autoHideDuration={2200}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </MotionBox>
  );
}

export default AdminUsers;
