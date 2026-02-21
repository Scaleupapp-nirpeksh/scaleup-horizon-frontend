// src/components/analytics/CashFlowForecasts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Stack, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import CashFlowDialog from './CashFlowDialog';
import CashFlowList from './CashFlowList';
import CashFlowDetails from './CashFlowDetails';
import { EmptyStateBox } from './StyledComponents';

import {
  createCashFlowForecast,
  getCashFlowForecasts,
  updateCashFlowForecast,
  getHistoricalCashFlowData,
  getCurrentCashPosition
} from '../../services/api';

const CashFlowForecasts = ({ 
  viewMode, 
  setViewMode,
  onEditItem,
  onDeleteItem,
  onShowSuccess,
  onShowError,
  refreshData
}) => {
  const [cashFlowForecasts, setCashFlowForecasts] = useState([]);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [historicalCashFlow, setHistoricalCashFlow] = useState(null);
  const [currentCashPosition, setCurrentCashPosition] = useState(null);
  const [openCashFlowDialog, setOpenCashFlowDialog] = useState(false);
  const [editForecastMode, setEditForecastMode] = useState(false);
  const [cashFlowFormData, setCashFlowFormData] = useState({
    forecastName: '',
    description: '',
    forecastType: 'Short-term',
    endDate: null,
    granularity: 'weekly'
  });
  const [loading, setLoading] = useState(false);

  // Fetch cash flow data
  const fetchCashFlowData = useCallback(async () => {
    setLoading(true);
    try {
      const [forecastsRes, historicalRes, positionRes] = await Promise.all([
        getCashFlowForecasts(),
        getHistoricalCashFlowData(),
        getCurrentCashPosition()
      ]);
      
      setCashFlowForecasts(forecastsRes.data || []);
      setHistoricalCashFlow(historicalRes.data || null);
      setCurrentCashPosition(positionRes.data || null);
      
      if (forecastsRes.data && forecastsRes.data.length > 0 && !selectedForecast) {
        setSelectedForecast(forecastsRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
      onShowError('Failed to load cash flow data');
    } finally {
      setLoading(false);
    }
  }, [onShowError, selectedForecast]);

  // Load data on mount
  useEffect(() => {
    fetchCashFlowData();
  }, [fetchCashFlowData]);

  // Refresh data when requested by parent
  useEffect(() => {
    if (refreshData) {
      fetchCashFlowData();
    }
  }, [refreshData, fetchCashFlowData]);

  // Handle create or update forecast
  const handleCreateForecast = async () => {
    try {
      setLoading(true);
      
      if (editForecastMode && selectedForecast) {
        await updateCashFlowForecast(selectedForecast._id, cashFlowFormData);
        onShowSuccess('Cash flow forecast updated successfully!');
      } else {
        await createCashFlowForecast(cashFlowFormData);
        onShowSuccess('Cash flow forecast created successfully!');
      }
      
      setOpenCashFlowDialog(false);
      fetchCashFlowData();
    } catch (error) {
      console.error('Error creating/updating forecast:', error);
      onShowError(`Failed to ${editForecastMode ? 'update' : 'create'} forecast`);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit forecast
  const handleEditForecast = (type, forecast) => {
    setCashFlowFormData({
      forecastName: forecast.forecastName,
      description: forecast.description || '',
      forecastType: forecast.forecastType,
      endDate: new Date(forecast.endDate || new Date()),
      granularity: forecast.granularity
    });
    setEditForecastMode(true);
    setOpenCashFlowDialog(true);
  };

  // Reset form
  const resetForm = () => {
    setCashFlowFormData({
      forecastName: '',
      description: '',
      forecastType: 'Short-term',
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default 3 months
      granularity: 'weekly'
    });
    setEditForecastMode(false);
  };

  // If no data, show loading
  if (!historicalCashFlow && !currentCashPosition && loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Loading cash flow data...
        </Typography>
      </Box>
    );
  }

  // If no forecasts, show empty state with historical data
  if (cashFlowForecasts.length === 0) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Cash Flow Forecasts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenCashFlowDialog(true);
            }}
            sx={{ borderRadius: 2 }}
            color="info"
          >
            New Forecast
          </Button>
        </Stack>
        
        {/* Show empty state if no historical data, otherwise show the details with historical data */}
        {!historicalCashFlow ? (
          <EmptyStateBox>
            <AccountBalanceIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Cash Flow Forecasts Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first forecast to predict your cash position
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenCashFlowDialog(true);
              }}
              size="large"
              sx={{ borderRadius: 2 }}
              color="info"
            >
              Create Your First Forecast
            </Button>
          </EmptyStateBox>
        ) : (
          <CashFlowDetails
            forecasts={[]}
            selectedForecast={null}
            historicalCashFlow={historicalCashFlow}
            currentCashPosition={currentCashPosition}
          />
        )}
        
        <CashFlowDialog
          open={openCashFlowDialog}
          onClose={() => {
            setOpenCashFlowDialog(false);
            resetForm();
          }}
          formData={cashFlowFormData}
          setFormData={setCashFlowFormData}
          editMode={editForecastMode}
          onSubmit={handleCreateForecast}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Cash Flow Forecasts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenCashFlowDialog(true);
          }}
          sx={{ borderRadius: 2 }}
          color="info"
        >
          New Forecast
        </Button>
      </Stack>

      {viewMode === 'history' ? (
        <CashFlowList
          forecasts={cashFlowForecasts}
          selectedForecast={selectedForecast}
          setSelectedForecast={setSelectedForecast}
          onSetViewMode={setViewMode}
          onEditItem={onEditItem || handleEditForecast}
          onDeleteItem={onDeleteItem}
        />
      ) : (
        <CashFlowDetails
          forecasts={cashFlowForecasts}
          selectedForecast={selectedForecast}
          setSelectedForecast={setSelectedForecast}
          historicalCashFlow={historicalCashFlow}
          currentCashPosition={currentCashPosition}
          onEdit={onEditItem || handleEditForecast}
          onHistoryClick={() => setViewMode('history')}
        />
      )}

      <CashFlowDialog
        open={openCashFlowDialog}
        onClose={() => {
          setOpenCashFlowDialog(false);
          resetForm();
        }}
        formData={cashFlowFormData}
        setFormData={setCashFlowFormData}
        editMode={editForecastMode}
        onSubmit={handleCreateForecast}
      />
    </Box>
  );
};

export default CashFlowForecasts;