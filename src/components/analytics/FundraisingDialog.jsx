// src/components/analytics/FundraisingDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Stack, Box, Switch, FormControlLabel, Slider,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

import { formatCurrency } from './formatters';

const FundraisingDialog = ({ 
  open, 
  onClose, 
  formData, 
  setFormData,
  editMode,
  onSubmit
}) => {
  // Track which milestones are enabled
  const [enabledMilestones, setEnabledMilestones] = useState({
    'Product Launch': formData.keyMilestones?.some(m => m.name === 'Product Launch') || false,
    'Revenue Target': formData.keyMilestones?.some(m => m.name === 'Revenue Target') || false,
    'User Growth': formData.keyMilestones?.some(m => m.name === 'User Growth') || false,
    'Market Expansion': formData.keyMilestones?.some(m => m.name === 'Market Expansion') || false
  });

  // Handle milestone toggle
  const handleMilestoneToggle = (milestone) => (event) => {
    const checked = event.target.checked;
    setEnabledMilestones({
      ...enabledMilestones,
      [milestone]: checked
    });

    if (checked) {
      // Add milestone to form data
      setFormData({
        ...formData,
        keyMilestones: [
          ...formData.keyMilestones.filter(m => m.name !== milestone),
          { name: milestone, percentageComplete: 50 }
        ]
      });
    } else {
      // Remove milestone from form data
      setFormData({
        ...formData,
        keyMilestones: formData.keyMilestones.filter(m => m.name !== milestone)
      });
    }
  };

  // Handle milestone completion change
  const handleMilestonePercentChange = (milestone, value) => {
    setFormData({
      ...formData,
      keyMilestones: formData.keyMilestones.map(m =>
        m.name === milestone ? { ...m, percentageComplete: value } : m
      )
    });
  };

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
        {editMode ? 'Edit Fundraising Prediction' : 'Create Fundraising Prediction'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prediction Name"
              value={formData.predictionName}
              onChange={(e) => setFormData({ ...formData, predictionName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Round Type</InputLabel>
              <Select
                value={formData.roundType}
                onChange={(e) => setFormData({ ...formData, roundType: e.target.value })}
                label="Round Type"
              >
                <MenuItem value="Pre-Seed">Pre-Seed</MenuItem>
                <MenuItem value="Seed">Seed</MenuItem>
                <MenuItem value="Series A">Series A</MenuItem>
                <MenuItem value="Series B">Series B</MenuItem>
                <MenuItem value="Bridge">Bridge</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Target Round Size (₹)"
              value={formData.targetRoundSize}
              onChange={(e) => setFormData({ 
                ...formData, 
                targetRoundSize: parseFloat(e.target.value) || 0 
              })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Target Valuation (₹)"
              value={formData.targetValuation}
              onChange={(e) => setFormData({ 
                ...formData, 
                targetValuation: parseFloat(e.target.value) || 0 
              })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          
          {/* Date Fields - Uncomment if you want to add specific date fields */}
          {/*
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Target Start Date"
              value={formData.predictedStartDate || null}
              onChange={(date) => setFormData({ ...formData, predictedStartDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Target Close Date"
              value={formData.predictedCloseDate || null}
              onChange={(date) => setFormData({ ...formData, predictedCloseDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          */}
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Key Milestones
            </Typography>
            <Stack spacing={2}>
              {['Product Launch', 'Revenue Target', 'User Growth', 'Market Expansion'].map((milestone) => (
                <Box key={milestone}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enabledMilestones[milestone]}
                        onChange={handleMilestoneToggle(milestone)}
                      />
                    }
                    label={milestone}
                  />
                  {enabledMilestones[milestone] && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <Typography variant="caption">Completion %</Typography>
                      <Slider
                        value={formData.keyMilestones.find(m => m.name === milestone)?.percentageComplete || 0}
                        onChange={(e, value) => handleMilestonePercentChange(milestone, value)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
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
          disabled={!formData.predictionName || formData.targetRoundSize === 0}
        >
          {editMode ? 'Update Prediction' : 'Create Prediction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FundraisingDialog;