// src/components/analytics/RevenueCohorts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Stack, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';

import RevenueCohortDialog from './RevenueCohortDialog';
import RevenueCohortsList from './RevenueCohortsList';
import RevenueCohortDetails from './RevenueCohortDetails';
import { EmptyStateBox } from './StyledComponents';

import {
  createRevenueCohort,
  getRevenueCohorts,
  getRevenueCohortById,
  updateRevenueCohort,
  updateCohortMetrics,
  generateCohortProjections
} from '../../services/api';

const RevenueCohorts = ({ 
  viewMode, 
  setViewMode,
  onEditItem,
  onDeleteItem,
  onShowSuccess,
  onShowError,
  refreshData
}) => {
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [openCohortDialog, setOpenCohortDialog] = useState(false);
  const [editCohortMode, setEditCohortMode] = useState(false);
  const [cohortFormData, setCohortFormData] = useState({
    cohortName: '',
    cohortStartDate: new Date(),
    cohortType: 'monthly',
    initialUsers: 0,
    acquisitionChannel: 'organic',
    acquisitionCost: 0,
    productType: 'basic',
    paymentFrequency: 'monthly'
  });
  const [loading, setLoading] = useState(false);

  // Fetch cohort data
  const fetchCohortData = useCallback(async () => {
    setLoading(true);
    try {
      const cohortsRes = await getRevenueCohorts();
      setCohorts(cohortsRes.data || []);
      
      if (cohortsRes.data && cohortsRes.data.length > 0 && !selectedCohort) {
        setSelectedCohort(cohortsRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching cohort data:', error);
      onShowError('Failed to load cohort data');
    } finally {
      setLoading(false);
    }
  }, [onShowError, selectedCohort]);

  // Load data on mount
  useEffect(() => {
    fetchCohortData();
  }, [fetchCohortData]);

  // Refresh data when requested by parent
  useEffect(() => {
    if (refreshData) {
      fetchCohortData();
    }
  }, [refreshData, fetchCohortData]);

  // Handle create or update cohort
  const handleCreateCohort = async () => {
    try {
      setLoading(true);
      
      if (editCohortMode && selectedCohort) {
        await updateRevenueCohort(selectedCohort._id, cohortFormData);
        onShowSuccess('Revenue cohort updated successfully!');
      } else {
        await createRevenueCohort(cohortFormData);
        onShowSuccess('Revenue cohort created successfully!');
      }
      
      setOpenCohortDialog(false);
      fetchCohortData();
    } catch (error) {
      console.error('Error creating/updating cohort:', error);
      onShowError(`Failed to ${editCohortMode ? 'update' : 'create'} cohort`);
    } finally {
      setLoading(false);
    }
  };

  // Handle update cohort metrics
  const handleUpdateCohortMetrics = async (updatedCohort) => {
    try {
      setLoading(true);
      
      // Call the dedicated API endpoint for updating metrics
      await updateCohortMetrics(updatedCohort._id, updatedCohort.metrics);
      onShowSuccess('Cohort metrics updated successfully!');
      
      // Fetch the updated cohort to ensure we have all derived values
      const response = await getRevenueCohortById(updatedCohort._id);
      const refreshedCohort = response.data;
      
      // Update the selected cohort and the cohorts list
      setSelectedCohort(refreshedCohort);
      setCohorts(prevCohorts => 
        prevCohorts.map(c => 
          c._id === refreshedCohort._id ? refreshedCohort : c
        )
      );
    } catch (error) {
      console.error('Error updating cohort metrics:', error);
      onShowError('Failed to update cohort metrics');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit cohort
  const handleEditCohort = (type, cohort) => {
    setCohortFormData({
      cohortName: cohort.cohortName,
      cohortStartDate: new Date(cohort.cohortStartDate),
      cohortType: cohort.cohortType,
      initialUsers: cohort.initialUsers,
      acquisitionChannel: cohort.acquisitionChannel || 'organic',
      acquisitionCost: cohort.acquisitionCost || 0,
      productType: cohort.productType || 'basic',
      paymentFrequency: cohort.paymentFrequency || 'monthly'
    });
    setEditCohortMode(true);
    setOpenCohortDialog(true);
  };

  // Handle generate projections
  const handleGenerateProjections = async (cohortId) => {
    try {
      setLoading(true);
      const response = await generateCohortProjections(cohortId, { projectionMonths: 24 });
      
      // Update the selected cohort with the new projections
      if (response && response.data && response.data.cohort) {
        setSelectedCohort(response.data.cohort);
        
        // Also update the cohort in the cohorts list
        setCohorts(prevCohorts => 
          prevCohorts.map(c => 
            c._id === response.data.cohort._id ? response.data.cohort : c
          )
        );
      }
      
      onShowSuccess('Cohort projections generated successfully!');
    } catch (error) {
      console.error('Error generating projections:', error);
      onShowError('Failed to generate projections');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCohortFormData({
      cohortName: '',
      cohortStartDate: new Date(),
      cohortType: 'monthly',
      initialUsers: 0,
      acquisitionChannel: 'organic',
      acquisitionCost: 0,
      productType: 'basic',
      paymentFrequency: 'monthly'
    });
    setEditCohortMode(false);
  };

  // If no data, show loading
  if (loading && cohorts.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Loading cohort data...
        </Typography>
      </Box>
    );
  }

  // If no cohorts, show empty state
  if (cohorts.length === 0) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Revenue Cohort Analysis
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenCohortDialog(true);
            }}
            sx={{ borderRadius: 2 }}
            color="secondary"
          >
            New Cohort
          </Button>
        </Stack>
        
        <EmptyStateBox>
          <PeopleIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Revenue Cohorts Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first cohort to analyze user retention and revenue metrics
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenCohortDialog(true);
            }}
            size="large"
            sx={{ borderRadius: 2 }}
            color="secondary"
          >
            Create Your First Cohort
          </Button>
        </EmptyStateBox>
        
        <RevenueCohortDialog
          open={openCohortDialog}
          onClose={() => {
            setOpenCohortDialog(false);
            resetForm();
          }}
          formData={cohortFormData}
          setFormData={setCohortFormData}
          editMode={editCohortMode}
          onSubmit={handleCreateCohort}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Revenue Cohort Analysis
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenCohortDialog(true);
          }}
          sx={{ borderRadius: 2 }}
          color="secondary"
        >
          New Cohort
        </Button>
      </Stack>

      {viewMode === 'history' ? (
        <RevenueCohortsList
          cohorts={cohorts}
          selectedCohort={selectedCohort}
          setSelectedCohort={setSelectedCohort}
          onSetViewMode={setViewMode}
          onEditItem={onEditItem || handleEditCohort}
          onDeleteItem={onDeleteItem}
        />
      ) : (
        <RevenueCohortDetails
          cohorts={cohorts}
          selectedCohort={selectedCohort}
          setSelectedCohort={setSelectedCohort}
          onEdit={onEditItem || handleEditCohort}
          onHistoryClick={() => setViewMode('history')}
          onGenerateProjections={handleGenerateProjections}
          onUpdateCohort={handleUpdateCohortMetrics}
        />
      )}

      <RevenueCohortDialog
        open={openCohortDialog}
        onClose={() => {
          setOpenCohortDialog(false);
          resetForm();
        }}
        formData={cohortFormData}
        setFormData={setCohortFormData}
        editMode={editCohortMode}
        onSubmit={handleCreateCohort}
      />
    </Box>
  );
};

export default RevenueCohorts;