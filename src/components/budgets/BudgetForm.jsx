// src/components/budgets/BudgetForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Card, CardContent, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper,
  CardHeader, Avatar, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AlertMessage from '../common/AlertMessage';
import { createBudget, updateBudget } from '../../services/api';

const budgetPeriodTypes = ['Monthly', 'Quarterly', 'Annual', 'Custom'];
const expenseCategories = [ // Re-using from ExpenseForm for consistency
  'Tech Infrastructure', 'Marketing & Sales', 'Salaries & Wages', 
  'Legal & Professional', 'Rent & Utilities', 'Software & Subscriptions', 
  'Travel & Entertainment', 'Office Supplies', 'Other'
];
const budgetStatuses = ['Draft', 'Active', 'Archived'];

const BudgetForm = ({ onBudgetSaved, budgetToEdit, onCancelEdit }) => {
  const initialItem = { category: expenseCategories[0], budgetedAmount: '', notes: '' };
  const [formData, setFormData] = useState({
    name: '',
    periodType: 'Monthly',
    periodStartDate: new Date().toISOString().split('T')[0],
    periodEndDate: '',
    items: [{ ...initialItem }],
    status: 'Draft',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (budgetToEdit) {
      setIsEditing(true);
      setFormData({
        name: budgetToEdit.name || '',
        periodType: budgetToEdit.periodType || 'Monthly',
        periodStartDate: budgetToEdit.periodStartDate ? new Date(budgetToEdit.periodStartDate).toISOString().split('T')[0] : '',
        periodEndDate: budgetToEdit.periodEndDate ? new Date(budgetToEdit.periodEndDate).toISOString().split('T')[0] : '',
        items: budgetToEdit.items && budgetToEdit.items.length > 0 ? budgetToEdit.items.map(item => ({...item, budgetedAmount: item.budgetedAmount.toString()})) : [{ ...initialItem }],
        status: budgetToEdit.status || 'Draft',
        notes: budgetToEdit.notes || ''
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetToEdit]);

  const resetForm = () => {
    setFormData({
      name: `Budget - ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, // Default name
      periodType: 'Monthly',
      periodStartDate: new Date().toISOString().split('T')[0],
      periodEndDate: '',
      items: [{ ...initialItem }],
      status: 'Draft',
      notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [name]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...initialItem }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) {
        setMessage({type: 'warning', text: 'A budget must have at least one item.'});
        return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotalBudget = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.budgetedAmount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        budgetedAmount: parseFloat(item.budgetedAmount) || 0
      })),
      totalBudgetedAmount: calculateTotalBudget() // Calculate on submit
    };
    
    if (!submissionData.periodEndDate && submissionData.periodType !== 'Custom') {
        setMessage({type: 'error', text: 'Period End Date is required for non-custom period types.'});
        setIsLoading(false);
        return;
    }
    if (new Date(submissionData.periodStartDate) > new Date(submissionData.periodEndDate)) {
        setMessage({type: 'error', text: 'Start Date cannot be after End Date.'});
        setIsLoading(false);
        return;
    }


    try {
      let response;
      if (isEditing && budgetToEdit?._id) {
        response = await updateBudget(budgetToEdit._id, submissionData);
        setMessage({ type: 'success', text: 'Budget updated successfully!' });
      } else {
        response = await createBudget(submissionData);
        setMessage({ type: 'success', text: 'Budget created successfully!' });
      }
      
      if (onBudgetSaved) onBudgetSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving budget:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save budget.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: '16px' }}>
      <CardHeader
        avatar={<Avatar sx={{bgcolor: 'secondary.light', color: 'secondary.dark'}}><AddCircleOutlineIcon/></Avatar>}
        title={isEditing ? 'Edit Budget' : 'Create New Budget'}
        titleTypographyProps={{variant: 'h6', fontWeight: 600}}
      />
      <CardContent>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Budget Name" value={formData.name} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="period-type-label">Period Type</InputLabel>
                <Select labelId="period-type-label" name="periodType" value={formData.periodType} label="Period Type" onChange={handleInputChange}>
                  {budgetPeriodTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="periodStartDate" label="Period Start Date" type="date" value={formData.periodStartDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="periodEndDate" label="Period End Date" type="date" value={formData.periodEndDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth required={formData.periodType !== 'Custom'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="status-label">Status</InputLabel>
                <Select labelId="status-label" name="status" value={formData.status} label="Status" onChange={handleInputChange}>
                  {budgetStatuses.map(st => <MenuItem key={st} value={st}>{st}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>Budget Items</Typography>
              {formData.items.map((item, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, borderRadius: '8px', border: '1px solid #eee' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel id={`category-label-${index}`}>Category</InputLabel>
                        <Select labelId={`category-label-${index}`} name="category" value={item.category} label="Category" onChange={(e) => handleItemChange(index, e)}>
                          {expenseCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={10} sm={3}>
                      <TextField name="budgetedAmount" label="Budgeted Amount" type="number" value={item.budgetedAmount} onChange={(e) => handleItemChange(index, e)} fullWidth inputProps={{ step: "0.01" }}/>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField name="notes" label="Item Notes" value={item.notes} onChange={(e) => handleItemChange(index, e)} fullWidth />
                    </Grid>
                    <Grid item xs={2} sm={1} sx={{textAlign: 'right'}}>
                      <Tooltip title="Remove Item">
                        <span>
                          <IconButton onClick={() => removeItem(index)} color="error" disabled={formData.items.length <= 1}>
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addItem} sx={{ mt: 1 }}>
                Add Budget Item
              </Button>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" sx={{mt:1}}>Total Budgeted: ₹{calculateTotalBudget().toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Overall Budget Notes (Optional)" value={formData.notes} onChange={handleInputChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
                {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel Edit</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Budget' : 'Create Budget')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetForm;
