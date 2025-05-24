// src/pages/KpisPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Paper, Box, Grid, List,ListItem ,Divider,ListItemText,IconButton, Tooltip } from '@mui/material';
import ManualKpiSnapshotForm from '../components/kpis/ManualKpiSnapshotForm';
import { getManualKpiSnapshots, deleteManualKpiSnapshot } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';

const KpisPage = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotToEdit, setSnapshotToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getManualKpiSnapshots({ page: 1, limit: 10, sort: '-snapshotDate' }); // Fetch recent 10
      setSnapshots(response.data.snapshots || []);
    } catch (error) {
      console.error("Error fetching KPI snapshots:", error);
      setMessage({ type: 'error', text: 'Could not load KPI snapshots.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const handleSnapshotSaved = (savedSnapshot) => {
    fetchSnapshots(); // Refresh list
    setSnapshotToEdit(null); // Clear editing state
    setMessage({ type: 'success', text: `Snapshot for ${new Date(savedSnapshot.snapshotDate).toLocaleDateString()} saved.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleEditSnapshot = (snapshot) => {
    setSnapshotToEdit(snapshot);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top where form is
  };
  
  const handleDeleteSnapshot = async (id) => {
    if (window.confirm('Are you sure you want to delete this snapshot?')) {
      try {
        await deleteManualKpiSnapshot(id);
        setMessage({ type: 'success', text: 'Snapshot deleted.' });
        fetchSnapshots(); // Refresh list
      } catch (error) {
        console.error("Error deleting snapshot:", error);
        setMessage({ type: 'error', text: 'Could not delete snapshot.' });
      }
    }
  };


  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <BarChartIcon sx={{ mr: 1, fontSize: '2rem' }} /> Key Performance Indicators
      </Typography>
      <AlertMessage message={message.text} severity={message.type || 'info'} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ManualKpiSnapshotForm onSnapshotSaved={handleSnapshotSaved} snapshotToEdit={snapshotToEdit} key={snapshotToEdit?._id || 'new'}/>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent KPI Snapshots</Typography>
            {loading && <LoadingSpinner message="Loading snapshots..." />}
            {!loading && snapshots.length === 0 && <Typography>No snapshots recorded yet.</Typography>}
            {!loading && snapshots.length > 0 && (
              <List dense>
                {snapshots.map(snap => (
                  <React.Fragment key={snap._id}>
                    <ListItem
                      secondaryAction={
                        <>
                          <Tooltip title="Edit Snapshot">
                            <IconButton edge="end" size="small" onClick={() => handleEditSnapshot(snap)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Snapshot">
                            <IconButton edge="end" size="small" sx={{ml:1}} onClick={() => handleDeleteSnapshot(snap._id)}>
                              <DeleteIcon fontSize="small" color="error"/>
                            </IconButton>
                          </Tooltip>
                        </>
                      }
                    >
                      <ListItemText 
                        primary={`Snapshot for: ${new Date(snap.snapshotDate).toLocaleDateString()}`}
                        secondary={`DAU: ${snap.dau || 'N/A'}, MAU: ${snap.mau || 'N/A'}, Total Users: ${snap.totalRegisteredUsers || 'N/A'}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Custom KPIs & Derived Metrics</Typography>
        <Paper sx={{p:2}}>
            <Typography color="textSecondary">
                (Placeholder for Custom KPI builder interface and displays for derived user growth metrics, DAU/MAU history charts, etc.)
            </Typography>
        </Paper>
      </Box>

    </Container>
  );
};
export default KpisPage;
