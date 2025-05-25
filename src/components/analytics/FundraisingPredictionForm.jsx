// src/components/analytics/FundraisingPredictionForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper, Divider,
  Tooltip, Autocomplete, Chip, Slider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../common/AlertMessage';
import { createFundraisingPrediction } from '../../services/api'; // Assuming API function

const roundTypes = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Bridge', 'Other'];
const milestoneMetricTypes = ['users', 'revenue', 'product', 'other'];
const milestoneImpacts = ['critical', 'high', 'medium', 'low'];
const probabilityFactorTypes = ['Current burn rate', 'Market conditions', 'User growth', 'Revenue traction', 'Team Strength', 'Product-Market Fit', 'Investor Network', 'Previous Fundraising Experience'];
const factorStatuses = ['positive', 'neutral', 'negative'];

const InitialMilestone = () => ({
    name: '', targetDate: '', metricType: milestoneMetricTypes[0], targetValue: '', currentValue: '', impact: milestoneImpacts[2]
});
const InitialProbabilityFactor = () => ({
    factor: probabilityFactorTypes[0], weight: 1, currentStatus: factorStatuses[1], impact: 0, notes: ''
});

const FundraisingPredictionForm = ({ onPredictionSaved, predictionToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    predictionName: '',
    targetRoundSize: '',
    targetValuation: '',
    roundType: roundTypes[0],
    keyMilestones: [InitialMilestone()],
    // probabilityFactors: [InitialProbabilityFactor()], // Simplified: Backend will derive these initially
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false); // For future edit functionality

  useEffect(() => {
    if (predictionToEdit) {
      setIsEditing(true);
      // Populate form with predictionToEdit data (simplified for now)
      setFormData({
        predictionName: predictionToEdit.predictionName || '',
        targetRoundSize: predictionToEdit.targetRoundSize?.toString() || '',
        targetValuation: predictionToEdit.targetValuation?.toString() || '',
        roundType: predictionToEdit.roundType || roundTypes[0],
        keyMilestones: predictionToEdit.keyMilestones?.length ? predictionToEdit.keyMilestones.map(m => ({
            ...m,
            targetDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '',
            targetValue: m.targetValue?.toString() || '',
            currentValue: m.currentValue?.toString() || '',
        })) : [InitialMilestone()],
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [predictionToEdit]);

  const resetForm = () => {
    setFormData({
      predictionName: '', targetRoundSize: '', targetValuation: '', roundType: roundTypes[0],
      keyMilestones: [InitialMilestone()],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMilestoneChange = (index, e) => {
    const { name, value } = e.target;
    const newMilestones = [...formData.keyMilestones];
    newMilestones[index] = { ...newMilestones[index], [name]: value };
    setFormData(prev => ({ ...prev, keyMilestones: newMilestones }));
  };

  const addMilestoneField = () => {
    setFormData(prev => ({ ...prev, keyMilestones: [...prev.keyMilestones, InitialMilestone()] }));
  };

  const removeMilestoneField = (index) => {
    if (formData.keyMilestones.length <= 1) return;
    const newMilestones = formData.keyMilestones.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, keyMilestones: newMilestones }));
  };
  
  // Similar handlers for probabilityFactors if added to form later

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      targetRoundSize: parseFloat(formData.targetRoundSize) || 0,
      targetValuation: parseFloat(formData.targetValuation) || null,
      keyMilestones: formData.keyMilestones.map(m => ({
        ...m,
        targetValue: parseFloat(m.targetValue) || null,
        currentValue: parseFloat(m.currentValue) || null,
        targetDate: m.targetDate || null,
      })).filter(m => m.name), // Only include milestones with a name
    };

    try {
      // For now, only create is implemented fully in controller
      // if (isEditing && predictionToEdit?._id) {
      //   response = await updateFundraisingPrediction(predictionToEdit._id, submissionData);
      // } else {
      const response = await createFundraisingPrediction(submissionData);
      setMessage({ type: 'success', text: 'Fundraising prediction created successfully!' });
      // }
      
      if (onPredictionSaved) onPredictionSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving fundraising prediction:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save prediction.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Fundraising Prediction' : 'New Fundraising Prediction'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}><TextField name="predictionName" label="Prediction Name / Scenario Title" value={formData.predictionName} onChange={handleInputChange} fullWidth required placeholder="e.g., Seed Round 2025 H1"/></Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth><InputLabel>Round Type</InputLabel>
                <Select name="roundType" value={formData.roundType} label="Round Type" onChange={handleInputChange}>
                    {roundTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select></FormControl>
            </Grid>
            <Grid item xs={12} sm={4}><TextField name="targetRoundSize" label="Target Round Size (INR)" type="number" value={formData.targetRoundSize} onChange={handleInputChange} fullWidth required /></Grid>
            <Grid item xs={12} sm={4}><TextField name="targetValuation" label="Target Pre-Money Valuation (INR)" type="number" value={formData.targetValuation} onChange={handleInputChange} fullWidth /></Grid>
            
            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:2, mb:0, fontWeight: 500}}>Key Milestones to Achieve</Typography></Grid>
            {formData.keyMilestones.map((milestone, index) => (
                <Grid item xs={12} key={index}>
                    <Paper elevation={0} sx={{p:2, mb:1, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}><TextField name="name" label="Milestone Name" value={milestone.name} onChange={e => handleMilestoneChange(index, e)} fullWidth placeholder="e.g., Launch V2 Product"/></Grid>
                            <Grid item xs={12} sm={3}><TextField name="targetDate" label="Target Date" type="date" value={milestone.targetDate} onChange={e => handleMilestoneChange(index, e)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth><InputLabel>Metric Type</InputLabel>
                                <Select name="metricType" value={milestone.metricType} label="Metric Type" onChange={e => handleMilestoneChange(index, e)}>
                                    {milestoneMetricTypes.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                </Select></FormControl>
                            </Grid>
                             <Grid item xs={12} sm={2} sx={{textAlign: 'right'}}>
                                <Tooltip title="Remove Milestone"><span><IconButton onClick={() => removeMilestoneField(index)} color="error" disabled={formData.keyMilestones.length <=1}><DeleteIcon /></IconButton></span></Tooltip>
                            </Grid>
                            <Grid item xs={12} sm={3}><TextField name="targetValue" label="Target Value" type="number" value={milestone.targetValue} onChange={e => handleMilestoneChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={3}><TextField name="currentValue" label="Current Value" type="number" value={milestone.currentValue} onChange={e => handleMilestoneChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth><InputLabel>Impact</InputLabel>
                                <Select name="impact" value={milestone.impact} label="Impact" onChange={e => handleMilestoneChange(index, e)}>
                                    {milestoneImpacts.map(i => <MenuItem key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</MenuItem>)}
                                </Select></FormControl>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            ))}
            <Grid item xs={12}><Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addMilestoneField} sx={{mt:-1}}>Add Milestone</Button></Grid>
            
            {/* Probability Factors could be displayed if returned by backend, or be a more complex input later */}

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Generating...' : (isEditing ? 'Update Prediction' : 'Generate Prediction')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default FundraisingPredictionForm;
