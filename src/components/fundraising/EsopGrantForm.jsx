// src/components/fundraising/EsopGrantForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, IconButton, Paper, Tooltip,FormControlLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../common/AlertMessage';
import { createEsopGrant, updateEsopGrant } from '../../services/api';

const vestingScheduleTypes = ['Time-based Cliff', 'Time-based Graded', 'Milestone-based', 'Custom (manual events)'];
const vestingFrequencies = ['Monthly', 'Quarterly', 'Annually', 'None'];

const InitialVestingEvent = () => ({
    vestDate: new Date().toISOString().split('T')[0],
    optionsVested: '',
    isCliff: false,
    notes: ''
});

const EsopGrantForm = ({ onGrantSaved, grantToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    numberOfOptionsGranted: '',
    strikePrice: '',
    grantDate: new Date().toISOString().split('T')[0],
    vestingScheduleType: vestingScheduleTypes[0],
    vestingPeriodYears: '',
    cliffPeriodMonths: '',
    vestingFrequency: vestingFrequencies[0],
    vestingEvents: [InitialVestingEvent()],
    notes: '',
    agreementUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (grantToEdit) {
      setIsEditing(true);
      setFormData({
        employeeName: grantToEdit.employeeName || '',
        employeeId: grantToEdit.employeeId || '',
        numberOfOptionsGranted: grantToEdit.numberOfOptionsGranted?.toString() || '',
        strikePrice: grantToEdit.strikePrice?.toString() || '',
        grantDate: grantToEdit.grantDate ? new Date(grantToEdit.grantDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        vestingScheduleType: grantToEdit.vestingScheduleType || vestingScheduleTypes[0],
        vestingPeriodYears: grantToEdit.vestingPeriodYears?.toString() || '',
        cliffPeriodMonths: grantToEdit.cliffPeriodMonths?.toString() || '',
        vestingFrequency: grantToEdit.vestingFrequency || vestingFrequencies[0],
        vestingEvents: grantToEdit.vestingEvents && grantToEdit.vestingEvents.length > 0 
            ? grantToEdit.vestingEvents.map(event => ({
                ...event,
                vestDate: event.vestDate ? new Date(event.vestDate).toISOString().split('T')[0] : '',
                optionsVested: event.optionsVested?.toString() || '',
            })) 
            : [InitialVestingEvent()],
        notes: grantToEdit.notes || '',
        agreementUrl: grantToEdit.agreementUrl || ''
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [grantToEdit]);

  const resetForm = () => {
    setFormData({
      employeeName: '', employeeId: '', numberOfOptionsGranted: '', strikePrice: '',
      grantDate: new Date().toISOString().split('T')[0], vestingScheduleType: vestingScheduleTypes[0],
      vestingPeriodYears: '', cliffPeriodMonths: '', vestingFrequency: vestingFrequencies[0],
      vestingEvents: [InitialVestingEvent()], notes: '', agreementUrl: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newEvents = [...formData.vestingEvents];
    newEvents[index] = { ...newEvents[index], [name]: type === 'checkbox' ? checked : value };
    setFormData(prev => ({ ...prev, vestingEvents: newEvents }));
  };

  const addEventField = () => {
    setFormData(prev => ({
      ...prev,
      vestingEvents: [...prev.vestingEvents, InitialVestingEvent()]
    }));
  };

  const removeEventField = (index) => {
    if (formData.vestingEvents.length <= 1 && formData.vestingScheduleType === 'Custom (manual events)') return; // Keep at least one for custom
    const newEvents = formData.vestingEvents.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, vestingEvents: newEvents.length > 0 ? newEvents : [InitialVestingEvent()] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      numberOfOptionsGranted: parseInt(formData.numberOfOptionsGranted) || 0,
      strikePrice: parseFloat(formData.strikePrice) || 0,
      vestingPeriodYears: parseInt(formData.vestingPeriodYears) || null,
      cliffPeriodMonths: parseInt(formData.cliffPeriodMonths) || null,
      vestingEvents: formData.vestingEvents.map(event => ({
          ...event,
          optionsVested: parseInt(event.optionsVested) || 0,
          vestDate: event.vestDate || null
      })).filter(event => event.optionsVested > 0 && event.vestDate) // Filter out empty events if any
    };
    
    // If not custom, vestingEvents might be auto-calculated by backend or not needed from form
    if (submissionData.vestingScheduleType !== 'Custom (manual events)') {
        // delete submissionData.vestingEvents; // Or send empty array if backend expects it
    }


    try {
      let response;
      if (isEditing && grantToEdit?._id) {
        response = await updateEsopGrant(grantToEdit._id, submissionData);
        setMessage({ type: 'success', text: 'ESOP Grant updated successfully!' });
      } else {
        response = await createEsopGrant(submissionData);
        setMessage({ type: 'success', text: 'ESOP Grant created successfully!' });
      }
      
      if (onGrantSaved) onGrantSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving ESOP grant:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save ESOP grant.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit ESOP Grant' : 'Create New ESOP Grant'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField name="employeeName" label="Employee Name" value={formData.employeeName} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="employeeId" label="Employee ID (Optional)" value={formData.employeeId} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="numberOfOptionsGranted" label="Number of Options Granted" type="number" value={formData.numberOfOptionsGranted} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="strikePrice" label="Strike Price (INR)" type="number" value={formData.strikePrice} onChange={handleInputChange} fullWidth required inputProps={{ step: "0.01" }}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="grantDate" label="Grant Date" type="date" value={formData.grantDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="vesting-schedule-type-label">Vesting Schedule Type</InputLabel>
                <Select labelId="vesting-schedule-type-label" name="vestingScheduleType" value={formData.vestingScheduleType} label="Vesting Schedule Type" onChange={handleInputChange}>
                  {vestingScheduleTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {formData.vestingScheduleType !== 'Custom (manual events)' && formData.vestingScheduleType !== 'Milestone-based' && (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField name="vestingPeriodYears" label="Vesting Period (Years)" type="number" value={formData.vestingPeriodYears} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField name="cliffPeriodMonths" label="Cliff Period (Months)" type="number" value={formData.cliffPeriodMonths} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="vesting-frequency-label">Vesting Frequency (Post-Cliff)</InputLabel>
                    <Select labelId="vesting-frequency-label" name="vestingFrequency" value={formData.vestingFrequency} label="Vesting Frequency (Post-Cliff)" onChange={handleInputChange}>
                      {vestingFrequencies.map(freq => <MenuItem key={freq} value={freq}>{freq}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            
            {formData.vestingScheduleType === 'Custom (manual events)' && (
                <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{mt:1, mb:1, fontWeight: 500}}>Vesting Events</Typography>
                    {formData.vestingEvents.map((event, index) => (
                        <Paper key={index} elevation={0} sx={{p:2, mb:1.5, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}><TextField name="vestDate" label="Vest Date" type="date" value={event.vestDate} onChange={e => handleEventChange(index, e)} InputLabelProps={{ shrink: true }} fullWidth/></Grid>
                                <Grid item xs={12} sm={3}><TextField name="optionsVested" label="Options Vested" type="number" value={event.optionsVested} onChange={e => handleEventChange(index, e)} fullWidth/></Grid>
                                <Grid item xs={12} sm={3}><FormControlLabel control={<TextField type="checkbox" name="isCliff" checked={event.isCliff} onChange={e => handleEventChange(index, e)} />} label="Is Cliff?" size="small" /></Grid>
                                <Grid item xs={12} sm={2} sx={{textAlign: 'right'}}>
                                    <Tooltip title="Remove Event"><span><IconButton onClick={() => removeEventField(index)} color="error" disabled={formData.vestingEvents.length === 1}><DeleteIcon /></IconButton></span></Tooltip>
                                </Grid>
                                <Grid item xs={12}><TextField name="notes" label="Event Notes" value={event.notes} onChange={e => handleEventChange(index, e)} fullWidth size="small"/></Grid>
                            </Grid>
                        </Paper>
                    ))}
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addEventField} sx={{mt:0.5}}>Add Vesting Event</Button>
                </Grid>
            )}

            <Grid item xs={12}>
              <TextField name="agreementUrl" label="Agreement URL (Optional)" value={formData.agreementUrl} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="General Grant Notes (Optional)" value={formData.notes} onChange={handleInputChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Grant' : 'Create Grant')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default EsopGrantForm;
