// src/components/analytics/RunwayScenarios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Stack, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TimelineIcon from '@mui/icons-material/Timeline';

import RunwayScenarioDialog from './RunwayScenarioDialog';
import RunwayScenarioList from './RunwayScenarioList';
import RunwayScenarioDetails from './RunwayScenarioDetails';
import { EmptyStateBox } from './StyledComponents';

import {
  getRunwayScenarios,
  createRunwayScenario,
  updateRunwayScenario,
  compareRunwayScenarios
} from '../../services/api';

const RunwayScenarios = ({ 
  viewMode, 
  setViewMode,
  onEditItem,
  onDeleteItem,
  onShowSuccess,
  onShowError,
  refreshData
}) => {
  const [runwayScenarios, setRunwayScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioComparison, setScenarioComparison] = useState(null);
  const [openScenarioDialog, setOpenScenarioDialog] = useState(false);
  const [editScenarioMode, setEditScenarioMode] = useState(false);
  const [scenarioFormData, setScenarioFormData] = useState({
    name: '',
    description: '',
    scenarioType: 'Baseline',
    projectionMonths: 24,
    assumptions: [
      { metric: 'monthly_burn_rate', baseValue: 0, growthRate: 0.05 },
      { metric: 'revenue_growth_rate', baseValue: 0, growthRate: 0.10 }
    ],
    plannedFundraisingEvents: []
  });

  // Fetch runway scenarios
  const fetchScenarios = useCallback(async () => {
    try {
      const response = await getRunwayScenarios();
      const scenarios = response.data || [];
      setRunwayScenarios(scenarios);
      
      if (scenarios.length > 0 && !selectedScenario) {
        setSelectedScenario(scenarios[0]);
      }
    } catch (error) {
      console.error('Error fetching runway scenarios:', error);
      onShowError('Failed to load runway scenarios');
    }
  }, [onShowError, selectedScenario]);

  // Fetch comparison data
  const fetchComparisonData = useCallback(async () => {
    try {
      const response = await compareRunwayScenarios();
      setScenarioComparison(response.data);
    } catch (error) {
      console.error('Error fetching scenario comparison:', error);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchScenarios();
    fetchComparisonData();
  }, [fetchScenarios, fetchComparisonData]);

  // Refresh data when requested by parent
  useEffect(() => {
    if (refreshData) {
      fetchScenarios();
      fetchComparisonData();
    }
  }, [refreshData, fetchScenarios, fetchComparisonData]);

  // Create or update scenario
  const handleCreateScenario = async () => {
    try {
      if (editScenarioMode && selectedScenario) {
        await updateRunwayScenario(selectedScenario._id, scenarioFormData);
        onShowSuccess('Runway scenario updated successfully!');
      } else {
        await createRunwayScenario(scenarioFormData);
        onShowSuccess('Runway scenario created successfully!');
      }
      
      setOpenScenarioDialog(false);
      fetchScenarios();
      fetchComparisonData();
    } catch (error) {
      console.error('Error creating/updating scenario:', error);
      onShowError(`Failed to ${editScenarioMode ? 'update' : 'create'} scenario`);
    }
  };

  // Handle edit scenario
  const handleEditScenario = (type, scenario) => {
    setScenarioFormData({
      name: scenario.name,
      description: scenario.description || '',
      scenarioType: scenario.scenarioType,
      projectionMonths: scenario.projectionMonths,
      assumptions: scenario.assumptions || [
        { metric: 'monthly_burn_rate', baseValue: scenario.initialMonthlyBurn || 0, growthRate: 0.05 },
        { metric: 'revenue_growth_rate', baseValue: scenario.initialMonthlyRevenue || 0, growthRate: 0.10 }
      ],
      plannedFundraisingEvents: scenario.plannedFundraisingEvents || []
    });
    setEditScenarioMode(true);
    setOpenScenarioDialog(true);
  };

  // Reset form
  const resetForm = () => {
    setScenarioFormData({
      name: '',
      description: '',
      scenarioType: 'Baseline',
      projectionMonths: 24,
      assumptions: [
        { metric: 'monthly_burn_rate', baseValue: 0, growthRate: 0.05 },
        { metric: 'revenue_growth_rate', baseValue: 0, growthRate: 0.10 }
      ],
      plannedFundraisingEvents: []
    });
    setEditScenarioMode(false);
  };

  // Handle comparison
  const handleCompareScenarios = async () => {
    try {
      const response = await compareRunwayScenarios();
      setScenarioComparison(response.data);
      onShowSuccess('Scenarios compared successfully!');
    } catch (error) {
      console.error('Error comparing scenarios:', error);
      onShowError('Failed to compare scenarios');
    }
  };

  // If no scenarios, show empty state
  if (runwayScenarios.length === 0) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Runway Scenarios & Projections
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenScenarioDialog(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            New Scenario
          </Button>
        </Stack>
        
        <EmptyStateBox>
          <TimelineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Runway Scenarios Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first scenario to predict your startup's financial runway
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenScenarioDialog(true);
            }}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Create Your First Scenario
          </Button>
        </EmptyStateBox>
        
        <RunwayScenarioDialog
          open={openScenarioDialog}
          onClose={() => {
            setOpenScenarioDialog(false);
            resetForm();
          }}
          formData={scenarioFormData}
          setFormData={setScenarioFormData}
          editMode={editScenarioMode}
          onSubmit={handleCreateScenario}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Runway Scenarios & Projections
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CompareArrowsIcon />}
            sx={{ borderRadius: 2 }}
            onClick={handleCompareScenarios}
          >
            Compare All
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenScenarioDialog(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            New Scenario
          </Button>
        </Stack>
      </Stack>

      {viewMode === 'history' ? (
        <RunwayScenarioList
          scenarios={runwayScenarios}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          onSetViewMode={setViewMode}
          onEditItem={onEditItem || handleEditScenario}
          onDeleteItem={onDeleteItem}
        />
      ) : (
        <RunwayScenarioDetails
          scenarios={runwayScenarios}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          scenarioComparison={scenarioComparison}
          onEdit={onEditItem || handleEditScenario}
          onHistoryClick={() => setViewMode('history')}
        />
      )}

      <RunwayScenarioDialog
        open={openScenarioDialog}
        onClose={() => {
          setOpenScenarioDialog(false);
          resetForm();
        }}
        formData={scenarioFormData}
        setFormData={setScenarioFormData}
        editMode={editScenarioMode}
        onSubmit={handleCreateScenario}
      />
    </Box>
  );
};

export default RunwayScenarios;