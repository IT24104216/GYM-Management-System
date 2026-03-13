import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PageHeader from '@/shared/components/ui/PageHeader';

const allClientsMock = [
  { id: 1, name: 'John Doe', joinedDate: '2025-01-15', age: 28, weight: 75, height: 175, goal: 'Build muscle and increase strength' },
  { id: 2, name: 'Jane Silva', joinedDate: '2026-03-16', age: 27, weight: 70, height: 170, goal: 'Muscle Gain Nutrition' },
  { id: 3, name: 'Kavindu Perera', joinedDate: '2026-03-17', age: 31, weight: 82, height: 178, goal: 'Fat Loss Meal Plan' },
  { id: 4, name: 'Mila Fernando', joinedDate: '2026-03-11', age: 25, weight: 61, height: 165, goal: 'Lean maintenance diet' },
  { id: 5, name: 'Sahan Wickram', joinedDate: '2026-03-10', age: 34, weight: 89, height: 182, goal: 'Reduce body fat percentage' },
  { id: 6, name: 'Rashmi De Alwis', joinedDate: '2026-03-08', age: 29, weight: 66, height: 168, goal: 'High-protein muscle support' },
];

function DietitianClients() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchText, setSearchText] = useState('');
  const [dietPlanModal, setDietPlanModal] = useState({ open: false, client: null });

  const panelBg = isDark ? '#1a2a47' : '#ffffff';
  const panelBorder = isDark ? '#2b4268' : '#dbe7f6';
  const mutedText = isDark ? '#88a1c7' : '#607aa5';

  const visibleClients = allClientsMock.filter((client) =>
    client.name.toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  const openDietPlanModal = (client) => {
    setDietPlanModal({ open: true, client });
  };

  const closeDietPlanModal = () => {
    setDietPlanModal({ open: false, client: null });
  };

  return (
    <Box>
      <PageHeader title="My Clients" subtitle="View all assigned members with the same dashboard card format." />

      <TextField
        fullWidth
        placeholder="Search client by name..."
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {visibleClients.map((client) => (
          <Box
            key={client.id}
            sx={{
              background: panelBg,
              border: '1px solid',
              borderColor: panelBorder,
              borderRadius: 2,
              p: 2.4,
              minHeight: 330,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1.85rem', mb: 0.5 }}>
              {client.name}
            </Typography>
            <Typography sx={{ color: mutedText, fontSize: '1.02rem', mb: 2.2 }}>
              Member since {client.joinedDate}
            </Typography>

            <Typography sx={{ color: '#b7cce8', fontSize: '1.03rem', lineHeight: 1.6 }}>
              Age: {client.age} years
              <br />
              Weight: {client.weight} kg
              <br />
              Height: {client.height} cm
              <br />
              Goal: {client.goal}
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => openDietPlanModal(client)}
              sx={{
                mt: 'auto',
                pt: 1.9,
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

      <Dialog
        open={dietPlanModal.open}
        onClose={closeDietPlanModal}
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
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc' }}>
            Create Diet Plan
          </Typography>
          <Typography sx={{ color: '#9fb3cf', fontSize: '0.95rem', mt: 0.4 }}>
            Creating plan for: <Box component="span" sx={{ color: '#f8fafc', fontWeight: 700 }}>{dietPlanModal.client?.name}</Box>
          </Typography>
          <Button
            onClick={closeDietPlanModal}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              minWidth: 0,
              p: 0.6,
              borderRadius: 1,
              color: '#94a3b8',
            }}
          >
            <CloseRoundedIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#c6d6ef', fontSize: '0.95rem' }}>
            Diet plan editor is available from the dashboard workflow. This popup confirms the click is active.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDietPlanModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DietitianClients;
