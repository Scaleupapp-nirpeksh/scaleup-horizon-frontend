// src/components/financials/RevenueForm.jsx
// Form for adding new revenue entries using MUI.
import React, { useState } from 'react';
import { addRevenue } from '../../services/api';
import {
  Button, TextField, Select, MenuItem, FormControl, Box,InputLabel, Grid, Card, CardContent, Typography
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CircularProgress from '@mui/material/CircularProgress';
import AlertMessage from '../common/AlertMessage';

const revenueSources = ['Product Sales', 'Service Fees', 'Subscription', 'Ad Revenue', 'Affiliate Income', 'Grants', 'Interest', 'Other'];
const revenueStatuses = ['Received', 'Pending', 'Expected'];

const RevenueForm = ({ onRevenueAdded }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(revenueSources[0]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(revenueStatuses[0]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setSource(revenueSources[0]);
    setDescription('');
    setStatus(revenueStatuses[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    const revenueData = { date, amount: parseFloat(amount), source, description, status };
    try {
      const response = await addRevenue(revenueData);
      setMessage({ type: 'success', text: 'Revenue added successfully!' });
      if (onRevenueAdded) onRevenueAdded(response.data);
      setTimeout(resetForm, 2000);
    } catch (error) {
      console.error("Error adding revenue:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to add revenue.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
          <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} /> Add New Revenue
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
                placeholder="e.g., Monthly Subscription - Plan X"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="revenue-source-label">Source*</InputLabel>
                <Select
                  labelId="revenue-source-label"
                  value={source}
                  label="Source*"
                  onChange={e => setSource(e.target.value)}
                  required
                >
                  {revenueSources.map(src => <MenuItem key={src} value={src}>{src}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="revenue-status-label">Status*</InputLabel>
                <Select
                  labelId="revenue-status-label"
                  value={status}
                  label="Status*"
                  onChange={e => setStatus(e.target.value)}
                  required
                >
                  {revenueStatuses.map(st => <MenuItem key={st} value={st}>{st}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" color="success" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : null}>
                {isLoading ? 'Adding...' : 'Add Revenue'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueForm;