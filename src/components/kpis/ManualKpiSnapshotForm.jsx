// src/components/kpis/ManualKpiSnapshotForm.jsx
import React, { useState, useEffect } from 'react';
import { createManualKpiSnapshot, updateManualKpiSnapshot } from '../../services/api';
import {
  Button, TextField, Grid, Card, CardContent, Typography, Box, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AlertMessage from '../common/AlertMessage';

// Default structure for featureUsage based on backend model
const initialFeatureUsage = {
  quizzesPlayed: 0,
  contentItemsCreated: 0,
  learnListsCreated: 0,
  studyGroupMessagesSent: 0,
  directMessagesSent: 0,
};

const ManualKpiSnapshotForm = ({ onSnapshotSaved, snapshotToEdit }) => {
  const [formData, setFormData] = useState({
    snapshotDate: new Date().toISOString().split('T')[0],
    totalRegisteredUsers: '',
    newUsersToday: '',
    dau: '',
    mau: '',
    featureUsage: { ...initialFeatureUsage },
    // retentionCohorts: [], // Handling this would make the form complex for V1
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (snapshotToEdit) {
      setIsEditing(true);
      setFormData({
        snapshotDate: new Date(snapshotToEdit.snapshotDate).toISOString().split('T')[0],
        totalRegisteredUsers: snapshotToEdit.totalRegisteredUsers?.toString() || '',
        newUsersToday: snapshotToEdit.newUsersToday?.toString() || '',
        dau: snapshotToEdit.dau?.toString() || '',
        mau: snapshotToEdit.mau?.toString() || '',
        featureUsage: { ...initialFeatureUsage, ...(snapshotToEdit.featureUsage || {}) },
        notes: snapshotToEdit.notes || ''
      });
    } else {
      setIsEditing(false);
      // Reset to default for new entry
      setFormData({
        snapshotDate: new Date().toISOString().split('T')[0],
        totalRegisteredUsers: '',
        newUsersToday: '',
        dau: '',
        mau: '',
        featureUsage: { ...initialFeatureUsage },
        notes: ''
      });
    }
  }, [snapshotToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureUsageChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      featureUsage: {
        ...prev.featureUsage,
        [name]: value === '' ? '' : parseInt(value, 10) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      totalRegisteredUsers: parseInt(formData.totalRegisteredUsers) || 0,
      newUsersToday: parseInt(formData.newUsersToday) || 0,
      dau: parseInt(formData.dau) || 0,
      mau: parseInt(formData.mau) || 0,
      // featureUsage is already numbers due to handleFeatureUsageChange
    };

    try {
      let response;
      if (isEditing && snapshotToEdit?._id) {
        response = await updateManualKpiSnapshot(snapshotToEdit._id, submissionData);
        setMessage({ type: 'success', text: 'KPI Snapshot updated successfully!' });
      } else {
        response = await createManualKpiSnapshot(submissionData);
        setMessage({ type: 'success', text: 'KPI Snapshot saved successfully!' });
      }
      
      if (onSnapshotSaved) onSnapshotSaved(response.data);
      if (!isEditing) { // Reset form only if it was a new entry
        setFormData({
            snapshotDate: new Date().toISOString().split('T')[0],
            totalRegisteredUsers: '', newUsersToday: '', dau: '', mau: '',
            featureUsage: { ...initialFeatureUsage }, notes: ''
        });
      }
    } catch (error) {
      console.error("Error saving KPI snapshot:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save KPI snapshot.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <SaveIcon sx={{ mr: 1, color: 'primary.main' }} /> {isEditing ? 'Edit' : 'Add New'} KPI Snapshot
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="snapshotDate"
                label="Snapshot Date"
                type="date"
                value={formData.snapshotDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="totalRegisteredUsers"
                label="Total Registered Users"
                type="number"
                value={formData.totalRegisteredUsers}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="newUsersToday"
                label="New Users (Period)"
                type="number"
                value={formData.newUsersToday}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="dau"
                label="Daily Active Users (DAU)"
                type="number"
                value={formData.dau}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="mau"
                label="Monthly Active Users (MAU)"
                type="number"
                value={formData.mau}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{mt:1}}>Feature Usage</Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField name="quizzesPlayed" label="Quizzes Played" type="number" value={formData.featureUsage.quizzesPlayed} onChange={handleFeatureUsageChange} fullWidth />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField name="contentItemsCreated" label="Content Created" type="number" value={formData.featureUsage.contentItemsCreated} onChange={handleFeatureUsageChange} fullWidth />
            </Grid>
             <Grid item xs={6} sm={4} md={3}>
              <TextField name="learnListsCreated" label="Learn Lists Created" type="number" value={formData.featureUsage.learnListsCreated} onChange={handleFeatureUsageChange} fullWidth />
            </Grid>
             <Grid item xs={6} sm={6} md={2}>
              <TextField name="studyGroupMessagesSent" label="Group Msgs" type="number" value={formData.featureUsage.studyGroupMessagesSent} onChange={handleFeatureUsageChange} fullWidth />
            </Grid>
             <Grid item xs={6} sm={6} md={2}>
              <TextField name="directMessagesSent" label="Direct Msgs" type="number" value={formData.featureUsage.directMessagesSent} onChange={handleFeatureUsageChange} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes (Optional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : null}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Snapshot' : 'Save Snapshot')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ManualKpiSnapshotForm;
