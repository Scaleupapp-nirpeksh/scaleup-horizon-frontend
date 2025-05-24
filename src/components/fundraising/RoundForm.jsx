// src/components/fundraising/RoundForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Card, CardContent, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AlertMessage from '../common/AlertMessage'; // Assuming you have this
import { createRound, updateRound } from '../../services/api'; // Assuming API functions

const roundStatuses = ['Planning', 'Open', 'Closing', 'Closed'];

const RoundForm = ({ onRoundSaved, roundToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentValuationPreMoney: '',
    currentValuationPostMoney: '',
    openDate: new Date().toISOString().split('T')[0],
    targetCloseDate: '',
    status: 'Planning',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (roundToEdit) {
      setIsEditing(true);
      setFormData({
        name: roundToEdit.name || '',
        targetAmount: roundToEdit.targetAmount?.toString() || '',
        currentValuationPreMoney: roundToEdit.currentValuationPreMoney?.toString() || '',
        currentValuationPostMoney: roundToEdit.currentValuationPostMoney?.toString() || '',
        openDate: roundToEdit.openDate ? new Date(roundToEdit.openDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        targetCloseDate: roundToEdit.targetCloseDate ? new Date(roundToEdit.targetCloseDate).toISOString().split('T')[0] : '',
        status: roundToEdit.status || 'Planning',
        notes: roundToEdit.notes || ''
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [roundToEdit]);

  const resetForm = () => {
    setFormData({
      name: '', targetAmount: '', currentValuationPreMoney: '', currentValuationPostMoney: '',
      openDate: new Date().toISOString().split('T')[0], targetCloseDate: '',
      status: 'Planning', notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentValuationPreMoney: parseFloat(formData.currentValuationPreMoney) || null,
      currentValuationPostMoney: parseFloat(formData.currentValuationPostMoney) || null,
      // Ensure dates are not empty strings if not provided
      targetCloseDate: formData.targetCloseDate || null,
    };

    try {
      let response;
      if (isEditing && roundToEdit?._id) {
        response = await updateRound(roundToEdit._id, submissionData);
        setMessage({ type: 'success', text: 'Round updated successfully!' });
      } else {
        response = await createRound(submissionData);
        setMessage({ type: 'success', text: 'Round created successfully!' });
      }
      
      if (onRoundSaved) onRoundSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving round:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save round.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card elevation={2} sx={{ borderRadius: '12px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {isEditing ? 'Edit Fundraising Round' : 'Create New Fundraising Round'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Round Name (e.g., Pre-Seed)" value={formData.name} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="targetAmount" label="Target Amount (INR)" type="number" value={formData.targetAmount} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="currentValuationPreMoney" label="Pre-Money Valuation (INR)" type="number" value={formData.currentValuationPreMoney} onChange={handleInputChange} fullWidth />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField name="currentValuationPostMoney" label="Post-Money Valuation (INR)" type="number" value={formData.currentValuationPostMoney} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="openDate" label="Open Date" type="date" value={formData.openDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="targetCloseDate" label="Target Close Date" type="date" value={formData.targetCloseDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="round-status-label">Status</InputLabel>
                <Select labelId="round-status-label" name="status" value={formData.status} label="Status" onChange={handleInputChange}>
                  {roundStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Notes (Optional)" value={formData.notes} onChange={handleInputChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Round' : 'Create Round')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoundForm;
