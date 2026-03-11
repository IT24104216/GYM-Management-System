import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const kpiCards = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$24,500',
    trend: '+12.5%',
    icon: AttachMoneyRoundedIcon,
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    trendBg: '#ecfdf5',
    trendColor: '#059669',
  },
  {
    id: 'members',
    label: 'Active Members',
    value: '1,240',
    trend: '+8.2%',
    icon: GroupsRoundedIcon,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    trendBg: '#eff6ff',
    trendColor: '#2563eb',
  },
  {
    id: 'retention',
    label: 'Retention Rate',
    value: '85%',
    trend: '+24%',
    icon: MonitorHeartRoundedIcon,
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
    trendBg: '#f5f3ff',
    trendColor: '#7c3aed',
  },
  {
    id: 'satisfaction',
    label: 'Avg. Satisfaction',
    value: '4.8/5',
    trend: '+5.1%',
    icon: TrendingUpRoundedIcon,
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    trendBg: '#fffbeb',
    trendColor: '#d97706',
  },
];

const revenueData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 2000 },
  { month: 'Apr', value: 2780 },
  { month: 'May', value: 1890 },
  { month: 'Jun', value: 2390 },
  { month: 'Jul', value: 3490 },
];

const activeUsersData = [
  { month: 'Jan', value: 120 },
  { month: 'Feb', value: 132 },
  { month: 'Mar', value: 145 },
  { month: 'Apr', value: 160 },
  { month: 'May', value: 178 },
  { month: 'Jun', value: 195 },
  { month: 'Jul', value: 210 },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        px: 1.3,
        py: 1,
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.1)',
      }}
    >
      <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800, mt: 0.2 }}>
        {payload[0].value}
      </Typography>
    </Box>
  );
}

function AdminReports() {
  return (
    <MotionBox variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 2.4 }}>
      <MotionBox variants={itemVariants} mb={2}>
        <Typography sx={{ fontSize: { xs: '1.62rem', md: '1.92rem' }, fontWeight: 900, lineHeight: 1.1 }}>
          Analytics Overview
        </Typography>
      </MotionBox>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: 'repeat(4, 1fr)' },
          gap: 1.6,
          mb: 2.05,
        }}
      >
        {kpiCards.map((item) => {
          const Icon = item.icon;
          return (
            <MotionCard
              key={item.id}
              variants={itemVariants}
              sx={{
                borderRadius: 2.4,
                border: '1px solid #e5edf6',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                minHeight: 172,
              }}
            >
              <CardContent sx={{ p: 2.4, '&:last-child': { pb: 2.4 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box sx={{ width: 50, height: 50, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: item.iconBg, color: item.iconColor }}>
                    <Icon sx={{ fontSize: 26 }} />
                  </Box>
                  <Chip
                    label={item.trend}
                    size="small"
                    sx={{
                      bgcolor: item.trendBg,
                      color: item.trendColor,
                      fontWeight: 800,
                      height: 30,
                      fontSize: '0.88rem',
                    }}
                  />
                </Stack>
                <Typography sx={{ fontWeight: 900, fontSize: '2.6rem', lineHeight: 1 }}>{item.value}</Typography>
                <Typography sx={{ color: '#64748b', mt: 0.55, fontWeight: 600, fontSize: '1.06rem' }}>{item.label}</Typography>
              </CardContent>
            </MotionCard>
          );
        })}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
          gap: 1.6,
        }}
      >
        <MotionCard variants={itemVariants} sx={{ borderRadius: 2.4, border: '1px solid #e5edf6', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '2rem', mb: 1.8 }}>Revenue Trend</Typography>
            <Box sx={{ width: '100%', height: 335 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 14 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 14 }} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#0D9488" radius={[6, 6, 0, 0]} barSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </MotionCard>

        <MotionCard variants={itemVariants} sx={{ borderRadius: 2.4, border: '1px solid #e5edf6', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '2rem', mb: 1.8 }}>User Growth</Typography>
            <Box sx={{ width: '100%', height: 335 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeUsersData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 14 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 14 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    strokeWidth={4}
                    dot={{ r: 5, fill: '#8B5CF6', strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </MotionCard>
      </Box>
    </MotionBox>
  );
}

export default AdminReports;
