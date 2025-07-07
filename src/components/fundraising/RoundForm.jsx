// src/components/fundraising/RoundForm.jsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Card, CardContent, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Divider,
  Alert, Chip, Stack
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import AlertMessage from '../common/AlertMessage';
import { createRound, updateRound } from '../../services/api';

const roundStatuses = ['Planning', 'Open', 'Closing', 'Closed'];
const roundTypes = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Bridge', 'Angel', 'Other'];

const RoundForm = ({ onRoundSaved, roundToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    roundType: 'Pre-Seed',
    targetAmount: '',
    equityPercentageOffered: '', // NEW: Key field for calculation
    existingSharesPreRound: '', // NEW: Key field for calculation
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
  const [useAutoCalculation, setUseAutoCalculation] = useState(true); // NEW: Toggle for calculation mode
  const [calculatedValues, setCalculatedValues] = useState(null); // NEW: Preview calculated values

  useEffect(() => {
    if (roundToEdit) {
      setIsEditing(true);
      setFormData({
        name: roundToEdit.name || '',
        roundType: roundToEdit.roundType || 'Pre-Seed',
        targetAmount: roundToEdit.targetAmount?.toString() || '',
        equityPercentageOffered: roundToEdit.equityPercentageOffered?.toString() || '',
        existingSharesPreRound: roundToEdit.existingSharesPreRound?.toString() || '',
        currentValuationPreMoney: roundToEdit.currentValuationPreMoney?.toString() || '',
        currentValuationPostMoney: roundToEdit.currentValuationPostMoney?.toString() || '',
        openDate: roundToEdit.openDate ? new Date(roundToEdit.openDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        targetCloseDate: roundToEdit.targetCloseDate ? new Date(roundToEdit.targetCloseDate).toISOString().split('T')[0] : '',
        status: roundToEdit.status || 'Planning',
        notes: roundToEdit.notes || ''
      });
      
      // Determine if we should use auto-calculation based on existing data
      const hasCalculationFields = roundToEdit.equityPercentageOffered && roundToEdit.existingSharesPreRound;
      setUseAutoCalculation(hasCalculationFields);
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [roundToEdit]);

  const resetForm = () => {
    setFormData({
      name: '', roundType: 'Pre-Seed', targetAmount: '', equityPercentageOffered: '', existingSharesPreRound: '',
      currentValuationPreMoney: '', currentValuationPostMoney: '',
      openDate: new Date().toISOString().split('T')[0], targetCloseDate: '',
      status: 'Planning', notes: ''
    });
    setCalculatedValues(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Trigger calculation preview when key fields change
    if (useAutoCalculation && ['targetAmount', 'equityPercentageOffered', 'existingSharesPreRound'].includes(name)) {
      calculatePreview({ ...formData, [name]: value });
    }
  };

  // NEW: Calculate preview values using corrected formula
  const calculatePreview = (data) => {
    const targetAmount = parseFloat(data.targetAmount) || 0;
    const equityPercentage = parseFloat(data.equityPercentageOffered) || 0;
    const existingShares = parseFloat(data.existingSharesPreRound) || 0;

    if (targetAmount > 0 && equityPercentage > 0 && existingShares > 0) {
      // CORRECTED CALCULATION LOGIC
      const postMoneyValuation = Math.round(targetAmount / (equityPercentage / 100));
      const preMoneyValuation = postMoneyValuation - targetAmount;
      const remainingEquityPercentage = (100 - equityPercentage) / 100;
      const totalSharesAfterFunding = Math.round(existingShares / remainingEquityPercentage);
      const newSharesToIssue = totalSharesAfterFunding - existingShares;
      const pricePerShare = Math.round(postMoneyValuation / totalSharesAfterFunding);

      setCalculatedValues({
        postMoneyValuation,
        preMoneyValuation,
        totalSharesAfterFunding,
        newSharesToIssue,
        pricePerShare,
        founderValueEach: existingShares > 0 ? Math.round((existingShares / 2) * pricePerShare) : 0 // Assuming 2 founders
      });
    } else {
      setCalculatedValues(null);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount) || 0,
      // Include calculation fields for auto-calculation mode
      ...(useAutoCalculation && {
        equityPercentageOffered: parseFloat(formData.equityPercentageOffered) || 0,
        existingSharesPreRound: parseFloat(formData.existingSharesPreRound) || 0,
      }),
      // Include manual valuation fields for manual mode
      ...(!useAutoCalculation && {
        currentValuationPreMoney: parseFloat(formData.currentValuationPreMoney) || null,
        currentValuationPostMoney: parseFloat(formData.currentValuationPostMoney) || null,
      }),
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
            {/* Basic Information */}
            <Grid item xs={12} sm={6}>
              <TextField 
                name="name" 
                label="Round Name (e.g., Pre-Seed FFF)" 
                value={formData.name} 
                onChange={handleInputChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="round-type-label">Round Type</InputLabel>
                <Select 
                  labelId="round-type-label" 
                  name="roundType" 
                  value={formData.roundType} 
                  label="Round Type" 
                  onChange={handleInputChange}
                >
                  {roundTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                name="targetAmount" 
                label="Target Amount (INR)" 
                type="number" 
                value={formData.targetAmount} 
                onChange={handleInputChange} 
                fullWidth 
                required 
                helperText="Amount you want to raise in this round"
              />
            </Grid>

            {/* Calculation Mode Toggle */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={useAutoCalculation}
                    onChange={(e) => {
                      setUseAutoCalculation(e.target.checked);
                      setCalculatedValues(null);
                    }}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalculateIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      Use Automatic Calculation (Recommended)
                    </Typography>
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {useAutoCalculation 
                  ? "Automatically calculate valuations based on equity percentage and existing shares"
                  : "Manually enter pre-money and post-money valuations"
                }
              </Typography>
            </Grid>

            {/* AUTO-CALCULATION MODE */}
            {useAutoCalculation && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="equityPercentageOffered" 
                    label="Equity Percentage Offered (%)" 
                    type="number" 
                    value={formData.equityPercentageOffered} 
                    onChange={handleInputChange} 
                    fullWidth 
                    required
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText="% of company you're giving away to investors"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="existingSharesPreRound" 
                    label="Existing Shares Before Round" 
                    type="number" 
                    value={formData.existingSharesPreRound} 
                    onChange={handleInputChange} 
                    fullWidth 
                    required
                    helperText="Current founder/employee shares (e.g., 12,000)"
                  />
                </Grid>

                {/* CALCULATION PREVIEW */}
                {calculatedValues && (
                  <Grid item xs={12}>
                    <Alert 
                      severity="info" 
                      icon={<CalculateIcon />}
                      sx={{ 
                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
                        border: '1px solid rgba(25, 118, 210, 0.2)'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        📊 Calculated Round Structure
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                        <Chip 
                          label={`Post-Money: ${formatCurrency(calculatedValues.postMoneyValuation)}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`Pre-Money: ${formatCurrency(calculatedValues.preMoneyValuation)}`}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`Price/Share: ₹${calculatedValues.pricePerShare.toLocaleString()}`}
                          color="success"
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Total Shares: {calculatedValues.totalSharesAfterFunding.toLocaleString()} | 
                        New Shares: {calculatedValues.newSharesToIssue.toLocaleString()} | 
                        Founder Value Each: {formatCurrency(calculatedValues.founderValueEach)}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </>
            )}

            {/* MANUAL MODE */}
            {!useAutoCalculation && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="currentValuationPreMoney" 
                    label="Pre-Money Valuation (INR)" 
                    type="number" 
                    value={formData.currentValuationPreMoney} 
                    onChange={handleInputChange} 
                    fullWidth 
                    helperText="Company value before investment"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="currentValuationPostMoney" 
                    label="Post-Money Valuation (INR)" 
                    type="number" 
                    value={formData.currentValuationPostMoney} 
                    onChange={handleInputChange} 
                    fullWidth 
                    helperText="Company value after investment"
                  />
                </Grid>
              </>
            )}

            {/* Dates and Status */}
            <Grid item xs={12} sm={6}>
              <TextField 
                name="openDate" 
                label="Open Date" 
                type="date" 
                value={formData.openDate} 
                onChange={handleInputChange} 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="targetCloseDate" 
                label="Target Close Date" 
                type="date" 
                value={formData.targetCloseDate} 
                onChange={handleInputChange} 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="round-status-label">Status</InputLabel>
                <Select 
                  labelId="round-status-label" 
                  name="status" 
                  value={formData.status} 
                  label="Status" 
                  onChange={handleInputChange}
                >
                  {roundStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField 
                name="notes" 
                label="Notes (Optional)" 
                value={formData.notes} 
                onChange={handleInputChange} 
                fullWidth 
                multiline 
                rows={3} 
                placeholder="Add any additional notes about this round..."
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              {isEditing && (
                <Button 
                  variant="outlined" 
                  onClick={onCancelEdit || resetForm} 
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={isLoading || (useAutoCalculation && !calculatedValues)} 
                startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
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