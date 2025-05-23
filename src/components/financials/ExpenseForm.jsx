// src/components/financials/ExpenseForm.jsx
// Form for adding new expenses using MUI.
import React, { useState } from 'react';
import { addExpense, categorizeTransaction, correctTransactionCategory } from '../../services/api';
import {
  Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, CircularProgress,Grid, Card, CardContent, Typography, IconButton, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // For auto-categorize
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AlertMessage from '../common/AlertMessage'; // We'll create this

const expenseCategories = [
  'Tech Infrastructure', 'Marketing & Sales', 'Salaries & Wages', 
  'Legal & Professional', 'Rent & Utilities', 'Software & Subscriptions', 
  'Travel & Entertainment', 'Office Supplies', 'Other'
];
const paymentMethods = ['Bank Transfer', 'Credit Card', 'Cash', 'UPI', 'Other'];

const ExpenseForm = ({ onExpenseAdded }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [categorizationConfidence, setCategorizationConfidence] = useState(null);
  const [lastSavedExpenseId, setLastSavedExpenseId] = useState(null); // To link correction

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setCategory(expenseCategories[0]);
    setVendor('');
    setDescription('');
    setPaymentMethod(paymentMethods[0]);
    setSuggestedCategory(null);
    setCategorizationConfidence(null);
    setLastSavedExpenseId(null);
    // Keep message for a bit or clear it: setMessage({ type: '', text: '' });
  };

  const handleAutoCategorize = async () => {
    if (!description || !amount) {
      setMessage({ type: 'warning', text: 'Description and amount are needed for auto-categorization.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await categorizeTransaction({ description, amount: parseFloat(amount), vendor });
      setSuggestedCategory(res.data.category);
      setCategory(res.data.category); // Pre-fill category
      setCategorizationConfidence(res.data.confidence);
      setMessage({ type: 'info', text: `Suggested: ${res.data.category} (Conf: ${(res.data.confidence * 100).toFixed(0)}%)` });
    } catch (error) {
      console.error("Auto-categorization error:", error);
      setMessage({ type: 'error', text: 'Auto-categorization failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const expenseData = { date, amount: parseFloat(amount), category, vendor, description, paymentMethod };
    
    try {
      const response = await addExpense(expenseData);
      const savedExpense = response.data;
      setLastSavedExpenseId(savedExpense._id); 
      
      let successMsg = 'Expense added successfully!';
      
      // If a suggestion was made and the user *changed* it from the suggestion
      if (suggestedCategory && suggestedCategory !== category && savedExpense._id) {
        try {
            await correctTransactionCategory(savedExpense._id, { 
                description: savedExpense.description, // Send original description for learning
                vendor: savedExpense.vendor,           // Send original vendor
                correctCategory: category 
            });
            successMsg = 'Expense added and category preference learned!';
        } catch (correctionError) {
            console.error("Error learning category correction:", correctionError);
            successMsg = 'Expense added, but category learning failed.';
        }
      }
      setMessage({ type: 'success', text: successMsg });
      if (onExpenseAdded) onExpenseAdded(savedExpense);
      
      setTimeout(resetForm, 2500);
    } catch (error) {
      console.error("Error adding expense:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to add expense.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <AddCircleOutlineIcon sx={{ mr: 1, color: 'primary.main' }} /> Add New Expense
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount (INR)"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                fullWidth
                required
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                fullWidth
                required
                placeholder="e.g., AWS Server Costs for May"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor (Optional)"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                fullWidth
                placeholder="e.g., Amazon Web Services"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="expense-category-label">Category*</InputLabel>
                <Select
                  labelId="expense-category-label"
                  id="expCategory"
                  value={category}
                  label="Category*"
                  onChange={e => { setCategory(e.target.value); if(suggestedCategory) setSuggestedCategory(null);}} // Clear suggestion if manually changed
                  required
                >
                  {expenseCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
              <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                <Tooltip title="Auto-suggest category based on description, amount, and vendor">
                    <span> {/* Tooltip needs a span wrapper if button is disabled */}
                    <IconButton 
                        onClick={handleAutoCategorize} 
                        disabled={!description || !amount || isLoading}
                        size="small"
                        color="secondary"
                    >
                        <AutoFixHighIcon />
                    </IconButton>
                    </span>
                </Tooltip>
                {suggestedCategory && (
                  <Typography variant="caption" color="textSecondary" sx={{ml:1}}>
                    Suggested: {suggestedCategory} 
                    {categorizationConfidence && ` (${(categorizationConfidence * 100).toFixed(0)}%)`}
                    {suggestedCategory === category && <CheckCircleIcon sx={{ fontSize: '1rem', ml: 0.5, color: 'success.main' }} />}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="payment-method-label">Payment Method*</InputLabel>
                <Select
                  labelId="payment-method-label"
                  value={paymentMethod}
                  label="Payment Method*"
                  onChange={e => setPaymentMethod(e.target.value)}
                  required
                >
                  {paymentMethods.map(pm => <MenuItem key={pm} value={pm}>{pm}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : null}>
                {isLoading ? 'Adding...' : 'Add Expense'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;