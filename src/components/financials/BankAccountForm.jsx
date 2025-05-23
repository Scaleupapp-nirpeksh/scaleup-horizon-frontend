// src/components/financials/BankAccountForm.jsx
// Form for adding/updating bank accounts using MUI.
import React, { useState, useEffect } from 'react';
import { addBankAccount, updateBankAccount } from '../../services/api';
import {
  Button, TextField, Grid, Card, CardContent, Typography, Box
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import AlertMessage from '../common/AlertMessage';

const BankAccountForm = ({ onAccountUpdated, accountToEditProp, onCancelEdit }) => {
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (accountToEditProp) {
      setAccountName(accountToEditProp.accountName || '');
      setBankName(accountToEditProp.bankName || '');
      setAccountNumber(accountToEditProp.accountNumber || '');
      setCurrentBalance(accountToEditProp.currentBalance?.toString() || '');
      setCurrency(accountToEditProp.currency || 'INR');
      setNotes(accountToEditProp.notes || '');
      setIsEditing(true);
      setEditingAccountId(accountToEditProp._id);
    } else {
      resetForm();
    }
  }, [accountToEditProp]);

  const resetForm = () => {
    setAccountName('');
    setBankName('');
    setAccountNumber('');
    setCurrentBalance('');
    setCurrency('INR');
    setNotes('');
    setIsEditing(false);
    setEditingAccountId(null);
    // setMessage({ type: '', text: '' }); // Optionally clear message on explicit reset
  };

  const handleInternalCancelEdit = () => {
    resetForm();
    if (onCancelEdit) {
      onCancelEdit(); // Notify parent to clear editing state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const accountData = {
      accountName, bankName, accountNumber,
      currentBalance: parseFloat(currentBalance),
      currency, notes
    };

    try {
      let response;
      if (isEditing && editingAccountId) {
        response = await updateBankAccount(editingAccountId, accountData);
        setMessage({ type: 'success', text: 'Bank account updated successfully!' });
      } else {
        response = await addBankAccount(accountData);
        setMessage({ type: 'success', text: 'Bank account added successfully!' });
      }
      if (onAccountUpdated) onAccountUpdated(response.data);
      
      setTimeout(() => {
        if (!isEditing) resetForm(); // Only reset fully if it was a new add
        else handleInternalCancelEdit(); // If editing, clear form and editing state
      }, 2000);

    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} bank account:`, error);
      setMessage({ type: 'error', text: error.response?.data?.msg || `Failed to ${isEditing ? 'update' : 'add'} bank account.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{mb: 3}}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          {isEditing ? <EditIcon sx={{ mr: 1, color: 'secondary.main' }} /> : <AccountBalanceIcon sx={{ mr: 1, color: 'secondary.main' }} />}
          {isEditing ? 'Edit Bank Account / Update Balance' : 'Add New Bank Account'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                fullWidth
                required
                placeholder="e.g., HDFC Operations"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Bank Name"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                fullWidth
                required
                placeholder="e.g., HDFC Bank"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Number (Optional)"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                fullWidth
                placeholder="e.g., 1234567890"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Balance"
                type="number"
                value={currentBalance}
                onChange={e => setCurrentBalance(e.target.value)}
                fullWidth
                required
                InputProps={{ startAdornment: <Typography sx={{mr:0.5}}>₹</Typography> }}
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="e.g., Main operational account"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing && (
                <Button variant="outlined" onClick={handleInternalCancelEdit} disabled={isLoading}>
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" variant="contained" color="secondary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : null}>
                {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Account' : 'Add Account')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
export default BankAccountForm;
