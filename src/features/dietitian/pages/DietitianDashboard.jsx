import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

const mockMembers = [
  {
    id: 1,
    name: 'John Doe',
    joinedDate: '2025-01-15',
    age: 28,
    weight: 75,
    height: 175,
    goal: 'Build muscle and increase strength',
  },
];

const tabItems = ['Members', 'Appointments', 'Time Slots'];

function DietitianDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState('Members');
  const [searchText, setSearchText] = useState('');

  const pageBg = isDark
    ? 'radial-gradient(circle at 15% 10%, #1b355b 0%, #0f1e3d 60%, #0b1731 100%)'
    : 'linear-gradient(180deg, #f8fbff 0%, #edf3fb 100%)';
  const panelBg = isDark ? '#1a2a47' : '#ffffff';
  const panelBorder = isDark ? '#2b4268' : '#dbe7f6';
  const subtitleColor = isDark ? '#8ea7cb' : '#5b7398';
  const mutedText = isDark ? '#88a1c7' : '#607aa5';

  const filteredMembers = useMemo(
    () =>
      mockMembers.filter((m) =>
        m.name.toLowerCase().includes(searchText.trim().toLowerCase()),
      ),
    [searchText],
  );

  const stats = [
    { label: 'Total Members', value: filteredMembers.length, icon: GroupRoundedIcon },
    { label: 'Diet Plans', value: 0, icon: FavoriteBorderRoundedIcon },
    { label: 'Available Slots', value: 0, icon: AccessTimeRoundedIcon },
    { label: 'Appointments', value: 0, icon: CalendarMonthRoundedIcon },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: 'calc(100vh - 120px)',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: panelBorder,
        background: pageBg,
      }}
    >
      <Typography sx={{ color: '#f8fafc', fontWeight: 800, fontSize: { xs: '1.8rem', md: '2rem' } }}>
        Dietician Dashboard
      </Typography>
      <Typography sx={{ color: subtitleColor, fontSize: '1.05rem', mb: 2.5 }}>
        Manage diet plans and consultations
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box
              key={stat.label}
              sx={{
                background: panelBg,
                border: '1px solid',
                borderColor: panelBorder,
                borderRadius: 2,
                p: 2.2,
                minHeight: 126,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography sx={{ color: subtitleColor, fontWeight: 600, fontSize: '1.05rem' }}>
                  {stat.label}
                </Typography>
                <Icon sx={{ color: '#ff3048', fontSize: 18 }} />
              </Stack>
              <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '2.2rem', lineHeight: 1 }}>
                {stat.value}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" spacing={0.4} sx={{ mb: 2.5, width: 'fit-content', background: panelBg, borderRadius: 99, p: 0.45 }}>
        {tabItems.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              textTransform: 'none',
              borderRadius: 99,
              px: 1.7,
              py: 0.45,
              minWidth: 0,
              fontWeight: 600,
              color: activeTab === tab ? '#0f172a' : '#a4bad9',
              backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
            }}
          >
            {tab}
          </Button>
        ))}
      </Stack>

      <TextField
        fullWidth
        placeholder="Search member by name..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{
          mb: 2.1,
          '& .MuiOutlinedInput-root': {
            color: '#cfe0fb',
            borderRadius: 1.5,
            background: isDark ? '#1a2a47' : '#f7fbff',
            '& fieldset': { borderColor: panelBorder },
            '&:hover fieldset': { borderColor: panelBorder },
            '&.Mui-focused fieldset': { borderColor: '#4f77b6' },
          },
          '& .MuiInputBase-input::placeholder': { color: mutedText, opacity: 1 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: mutedText, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {activeTab === 'Members' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
            gap: 2,
          }}
        >
          {filteredMembers.map((member) => (
            <Box
              key={member.id}
              sx={{
                background: panelBg,
                border: '1px solid',
                borderColor: panelBorder,
                borderRadius: 2,
                p: 2.4,
              }}
            >
              <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1.85rem', mb: 0.5 }}>
                {member.name}
              </Typography>
              <Typography sx={{ color: mutedText, fontSize: '1.02rem', mb: 2.2 }}>
                Member since {member.joinedDate}
              </Typography>

              <Typography sx={{ color: '#b7cce8', fontSize: '1.03rem', lineHeight: 1.6 }}>
                Age: {member.age} years
                <br />
                Weight: {member.weight} kg
                <br />
                Height: {member.height} cm
                <br />
                Goal: {member.goal}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 1.8,
                  backgroundColor: '#f30612',
                  '&:hover': { backgroundColor: '#cf0812' },
                }}
              >
                Create Diet Plan
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 'Appointments' && (
        <Box sx={{ color: mutedText, p: 2, border: '1px dashed', borderColor: panelBorder, borderRadius: 2 }}>
          No appointments yet.
        </Box>
      )}

      {activeTab === 'Time Slots' && (
        <Box sx={{ color: mutedText, p: 2, border: '1px dashed', borderColor: panelBorder, borderRadius: 2 }}>
          No time slots yet.
        </Box>
      )}
    </Box>
  );
}

export default DietitianDashboard;
