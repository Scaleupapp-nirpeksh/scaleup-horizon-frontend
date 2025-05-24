// src/components/fundraising/CapTableForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AlertMessage from '../common/AlertMessage';
import { addCapTableEntry, updateCapTableEntry } from '../../services/api';

const shareholderTypes = ['Founder', 'Investor', 'ESOP Pool', 'Other'];
const securityTypes = ['Common Stock', 'Preferred Stock', 'SAFE', 'Convertible Note', 'Option Pool'];

const CapTableForm = ({ onEntrySaved, entryToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    shareholderName: '',
    shareholderType: shareholderTypes[0],
    numberOfShares: '',
    // percentageOwnership: '', // This is often calculated, not directly input
    securityType: securityTypes[0],
    investmentAmount: '',
    grantDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setIsEditing(true);
      setFormData({
        shareholderName: entryToEdit.shareholderName || '',
        shareholderType: entryToEdit.shareholderType || shareholderTypes[0],
        numberOfShares: entryToEdit.numberOfShares?.toString() || '',
        // percentageOwnership: entryToEdit.percentageOwnership?.toString() || '',
        securityType: entryToEdit.securityType || securityTypes[0],
        investmentAmount: entryToEdit.investmentAmount?.toString() || '',
        grantDate: entryToEdit.grantDate ? new Date(entryToEdit.grantDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: entryToEdit.notes || ''
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [entryToEdit]);

  const resetForm = () => {
    setFormData({
      shareholderName: '', shareholderType: shareholderTypes[0], numberOfShares: '',
      securityType: securityTypes[0], investmentAmount: '',
      grantDate: new Date().toISOString().split('T')[0], notes: ''
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
      numberOfShares: parseFloat(formData.numberOfShares) || null, // Allow null if not applicable
      // percentageOwnership: parseFloat(formData.percentageOwnership) || null,
      investmentAmount: parseFloat(formData.investmentAmount) || null,
      grantDate: formData.grantDate || null,
    };

    try {
      let response;
      if (isEditing && entryToEdit?._id) {
        response = await updateCapTableEntry(entryToEdit._id, submissionData);
        setMessage({ type: 'success', text: 'Cap table entry updated successfully!' });
      } else {
        response = await addCapTableEntry(submissionData);
        setMessage({ type: 'success', text: 'Cap table entry added successfully!' });
      }
      
      if (onEntrySaved) onEntrySaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving cap table entry:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save entry.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box> {/* Removed Card from here, Dialog will provide framing */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Cap Table Entry' : 'Add New Cap Table Entry'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField name="shareholderName" label="Shareholder Name" value={formData.shareholderName} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="shareholder-type-label">Shareholder Type</InputLabel>
                <Select labelId="shareholder-type-label" name="shareholderType" value={formData.shareholderType} label="Shareholder Type" onChange={handleInputChange}>
                  {shareholderTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="numberOfShares" label="Number of Shares/Units" type="number" value={formData.numberOfShares} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="security-type-label">Security Type</InputLabel>
                <Select labelId="security-type-label" name="securityType" value={formData.securityType} label="Security Type" onChange={handleInputChange}>
                  {securityTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="investmentAmount" label="Investment Amount (INR, if applicable)" type="number" value={formData.investmentAmount} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="grantDate" label="Grant/Issue Date" type="date" value={formData.grantDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Notes (Optional)" value={formData.notes} onChange={handleInputChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Add Entry')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default CapTableForm;
