// src/pages/DocumentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  alpha, useTheme, Paper, Grid, Select, MenuItem, FormControl, InputLabel, TextField,Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import DocumentUploadForm from '../components/documents/DocumentUploadForm';
import DocumentList from '../components/documents/DocumentList';
import { getDocuments, deleteDocument, getRounds, getInvestors } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';

const documentCategories = ['All', 'Investor Agreement', 'Financial Report', 'Pitch Deck', 'Legal', 'Meeting Minutes', 'Product Specs', 'Other'];


const DocumentsPage = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const [filters, setFilters] = useState({
    category: 'All',
    roundId: '',
    investorId: '',
    tag: ''
  });
  const [rounds, setRounds] = useState([]);
  const [investors, setInvestors] = useState([]);


  const fetchPageData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.roundId) params.roundId = filters.roundId;
      if (filters.investorId) params.investorId = filters.investorId;
      if (filters.tag) params.tag = filters.tag;

      const [docsRes, roundsRes, investorsRes] = await Promise.all([
        getDocuments(params),
        getRounds(),
        getInvestors()
      ]);
      setDocuments(docsRes.data || []);
      setRounds(roundsRes.data || []);
      setInvestors(investorsRes.data || []);

    } catch (error) {
      console.error("Error fetching documents:", error);
      setMessage({ type: 'error', text: 'Could not load documents.' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleDocumentUploaded = (newDocument) => {
    fetchPageData(); // Refresh list
    setShowUploadDialog(false);
    setMessage({ type: 'success', text: `Document "${newDocument.fileName}" uploaded successfully.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleDeleteDocument = async (docId, docName) => {
    if (window.confirm(`Are you sure you want to delete "${docName}"?`)) {
      try {
        await deleteDocument(docId);
        setMessage({ type: 'success', text: `Document "${docName}" deleted.` });
        fetchPageData(); // Refresh list
      } catch (error) {
        console.error("Error deleting document:", error);
        setMessage({ type: 'error', text: 'Could not delete document.' });
      }
    }
  };
  
  const handleFilterChange = (event) => {
    setFilters(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };
  
  // Reset filters and fetch all data
  const handleClearFilters = () => {
    setFilters({ category: 'All', roundId: '', investorId: '', tag: '' });
    // fetchPageData will be called by useEffect due to filter change
  };


  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      <Box sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 4, mb: 4,
      }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.dark', mb: 1, display: 'flex', alignItems: 'center' }}>
            <FolderSpecialIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
            Document Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload, organize, and securely manage your important company documents.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Your Documents
            </Typography>
            <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => setShowUploadDialog(true)}
                sx={{ borderRadius: '12px', fontWeight: 600, boxShadow: theme.shadows[3] }}
            >
                Upload Document
            </Button>
        </Stack>
        <AlertMessage message={message.text} severity={message.type || 'info'} />

        {/* Filters Bar */}
        <Paper elevation={1} sx={{p:2, mb:3, borderRadius: '12px', bgcolor: alpha(theme.palette.background.paper, 0.9)}}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select name="category" value={filters.category} label="Category" onChange={handleFilterChange}>
                            {documentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Associated Round</InputLabel>
                        <Select name="roundId" value={filters.roundId} label="Associated Round" onChange={handleFilterChange}>
                            <MenuItem value=""><em>Any Round</em></MenuItem>
                            {rounds.map(r => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                     <FormControl fullWidth size="small">
                        <InputLabel>Associated Investor</InputLabel>
                        <Select name="investorId" value={filters.investorId} label="Associated Investor" onChange={handleFilterChange}>
                            <MenuItem value=""><em>Any Investor</em></MenuItem>
                            {investors.map(i => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField name="tag" label="Tag" value={filters.tag} onChange={handleFilterChange} size="small" fullWidth/>
                </Grid>
                 <Grid item xs={12} sm={1} sx={{textAlign: 'right'}}>
                    <Button onClick={handleClearFilters} size="small">Clear</Button>
                </Grid>
            </Grid>
        </Paper>


        <DocumentList documents={documents} loading={loading} onDeleteDocument={handleDeleteDocument} />

        <Dialog
            open={showUploadDialog}
            onClose={() => setShowUploadDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, backdropFilter: 'blur(5px)', backgroundColor: alpha(theme.palette.background.paper, 0.95) } }}
        >
            <DialogTitle sx={{ pb: 1, fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>
            Upload New Document
            </DialogTitle>
            <DialogContent sx={{pt: '20px !important'}}>
            <DocumentUploadForm 
                onDocumentUploaded={handleDocumentUploaded} 
                onCancel={() => setShowUploadDialog(false)}
            />
            </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DocumentsPage;
