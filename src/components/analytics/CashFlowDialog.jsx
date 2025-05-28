// src/components/analytics/CashFlowDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Stack, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const CashFlowDialog = ({ 
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
        {editMode ? 'Edit Cash Flow Forecast' : 'Create Cash Flow Forecast'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Forecast Name"
              value={formData.forecastName}
              onChange={(e) => setFormData({ ...formData, forecastName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Forecast Type</InputLabel>
              <Select
                value={formData.forecastType}
                onChange={(e) => setFormData({ ...formData, forecastType: e.target.value })}
                label="Forecast Type"
              >
                <MenuItem value="Short-term">Short-term (3 months)</MenuItem>
                <MenuItem value="Medium-term">Medium-term (6 months)</MenuItem>
                <MenuItem value="Long-term">Long-term (12 months)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Forecast End Date"
              value={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Granularity</InputLabel>
              <Select
                value={formData.granularity}
                onChange={(e) => setFormData({ ...formData, granularity: e.target.value })}
                label="Granularity"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info">
              This forecast will use your historical cash flow patterns and apply machine learning to predict future cash positions.
            </Alert>
          </Grid>
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
          disabled={!formData.forecastName}
          color="info"
        >
          {editMode ? 'Update Forecast' : 'Create Forecast'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CashFlowDialog;