// src/components/kpis/CustomKpiForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Typography, Box, CircularProgress, Select, MenuItem,
  FormControl, InputLabel, IconButton, Paper, Divider, Switch, FormControlLabel,
  Tooltip, Autocomplete
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../common/AlertMessage';
import { createCustomKpi, updateCustomKpi } from '../../services/api';

const kpiCategories = ['Financial', 'Growth', 'Operational', 'Sales', 'Customer', 'Custom'];
const variableSources = ['revenue', 'expense', 'bank_balance', 'user_count', 'custom_metric', 'constant'];
const aggregations = ['sum', 'average', 'count', 'min', 'max', 'latest'];
const timeframes = ['current_month', 'last_month', 'current_quarter', 'last_quarter', 'current_year', 'last_30_days', 'last_90_days', 'all_time', 'custom'];
const displayFormatTypes = ['number', 'percentage', 'currency', 'ratio'];
const chartTypes = ['line', 'bar', 'area', 'gauge', 'number'];

const InitialVariable = () => ({
    variable: '', 
    source: variableSources[0], 
    filterField: '', filterOperator: '', filterValue: '',
    aggregation: aggregations[0], 
    timeframe: timeframes[0],
    customTimeframeStart: '', customTimeframeEnd: '',
    metricName: '' // For source 'custom_metric'
});

