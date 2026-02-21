// src/components/analytics/CohortMetricsEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, Typography, Stack, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Divider, Box, Alert, InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import PercentIcon from '@mui/icons-material/Percent';
import moment from 'moment';

import { formatCurrency } from './formatters';

const CohortMetricsEditor = ({
  open,
  onClose,
  cohort,
  onSave
}) => {
  const [metrics, setMetrics] = useState([]);
  const [newMetricRow, setNewMetricRow] = useState({
    periodNumber: 0,
    periodLabel: '',
    activeUsers: 0,
    churnedUsers: 0,
    retentionRate: 1.0,
    revenue: 0,
    averageRevenuePerUser: 0,
    cumulativeRevenue: 0,
    averageSessionsPerUser: 0,
    averageEngagementScore: 0,
    isProjected: false
  });
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load existing metrics when cohort changes
  useEffect(() => {
    if (cohort && cohort.metrics) {
      // Only load non-projected metrics (historical data)
      const historicalMetrics = cohort.metrics.filter(m => !m.isProjected);
      setMetrics(historicalMetrics);
      
      // Set the next period number for the new row
      const nextPeriod = historicalMetrics.length > 0 
        ? Math.max(...historicalMetrics.map(m => m.periodNumber)) + 1 
        : 0;
      
      setNewMetricRow(prev => ({
        ...prev,
        periodNumber: nextPeriod,
        periodLabel: `Month ${nextPeriod}`
      }));
    }
  }, [cohort]);

  // Calculate derived values when active users or revenue changes
  const calculateDerivedValues = (rowData) => {
    const { activeUsers, revenue } = rowData;
    
    // Calculate average revenue per user
    const arpu = activeUsers > 0 ? revenue / activeUsers : 0;
    
    return {
      ...rowData,
      averageRevenuePerUser: arpu
    };
  };

  // Add a new metric row
  const handleAddRow = () => {
    // Validate inputs
    if (!newMetricRow.periodLabel) {
      setValidationError('Period label is required');
      return;
    }
    
    if (newMetricRow.activeUsers < 0 || newMetricRow.revenue < 0) {
      setValidationError('Active users and revenue must be non-negative');
      return;
    }
    
    // Add the new row with cumulative revenue calculated
    const lastCumulativeRevenue = metrics.length > 0 
      ? metrics[metrics.length - 1].cumulativeRevenue 
      : 0;
    
    const newRow = {
      ...calculateDerivedValues(newMetricRow),
      cumulativeRevenue: lastCumulativeRevenue + newMetricRow.revenue
    };
    
    setMetrics([...metrics, newRow]);
    
    // Reset the new row form with incremented period
    setNewMetricRow({
      periodNumber: newMetricRow.periodNumber + 1,
      periodLabel: `Month ${newMetricRow.periodNumber + 1}`,
      activeUsers: 0,
      churnedUsers: 0,
      retentionRate: 0,
      revenue: 0,
      averageRevenuePerUser: 0,
      cumulativeRevenue: 0,
      averageSessionsPerUser: 0,
      averageEngagementScore: 0,
      isProjected: false
    });
    
    setValidationError('');
    setIsAddingRow(false);
  };

  // Delete a metric row
  const handleDeleteRow = (index) => {
    const updatedMetrics = [...metrics];
    updatedMetrics.splice(index, 1);
    
    // Recalculate cumulative revenue
    let cumulativeRevenue = 0;
    updatedMetrics.forEach((metric, idx) => {
      cumulativeRevenue += metric.revenue;
      updatedMetrics[idx].cumulativeRevenue = cumulativeRevenue;
    });
    
    setMetrics(updatedMetrics);
  };

  // Update a specific field in a metric row
  const handleUpdateMetric = (index, field, value) => {
    const updatedMetrics = [...metrics];
    
    // Update the field
    updatedMetrics[index] = {
      ...updatedMetrics[index],
      [field]: value
    };
    
    // Recalculate derived values
    if (field === 'activeUsers' || field === 'revenue') {
      updatedMetrics[index] = calculateDerivedValues(updatedMetrics[index]);
    }
    
    // Recalculate cumulative revenue if revenue changed
    if (field === 'revenue') {
      let cumulativeRevenue = 0;
      updatedMetrics.forEach((metric, idx) => {
        cumulativeRevenue += metric.revenue;
        updatedMetrics[idx].cumulativeRevenue = cumulativeRevenue;
      });
    }
    
    setMetrics(updatedMetrics);
  };

  // Handle save and close
  const handleSave = () => {
    // Combine the existing projected metrics with the updated historical metrics
    const projectedMetrics = cohort.metrics 
      ? cohort.metrics.filter(m => m.isProjected) 
      : [];
    
    onSave({
      ...cohort,
      metrics: [...metrics, ...projectedMetrics]
    });
    
    onClose();
  };

  // Prepare file for download
  const handleDownloadTemplate = () => {
    // Create a template with one sample row
    const template = {
      cohortName: "Sample Cohort",
      metrics: [
        {
          periodNumber: 0,
          periodLabel: "Month 0",
          activeUsers: 100,
          churnedUsers: 0,
          retentionRate: 1.0,
          revenue: 5000,
          averageRevenuePerUser: 50,
          cumulativeRevenue: 5000,
          averageSessionsPerUser: 30,
          averageEngagementScore: 8.0,
          isProjected: false
        }
      ]
    };
    
    // Convert to JSON and create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cohort-metrics-template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Validate the file format
        if (!jsonData.metrics || !Array.isArray(jsonData.metrics)) {
          setValidationError('Invalid file format. Please use the template.');
          return;
        }
        
        // Filter out projected metrics from the upload
        const historicalMetrics = jsonData.metrics.filter(m => !m.isProjected);
        
        // Sort by period number
        historicalMetrics.sort((a, b) => a.periodNumber - b.periodNumber);
        
        // Recalculate cumulative revenue to ensure consistency
        let cumulativeRevenue = 0;
        historicalMetrics.forEach(metric => {
          cumulativeRevenue += metric.revenue;
          metric.cumulativeRevenue = cumulativeRevenue;
        });
        
        setMetrics(historicalMetrics);
        
        // Set next period number for new rows
        if (historicalMetrics.length > 0) {
          const nextPeriod = Math.max(...historicalMetrics.map(m => m.periodNumber)) + 1;
          setNewMetricRow(prev => ({
            ...prev,
            periodNumber: nextPeriod,
            periodLabel: `Month ${nextPeriod}`
          }));
        }
        
        setValidationError('');
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setValidationError('Could not parse file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {cohort ? `Edit Metrics for ${cohort.cohortName}` : 'Edit Cohort Metrics'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Cohort Overview */}
          {cohort && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Cohort Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Initial Users: <b>{cohort.initialUsers}</b>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Start Date: <b>{moment(cohort.cohortStartDate).format('MMM D, YYYY')}</b>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Type: <b>{cohort.cohortType}</b>
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}
          
          {/* Metrics Table */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Historical Metrics
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                >
                  Download Template
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  component="label"
                >
                  Upload JSON
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleFileUpload}
                  />
                </Button>
              </Stack>
            </Stack>
            
            {validationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationError}
              </Alert>
            )}
            
            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Period #</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Active Users</TableCell>
                    <TableCell>Retention Rate</TableCell>
                    <TableCell>Churned Users</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>ARPU</TableCell>
                    <TableCell>Cum. Revenue</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.length > 0 ? (
                    metrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell>{metric.periodNumber}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={metric.periodLabel}
                            onChange={(e) => handleUpdateMetric(index, 'periodLabel', e.target.value)}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={metric.activeUsers}
                            onChange={(e) => handleUpdateMetric(index, 'activeUsers', parseInt(e.target.value) || 0)}
                            variant="standard"
                            InputProps={{
                              endAdornment: <InputAdornment position="end"><PeopleIcon fontSize="small" /></InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={metric.retentionRate}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              handleUpdateMetric(index, 'retentionRate', Math.min(1, Math.max(0, value)));
                            }}
                            variant="standard"
                            InputProps={{
                              endAdornment: <InputAdornment position="end"><PercentIcon fontSize="small" /></InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={metric.churnedUsers}
                            onChange={(e) => handleUpdateMetric(index, 'churnedUsers', parseInt(e.target.value) || 0)}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={metric.revenue}
                            onChange={(e) => handleUpdateMetric(index, 'revenue', parseFloat(e.target.value) || 0)}
                            variant="standard"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(metric.averageRevenuePerUser || 0)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(metric.cumulativeRevenue || 0)}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteRow(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No metrics data yet. Add your first period or upload a JSON file.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Add new row form */}
            {isAddingRow ? (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Add New Period
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Period #"
                      type="number"
                      value={newMetricRow.periodNumber}
                      onChange={(e) => setNewMetricRow({
                        ...newMetricRow,
                        periodNumber: parseInt(e.target.value) || 0
                      })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Period Label"
                      value={newMetricRow.periodLabel}
                      onChange={(e) => setNewMetricRow({
                        ...newMetricRow,
                        periodLabel: e.target.value
                      })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Active Users"
                      type="number"
                      value={newMetricRow.activeUsers}
                      onChange={(e) => setNewMetricRow({
                        ...newMetricRow,
                        activeUsers: parseInt(e.target.value) || 0
                      })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Retention Rate"
                      type="number"
                      value={newMetricRow.retentionRate}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setNewMetricRow({
                          ...newMetricRow,
                          retentionRate: Math.min(1, Math.max(0, value))
                        });
                      }}
                      size="small"
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><PercentIcon fontSize="small" /></InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Churned Users"
                      type="number"
                      value={newMetricRow.churnedUsers}
                      onChange={(e) => setNewMetricRow({
                        ...newMetricRow,
                        churnedUsers: parseInt(e.target.value) || 0
                      })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Revenue"
                      type="number"
                      value={newMetricRow.revenue}
                      onChange={(e) => setNewMetricRow({
                        ...newMetricRow,
                        revenue: parseFloat(e.target.value) || 0
                      })}
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>
                      }}
                    />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsAddingRow(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddRow}
                    startIcon={<AddIcon />}
                  >
                    Add Period
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsAddingRow(true)}
                sx={{ mb: 2 }}
              >
                Add Period
              </Button>
            )}
            
            <Alert severity="info">
              After saving historical metrics, you can generate projections to see future performance.
            </Alert>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          color="primary"
        >
          Save Metrics
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CohortMetricsEditor;