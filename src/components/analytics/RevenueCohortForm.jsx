// src/components/analytics/RevenueCohortForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper, Divider, Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../common/AlertMessage';
import { createRevenueCohort } from '../../services/api'; // Ensure API function

const cohortTypes = ['monthly', 'weekly', 'quarterly', 'custom'];
const paymentFrequencies = ['monthly', 'quarterly', 'annual', 'one-time'];

const InitialMetric = () => ({
    periodNumber: 0,
    periodLabel: 'Month 0', // Or Week 0, etc.
    activeUsers: '',
    revenue: '',
    // Other metrics like churnedUsers, retentionRate can be calculated or added later
});

const RevenueCohortForm = ({ onCohortSaved, cohortToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    cohortName: '',
    cohortStartDate: new Date().toISOString().split('T')[0],
    cohortType: cohortTypes[0],
    initialUsers: '',
    acquisitionChannel: '',
    acquisitionCost: '',
    productType: '', // e.g., "Premium Plan", "Basic Quiz Pack"
    paymentFrequency: paymentFrequencies[0],
    metrics: [InitialMetric()] // For initial historical data points
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (cohortToEdit) {
      setIsEditing(true);
      setFormData({
        cohortName: cohortToEdit.cohortName || '',
        cohortStartDate: cohortToEdit.cohortStartDate ? new Date(cohortToEdit.cohortStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        cohortType: cohortToEdit.cohortType || cohortTypes[0],
        initialUsers: cohortToEdit.initialUsers?.toString() || '',
        acquisitionChannel: cohortToEdit.acquisitionChannel || '',
        acquisitionCost: cohortToEdit.acquisitionCost?.toString() || '',
        productType: cohortToEdit.productType || '',
        paymentFrequency: cohortToEdit.paymentFrequency || paymentFrequencies[0],
        metrics: cohortToEdit.metrics && cohortToEdit.metrics.length > 0 
            ? cohortToEdit.metrics.map(m => ({
                ...m,
                activeUsers: m.activeUsers?.toString() || '',
                revenue: m.revenue?.toString() || '',
            })) 
            : [InitialMetric()]
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [cohortToEdit]);

  const resetForm = () => {
    setFormData({
      cohortName: '', cohortStartDate: new Date().toISOString().split('T')[0], cohortType: cohortTypes[0],
      initialUsers: '', acquisitionChannel: '', acquisitionCost: '', productType: '', paymentFrequency: paymentFrequencies[0],
      metrics: [InitialMetric()]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetricChange = (index, e) => {
    const { name, value } = e.target;
    const newMetrics = [...formData.metrics];
    newMetrics[index] = { ...newMetrics[index], [name]: value };
    // Auto-update periodLabel if periodNumber changes
    if (name === "periodNumber") {
        newMetrics[index].periodLabel = `${formData.cohortType === 'weekly' ? 'Week' : 'Month'} ${value}`;
    }
    setFormData(prev => ({ ...prev, metrics: newMetrics }));
  };

  const addMetricField = () => {
    const lastPeriodNum = formData.metrics.length > 0 ? parseInt(formData.metrics[formData.metrics.length - 1].periodNumber) : -1;
    const newPeriodNum = lastPeriodNum + 1;
    setFormData(prev => ({ 
        ...prev, 
        metrics: [
            ...prev.metrics, 
            { ...InitialMetric(), periodNumber: newPeriodNum, periodLabel: `${formData.cohortType === 'weekly' ? 'Week' : 'Month'} ${newPeriodNum}` }
        ] 
    }));
  };

  const removeMetricField = (index) => {
    if (formData.metrics.length <= 1 && index === 0) return; // Keep at least one if it's the first one
    const newMetrics = formData.metrics.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, metrics: newMetrics.length > 0 ? newMetrics : [InitialMetric()] }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      initialUsers: parseInt(formData.initialUsers) || 0,
      acquisitionCost: parseFloat(formData.acquisitionCost) || null,
      metrics: formData.metrics.map(m => ({
        periodNumber: parseInt(m.periodNumber) || 0,
        periodLabel: m.periodLabel || `${formData.cohortType === 'weekly' ? 'Week' : 'Month'} ${m.periodNumber || 0}`,
        activeUsers: parseInt(m.activeUsers) || 0,
        revenue: parseFloat(m.revenue) || 0,
      })).filter(m => m.activeUsers > 0 || m.revenue > 0) // Only submit metrics with data
    };

    try {
      // For now, only create. Update would be similar.
      const response = await createRevenueCohort(submissionData);
      setMessage({ type: 'success', text: 'Revenue cohort created successfully!' });
      
      if (onCohortSaved) onCohortSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving revenue cohort:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save cohort.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Revenue Cohort' : 'Define New Revenue Cohort'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}><TextField name="cohortName" label="Cohort Name" value={formData.cohortName} onChange={handleInputChange} fullWidth required placeholder="e.g., Jan 2025 Signups"/></Grid>
            <Grid item xs={12} sm={6}><TextField name="cohortStartDate" label="Cohort Start Date" type="date" value={formData.cohortStartDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth required /></Grid>
            
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth><InputLabel>Cohort Type</InputLabel>
                <Select name="cohortType" value={formData.cohortType} label="Cohort Type" onChange={handleInputChange}>
                    {cohortTypes.map(type => <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>)}
                </Select></FormControl>
            </Grid>
            <Grid item xs={12} sm={4}><TextField name="initialUsers" label="Initial Users in Cohort" type="number" value={formData.initialUsers} onChange={handleInputChange} fullWidth required /></Grid>
            <Grid item xs={12} sm={4}><TextField name="acquisitionChannel" label="Acquisition Channel (Optional)" value={formData.acquisitionChannel} onChange={handleInputChange} fullWidth /></Grid>
            
            <Grid item xs={12} sm={4}><TextField name="acquisitionCost" label="Total Acquisition Cost (Optional)" type="number" value={formData.acquisitionCost} onChange={handleInputChange} fullWidth /></Grid>
            <Grid item xs={12} sm={4}><TextField name="productType" label="Product/Plan Type (Optional)" value={formData.productType} onChange={handleInputChange} fullWidth /></Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth><InputLabel>Payment Frequency</InputLabel>
                <Select name="paymentFrequency" value={formData.paymentFrequency} label="Payment Frequency" onChange={handleInputChange}>
                    {paymentFrequencies.map(pf => <MenuItem key={pf} value={pf}>{pf.charAt(0).toUpperCase() + pf.slice(1)}</MenuItem>)}
                </Select></FormControl>
            </Grid>

            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:2, mb:0, fontWeight: 500}}>Initial Historical Metrics (Optional)</Typography></Grid>
            {formData.metrics.map((metric, index) => (
                <Grid item xs={12} key={index}>
                    <Paper elevation={0} sx={{p:2, mb:1, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}><TextField name="periodNumber" label="Period Number (0, 1...)" type="number" value={metric.periodNumber} onChange={e => handleMetricChange(index, e)} fullWidth InputProps={{readOnly: index === 0 && metric.periodNumber === 0 }}/></Grid>
                            <Grid item xs={12} sm={3}><TextField name="periodLabel" label="Period Label" value={metric.periodLabel} InputProps={{readOnly: true}} fullWidth /></Grid>
                            <Grid item xs={12} sm={2}><TextField name="activeUsers" label="Active Users" type="number" value={metric.activeUsers} onChange={e => handleMetricChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={3}><TextField name="revenue" label="Revenue (INR)" type="number" value={metric.revenue} onChange={e => handleMetricChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={1} sx={{textAlign: 'right'}}>
                                <Tooltip title="Remove Metric Point"><span><IconButton onClick={() => removeMetricField(index)} color="error" disabled={formData.metrics.length <= 1 && index === 0}><DeleteIcon /></IconButton></span></Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            ))}
            <Grid item xs={12}><Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addMetricField} sx={{mt:-1}}>Add Metric Period</Button></Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Cohort' : 'Create Cohort')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default RevenueCohortForm;
