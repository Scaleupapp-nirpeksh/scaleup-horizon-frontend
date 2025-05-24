// src/components/financials/RecurringTransactionForm.jsx
import React, { useState } from 'react';
import { addRecurringTransaction } from '../../services/api';
import {
  Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Box, Switch, FormControlLabel
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CircularProgress from '@mui/material/CircularProgress';
import AlertMessage from '../common/AlertMessage';

const transactionTypes = ['expense', 'revenue'];
// Using the same categories as ExpenseForm for consistency
const expenseCategories = [
  'Tech Infrastructure', 'Marketing & Sales', 'Salaries & Wages', 
  'Legal & Professional', 'Rent & Utilities', 'Software & Subscriptions', 
  'Travel & Entertainment', 'Office Supplies', 'Other'
];
const revenueSources = ['Product Sales', 'Service Fees', 'Subscription', 'Ad Revenue', 'Affiliate Income', 'Grants', 'Interest', 'Other'];

const frequencies = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'];
// 'custom' frequency would require more UI for interval and unit, skipping for this blitz

const RecurringTransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    amount: '',
    category: expenseCategories[0], // Default to first expense category
    vendor: '', // For expenses
    source: '', // For revenue
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    dayOfMonth: new Date().getDate(), // Default to current day of month for monthly
    autoCreate: true,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
        ...prev,
        type: newType,
        category: newType === 'expense' ? expenseCategories[0] : revenueSources[0], // Reset category/source
        vendor: newType === 'revenue' ? '' : prev.vendor,
        source: newType === 'expense' ? '' : prev.source,
    }));
  };


  const resetForm = () => {
    setFormData({
      name: '', type: 'expense', amount: '', category: expenseCategories[0],
      vendor: '', source: '', frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: new Date().getDate(), autoCreate: true, notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      // Backend expects category for both types, so we map source to category if type is revenue
      category: formData.type === 'revenue' ? formData.source : formData.category,
    };
    // Remove source/vendor if not applicable to type to prevent backend validation issues
    if(submissionData.type === 'expense') delete submissionData.source;
    if(submissionData.type === 'revenue') delete submissionData.vendor;


    try {
      const response = await addRecurringTransaction(submissionData);
      setMessage({ type: 'success', text: 'Recurring transaction added successfully!' });
      if (onTransactionAdded) onTransactionAdded(response.data);
      setTimeout(resetForm, 2000);
    } catch (error) {
      console.error("Error adding recurring transaction:", error);
      const errorMsg = error.response?.data?.errors 
        ? error.response.data.errors.map(err => err.msg).join(', ') 
        : error.response?.data?.msg || 'Failed to add recurring transaction.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentCategories = formData.type === 'expense' ? expenseCategories : revenueSources;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <AutorenewIcon sx={{ mr: 1, color: 'primary.main' }} /> Add Recurring Transaction
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Name / Description" value={formData.name} onChange={handleInputChange} fullWidth required placeholder="e.g., Monthly Office Rent"/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="recurring-type-label">Type</InputLabel>
                <Select labelId="recurring-type-label" name="type" value={formData.type} label="Type" onChange={handleTypeChange}>
                  {transactionTypes.map(type => <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField name="amount" label="Amount (INR)" type="number" value={formData.amount} onChange={handleInputChange} fullWidth required inputProps={{ step: "0.01" }} />
            </Grid>
             <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="recurring-category-label">{formData.type === 'expense' ? 'Category' : 'Source'}</InputLabel>
                <Select
                  labelId="recurring-category-label"
                  name={formData.type === 'expense' ? 'category' : 'source'}
                  value={formData.type === 'expense' ? formData.category : formData.source}
                  label={formData.type === 'expense' ? 'Category' : 'Source'}
                  onChange={handleInputChange}
                >
                  {currentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {formData.type === 'expense' && (
              <Grid item xs={12} sm={6}>
                <TextField name="vendor" label="Vendor (Optional)" value={formData.vendor} onChange={handleInputChange} fullWidth />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="recurring-frequency-label">Frequency</InputLabel>
                <Select labelId="recurring-frequency-label" name="frequency" value={formData.frequency} label="Frequency" onChange={handleInputChange}>
                  {frequencies.map(freq => <MenuItem key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="startDate" label="Start Date" type="date" value={formData.startDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth required />
            </Grid>
            {formData.frequency === 'monthly' && (
              <Grid item xs={12} sm={6}>
                <TextField name="dayOfMonth" label="Day of Month (1-31)" type="number" value={formData.dayOfMonth} onChange={handleInputChange} fullWidth inputProps={{ min: 1, max: 31 }}/>
              </Grid>
            )}
            {/* Add more conditional fields for other frequencies (dayOfWeek, monthOfYear) as needed */}
            <Grid item xs={12}>
              <TextField name="notes" label="Notes (Optional)" value={formData.notes} onChange={handleInputChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.autoCreate} onChange={handleInputChange} name="autoCreate" />}
                label="Auto-create transaction when due"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : null}>
                {isLoading ? 'Adding...' : 'Add Recurring Transaction'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecurringTransactionForm;
