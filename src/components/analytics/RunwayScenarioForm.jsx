// src/components/analytics/RunwayScenarioForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper, Divider,
  Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../common/AlertMessage';
import { createRunwayScenario, updateBankAccount } from '../../services/api'; // Assuming update for scenarios if needed

const scenarioTypes = ['Conservative', 'Base', 'Optimistic', 'Custom'];
const assumptionMetrics = ['monthly_burn_rate', 'revenue_growth_rate', 'hiring_cost', 'new_marketing_spend']; // Example metrics

const InitialAssumption = () => ({
    metric: assumptionMetrics[0],
    baseValue: '',
    growthRate: '', // As decimal, e.g., 0.05 for 5%
    variancePercentage: '' // For sensitivity
});

const RunwayScenarioForm = ({ onScenarioSaved, scenarioToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scenarioType: scenarioTypes[1], // Default to 'Base'
    projectionMonths: '24',
    // initialCashBalance, initialMonthlyBurn, initialMonthlyRevenue will be fetched by backend or pre-filled
    assumptions: [InitialAssumption()],
    plannedFundraisingEvents: [] // Simplified for now
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (scenarioToEdit) {
      setIsEditing(true);
      setFormData({
        name: scenarioToEdit.name || '',
        description: scenarioToEdit.description || '',
        scenarioType: scenarioToEdit.scenarioType || scenarioTypes[1],
        projectionMonths: scenarioToEdit.projectionMonths?.toString() || '24',
        assumptions: scenarioToEdit.assumptions && scenarioToEdit.assumptions.length > 0 
            ? scenarioToEdit.assumptions.map(a => ({
                metric: a.metric || assumptionMetrics[0],
                baseValue: a.baseValue?.toString() || '',
                growthRate: a.growthRate?.toString() || '', // Store as string for input
                variancePercentage: a.variancePercentage?.toString() || ''
            }))
            : [InitialAssumption()],
        plannedFundraisingEvents: scenarioToEdit.plannedFundraisingEvents || []
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [scenarioToEdit]);

  const resetForm = () => {
    setFormData({
      name: '', description: '', scenarioType: scenarioTypes[1], projectionMonths: '24',
      assumptions: [InitialAssumption()], plannedFundraisingEvents: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssumptionChange = (index, e) => {
    const { name, value } = e.target;
    const newAssumptions = [...formData.assumptions];
    newAssumptions[index] = { ...newAssumptions[index], [name]: value };
    setFormData(prev => ({ ...prev, assumptions: newAssumptions }));
  };

  const addAssumptionField = () => {
    setFormData(prev => ({ ...prev, assumptions: [...prev.assumptions, InitialAssumption()] }));
  };

  const removeAssumptionField = (index) => {
    if (formData.assumptions.length <= 1) return;
    const newAssumptions = formData.assumptions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, assumptions: newAssumptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      projectionMonths: parseInt(formData.projectionMonths) || 24,
      assumptions: formData.assumptions.map(a => ({
        metric: a.metric,
        baseValue: parseFloat(a.baseValue) || 0,
        growthRate: parseFloat(a.growthRate) || 0, // Convert to decimal if input as %
        variancePercentage: parseFloat(a.variancePercentage) || 0
      })).filter(a => a.metric && a.baseValue !== undefined), // Ensure essential fields
      // plannedFundraisingEvents would need its own UI to add/manage
    };

    try {
      let response;
      // For this sprint, focusing on create. Update logic would be similar.
      // if (isEditing && scenarioToEdit?._id) {
      //   response = await updateRunwayScenario(scenarioToEdit._id, submissionData);
      //   setMessage({ type: 'success', text: 'Scenario updated successfully!' });
      // } else {
        response = await createRunwayScenario(submissionData);
        setMessage({ type: 'success', text: 'Runway scenario created successfully! Projections are being generated.' });
      // }
      
      if (onScenarioSaved) onScenarioSaved(response.data); // response.data should include the scenario and initial projections
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving runway scenario:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save scenario.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Runway Scenario' : 'Create New Runway Scenario'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}><TextField name="name" label="Scenario Name" value={formData.name} onChange={handleInputChange} fullWidth required placeholder="e.g., Aggressive Growth Q3"/></Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth><InputLabel>Scenario Type</InputLabel>
                <Select name="scenarioType" value={formData.scenarioType} label="Scenario Type" onChange={handleInputChange}>
                    {scenarioTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select></FormControl>
            </Grid>
            <Grid item xs={12}><TextField name="description" label="Description (Optional)" value={formData.description} onChange={handleInputChange} fullWidth multiline rows={2} /></Grid>
            <Grid item xs={12} sm={6}><TextField name="projectionMonths" label="Projection Months" type="number" value={formData.projectionMonths} onChange={handleInputChange} fullWidth required /></Grid>
            
            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:2, mb:1, fontWeight: 500}}>Key Assumptions</Typography></Grid>
            {formData.assumptions.map((assumption, index) => (
                <Grid item xs={12} key={index}>
                    <Paper elevation={0} sx={{p:2, mb:1.5, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth><InputLabel>Metric</InputLabel>
                                <Select name="metric" value={assumption.metric} label="Metric" onChange={e => handleAssumptionChange(index, e)}>
                                    {assumptionMetrics.map(m => <MenuItem key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</MenuItem>)}
                                </Select></FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}><TextField name="baseValue" label="Base Value (Monthly)" type="number" value={assumption.baseValue} onChange={e => handleAssumptionChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={3}><TextField name="growthRate" label="Growth Rate (e.g., 0.05 for 5%)" type="number" value={assumption.growthRate} onChange={e => handleAssumptionChange(index, e)} fullWidth inputProps={{step: "0.01"}}/></Grid>
                            <Grid item xs={12} sm={2}><TextField name="variancePercentage" label="Variance (%)" type="number" value={assumption.variancePercentage} onChange={e => handleAssumptionChange(index, e)} fullWidth inputProps={{step: "0.01"}}/></Grid>
                            <Grid item xs={12} sm={1} sx={{textAlign: 'right'}}>
                                <Tooltip title="Remove Assumption"><span><IconButton onClick={() => removeAssumptionField(index)} color="error" disabled={formData.assumptions.length <=1}><DeleteIcon /></IconButton></span></Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            ))}
            <Grid item xs={12}><Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addAssumptionField} sx={{mt:-1}}>Add Assumption</Button></Grid>
            
            {/* Placeholder for Planned Fundraising Events UI */}

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Scenario' : 'Create & Project Scenario')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default RunwayScenarioForm;
