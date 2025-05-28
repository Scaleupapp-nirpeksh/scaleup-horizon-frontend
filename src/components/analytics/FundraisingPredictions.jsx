// src/components/analytics/FundraisingPredictions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Stack, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import FundraisingDialog from './FundraisingDialog';
import FundraisingList from './FundraisingList';
import FundraisingDetails from './FundraisingDetails';
import { EmptyStateBox } from './StyledComponents';

import { 
  getFundraisingReadiness,
  getFundraisingPredictions,
  getFundraisingPredictionById,
  createFundraisingPrediction,
  updateFundraisingPrediction,
  deleteFundraisingPrediction,
  
} from '../../services/api';

const FundraisingPredictions = ({ 
  viewMode, 
  setViewMode,
  onEditItem,
  onDeleteItem,
  onShowSuccess,
  onShowError,
  refreshData
}) => {
  const [fundraisingReadiness, setFundraisingReadiness] = useState(null);
  const [fundraisingPredictions, setFundraisingPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [openFundraisingDialog, setOpenFundraisingDialog] = useState(false);
  const [editPredictionMode, setEditPredictionMode] = useState(false);
  const [fundraisingFormData, setFundraisingFormData] = useState({
    predictionName: '',
    targetRoundSize: 0,
    targetValuation: 0,
    roundType: 'Seed',
    keyMilestones: []
  });
  const [loading, setLoading] = useState(false);

  // Fetch fundraising data
  const fetchFundraisingData = useCallback(async () => {
    setLoading(true);
    try {
      const [readinessRes, predictionsRes, comparablesRes] = await Promise.all([
        getFundraisingReadiness(),
        getFundraisingPredictions()
      ]);
      
      setFundraisingReadiness(readinessRes.data || null);
      setFundraisingPredictions(predictionsRes.data || []);
      
      if (predictionsRes.data && predictionsRes.data.length > 0 && !selectedPrediction) {
        setSelectedPrediction(predictionsRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching fundraising data:', error);
      onShowError('Failed to load fundraising data');
    } finally {
      setLoading(false);
    }
  }, [onShowError, selectedPrediction]);

  // Load data on mount
  useEffect(() => {
    fetchFundraisingData();
  }, [fetchFundraisingData]);

  // Refresh data when requested by parent
  useEffect(() => {
    if (refreshData) {
      fetchFundraisingData();
    }
  }, [refreshData, fetchFundraisingData]);

  // Handle create or update prediction
  const handleCreatePrediction = async () => {
    try {
      setLoading(true);
      
      if (editPredictionMode && selectedPrediction) {
        await updateFundraisingPrediction(selectedPrediction._id, fundraisingFormData);
        onShowSuccess('Fundraising prediction updated successfully!');
      } else {
        await createFundraisingPrediction(fundraisingFormData);
        onShowSuccess('Fundraising prediction created successfully!');
      }
      
      setOpenFundraisingDialog(false);
      fetchFundraisingData();
    } catch (error) {
      console.error('Error creating/updating prediction:', error);
      onShowError(`Failed to ${editPredictionMode ? 'update' : 'create'} prediction`);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit prediction
  const handleEditPrediction = (type, prediction) => {
    setFundraisingFormData({
      predictionName: prediction.predictionName,
      targetRoundSize: prediction.targetRoundSize,
      targetValuation: prediction.targetValuation,
      roundType: prediction.roundType,
      keyMilestones: prediction.keyMilestones || []
    });
    setEditPredictionMode(true);
    setOpenFundraisingDialog(true);
  };

  // Reset form
  const resetForm = () => {
    setFundraisingFormData({
      predictionName: '',
      targetRoundSize: 0,
      targetValuation: 0,
      roundType: 'Seed',
      keyMilestones: []
    });
    setEditPredictionMode(false);
  };

  // If no readiness data, show loading
  if (!fundraisingReadiness && loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Loading fundraising data...
        </Typography>
      </Box>
    );
  }

  // If no predictions, show empty state
  if (fundraisingPredictions.length === 0) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Fundraising Predictions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenFundraisingDialog(true);
            }}
            sx={{ borderRadius: 2 }}
            color="secondary"
          >
            New Prediction
          </Button>
        </Stack>
        
        <EmptyStateBox>
          <RocketLaunchIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Fundraising Predictions Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first prediction to model your fundraising round
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenFundraisingDialog(true);
            }}
            size="large"
            sx={{ borderRadius: 2 }}
            color="secondary"
          >
            Create Your First Prediction
          </Button>
        </EmptyStateBox>
        
        <FundraisingDialog
          open={openFundraisingDialog}
          onClose={() => {
            setOpenFundraisingDialog(false);
            resetForm();
          }}
          formData={fundraisingFormData}
          setFormData={setFundraisingFormData}
          editMode={editPredictionMode}
          onSubmit={handleCreatePrediction}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Fundraising Predictions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenFundraisingDialog(true);
          }}
          sx={{ borderRadius: 2 }}
          color="secondary"
        >
          New Prediction
        </Button>
      </Stack>

      {viewMode === 'history' ? (
        <FundraisingList
          predictions={fundraisingPredictions}
          selectedPrediction={selectedPrediction}
          setSelectedPrediction={setSelectedPrediction}
          onSetViewMode={setViewMode}
          onEditItem={onEditItem || handleEditPrediction}
          onDeleteItem={onDeleteItem}
        />
      ) : (
        <FundraisingDetails
          predictions={fundraisingPredictions}
          selectedPrediction={selectedPrediction}
          setSelectedPrediction={setSelectedPrediction}
          fundraisingReadiness={fundraisingReadiness}
          onEdit={onEditItem || handleEditPrediction}
          onHistoryClick={() => setViewMode('history')}
        />
      )}

      <FundraisingDialog
        open={openFundraisingDialog}
        onClose={() => {
          setOpenFundraisingDialog(false);
          resetForm();
        }}
        formData={fundraisingFormData}
        setFormData={setFundraisingFormData}
        editMode={editPredictionMode}
        onSubmit={handleCreatePrediction}
      />
    </Box>
  );
};

export default FundraisingPredictions;