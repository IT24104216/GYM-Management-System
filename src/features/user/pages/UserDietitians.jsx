import { motion } from 'framer-motion';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const MotionCard = motion(Card);

const DIETITIANS = [
  {
    id: 'd1',
    name: 'Olivia Martin',
    specialty: 'Clinical Nutrition and Weight Management',
    experience: '7 years',
    rating: 4.9,
    slots: 'Mon - Fri, 8:00 AM - 12:00 PM',
    qualification: 'BSc Human Nutrition and Dietetics',
    certificates: 'CDE, Sports Nutrition Specialist',
    avatar: 'OM',
    tags: ['Weight Loss', 'PCOS', 'Meal Planning'],
  },
  {
    id: 'd2',
    name: 'Daniel Perera',
    specialty: 'Sports and Performance Nutrition',
    experience: '6 years',
    rating: 4.8,
    slots: 'Mon - Sat, 2:00 PM - 7:00 PM',
    qualification: 'MSc Sports Nutrition',
    certificates: 'ISSN-Certified, Precision Nutrition L2',
    avatar: 'DP',
    tags: ['Muscle Gain', 'Endurance', 'Supplements'],
  },
  {
    id: 'd3',
    name: 'Ayesha Fernando',
    specialty: 'Lifestyle and Therapeutic Diet Plans',
    experience: '5 years',
    rating: 4.7,
    slots: 'Tue - Sun, 9:00 AM - 3:00 PM',
    qualification: 'BSc Nutrition and Food Science',
    certificates: 'Diabetes Educator, Clinical Dietetics',
    avatar: 'AF',
    tags: ['Diabetes', 'Heart Health', 'Balanced Diet'],
  },
  {
    id: 'd4',
    name: 'Michael Silva',
    specialty: 'Gut Health and Medical Nutrition Therapy',
    experience: '8 years',
    rating: 5.0,
    slots: 'Mon - Fri, 4:00 PM - 9:00 PM',
    qualification: 'MSc Clinical Dietetics',
    certificates: 'GI Nutrition Specialist, Renal Nutrition',
    avatar: 'MS',
    tags: ['Gut Health', 'Hormonal Balance', 'Medical Diet'],
  },
];

function UserDietitians() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        px: { xs: 2, md: 3 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1220, mx: 'auto' }}>
        <Stack spacing={1} mb={4.5}>
          <Typography
            sx={{
              fontSize: { xs: '2rem', md: '2.6rem' },
              fontWeight: 800,
              color: theme.palette.text.primary,
            }}
          >
            Choose Your Dietitian
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.02rem' }}>
            Select a dietitian for your nutrition planning. Compare specialties, ratings, and available slots.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          {DIETITIANS.map((dietitian, index) => (
            <MotionCard
              key={dietitian.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              sx={{
                borderRadius: 3,
                border: `1px solid ${isDark ? '#2b3d58' : '#e5edf8'}`,
                bgcolor: theme.palette.background.paper,
                boxShadow: isDark
                  ? '0 12px 28px rgba(4, 11, 24, 0.45)'
                  : '0 12px 28px rgba(29, 58, 101, 0.11)',
              }}
            >
              <CardContent sx={{ p: 2.8 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={1.8}>
                  <Avatar sx={{ width: 54, height: 54, bgcolor: '#2b8eff', fontWeight: 700 }}>
                    {dietitian.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.2}>
                      <Typography sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                        {dietitian.name}
                      </Typography>
                      <VerifiedRoundedIcon sx={{ color: '#2b8eff', fontSize: 18 }} />
                    </Stack>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.94rem' }}>
                      {dietitian.specialty}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {dietitian.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: isDark ? '#18263c' : '#ecf4ff',
                        color: isDark ? '#bcd4f7' : '#2f4b72',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>

                <Stack spacing={1.2} mb={2.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StarRoundedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      Rating {dietitian.rating}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <RestaurantMenuRoundedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      Experience {dietitian.experience}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeRoundedIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.93rem' }}>
                      {dietitian.slots}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack spacing={0.8}>
                  <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.92rem' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Qualification:</Box>{' '}
                    {dietitian.qualification}
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.primary, fontSize: '0.92rem' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Certificates:</Box>{' '}
                    {dietitian.certificates}
                  </Typography>
                </Stack>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default UserDietitians;