const CustomKpiForm = ({ onKpiSaved, kpiToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: kpiCategories[0],
    formula: '',
    formulaVariables: [InitialVariable()],
    displayFormat: { type: displayFormatTypes[0], decimals: 2, prefix: '', suffix: '' },
    isPinned: false,
    visualization: { chartType: chartTypes[0], color: '#6366F1' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (kpiToEdit) {
      setIsEditing(true);
      setFormData({
        name: kpiToEdit.name || '',
        displayName: kpiToEdit.displayName || '',
        description: kpiToEdit.description || '',
        category: kpiToEdit.category || kpiCategories[0],
        formula: kpiToEdit.formula || '',
        formulaVariables: kpiToEdit.formulaVariables && kpiToEdit.formulaVariables.length > 0 
            ? kpiToEdit.formulaVariables.map(v => ({
                variable: v.variable || '',
                source: v.source || variableSources[0],
                filterField: v.filter?.field || '',
                filterOperator: v.filter?.operator || '',
                filterValue: v.filter?.value || '',
                aggregation: v.aggregation || aggregations[0],
                timeframe: v.timeframe || timeframes[0],
                customTimeframeStart: v.customTimeframe?.start ? new Date(v.customTimeframe.start).toISOString().split('T')[0] : '',
                customTimeframeEnd: v.customTimeframe?.end ? new Date(v.customTimeframe.end).toISOString().split('T')[0] : '',
                metricName: v.source === 'custom_metric' ? v.value : '' // Backend uses 'value' for metric name
            }))
            : [InitialVariable()],
        displayFormat: { 
            type: kpiToEdit.displayFormat?.type || displayFormatTypes[0], 
            decimals: kpiToEdit.displayFormat?.decimals !== undefined ? kpiToEdit.displayFormat.decimals : 2,
            prefix: kpiToEdit.displayFormat?.prefix || '',
            suffix: kpiToEdit.displayFormat?.suffix || ''
        },
        isPinned: kpiToEdit.isPinned || false,
        visualization: {
            chartType: kpiToEdit.visualization?.chartType || chartTypes[0],
            color: kpiToEdit.visualization?.color || '#6366F1'
        }
      });
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [kpiToEdit]);

  const resetForm = () => {
    setFormData({
      name: '', displayName: '', description: '', category: kpiCategories[0], formula: '',
      formulaVariables: [InitialVariable()],
      displayFormat: { type: displayFormatTypes[0], decimals: 2, prefix: '', suffix: '' },
      isPinned: false,
      visualization: { chartType: chartTypes[0], color: '#6366F1' }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isPinned") {
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDisplayFormatChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, displayFormat: { ...prev.displayFormat, [name]: name === 'decimals' ? parseInt(value) : value }}));
  };
  
  const handleVisualizationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, visualization: { ...prev.visualization, [name]: value }}));
  };

  const handleVariableChange = (index, e) => {
    const { name, value } = e.target;
    const newVariables = [...formData.formulaVariables];
    newVariables[index] = { ...newVariables[index], [name]: value };
    setFormData(prev => ({ ...prev, formulaVariables: newVariables }));
  };

  const addVariableField = () => {
    setFormData(prev => ({ ...prev, formulaVariables: [...prev.formulaVariables, InitialVariable()] }));
  };

  const removeVariableField = (index) => {
    if (formData.formulaVariables.length <= 1) return; // Keep at least one
    const newVariables = formData.formulaVariables.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, formulaVariables: newVariables }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const submissionData = {
      ...formData,
      formulaVariables: formData.formulaVariables.map(v => ({
        variable: v.variable,
        source: v.source,
        filter: (v.filterField && v.filterOperator && v.filterValue) ? {
            field: v.filterField,
            operator: v.filterOperator,
            value: v.filterValue // TODO: Parse value if it's number/boolean/array based on operator
        } : undefined,
        aggregation: v.aggregation,
        timeframe: v.timeframe,
        customTimeframe: v.timeframe === 'custom' && v.customTimeframeStart && v.customTimeframeEnd ? {
            start: v.customTimeframeStart,
            end: v.customTimeframeEnd
        } : undefined,
        value: v.source === 'custom_metric' ? v.metricName : (v.source === 'constant' ? parseFloat(v.filterValue) : undefined) // 'value' for custom_metric or constant
      })).filter(v => v.variable && v.source) // Ensure essential fields are present
    };
    // Clean up unnecessary fields from variables
    submissionData.formulaVariables.forEach(v => {
        if (v.source !== 'custom_metric') delete v.metricName;
        if (v.source !== 'constant' && v.source !== 'custom_metric') { // if not constant or custom_metric, filterValue is part of filter obj
             // filterValue was handled by filter object, no need to delete here
        }
        if (v.timeframe !== 'custom') {
            delete v.customTimeframeStart;
            delete v.customTimeframeEnd;
        }
        if (v.source === 'constant' || v.source === 'custom_metric') {
            delete v.filterField;
            delete v.filterOperator;
            // filterValue is used as 'value' for constant
        } else {
           // if filterValue was not used for filter object, it's not needed
           if (!v.filter) delete v.filterValue;
        }


    });


    try {
      let response;
      if (isEditing && kpiToEdit?._id) {
        response = await updateCustomKpi(kpiToEdit._id, submissionData);
        setMessage({ type: 'success', text: 'Custom KPI updated successfully!' });
      } else {
        response = await createCustomKpi(submissionData);
        setMessage({ type: 'success', text: 'Custom KPI created successfully!' });
      }
      
      if (onKpiSaved) onKpiSaved(response.data);
      if (!isEditing) resetForm();
      else if (onCancelEdit) onCancelEdit();

    } catch (error) {
      console.error("Error saving custom KPI:", error);
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to save custom KPI.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {isEditing ? 'Edit Custom KPI' : 'Create New Custom KPI'}
        </Typography>
        <AlertMessage message={message.text} severity={message.type || 'info'} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}><TextField name="name" label="Internal Name (snake_case)" value={formData.name} onChange={handleInputChange} fullWidth required helperText="Unique identifier, e.g., monthly_recurring_revenue" /></Grid>
            <Grid item xs={12} sm={6}><TextField name="displayName" label="Display Name" value={formData.displayName} onChange={handleInputChange} fullWidth required  helperText="How it appears on dashboards, e.g., Monthly Recurring Revenue"/></Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth><InputLabel>Category</InputLabel>
                    <Select name="category" value={formData.category} label="Category" onChange={handleInputChange}>
                    {kpiCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12}><TextField name="description" label="Description (Optional)" value={formData.description} onChange={handleInputChange} fullWidth multiline rows={2} /></Grid>
            <Grid item xs={12}><TextField name="formula" label="Formula" value={formData.formula} onChange={handleInputChange} fullWidth required placeholder="e.g., (revenue - expenses) / revenue * 100" helperText="Use variable names defined below."/></Grid>
            
            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:2, mb:1, fontWeight: 500}}>Formula Variables</Typography></Grid>
            {formData.formulaVariables.map((variable, index) => (
                <Grid item xs={12} key={index}>
                    <Paper elevation={0} sx={{p:2, border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}><TextField name="variable" label="Variable Name in Formula" value={variable.variable} onChange={e => handleVariableChange(index, e)} fullWidth required placeholder="e.g., revenue"/></Grid>
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth><InputLabel>Source</InputLabel>
                                <Select name="source" value={variable.source} label="Source" onChange={e => handleVariableChange(index, e)}>
                                    {variableSources.map(src => <MenuItem key={src} value={src}>{src}</MenuItem>)}
                                </Select></FormControl>
                            </Grid>
                            {variable.source === 'custom_metric' && (
                                <Grid item xs={12} sm={6}><TextField name="metricName" label="Referenced KPI Name (snake_case)" value={variable.metricName} onChange={e => handleVariableChange(index, e)} fullWidth placeholder="e.g., burn_rate"/></Grid>
                            )}
                            {variable.source === 'constant' && (
                                <Grid item xs={12} sm={6}><TextField name="filterValue" label="Constant Value" type="number" value={variable.filterValue} onChange={e => handleVariableChange(index, e)} fullWidth /></Grid>
                            )}
                            {(variable.source === 'revenue' || variable.source === 'expense') && (
                                <>
                                <Grid item xs={12} sm={3}><TextField name="filterField" label="Filter Field (Optional)" value={variable.filterField} onChange={e => handleVariableChange(index, e)} fullWidth placeholder="e.g., category"/></Grid>
                                <Grid item xs={12} sm={3}><TextField name="filterOperator" label="Filter Operator" value={variable.filterOperator} onChange={e => handleVariableChange(index, e)} fullWidth placeholder="e.g., equals, contains"/></Grid>
                                <Grid item xs={12} sm={3}><TextField name="filterValue" label="Filter Value" value={variable.filterValue} onChange={e => handleVariableChange(index, e)} fullWidth placeholder="e.g., Marketing"/></Grid>
                                </>
                            )}
                             {(variable.source !== 'constant' && variable.source !== 'custom_metric') && (
                                <>
                                <Grid item xs={12} sm={3}>
                                    <FormControl fullWidth><InputLabel>Aggregation</InputLabel>
                                    <Select name="aggregation" value={variable.aggregation} label="Aggregation" onChange={e => handleVariableChange(index, e)}>
                                        {aggregations.map(agg => <MenuItem key={agg} value={agg}>{agg}</MenuItem>)}
                                    </Select></FormControl>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <FormControl fullWidth><InputLabel>Timeframe</InputLabel>
                                    <Select name="timeframe" value={variable.timeframe} label="Timeframe" onChange={e => handleVariableChange(index, e)}>
                                        {timeframes.map(tf => <MenuItem key={tf} value={tf}>{tf}</MenuItem>)}
                                    </Select></FormControl>
                                </Grid>
                                {variable.timeframe === 'custom' && (
                                    <>
                                    <Grid item xs={12} sm={3}><TextField name="customTimeframeStart" label="Custom Start" type="date" InputLabelProps={{ shrink: true }} value={variable.customTimeframeStart} onChange={e => handleVariableChange(index, e)} fullWidth/></Grid>
                                    <Grid item xs={12} sm={3}><TextField name="customTimeframeEnd" label="Custom End" type="date" InputLabelProps={{ shrink: true }} value={variable.customTimeframeEnd} onChange={e => handleVariableChange(index, e)} fullWidth/></Grid>
                                    </>
                                )}
                                </>
                             )}
                            <Grid item xs={12} sm={12} sx={{textAlign: 'right'}}>
                                <Tooltip title="Remove Variable"><span><IconButton onClick={() => removeVariableField(index)} color="error" disabled={formData.formulaVariables.length <=1}><DeleteIcon /></IconButton></span></Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            ))}
            <Grid item xs={12}><Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addVariableField} sx={{mt:-1}}>Add Variable</Button></Grid>

            <Grid item xs={12}><Typography variant="subtitle1" sx={{mt:2, mb:1, fontWeight: 500}}>Display & Visualization</Typography></Grid>
            <Grid item xs={12} sm={3}><FormControl fullWidth><InputLabel>Display Type</InputLabel><Select name="type" label="Display Type" value={formData.displayFormat.type} onChange={handleDisplayFormatChange}>{displayFormatTypes.map(df => <MenuItem key={df} value={df}>{df}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={2}><TextField name="decimals" label="Decimals" type="number" value={formData.displayFormat.decimals} onChange={handleDisplayFormatChange} fullWidth /></Grid>
            <Grid item xs={12} sm={2}><TextField name="prefix" label="Prefix (e.g. ₹)" value={formData.displayFormat.prefix} onChange={handleDisplayFormatChange} fullWidth /></Grid>
            <Grid item xs={12} sm={2}><TextField name="suffix" label="Suffix (e.g. %)" value={formData.displayFormat.suffix} onChange={handleDisplayFormatChange} fullWidth /></Grid>
            <Grid item xs={12} sm={3}>
                <FormControlLabel control={<Switch name="isPinned" checked={formData.isPinned} onChange={handleInputChange} />} label="Pin to Dashboard" />
            </Grid>
            <Grid item xs={12} sm={6}> <FormControl fullWidth><InputLabel>Chart Type</InputLabel><Select name="chartType" label="Chart Type" value={formData.visualization.chartType} onChange={handleVisualizationChange}>{chartTypes.map(ct => <MenuItem key={ct} value={ct}>{ct}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField name="color" label="Chart Color (Hex)" value={formData.visualization.color} onChange={handleVisualizationChange} fullWidth /></Grid>


            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
              {isEditing && <Button variant="outlined" onClick={onCancelEdit || resetForm} disabled={isLoading}>Cancel</Button>}
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update KPI' : 'Create KPI')}
              </Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
};

export default CustomKpiForm;
