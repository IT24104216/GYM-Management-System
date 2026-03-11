import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  TextField,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const STORAGE_KEY = 'admin_promotions_v1';

function formatDiscount(promo) {
  if (!promo) return '';
  if (promo.discountType === 'percentage') return `${promo.discountValue}% off`;
  return `₹${promo.discountValue} off`;
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    code: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    description: '',
    image: '',
  });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPromotions(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const persistPromotions = (next) => {
    setPromotions(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormError('');
    setForm({
      title: '',
      code: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      status: 'Active',
      description: '',
      image: '',
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (promotion) => {
    setEditingId(promotion.id);
    setFormError('');
    setForm({
      title: promotion.title || '',
      code: promotion.code || '',
      discountType: promotion.discountType || 'percentage',
      discountValue: promotion.discountValue || '',
      startDate: promotion.startDate || '',
      endDate: promotion.endDate || '',
      status: promotion.status || 'Active',
      description: promotion.description || '',
      image: promotion.image || '',
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const handleFieldChange = (field) => (event) => {
    setFormError('');
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new window.FileReader();
    reader.onload = (e) => setForm((prev) => ({ ...prev, image: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleDelete = (id) => {
    const existing = promotions.find((p) => p.id === id);
    const next = promotions.filter((p) => p.id !== id);
    persistPromotions(next);
    setToast({ open: true, message: `${existing?.title || 'Promotion'} deleted successfully.`, severity: 'success' });
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.code.trim() || !form.discountValue || !form.startDate || !form.endDate) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (Number(form.discountValue) <= 0) {
      setFormError('Discount value must be greater than zero.');
      return;
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      setFormError('End date must be after start date.');
      return;
    }

    const normalizedCode = form.code.trim().toUpperCase();
    const duplicate = promotions.find((p) => p.code === normalizedCode && p.id !== editingId);
    if (duplicate) {
      setFormError('Promo code already exists. Please use a different code.');
      return;
    }

    if (editingId) {
      const next = promotions.map((p) => (p.id === editingId ? { ...p, ...form, code: normalizedCode, title: form.title.trim(), description: form.description.trim(), image: form.image || '' } : p));
      persistPromotions(next);
      setToast({ open: true, message: 'Promotion updated successfully.', severity: 'success' });
    } else {
      const nextPromotion = {
        id: Date.now(),
        ...form,
        code: normalizedCode,
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image || '',
      };
      persistPromotions([nextPromotion, ...promotions]);
      setToast({ open: true, message: 'Promotion created successfully.', severity: 'success' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleCloseToast = (_, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const filteredPromotions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return promotions;
    return promotions.filter((p) => (p.title || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q));
  }, [promotions, search]);

  const containerVariants = { hidden: {}, visible: {} };
  const itemVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  return (
    <MotionBox variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 2.4 }}>
      <MotionBox variants={itemVariants} mb={1.8}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.2}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', md: '1.65rem' } }}>Promotions Management</Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.35 }}>Create and manage ad promotions with modern campaign controls.</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddCircleOutlineRoundedIcon />} onClick={openCreateDialog} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, backgroundColor: '#0D9488', '&:hover': { backgroundColor: '#0f766e' } }}>
            Add Promotion
          </Button>
        </Stack>
      </MotionBox>

      <MotionBox variants={itemVariants} mb={1.8}>
        <TextField fullWidth size="small" placeholder="Search by title or promo code..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </MotionBox>

      <Grid container spacing={1.6}>
        {filteredPromotions.map((promotion) => (
          <Grid key={promotion.id} item xs={12} md={6}>
            <MotionCard variants={itemVariants} sx={{ borderRadius: 2.4, border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)', height: '100%' }}>
              <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                {promotion.image && (
                  <Box sx={{ mb: 1.2 }}>
                    <img src={promotion.image} alt={promotion.title} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  </Box>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.2}>
                  <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 2, background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <CampaignRoundedIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem' }} noWrap>{promotion.title}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Code: {promotion.code}</Typography>
                    </Box>
                  </Stack>

                  <Chip size="small" label={promotion.status} sx={{ fontWeight: 700, backgroundColor: promotion.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.16)', color: promotion.status === 'Active' ? '#059669' : '#64748b' }} />
                </Stack>

                <Stack direction="row" spacing={0.8} alignItems="center" mt={1.25}>
                  <SellRoundedIcon sx={{ color: '#0D9488', fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{formatDiscount(promotion)}</Typography>
                </Stack>

                <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 1.2, minHeight: 42 }}>{promotion.description || 'No description provided.'}</Typography>

                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.4 }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.76rem' }}>{promotion.startDate} - {promotion.endDate}</Typography>
                </Stack>

                <Stack direction="row" spacing={1} mt={1.6}>
                  <Button fullWidth variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => openEditDialog(promotion)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Edit</Button>
                  <Button fullWidth variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => handleDelete(promotion.id)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Delete</Button>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {!filteredPromotions.length && (
        <MotionBox variants={itemVariants} sx={{ mt: 1.4 }}>
          <Card sx={{ borderRadius: 2.3, border: '1px dashed', borderColor: 'divider' }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700 }}>No promotions found</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem', mt: 0.4 }}>Try a different keyword or create a new promotion.</Typography>
            </CardContent>
          </Card>
        </MotionBox>
      )}

      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{editingId ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1.4} sx={{ mt: 0.2 }}>
            <Grid item xs={12} md={7}>
              <TextField fullWidth label="Promotion Title" value={form.title} onChange={handleFieldChange('title')} size="small" />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Promo Code" value={form.code} onChange={handleFieldChange('code')} size="small" />
            </Grid>
            <Grid item xs={12}>
              <Button component="label" variant="outlined" sx={{ mt: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                {form.image ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {form.image && (
                <Box sx={{ mt: 1.2, mb: 0.5 }}>
                  <img src={form.image} alt="Promotion" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Discount Type</InputLabel>
                <Select label="Discount Type" value={form.discountType} onChange={handleFieldChange('discountType')}>
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Discount Value" type="number" value={form.discountValue} onChange={handleFieldChange('discountValue')} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status} onChange={handleFieldChange('status')}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Start Date" type="date" value={form.startDate} onChange={handleFieldChange('startDate')} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="End Date" type="date" value={form.endDate} onChange={handleFieldChange('endDate')} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline minRows={3} value={form.description} onChange={handleFieldChange('description')} size="small" />
            </Grid>
          </Grid>
          {formError && <Alert severity="error" sx={{ mt: 1.4 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ textTransform: 'none', fontWeight: 700 }}>{editingId ? 'Save Changes' : 'Create Promotion'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={handleCloseToast} sx={{ width: '100%' }}>{toast.message}</Alert>
      </Snackbar>
    </MotionBox>
  );
}
