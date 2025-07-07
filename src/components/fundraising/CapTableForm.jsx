// src/components/fundraising/CapTableForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Alert, Chip, 
  Stack, Autocomplete, Switch, FormControlLabel, Tooltip, IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AlertMessage from '../common/AlertMessage';
import { 
  addCapTableEntry, 
  updateCapTableEntry, 
  getRounds, 
  getInvestors 
} from '../../services/api';

const shareholderTypes = ['Founder', 'Investor', 'Employee', 'Advisor', 'ESOP Pool', 'Other'];
const securityTypes = ['Common Stock', 'Preferred Stock', 'SAFE', 'Convertible Note', 'Option Pool', 'Warrants'];

/**
 * Enhanced CapTableForm Component with Round Integration & Calculations
 * 
 * Key Features:
 * - Integration with rounds for automatic share price calculations
 * - Investor linking functionality for seamless data connections
 * - Real-time valuation preview using round pricing
 * - Enhanced validation and error handling
 * - Smart form behavior based on shareholder type
 * - Professional UX with calculation helpers
 */
const CapTableForm = ({ onEntrySaved, entryToEdit, onCancelEdit }) => {
  const [rounds, setRounds] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [linkedInvestor, setLinkedInvestor] = useState(null);
  const [calculationPreview, setCalculationPreview] = useState(null);
  const [formData, setFormData] = useState({
    shareholderName: '',
    shareholderType: shareholderTypes[0],
    numberOfShares: '',
    securityType: securityTypes[0],
    investmentAmount: '',
    grantDate: new Date().toISOString().split('T')[0],
    notes: '',
    roundId: '',
    linkedInvestorId: '',
    useRoundPricing: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch supporting data on component mount
  useEffect(() => {
    const fetchSupportingData = async () => {
      try {
        const [roundsRes, investorsRes] = await Promise.all([
          getRounds(),
          getInvestors()
        ]);
        setRounds(roundsRes.data || []);
        setInvestors(investorsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch supporting data:", error);
        setMessage({ type: 'error', text: 'Could not load rounds and investors data.' });
      }
    };
    fetchSupportingData();
  }, []);

  // Handle editing mode setup
  useEffect(() => {
    if (entryToEdit) {
      setIsEditing(true);
      setFormData({
        shareholderName: entryToEdit.shareholderName || '',
        shareholderType: entryToEdit.shareholderType || shareholderTypes[0],
        numberOfShares: entryToEdit.numberOfShares?.toString() || '',
        securityType: entryToEdit.securityType || securityTypes[0],
        investmentAmount: entryToEdit.investmentAmount?.toString() || '',
        grantDate: entryToEdit.grantDate ? new Date(entryToEdit.grantDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: entryToEdit.notes || '',
        roundId: entryToEdit.roundId || '',
        linkedInvestorId: entryToEdit.linkedInvestorId || '',
        useRoundPricing: !!entryToEdit.roundId
      });
      
      // Set selected round and linked investor for editing
      if (entryToEdit.roundId && rounds.length > 0) {
        const round = rounds.find(r => r._id === entryToEdit.roundId);
        setSelectedRound(round);
      }
      
      if (entryToEdit.linkedInvestorId && investors.length > 0) {
        const investor = investors.find(i => i._id === entryToEdit.linkedInvestorId);
        setLinkedInvestor(investor);
      }
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [entryToEdit, rounds, investors]);

  // Calculate preview when relevant fields change
  useEffect(() => {
    if (formData.useRoundPricing && selectedRound && formData.investmentAmount) {
      calculateSharesFromInvestment();
    } else if (selectedRound && formData.numberOfShares) {
      calculateValueFromShares();
    } else {
      setCalculationPreview(null);
    }
  }, [formData.investmentAmount, formData.numberOfShares, selectedRound, formData.useRoundPricing]);

  const resetForm = () => {
    setFormData({
      shareholderName: '', shareholderType: shareholderTypes[0], numberOfShares: '',
      securityType: securityTypes[0], investmentAmount: '',
      grantDate: new Date().toISOString().split('T')[0], notes: '',
      roundId: '', linkedInvestorId: '', useRoundPricing: false
    });
    setSelectedRound(null);
    setLinkedInvestor(null);
    setCalculationPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Handle round selection
    if (name === 'roundId') {
      const round = rounds.find(r => r._id === value);
      setSelectedRound(round);
    }
  };

  // Handle investor linking
  const handleInvestorChange = (event, newValue) => {
    setLinkedInvestor(newValue);
    setFormData(prev => ({ 
      ...prev, 
      linkedInvestorId: newValue?._id || '',
      shareholderName: newValue ? newValue.name : prev.shareholderName
    }));
  };

  // Calculate shares from investment amount using round pricing
  const calculateSharesFromInvestment = () => {
    if (!selectedRound?.pricePerShare || !formData.investmentAmount) return;
    
    const investmentAmount = parseFloat(formData.investmentAmount);
    const shares = Math.round(investmentAmount / selectedRound.pricePerShare);
    const exactValue = investmentAmount / selectedRound.pricePerShare;
    
    setCalculationPreview({
      type: 'sharesFromInvestment',
      shares,
      exactShares: exactValue,
      pricePerShare: selectedRound.pricePerShare,
      totalValue: investmentAmount,
      roundName: selectedRound.name
    });
  };

  // Calculate value from shares using round pricing
  const calculateValueFromShares = () => {
    if (!selectedRound?.pricePerShare || !formData.numberOfShares) return;
    
    const shares = parseFloat(formData.numberOfShares);
    const value = shares * selectedRound.pricePerShare;
    
    setCalculationPreview({
      type: 'valueFromShares',
      shares,
      pricePerShare: selectedRound.pricePerShare,
      totalValue: value,
      roundName: selectedRound.name
    });
  };

  // Apply calculated shares to form
  const applyCalculatedShares = () => {
    if (calculationPreview?.shares) {
      setFormData(prev => ({ 
        ...prev, 
        numberOfShares: calculationPreview.shares.toString() 
      }));
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount >= 10000000) { // 1 Crore
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) { // 1 Lakh
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.shareholderName.trim()) {
      setMessage({ type: 'error', text: 'Shareholder name is required.' });
      setIsLoading(false);
      return;
    }

    if (!formData.numberOfShares || parseFloat(formData.numberOfShares) <= 0) {
      setMessage({ type: 'error', text: 'Number of shares must be greater than 0.' });
      setIsLoading(false);
      return;
    }

    const submissionData = {
      ...formData,
      numberOfShares: parseFloat(formData.numberOfShares) || 0,
      investmentAmount: parseFloat(formData.investmentAmount) || null,
      grantDate: formData.grantDate || null,
      roundId: formData.roundId || null,
      linkedInvestorId: formData.linkedInvestorId || null
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
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Cap Table Entry' : 'Add New Cap Table Entry'}
        </Typography>
        
        <AlertMessage message={message.text} severity={message.type || 'info'} />

        {/* Calculation Preview */}
        {calculationPreview && (
          <Alert 
            severity="info" 
            icon={<CalculateIcon />}
            action={
              calculationPreview.type === 'sharesFromInvestment' && (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={applyCalculatedShares}
                  startIcon={<SaveIcon />}
                >
                  Apply
                </Button>
              )
            }
            sx={{ 
              mb: 2,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              📊 Calculation Preview ({calculationPreview.roundName})
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Chip 
                label={`${calculationPreview.shares.toLocaleString()} Shares`}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`${formatCurrency(calculationPreview.pricePerShare)}/share`}
                color="secondary"
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`Total: ${formatCurrency(calculationPreview.totalValue)}`}
                color="success"
                size="small"
                variant="outlined"
              />
            </Stack>
            {calculationPreview.exactShares && calculationPreview.exactShares !== calculationPreview.shares && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Exact shares: {calculationPreview.exactShares.toFixed(2)} (rounded to {calculationPreview.shares})
              </Typography>
            )}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            {/* SHAREHOLDER DETAILS */}
            <Grid item xs={12} sm={6}>
              <TextField 
                name="shareholderName" 
                label="Shareholder Name" 
                value={formData.shareholderName} 
                onChange={handleInputChange} 
                fullWidth 
                required 
                error={!formData.shareholderName.trim()}
                helperText={!formData.shareholderName.trim() ? "Shareholder name is required" : ""}
                disabled={!!linkedInvestor}
                InputProps={{
                  startAdornment: linkedInvestor && (
                    <Tooltip title={`Linked to investor: ${linkedInvestor.name}`}>
                      <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="shareholder-type-label">Shareholder Type</InputLabel>
                <Select 
                  labelId="shareholder-type-label" 
                  name="shareholderType" 
                  value={formData.shareholderType} 
                  label="Shareholder Type" 
                  onChange={handleInputChange}
                >
                  {shareholderTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type === 'Founder' && <PersonIcon sx={{ mr: 1, fontSize: 16 }} />}
                      {type === 'Investor' && <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />}
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* INVESTOR LINKING */}
            {formData.shareholderType === 'Investor' && (
              <Grid item xs={12}>
                <Autocomplete
                  options={investors}
                  getOptionLabel={(option) => option.name || ''}
                  value={linkedInvestor}
                  onChange={handleInvestorChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Link to Existing Investor (Optional)"
                      helperText="Connect this cap table entry to an investor record"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(option.totalCommittedAmount || 0)} committed
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            )}

            {/* ROUND INTEGRATION */}
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.useRoundPricing}
                      onChange={handleInputChange}
                      name="useRoundPricing"
                      color="primary"
                    />
                  }
                  label="Use Round-Based Pricing"
                />
                <Tooltip title="Enable to automatically calculate shares based on round pricing">
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Stack>
              
              {formData.useRoundPricing && (
                <FormControl fullWidth>
                  <InputLabel id="round-label">Pricing Round</InputLabel>
                  <Select
                    labelId="round-label"
                    name="roundId"
                    value={formData.roundId}
                    label="Pricing Round"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Select a round</em>
                    </MenuItem>
                    {rounds
                      .filter(r => r.pricePerShare > 0)
                      .map(round => (
                        <MenuItem key={round._id} value={round._id}>
                          <Box>
                            <Typography variant="body2">{round.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{round.pricePerShare?.toLocaleString()}/share
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </Grid>

            {/* SHARES AND INVESTMENT */}
            <Grid item xs={12} sm={6}>
              <TextField 
                name="numberOfShares" 
                label="Number of Shares/Units" 
                type="number" 
                value={formData.numberOfShares} 
                onChange={handleInputChange} 
                fullWidth 
                required
                error={!formData.numberOfShares || parseFloat(formData.numberOfShares) <= 0}
                helperText={
                  !formData.numberOfShares || parseFloat(formData.numberOfShares) <= 0
                    ? "Number of shares is required"
                    : selectedRound?.pricePerShare 
                      ? `Value: ${formatCurrency(parseFloat(formData.numberOfShares) * selectedRound.pricePerShare)}`
                      : ""
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                name="investmentAmount" 
                label="Investment Amount (INR)" 
                type="number" 
                value={formData.investmentAmount} 
                onChange={handleInputChange} 
                fullWidth 
                helperText={
                  formData.useRoundPricing && selectedRound?.pricePerShare
                    ? "Enter amount to auto-calculate shares"
                    : "Investment amount (if applicable)"
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* SECURITY DETAILS */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="security-type-label">Security Type</InputLabel>
                <Select 
                  labelId="security-type-label" 
                  name="securityType" 
                  value={formData.securityType} 
                  label="Security Type" 
                  onChange={handleInputChange}
                >
                  {securityTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                name="grantDate" 
                label="Grant/Issue Date" 
                type="date" 
                value={formData.grantDate} 
                onChange={handleInputChange} 
                InputLabelProps={{ shrink: true }} 
                fullWidth 
              />
            </Grid>

            {/* NOTES */}
            <Grid item xs={12}>
              <TextField 
                name="notes" 
                label="Notes (Optional)" 
                value={formData.notes} 
                onChange={handleInputChange} 
                fullWidth 
                multiline 
                rows={3} 
                placeholder="Additional notes about this cap table entry..."
              />
            </Grid>

            {/* SUBMIT BUTTONS */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
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
                disabled={isLoading} 
                startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
              >
                {isLoading ? 'Saving...' : (isEditing ? 'Update Entry' : 'Add Entry')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default CapTableForm;