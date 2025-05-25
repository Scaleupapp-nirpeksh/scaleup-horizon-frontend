// src/components/analytics/CashFlowForecastForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper, Divider, Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../common/AlertMessage';
import { createCashFlowForecast } from '../../services/api';

const forecastTypes = ['Short-term', 'Medium-term', 'Long-term', 'Custom'];
const granularities = ['daily', 'weekly', 'monthly'];
const categoryTypes = [
  'Tech Infrastructure', 'Marketing & Sales', 'Salaries & Wages', 
  'Legal & Professional', 'Rent & Utilities', 'Software & Subscriptions', 
  'Travel & Entertainment', 'Office Supplies', 'Revenue', 'Other'
]; // For category-wise forecasts

const InitialCategoryForecast = () => ({
    category: categoryTypes[0],
    baseAmount: '', // Monthly base
    growthRate: '0', // Monthly growth rate as decimal
    // seasonalityFactors can be complex, skipping direct input for V1
    confidence: '0.8'
});

const CashFlowForecastForm = ({ onForecastSaved, forecastToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    forecastName: '',
    description: '',
    forecastType: forecastTypes[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0], // Default 3 months
    granularity: granularities[1], // weekly
    initialCashPosition: '',
    outstandingReceivables: '',
    outstandingPayables: '',
    categoryForecasts: [InitialCategoryForecast()]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false); // For future edit functionality

  useEffect(() => {
    if (forecastToEdit) {
      setIsEditing(true);
      setFormData({
        forecastName: forecastToEdit.forecastName || '',
        description: forecastToEdit.description || '',
        forecastType: forecastToEdit.forecastType || forecastTypes[0],
        startDate: forecastToEdit.startDate ? new Date(forecastToEdit.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: forecastToEdit.endDate ? new Date(forecastToEdit.endDate).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        granularity: forecastToEdit.granularity || granularities[1],
        initialCashPosition: forecastToEdit.initialCashPosition?.toString() || '',
        outstandingReceivables: forecastToEdit.outstandingReceivables?.toString() || '',
        outstandingPayables: forecastToEdit.outstandingPayables?.toString() || '',
        categoryForecasts: forecastToEdit.categoryForecasts?.length ? forecastToEdit.categoryForecasts.map(cf => ({
            ...cf,
            baseAmount: cf.baseAmount?.toString() || '',
            growthRate: cf.growthRate?.toString() || '0',
            confidence: cf.confidence?.toString() || '0.8'
        })) : [InitialCategoryForecast()]
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [forecastToEdit]);

  const resetForm = () => {
    setFormData({
      forecastName: '', description: '', forecastType: forecastTypes[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      granularity: granularities[1], initialCashPosition: '', outstandingReceivables: '', outstandingPayables: '',
      categoryForecasts: [InitialCategoryForecast()]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryForecastChange = (index, e) => {
    const { name, value } = e.target;
    const newCategoryForecasts = [...formData.categoryForecasts];
    newCategoryForecasts[index] = { ...newCategoryForecasts[index], [name]: value };
    setFormData(prev => ({ ...prev, categoryForecasts: newCategoryForecasts }));
  };

  const addCategoryForecastField = () => {
    setFormData(prev => ({ ...prev, categoryForecasts: [...prev.categoryForecasts, InitialCategoryForecast()] }));
  };

  const removeCategoryForecastField = (index) => {
    if (formData.categoryForecasts.length <= 1) return; // Keep at least one
    const newCategoryForecasts = formData.categoryForecasts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, categoryForecasts: newCategoryForecasts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      initialCashPosition: parseFloat(formData.initialCashPosition) || 0,
      outstandingReceivables: parseFloat(formData.outstandingReceivables) || 0,
      outstandingPayables: parseFloat(formData.outstandingPayables) || 0,
      categoryForecasts: formData.categoryForecasts.map(cf => ({
        category: cf.category,
        baseAmount: parseFloat(cf.baseAmount) || 0,
        growthRate: parseFloat(cf.growthRate) || 0,
        confidence: parseFloat(cf.confidence) || 0.8
      })).filter(cf => cf.category && cf.baseAmount !== undefined)
    };

    try {
      // For now, only create
      const response = await createCashFlowForecast(submissionData);
      setMessage({ type: 'success', text: 'Cash flow forecast created successfully! Generating report...' });
      
      if (onForecastSaved) onForecastSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving cash flow forecast:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save forecast.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Cash Flow Forecast' : 'New Cash Flow Forecast'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}><TextField name="forecastName" label="Forecast Name" value={formData.forecastName} onChange={handleInputChange} fullWidth required placeholder="e.g., Q3 Operations Forecast"/></Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth><InputLabel>Forecast Type</InputLabel>
                <Select name="forecastType" value={formData.forecastType} label="Forecast Type" onChange={handleInputChange}>
                    {forecastTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select></FormControl>
            </Grid>
            <Grid item xs={12} sm={4}><TextField name="startDate" label="Start Date" type="date" value={formData.startDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth required /></Grid>
            <Grid item xs={12} sm={4}><TextField name="endDate" label="End Date" type="date" value={formData.endDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth required /></Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth><InputLabel>Granularity</InputLabel>
                <Select name="granularity" value={formData.granularity} label="Granularity" onChange={handleInputChange}>
                    {granularities.map(g => <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>)}
                </Select></FormControl>
            </Grid>
            <Grid item xs={12}><TextField name="description" label="Description (Optional)" value={formData.description} onChange={handleInputChange} fullWidth multiline rows={2} /></Grid>
            
            <Grid item xs={12} sm={4}><TextField name="initialCashPosition" label="Initial Cash (INR)" type="number" value={formData.initialCashPosition} onChange={handleInputChange} fullWidth required /></Grid>
            <Grid item xs={12} sm={4}><TextField name="outstandingReceivables" label="Outstanding Receivables (INR)" type="number" value={formData.outstandingReceivables} onChange={handleInputChange} fullWidth /></Grid>
            <Grid item xs={12} sm={4}><TextField name="outstandingPayables" label="Outstanding Payables (INR)" type="number" value={formData.outstandingPayables} onChange={handleInputChange} fullWidth /></Grid>

            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:2, mb:0, fontWeight: 500}}>Category-wise Monthly Assumptions</Typography></Grid>
            {formData.categoryForecasts.map((cf, index) => (
                <Grid item xs={12} key={index}>
                    <Paper elevation={0} sx={{p:2, mb:1, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth><InputLabel>Category</InputLabel>
                                <Select name="category" value={cf.category} label="Category" onChange={e => handleCategoryForecastChange(index, e)}>
                                    {categoryTypes.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                                </Select></FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}><TextField name="baseAmount" label="Monthly Base Amt" type="number" value={cf.baseAmount} onChange={e => handleCategoryForecastChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={3}><TextField name="growthRate" label="Monthly Growth (0.05 for 5%)" type="number" value={cf.growthRate} onChange={e => handleCategoryForecastChange(index, e)} fullWidth inputProps={{step: "0.01"}}/></Grid>
                            <Grid item xs={12} sm={2}><TextField name="confidence" label="Confidence (0-1)" type="number" value={cf.confidence} onChange={e => handleCategoryForecastChange(index, e)} fullWidth inputProps={{step: "0.1", min:"0", max:"1"}}/></Grid>
                            <Grid item xs={12} sm={1} sx={{textAlign: 'right'}}>
                                <Tooltip title="Remove Assumption"><span><IconButton onClick={() => removeCategoryForecastField(index)} color="error" disabled={formData.categoryForecasts.length <=1}><DeleteIcon /></IconButton></span></Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            ))}
            <Grid item xs={12}><Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addCategoryForecastField} sx={{mt:-1}}>Add Category Assumption</Button></Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Generating...' : (isEditing ? 'Update Forecast' : 'Generate Forecast')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default CashFlowForecastForm;
