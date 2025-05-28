// src/components/analytics/RunwayScenarioDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Stack, Chip, Slider, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

import { formatPercentage } from './formatters';

// Pre-defined scenario templates for quick selection
const scenarioTemplates = [
  { name: 'Conservative Growth', burnGrowth: 0.03, revenueGrowth: 0.05 },
  { name: 'Aggressive Expansion', burnGrowth: 0.15, revenueGrowth: 0.25 },
  { name: 'Steady State', burnGrowth: 0, revenueGrowth: 0.10 },
  { name: 'Cost Cutting', burnGrowth: -0.05, revenueGrowth: 0.05 },
];

const RunwayScenarioDialog = ({ 
  open, 
  onClose, 
  formData, 
  setFormData,
  editMode,
  onSubmit
}) => {

  // Apply a template to the scenario form
  const applyScenarioTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      assumptions: [
        { metric: 'monthly_burn_rate', baseValue: prev.assumptions[0].baseValue, growthRate: template.burnGrowth },
        { metric: 'revenue_growth_rate', baseValue: prev.assumptions[1].baseValue, growthRate: template.revenueGrowth }
      ]
    }));
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
        {editMode ? 'Edit Runway Scenario' : 'Create New Runway Scenario'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Quick Templates
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {scenarioTemplates.map((template) => (
                <Chip
                  key={template.name}
                  label={template.name}
                  onClick={() => applyScenarioTemplate(template)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Scenario Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Scenario Type</InputLabel>
              <Select
                value={formData.scenarioType}
                onChange={(e) => setFormData({ ...formData, scenarioType: e.target.value })}
                label="Scenario Type"
              >
                <MenuItem value="Baseline">Baseline</MenuItem>
                <MenuItem value="Optimistic">Optimistic</MenuItem>
                <MenuItem value="Pessimistic">Pessimistic</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
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
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Growth Assumptions
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Burn Rate Growth
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPercentage(formData.assumptions[0].growthRate)}
                  </Typography>
                </Stack>
                <Slider
                  value={formData.assumptions[0].growthRate * 100}
                  onChange={(e, value) => {
                    const newAssumptions = [...formData.assumptions];
                    newAssumptions[0].growthRate = value / 100;
                    setFormData({ ...formData, assumptions: newAssumptions });
                  }}
                  marks
                  step={1}
                  min={-10}
                  max={20}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Revenue Growth Rate
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPercentage(formData.assumptions[1].growthRate)}
                  </Typography>
                </Stack>
                <Slider
                  value={formData.assumptions[1].growthRate * 100}
                  onChange={(e, value) => {
                    const newAssumptions = [...formData.assumptions];
                    newAssumptions[1].growthRate = value / 100;
                    setFormData({ ...formData, assumptions: newAssumptions });
                  }}
                  marks
                  step={1}
                  min={0}
                  max={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                  color="secondary"
                />
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Projection Period (months)"
              value={formData.projectionMonths}
              onChange={(e) => setFormData({ ...formData, projectionMonths: parseInt(e.target.value) })}
              InputProps={{
                inputProps: { min: 6, max: 60 }
              }}
            />
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
          disabled={!formData.name}
        >
          {editMode ? 'Update Scenario' : 'Create Scenario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RunwayScenarioDialog;