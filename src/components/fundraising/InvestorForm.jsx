// src/components/fundraising/InvestorForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper, Divider, Autocomplete,Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../common/AlertMessage';
import { addInvestor, updateInvestor, getRounds } from '../../services/api'; // Ensure getRounds is available

const investmentVehicles = ['SAFE', 'Convertible Note', 'Equity', 'Other'];
const investorStatuses = ['Introduced', 'Pitched', 'Soft Committed', 'Hard Committed', 'Invested', 'Declined'];

// Simplified Tranche Input for this form
const InitialTranche = () => ({
    trancheNumber: 1,
    agreedAmount: '',
    receivedAmount: '',
    dateAgreed: new Date().toISOString().split('T')[0],
    dateReceived: '',
    status: 'Pending',
    triggerCondition: ''
});


const InvestorForm = ({ onInvestorSaved, investorToEdit, onCancelEdit }) => {
  const [rounds, setRounds] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    entityName: '',
    investmentVehicle: investmentVehicles[0],
    safeValuationCap: '',
    safeDiscountRate: '',
    noteInterestRate: '',
    noteMaturityDate: '',
    totalCommittedAmount: '', // Will be auto-calculated if tranches are used extensively
    roundId: '',
    status: investorStatuses[0],
    notes: '',
    tranches: [InitialTranche()] // Start with one tranche
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchRoundsData = async () => {
      try {
        const response = await getRounds();
        setRounds(response.data || []);
      } catch (error) {
        console.error("Failed to fetch rounds for investor form:", error);
        setMessage({ type: 'error', text: 'Could not load rounds.' });
      }
    };
    fetchRoundsData();
  }, []);

  useEffect(() => {
    if (investorToEdit) {
      setIsEditing(true);
      setFormData({
        name: investorToEdit.name || '',
        contactPerson: investorToEdit.contactPerson || '',
        email: investorToEdit.email || '',
        phone: investorToEdit.phone || '',
        entityName: investorToEdit.entityName || '',
        investmentVehicle: investorToEdit.investmentVehicle || investmentVehicles[0],
        safeValuationCap: investorToEdit.safeValuationCap?.toString() || '',
        safeDiscountRate: investorToEdit.safeDiscountRate?.toString() || '',
        noteInterestRate: investorToEdit.noteInterestRate?.toString() || '',
        noteMaturityDate: investorToEdit.noteMaturityDate ? new Date(investorToEdit.noteMaturityDate).toISOString().split('T')[0] : '',
        totalCommittedAmount: investorToEdit.totalCommittedAmount?.toString() || '',
        roundId: investorToEdit.roundId?._id || investorToEdit.roundId || '', // Handle populated vs ID
        status: investorToEdit.status || investorStatuses[0],
        notes: investorToEdit.notes || '',
        tranches: investorToEdit.tranches && investorToEdit.tranches.length > 0 
            ? investorToEdit.tranches.map(t => ({
                ...t,
                agreedAmount: t.agreedAmount?.toString() || '',
                receivedAmount: t.receivedAmount?.toString() || '',
                dateAgreed: t.dateAgreed ? new Date(t.dateAgreed).toISOString().split('T')[0] : '',
                dateReceived: t.dateReceived ? new Date(t.dateReceived).toISOString().split('T')[0] : '',
            })) 
            : [InitialTranche()]
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [investorToEdit]);

  const resetForm = () => {
    setFormData({
      name: '', contactPerson: '', email: '', phone: '', entityName: '',
      investmentVehicle: investmentVehicles[0], safeValuationCap: '', safeDiscountRate: '',
      noteInterestRate: '', noteMaturityDate: '', totalCommittedAmount: '',
      roundId: rounds.length > 0 ? rounds[0]._id : '', status: investorStatuses[0], notes: '',
      tranches: [InitialTranche()]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTrancheChange = (index, e) => {
    const { name, value } = e.target;
    const newTranches = [...formData.tranches];
    newTranches[index] = { ...newTranches[index], [name]: value };
    setFormData(prev => ({ ...prev, tranches: newTranches }));
    recalculateTotalCommitted(newTranches);
  };

  const addTrancheField = () => {
    setFormData(prev => ({
      ...prev,
      tranches: [...prev.tranches, { ...InitialTranche(), trancheNumber: prev.tranches.length + 1 }]
    }));
  };

  const removeTrancheField = (index) => {
    if (formData.tranches.length <= 1) return; // Keep at least one
    const newTranches = formData.tranches.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, tranches: newTranches }));
    recalculateTotalCommitted(newTranches);
  };
  
  const recalculateTotalCommitted = (currentTranches) => {
     const total = currentTranches.reduce((sum, t) => sum + (parseFloat(t.agreedAmount) || 0), 0);
     setFormData(prev => ({ ...prev, totalCommittedAmount: total.toString() }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      safeValuationCap: parseFloat(formData.safeValuationCap) || null,
      safeDiscountRate: parseFloat(formData.safeDiscountRate) || null,
      noteInterestRate: parseFloat(formData.noteInterestRate) || null,
      noteMaturityDate: formData.noteMaturityDate || null,
      totalCommittedAmount: parseFloat(formData.totalCommittedAmount) || 0,
      tranches: formData.tranches.map(t => ({
          ...t,
          agreedAmount: parseFloat(t.agreedAmount) || 0,
          receivedAmount: parseFloat(t.receivedAmount) || 0,
          dateAgreed: t.dateAgreed || null,
          dateReceived: t.dateReceived || null,
      }))
    };

    try {
      let response;
      if (isEditing && investorToEdit?._id) {
        response = await updateInvestor(investorToEdit._id, submissionData);
        setMessage({ type: 'success', text: 'Investor updated successfully!' });
      } else {
        response = await addInvestor(submissionData);
        setMessage({ type: 'success', text: 'Investor added successfully!' });
      }
      
      if (onInvestorSaved) onInvestorSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving investor:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save investor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box> {/* Removed Card from here, Dialog will provide framing */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Investor Details' : 'Add New Investor'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Investor Name / Fund Name" value={formData.name} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="investor-round-label">Round</InputLabel>
                <Select labelId="investor-round-label" name="roundId" value={formData.roundId} label="Round" onChange={handleInputChange}>
                  {rounds.map(round => <MenuItem key={round._id} value={round._id}>{round.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="contactPerson" label="Contact Person" value={formData.contactPerson} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone" label="Phone" value={formData.phone} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="entityName" label="Investing Entity (if different)" value={formData.entityName} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="investor-vehicle-label">Investment Vehicle</InputLabel>
                <Select labelId="investor-vehicle-label" name="investmentVehicle" value={formData.investmentVehicle} label="Investment Vehicle" onChange={handleInputChange}>
                  {investmentVehicles.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="investor-status-label">Status</InputLabel>
                <Select labelId="investor-status-label" name="status" value={formData.status} label="Status" onChange={handleInputChange}>
                  {investorStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Conditional fields for SAFE/Note */}
            {(formData.investmentVehicle === 'SAFE' || formData.investmentVehicle === 'Convertible Note') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField name="safeValuationCap" label="Valuation Cap (INR)" type="number" value={formData.safeValuationCap} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="safeDiscountRate" label="Discount Rate (e.g., 0.2 for 20%)" type="number" value={formData.safeDiscountRate} onChange={handleInputChange} fullWidth inputProps={{ step: "0.01" }}/>
                </Grid>
              </>
            )}
            {formData.investmentVehicle === 'Convertible Note' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField name="noteInterestRate" label="Interest Rate (%)" type="number" value={formData.noteInterestRate} onChange={handleInputChange} fullWidth inputProps={{ step: "0.01" }}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="noteMaturityDate" label="Maturity Date" type="date" value={formData.noteMaturityDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{mt:2, mb:1, fontWeight: 500}}>Tranches</Typography>
                {formData.tranches.map((tranche, index) => (
                    <Paper key={index} elevation={0} sx={{p:2, mb:2, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                        <Typography variant="body2" sx={{fontWeight: 'medium', mb:1}}>Tranche {tranche.trancheNumber || index + 1}</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}><TextField name="agreedAmount" label="Agreed Amount" type="number" value={tranche.agreedAmount} onChange={e => handleTrancheChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={6} md={3}><TextField name="receivedAmount" label="Received Amount" type="number" value={tranche.receivedAmount} onChange={e => handleTrancheChange(index, e)} fullWidth /></Grid>
                            <Grid item xs={12} sm={6} md={3}><TextField name="dateAgreed" label="Date Agreed" type="date" value={tranche.dateAgreed} onChange={e => handleTrancheChange(index, e)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                            <Grid item xs={12} sm={6} md={3}><TextField name="dateReceived" label="Date Received" type="date" value={tranche.dateReceived} onChange={e => handleTrancheChange(index, e)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                            <Grid item xs={12} sm={5}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select name="status" value={tranche.status} label="Tranche Status" onChange={e => handleTrancheChange(index, e)}>
                                        {['Pending', 'Partially Received', 'Fully Received', 'Cancelled'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={5}><TextField name="triggerCondition" label="Trigger Condition" value={tranche.triggerCondition} onChange={e => handleTrancheChange(index, e)} fullWidth size="small"/></Grid>
                            <Grid item xs={12} sm={2} sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                                <Tooltip title="Remove Tranche">
                                    <span>
                                    <IconButton onClick={() => removeTrancheField(index)} color="error" disabled={formData.tranches.length <= 1}>
                                        <DeleteIcon />
                                    </IconButton>
                                    </span>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addTrancheField} sx={{mt:1}}>Add Tranche</Button>
            </Grid>

            <Grid item xs={12}>
              <TextField name="totalCommittedAmount" label="Total Committed Amount (INR)" type="number" value={formData.totalCommittedAmount} onChange={handleInputChange} fullWidth required 
                InputProps={{ readOnly: formData.tranches.length > 1 && formData.tranches.some(t => t.agreedAmount) }} // Readonly if auto-calculated
                helperText={formData.tranches.length > 1 && formData.tranches.some(t => t.agreedAmount) ? "Auto-calculated from tranches" : ""}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField name="notes" label="General Notes (Optional)" value={formData.notes} onChange={handleInputChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Investor' : 'Add Investor')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default InvestorForm;
