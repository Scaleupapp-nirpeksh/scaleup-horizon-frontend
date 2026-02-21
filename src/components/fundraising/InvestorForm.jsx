// src/components/fundraising/InvestorForm.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper, 
  Tooltip, Alert, Chip, Stack
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CalculateIcon from '@mui/icons-material/Calculate';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AlertMessage from '../common/AlertMessage';
import { addInvestor, updateInvestor, getRounds, previewInvestmentImpact } from '../../services/api';

const investmentVehicles = ['SAFE', 'Convertible Note', 'Equity', 'Other'];
const investorStatuses = ['Introduced', 'Pitched', 'Soft Committed', 'Hard Committed', 'Invested', 'Declined'];

// ✅ FIX: Enhanced InitialTranche with proper default values
const InitialTranche = () => ({
    trancheNumber: 1,
    agreedAmount: '',
    receivedAmount: '0',
    dateAgreed: new Date().toISOString().split('T')[0],
    dateReceived: '',
    status: 'Pending',
    triggerCondition: '',
    paymentMethod: '',
    transactionReference: '',
    notes: ''
});

/**
 * Enhanced InvestorForm Component with COMPLETE TRANCHE SUPPORT
 * 
 * Key Features:
 * - Real-time equity calculation preview using round's fixed price per share
 * - Investment impact visualization showing shares, equity %, and remaining pool
 * - Enhanced tranche management with automatic total calculation
 * - Proper validation and error handling for equity calculations
 * - Integration with corrected fundraising calculation service
 * - FIXED: Proper tranche data handling and submission
 */
