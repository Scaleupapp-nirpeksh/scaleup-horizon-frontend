// src/components/analytics/RevenueCohortDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Alert, FormHelperText, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

const RevenueCohortDialog = ({
  open,
  onClose,
  formData,
  setFormData,
  editMode,
  onSubmit
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editMode ? 'Edit Revenue Cohort' : 'Create Revenue Cohort'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cohort Name"
              value={formData.cohortName}
              onChange={(e) => setFormData({ ...formData, cohortName: e.target.value })}
              required
              placeholder="e.g., Jan 2025 Signups"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Cohort Start Date"
              value={formData.cohortStartDate}
              onChange={(date) => setFormData({ ...formData, cohortStartDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Cohort Type</InputLabel>
              <Select
                value={formData.cohortType}
                onChange={(e) => setFormData({ ...formData, cohortType: e.target.value })}
                label="Cohort Type"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
              <FormHelperText>
                How to group users in this cohort
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Initial Users"
              type="number"
              value={formData.initialUsers}
              onChange={(e) => setFormData({ ...formData, initialUsers: parseInt(e.target.value) || 0 })}
              required
              InputProps={{
                startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Acquisition Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Acquisition Channel</InputLabel>
              <Select
                value={formData.acquisitionChannel}
                onChange={(e) => setFormData({ ...formData, acquisitionChannel: e.target.value })}
                label="Acquisition Channel"
              >
                <MenuItem value="organic">Organic</MenuItem>
                <MenuItem value="paid_search">Paid Search</MenuItem>
                <MenuItem value="social">Social Media</MenuItem>
                <MenuItem value="referral">Referral</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="partner">Partner</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Acquisition Cost"
              type="number"
              value={formData.acquisitionCost}
              onChange={(e) => setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) || 0 })}
              InputProps={{
                startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Product Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                label="Product Type"
              >
                <MenuItem value="free">Free Tier</MenuItem>
                <MenuItem value="basic">Basic Plan</MenuItem>
                <MenuItem value="premium">Premium Plan</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Frequency</InputLabel>
              <Select
                value={formData.paymentFrequency}
                onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
                label="Payment Frequency"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="one-time">One-time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {!editMode && (
            <Grid item xs={12}>
              <Alert severity="info">
                After creating the cohort, you'll be able to add historical metrics and generate projections for future performance.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          startIcon={editMode ? <SaveIcon /> : <AddIcon />}
          disabled={!formData.cohortName || !formData.initialUsers}
          color="info"
        >
          {editMode ? 'Update Cohort' : 'Create Cohort'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RevenueCohortDialog;