const InvestorForm = ({ onInvestorSaved, investorToEdit, onCancelEdit }) => {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [investmentPreview, setInvestmentPreview] = useState(null);
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
    totalCommittedAmount: '',
    roundId: '',
    status: investorStatuses[0],
    notes: '',
    tranches: [InitialTranche()]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ✅ FIX: Enhanced rounds fetching with error handling
  useEffect(() => {
    const fetchRoundsData = async () => {
      try {
        console.log('🔄 Fetching rounds for investor form...');
        const response = await getRounds();
        const roundsData = Array.isArray(response.data) ? response.data : 
                         response.data?.rounds || [];
        
        console.log('✅ Rounds loaded:', roundsData.length);
        setRounds(roundsData);
        
        // Auto-select first round if available and no editing
        if (roundsData.length > 0 && !investorToEdit) {
          setFormData(prev => ({ ...prev, roundId: roundsData[0]._id }));
          setSelectedRound(roundsData[0]);
          console.log('🎯 Auto-selected round:', roundsData[0].name);
        }
      } catch (error) {
        console.error("❌ Failed to fetch rounds for investor form:", error);
        setMessage({ type: 'error', text: 'Could not load rounds.' });
      }
    };
    fetchRoundsData();
  }, [investorToEdit]);

  // ✅ FIX: Enhanced editing mode setup with proper tranche handling
  useEffect(() => {
    if (investorToEdit) {
      console.log('✏️  Setting up editing mode for:', investorToEdit.name);
      console.log('📊 Investor tranches:', investorToEdit.tranches);
      
      setIsEditing(true);
      
      // ✅ FIX: Properly handle existing tranches or create default
      const existingTranches = investorToEdit.tranches && Array.isArray(investorToEdit.tranches) && investorToEdit.tranches.length > 0
        ? investorToEdit.tranches.map((t, index) => ({
            trancheNumber: t.trancheNumber || (index + 1),
            agreedAmount: t.agreedAmount?.toString() || '',
            receivedAmount: (t.receivedAmount || 0).toString(),
            dateAgreed: t.dateAgreed ? new Date(t.dateAgreed).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dateReceived: t.dateReceived ? new Date(t.dateReceived).toISOString().split('T')[0] : '',
            status: t.status || 'Pending',
            triggerCondition: t.triggerCondition || '',
            paymentMethod: t.paymentMethod || '',
            transactionReference: t.transactionReference || '',
            notes: t.notes || ''
          }))
        : [{ 
            ...InitialTranche(), 
            agreedAmount: investorToEdit.totalCommittedAmount?.toString() || '',
            receivedAmount: (investorToEdit.totalReceivedAmount || 0).toString()
          }];
      
      console.log('🔧 Processed tranches for editing:', existingTranches);
      
      setFormData({
        name: investorToEdit.name || '',
        contactPerson: investorToEdit.contactPerson || investorToEdit.name || '',
        email: investorToEdit.email || '',
        phone: investorToEdit.phone || '',
        entityName: investorToEdit.entityName || '',
        investmentVehicle: investorToEdit.investmentVehicle || investmentVehicles[0],
        safeValuationCap: investorToEdit.safeValuationCap?.toString() || '',
        safeDiscountRate: investorToEdit.safeDiscountRate?.toString() || '',
        noteInterestRate: investorToEdit.noteInterestRate?.toString() || '',
        noteMaturityDate: investorToEdit.noteMaturityDate ? new Date(investorToEdit.noteMaturityDate).toISOString().split('T')[0] : '',
        totalCommittedAmount: investorToEdit.totalCommittedAmount?.toString() || '',
        roundId: investorToEdit.roundId?._id || investorToEdit.roundId || '',
        status: investorToEdit.status || investorStatuses[0],
        notes: investorToEdit.notes || '',
        tranches: existingTranches
      });
      
      // Find and set the selected round for editing
      if (rounds.length > 0) {
        const editRound = rounds.find(r => r._id === (investorToEdit.roundId?._id || investorToEdit.roundId));
        if (editRound) {
          setSelectedRound(editRound);
          console.log('🎯 Selected round for editing:', editRound.name);
        }
      }
    } else {
      setIsEditing(false);
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorToEdit, rounds]);

  // Trigger investment preview when key fields change
  useEffect(() => {
    if (selectedRound && formData.totalCommittedAmount && parseFloat(formData.totalCommittedAmount) > 0) {
      calculateInvestmentPreview();
    } else {
      setInvestmentPreview(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRound, formData.totalCommittedAmount]);

  const resetForm = () => {
    const defaultTranche = InitialTranche();
    setFormData({
      name: '', contactPerson: '', email: '', phone: '', entityName: '',
      investmentVehicle: investmentVehicles[0], safeValuationCap: '', safeDiscountRate: '',
      noteInterestRate: '', noteMaturityDate: '', totalCommittedAmount: '',
      roundId: rounds.length > 0 ? rounds[0]._id : '', status: investorStatuses[0], notes: '',
      tranches: [defaultTranche]
    });
    setInvestmentPreview(null);
    setSelectedRound(rounds.length > 0 ? rounds[0] : null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle round selection change
    if (name === 'roundId') {
      const round = rounds.find(r => r._id === value);
      setSelectedRound(round);
      console.log('🔄 Round changed to:', round?.name);
    }
  };

  // ✅ FIX: Enhanced tranche change handler with better logging
  const handleTrancheChange = (index, e) => {
    const { name, value } = e.target;
    console.log(`🔧 Tranche ${index + 1} field "${name}" changed to:`, value);
    
    const newTranches = [...formData.tranches];
    newTranches[index] = { ...newTranches[index], [name]: value };
    
    setFormData(prev => ({ ...prev, tranches: newTranches }));
    
    // ✅ FIX: Recalculate total when agreed amounts change
    if (name === 'agreedAmount') {
      recalculateTotalCommitted(newTranches);
    }
  };

  const addTrancheField = () => {
    const newTranche = { 
      ...InitialTranche(), 
      trancheNumber: formData.tranches.length + 1 
    };
    
    setFormData(prev => ({
      ...prev,
      tranches: [...prev.tranches, newTranche]
    }));
    
    console.log('➕ Added new tranche. Total tranches:', formData.tranches.length + 1);
  };

  const removeTrancheField = (index) => {
    if (formData.tranches.length <= 1) {
      console.log('⚠️  Cannot remove last tranche');
      return; // Keep at least one
    }
    
    const newTranches = formData.tranches.filter((_, i) => i !== index);
    // Renumber tranches
    const renumberedTranches = newTranches.map((tranche, i) => ({ 
      ...tranche, 
      trancheNumber: i + 1 
    }));
    
    setFormData(prev => ({ ...prev, tranches: renumberedTranches }));
    recalculateTotalCommitted(renumberedTranches);
    
    console.log('➖ Removed tranche', index + 1, '. Remaining tranches:', renumberedTranches.length);
  };
  
  // ✅ FIX: Enhanced total commitment calculation
  const recalculateTotalCommitted = (currentTranches) => {
    const total = currentTranches.reduce((sum, t) => {
      const amount = parseFloat(t.agreedAmount) || 0;
      return sum + amount;
    }, 0);
    
    console.log('💰 Recalculated total committed:', total);
    setFormData(prev => ({ ...prev, totalCommittedAmount: total.toString() }));
  };

  /**
   * Calculate investment impact using the round's fixed valuation structure
   * CORRECTED: Uses round's pricePerShare and totalSharesOutstanding
   */
  const calculateInvestmentPreview = async () => {
    if (!selectedRound || !formData.totalCommittedAmount || parseFloat(formData.totalCommittedAmount) <= 0) {
      setInvestmentPreview(null);
      return;
    }

    // Check if round has proper calculation fields
    if (!selectedRound.pricePerShare || !selectedRound.totalSharesOutstanding) {
      setInvestmentPreview({
        error: 'Selected round needs target amount and equity percentage to calculate investment impact'
      });
      return;
    }

    setPreviewLoading(true);
    try {
      const response = await previewInvestmentImpact(selectedRound._id, {
        investmentAmount: parseFloat(formData.totalCommittedAmount)
      });
      
      setInvestmentPreview(response.data);
      console.log('📊 Investment preview calculated:', response.data);
    } catch (error) {
      console.error('❌ Error calculating investment preview:', error);
      // Fallback to client-side calculation
      const investmentAmount = parseFloat(formData.totalCommittedAmount);
      const shares = Math.round(investmentAmount / selectedRound.pricePerShare);
      const equityPercentage = (shares / selectedRound.totalSharesOutstanding) * 100;
      
      const fallbackPreview = {
        shares,
        equityPercentage: Math.round(equityPercentage * 100) / 100,
        sharePrice: selectedRound.pricePerShare,
        currentValuation: selectedRound.currentValuationPostMoney,
        remainingEquityPool: selectedRound.equityPercentageOffered - equityPercentage,
        isClientCalculated: true
      };
      
      setInvestmentPreview(fallbackPreview);
      console.log('📊 Fallback preview calculated:', fallbackPreview);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ✅ FIX: Enhanced form submission with comprehensive validation and logging
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    console.log('📤 Form submission started');
    console.log('📋 Form data:', formData);

    // ✅ FIX: Enhanced validation
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Investor name is required.' });
      setIsLoading(false);
      return;
    }

    if (!formData.roundId) {
      setMessage({ type: 'error', text: 'Please select a funding round.' });
      setIsLoading(false);
      return;
    }

    if (!formData.totalCommittedAmount || parseFloat(formData.totalCommittedAmount) <= 0) {
      setMessage({ type: 'error', text: 'Total committed amount must be greater than 0.' });
      setIsLoading(false);
      return;
    }

    // ✅ FIX: Validate tranches - at least one must have valid agreed amount
    const validTranches = formData.tranches.filter(t => 
      t.agreedAmount && parseFloat(t.agreedAmount) > 0
    );

    if (validTranches.length === 0) {
      setMessage({ 
        type: 'error', 
        text: 'At least one tranche with an agreed amount greater than 0 is required.' 
      });
      setIsLoading(false);
      return;
    }

    // ✅ FIX: Enhanced data preparation with proper type conversion
    const submissionData = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson?.trim() || formData.name.trim(),
      email: formData.email?.trim() || '',
      phone: formData.phone?.trim() || '',
      entityName: formData.entityName?.trim() || '',
      investmentVehicle: formData.investmentVehicle,
      safeValuationCap: formData.safeValuationCap ? parseFloat(formData.safeValuationCap) : null,
      safeDiscountRate: formData.safeDiscountRate ? parseFloat(formData.safeDiscountRate) : null,
      noteInterestRate: formData.noteInterestRate ? parseFloat(formData.noteInterestRate) : null,
      noteMaturityDate: formData.noteMaturityDate || null,
      totalCommittedAmount: parseFloat(formData.totalCommittedAmount),
      roundId: formData.roundId,
      status: formData.status,
      notes: formData.notes?.trim() || '',
      // ✅ FIX: Properly process tranches with all required fields
      tranches: formData.tranches.map((t, index) => {
        const processedTranche = {
          trancheNumber: t.trancheNumber || (index + 1),
          agreedAmount: parseFloat(t.agreedAmount) || 0,
          receivedAmount: parseFloat(t.receivedAmount) || 0,
          dateAgreed: t.dateAgreed || null,
          dateReceived: t.dateReceived || null,
          status: t.status || 'Pending',
          triggerCondition: t.triggerCondition?.trim() || '',
          paymentMethod: t.paymentMethod?.trim() || '',
          transactionReference: t.transactionReference?.trim() || '',
          notes: t.notes?.trim() || ''
        };
        
        console.log(`📊 Processed tranche ${index + 1}:`, processedTranche);
        return processedTranche;
      })
    };

    console.log('📤 Final submission data:', submissionData);
    console.log('📊 Tranches being submitted:', submissionData.tranches);

    try {
      let response;
      if (isEditing && investorToEdit?._id) {
        console.log('✏️  Updating existing investor:', investorToEdit._id);
        response = await updateInvestor(investorToEdit._id, submissionData);
        setMessage({ 
          type: 'success', 
          text: `Investor "${submissionData.name}" updated successfully! Equity allocation recalculated.` 
        });
      } else {
        console.log('➕ Creating new investor');
        response = await addInvestor(submissionData);
        setMessage({ 
          type: 'success', 
          text: `Investor "${submissionData.name}" added successfully! Equity allocation calculated automatically.` 
        });
      }
      
      console.log('✅ Investor saved successfully:', response.data);
      
      if (onInvestorSaved) onInvestorSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("❌ Error saving investor:", error);
      console.error("❌ Error response:", error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.msg || 'Failed to save investor. Please check all fields and try again.' 
      });
    } finally {
      setIsLoading(false);
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

  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Investor Details' : 'Add New Investor'}
          {selectedRound && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
              Round: {selectedRound.name} | Price: ₹{selectedRound.pricePerShare?.toLocaleString() || 'Not calculated'}/share
            </Typography>
          )}
        </Typography>

        <AlertMessage message={message.text} severity={message.type || 'info'} />

        {/* INVESTMENT IMPACT PREVIEW */}
        {investmentPreview && !investmentPreview.error && (
          <Alert 
            severity="info" 
            icon={<CalculateIcon />}
            sx={{ 
              mb: 2,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              📊 Investment Impact Preview
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
              <Chip 
                label={`${investmentPreview.shares?.toLocaleString() || 0} Shares`}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`${investmentPreview.equityPercentage || 0}% Equity`}
                color="secondary"
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`${formatCurrency(investmentPreview.sharePrice || 0)}/share`}
                color="success"
                size="small"
                variant="outlined"
              />
            </Stack>
            {investmentPreview.remainingEquityPool !== undefined && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Remaining equity pool: {Math.max(0, investmentPreview.remainingEquityPool).toFixed(2)}%
                {investmentPreview.isClientCalculated && ' (Estimated)'}
              </Typography>
            )}
          </Alert>
        )}

        {/* ERROR ALERT FOR ROUND ISSUES */}
        {investmentPreview?.error && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            {investmentPreview.error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            {/* BASIC INVESTOR INFO */}
            <Grid item xs={12} sm={6}>
              <TextField 
                name="name" 
                label="Investor Name / Fund Name" 
                value={formData.name} 
                onChange={handleInputChange} 
                fullWidth 
                required 
                error={!formData.name.trim()}
                helperText={!formData.name.trim() ? "Investor name is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!formData.roundId}>
                <InputLabel id="investor-round-label">Funding Round</InputLabel>
                <Select 
                  labelId="investor-round-label" 
                  name="roundId" 
                  value={formData.roundId} 
                  label="Funding Round" 
                  onChange={handleInputChange}
                >
                  {rounds.map(round => (
                    <MenuItem key={round._id} value={round._id}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {round.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target: {formatCurrency(round.targetAmount || 0)} | 
                          {round.pricePerShare ? ` ₹${round.pricePerShare.toLocaleString()}/share` : ' Price not set'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {!formData.roundId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    Please select a funding round
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* CONTACT INFO */}
            <Grid item xs={12} sm={6}>
              <TextField 
                name="contactPerson" 
                label="Contact Person" 
                value={formData.contactPerson} 
                onChange={handleInputChange} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="email" 
                label="Email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="phone" 
                label="Phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                fullWidth 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="entityName" 
                label="Investing Entity (if different)" 
                value={formData.entityName} 
                onChange={handleInputChange} 
                fullWidth 
              />
            </Grid>

            {/* INVESTMENT DETAILS */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="investor-vehicle-label">Investment Vehicle</InputLabel>
                <Select 
                  labelId="investor-vehicle-label" 
                  name="investmentVehicle" 
                  value={formData.investmentVehicle} 
                  label="Investment Vehicle" 
                  onChange={handleInputChange}
                >
                  {investmentVehicles.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="investor-status-label">Status</InputLabel>
                <Select 
                  labelId="investor-status-label" 
                  name="status" 
                  value={formData.status} 
                  label="Status" 
                  onChange={handleInputChange}
                >
                  {investorStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* CONDITIONAL FIELDS FOR SAFE/NOTE */}
            {(formData.investmentVehicle === 'SAFE' || formData.investmentVehicle === 'Convertible Note') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="safeValuationCap" 
                    label="Valuation Cap (INR)" 
                    type="number" 
                    value={formData.safeValuationCap} 
                    onChange={handleInputChange} 
                    fullWidth 
                    helperText="Maximum valuation for conversion"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="safeDiscountRate" 
                    label="Discount Rate (e.g., 0.2 for 20%)" 
                    type="number" 
                    value={formData.safeDiscountRate} 
                    onChange={handleInputChange} 
                    fullWidth 
                    inputProps={{ step: "0.01", min: 0, max: 1 }}
                    helperText="Discount from next round price"
                  />
                </Grid>
              </>
            )}
            
            {formData.investmentVehicle === 'Convertible Note' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="noteInterestRate" 
                    label="Interest Rate (%)" 
                    type="number" 
                    value={formData.noteInterestRate} 
                    onChange={handleInputChange} 
                    fullWidth 
                    inputProps={{ step: "0.01", min: 0 }}
                    helperText="Annual interest rate"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="noteMaturityDate" 
                    label="Maturity Date" 
                    type="date" 
                    value={formData.noteMaturityDate} 
                    onChange={handleInputChange} 
                    InputLabelProps={{ shrink: true }} 
                    fullWidth 
                    helperText="Note conversion deadline"
                  />
                </Grid>
              </>
            )}
            
            {/* ✅ FIX: ENHANCED TRANCHES SECTION */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{mt:2, mb:1, fontWeight: 500}}>
                  Investment Tranches
                  <Tooltip title="Split the total investment into multiple payments with different timelines">
                    <InfoIcon sx={{ fontSize: 16, ml: 1, color: 'text.secondary' }} />
                  </Tooltip>
                </Typography>
                {formData.tranches.map((tranche, index) => (
                    <Paper key={index} elevation={0} sx={{p:2, mb:2, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                        <Typography variant="body2" sx={{fontWeight: 'medium', mb:1}}>
                          Tranche {tranche.trancheNumber || index + 1}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField 
                                name="agreedAmount" 
                                label="Agreed Amount *" 
                                type="number" 
                                value={tranche.agreedAmount} 
                                onChange={e => handleTrancheChange(index, e)} 
                                fullWidth 
                                required
                                inputProps={{ min: 0 }}
                                helperText="Committed amount"
                                error={!tranche.agreedAmount || parseFloat(tranche.agreedAmount) <= 0}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField 
                                name="receivedAmount" 
                                label="Received Amount" 
                                type="number" 
                                value={tranche.receivedAmount} 
                                onChange={e => handleTrancheChange(index, e)} 
                                fullWidth 
                                inputProps={{ 
                                  min: 0, 
                                  max: parseFloat(tranche.agreedAmount) || undefined 
                                }}
                                helperText="Actually received"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField 
                                name="dateAgreed" 
                                label="Date Agreed" 
                                type="date" 
                                value={tranche.dateAgreed} 
                                onChange={e => handleTrancheChange(index, e)} 
                                InputLabelProps={{ shrink: true }} 
                                fullWidth 
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField 
                                name="dateReceived" 
                                label="Date Received" 
                                type="date" 
                                value={tranche.dateReceived} 
                                onChange={e => handleTrancheChange(index, e)} 
                                InputLabelProps={{ shrink: true }} 
                                fullWidth 
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select 
                                      name="status" 
                                      value={tranche.status} 
                                      label="Tranche Status" 
                                      onChange={e => handleTrancheChange(index, e)}
                                    >
                                        {['Pending', 'Partially Received', 'Fully Received', 'Cancelled'].map(s => (
                                          <MenuItem key={s} value={s}>{s}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField 
                                name="triggerCondition" 
                                label="Trigger Condition" 
                                value={tranche.triggerCondition} 
                                onChange={e => handleTrancheChange(index, e)} 
                                fullWidth 
                                size="small"
                                placeholder="e.g., Milestone completion, next round..."
                                helperText="When this tranche should be paid"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField 
                                name="paymentMethod" 
                                label="Payment Method" 
                                value={tranche.paymentMethod} 
                                onChange={e => handleTrancheChange(index, e)} 
                                fullWidth 
                                size="small"
                                placeholder="e.g., Wire Transfer, Check..."
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField 
                                name="transactionReference" 
                                label="Transaction Reference" 
                                value={tranche.transactionReference} 
                                onChange={e => handleTrancheChange(index, e)} 
                                fullWidth 
                                size="small"
                                placeholder="Bank reference or check number"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField 
                                name="notes" 
                                label="Tranche Notes" 
                                value={tranche.notes} 
                                onChange={e => handleTrancheChange(index, e)} 
                                fullWidth 
                                size="small"
                                placeholder="Additional notes for this tranche"
                              />
                            </Grid>
                            <Grid item xs={12} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                <Tooltip title={formData.tranches.length <= 1 ? "At least one tranche required" : "Remove Tranche"}>
                                    <span>
                                    <IconButton 
                                      onClick={() => removeTrancheField(index)} 
                                      color="error" 
                                      disabled={formData.tranches.length <= 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    </span>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<AddIcon />} 
                  onClick={addTrancheField} 
                  sx={{mt:1}}
                >
                  Add Another Tranche
                </Button>
            </Grid>

            {/* TOTAL COMMITTED AMOUNT */}
            <Grid item xs={12}>
              <TextField 
                name="totalCommittedAmount" 
                label="Total Committed Amount (INR) *" 
                type="number" 
                value={formData.totalCommittedAmount} 
                onChange={handleInputChange} 
                fullWidth 
                required 
                error={!formData.totalCommittedAmount || parseFloat(formData.totalCommittedAmount) <= 0}
                InputProps={{ 
                  readOnly: formData.tranches.length > 1 && formData.tranches.some(t => t.agreedAmount)
                }} 
                helperText={
                  formData.tranches.length > 1 && formData.tranches.some(t => t.agreedAmount) 
                    ? "Auto-calculated from tranches" 
                    : !formData.totalCommittedAmount || parseFloat(formData.totalCommittedAmount) <= 0
                      ? "Total committed amount is required"
                      : "Total investment commitment from this investor"
                }
              />
            </Grid>

            {/* NOTES */}
            <Grid item xs={12}>
              <TextField 
                name="notes" 
                label="General Notes (Optional)" 
                value={formData.notes} 
                onChange={handleInputChange} 
                fullWidth 
                multiline 
                rows={3} 
                placeholder="Any additional notes about this investor, terms, or relationship..."
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
                disabled={isLoading || previewLoading} 
                startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
              >
                {isLoading ? 'Saving...' : (isEditing ? 'Update Investor' : 'Add Investor')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default InvestorForm;