// src/pages/DocumentsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  alpha, useTheme, Paper, Grid, Select, MenuItem, FormControl, InputLabel,
  TextField, Stack, IconButton, Chip, Avatar, Card, CardContent, Fade,
  Tooltip, Badge, InputAdornment, Skeleton,
  Collapse, Alert, Zoom, Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import DocumentUploadForm from '../components/documents/DocumentUploadForm';
import DocumentList from '../components/documents/DocumentList';
import { getDocuments, deleteDocument, getRounds, getInvestors } from '../services/api';

const documentCategories = ['All', 'Investor Agreement', 'Financial Report', 'Pitch Deck', 'Legal', 'Meeting Minutes', 'Product Specs', 'Other'];

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.05)} 50%,
    ${alpha(theme.palette.success.main, 0.08)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: alpha(theme.palette.primary.main, 0.05),
    animation: 'float 20s ease-in-out infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: alpha(theme.palette.secondary.main, 0.05),
    animation: 'float 25s ease-in-out infinite reverse',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
    '33%': { transform: 'translate(30px, -30px) scale(1.05)' },
    '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
  }
}));

const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    border: `1px solid ${alpha(theme.palette[color].main, 0.4)}`,
    '& .stats-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: alpha(theme.palette[color].main, 0.1),
    transition: 'all 0.5s',
  },
  '&:hover::before': {
    transform: 'scale(1.5)',
  }
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  fontWeight: 500,
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    borderRadius: '50%',
    background: alpha(theme.palette.common.white, 0.3),
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.6s, height 0.6s',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    '&::before': {
      width: 300,
      height: 300,
    }
  }
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s',
  '&:hover': {
    boxShadow: theme.shadows[4],
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    overflow: 'visible',
  }
}));

// Helper function to calculate statistics
const calculateStats = (documents) => {
  const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
  const categories = {};
  const fileTypes = {};
  
  documents.forEach(doc => {
    categories[doc.category] = (categories[doc.category] || 0) + 1;
    const type = doc.fileType?.split('/')[1] || 'unknown';
    fileTypes[type] = (fileTypes[type] || 0) + 1;
  });
  
  const mostUsedCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  const recentDocs = documents.filter(doc => {
    const daysDiff = (Date.now() - new Date(doc.createdAt)) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });
  
  return {
    total: documents.length,
    totalSize,
    mostUsedCategory: mostUsedCategory?.[0] || 'None',
    recentCount: recentDocs.length,
    fileTypes
  };
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const DocumentsPage = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  
  const [filters, setFilters] = useState({
    category: 'All',
    roundId: '',
    investorId: '',
    tag: ''
  });
  const [rounds, setRounds] = useState([]);
  const [investors, setInvestors] = useState([]);

  // Calculate stats
  const stats = useMemo(() => calculateStats(documents), [documents]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.roundId) count++;
    if (filters.investorId) count++;
    if (filters.tag) count++;
    setActiveFilters(count);
  }, [filters]);

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
    fetchPageData();
    setShowUploadDialog(false);
    setMessage({ type: 'success', text: `Document "${newDocument.fileName}" uploaded successfully! 🎉` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleDeleteDocument = async (docId, docName) => {
    if (window.confirm(`Are you sure you want to delete "${docName}"?`)) {
      try {
        await deleteDocument(docId);
        setMessage({ type: 'success', text: `Document "${docName}" deleted.` });
        fetchPageData();
      } catch (error) {
        console.error("Error deleting document:", error);
        setMessage({ type: 'error', text: 'Could not delete document.' });
      }
    }
  };
  
  const handleFilterChange = (event) => {
    setFilters(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };
  
  const handleClearFilters = () => {
    setFilters({ category: 'All', roundId: '', investorId: '', tag: '' });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      {/* Hero Section */}
      <HeroSection sx={{ py: { xs: 4, md: 6 }, mb: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Fade in timeout={600}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }}>
                      <FolderSpecialIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 800, 
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 0.5
                      }}>
                        Document Hub
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Your centralized repository for all important company documents
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                    <AnimatedButton
                      variant="contained"
                      size="large"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => setShowUploadDialog(true)}
                    >
                      Upload Document
                    </AnimatedButton>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Fade in timeout={800}>
                <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
                  <AutoAwesomeIcon sx={{ 
                    position: 'absolute',
                    top: -20,
                    right: 20,
                    fontSize: 120,
                    color: alpha(theme.palette.warning.main, 0.1),
                    transform: 'rotate(15deg)'
                  }} />
                  <ArticleIcon sx={{ 
                    position: 'absolute',
                    bottom: -10,
                    left: 20,
                    fontSize: 80,
                    color: alpha(theme.palette.info.main, 0.1),
                    transform: 'rotate(-15deg)'
                  }} />
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Container maxWidth="xl">
        {/* Statistics Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {[
              { 
                title: 'Total Documents', 
                value: stats.total, 
                icon: <DescriptionIcon />, 
                color: 'primary',
                subtitle: 'All uploaded files'
              },
              { 
                title: 'Storage Used', 
                value: formatFileSize(stats.totalSize), 
                icon: <StorageIcon />, 
                color: 'secondary',
                subtitle: 'Total file size'
              },
              { 
                title: 'Recent Uploads', 
                value: stats.recentCount, 
                icon: <AccessTimeIcon />, 
                color: 'success',
                subtitle: 'Last 7 days'
              },
              { 
                title: 'Top Category', 
                value: stats.mostUsedCategory, 
                icon: <CategoryIcon />, 
                color: 'warning',
                subtitle: 'Most used category'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Zoom in timeout={400 + index * 100}>
                  <StatsCard color={stat.color}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {loading ? <Skeleton width={60} /> : stat.value}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stat.subtitle}
                          </Typography>
                        </Box>
                        <Avatar 
                          className="stats-icon"
                          sx={{ 
                            bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                            color: theme.palette[stat.color].main,
                            width: 56,
                            height: 56,
                            transition: 'all 0.3s'
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Stack>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Actions Bar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Documents
            </Typography>
            <Badge badgeContent={activeFilters} color="primary" invisible={activeFilters === 0}>
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                sx={{ 
                  bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Badge>
          </Stack>
          
          {message.text && (
            <Slide direction="left" in mountOnEnter unmountOnExit>
              <Alert 
                severity={message.type} 
                action={
                  <IconButton size="small" onClick={() => setMessage({ type: '', text: '' })}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ borderRadius: 2 }}
              >
                {message.text}
              </Alert>
            </Slide>
          )}
        </Stack>

        {/* Filters Section */}
        <Collapse in={showFilters}>
          <FilterSection elevation={0} sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <FilterListIcon color="action" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Filter Documents
                  </Typography>
                  {activeFilters > 0 && (
                    <Chip 
                      label={`${activeFilters} active`} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select 
                    name="category" 
                    value={filters.category} 
                    label="Category" 
                    onChange={handleFilterChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {documentCategories.map(cat => (
                      <MenuItem key={cat} value={cat}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>{cat}</span>
                          {cat !== 'All' && documents.filter(d => d.category === cat).length > 0 && (
                            <Chip label={documents.filter(d => d.category === cat).length} size="small" />
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Round</InputLabel>
                  <Select 
                    name="roundId" 
                    value={filters.roundId} 
                    label="Round" 
                    onChange={handleFilterChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value=""><em>Any Round</em></MenuItem>
                    {rounds.map(r => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Investor</InputLabel>
                  <Select 
                    name="investorId" 
                    value={filters.investorId} 
                    label="Investor" 
                    onChange={handleFilterChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <PeopleIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value=""><em>Any Investor</em></MenuItem>
                    {investors.map(i => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField 
                  name="tag" 
                  label="Tag" 
                  value={filters.tag} 
                  onChange={handleFilterChange} 
                  size="small" 
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={12} md={1}>
                <Tooltip title="Clear all filters">
                  <Button 
                    onClick={handleClearFilters} 
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      minWidth: 'auto',
                      borderRadius: 2,
                      borderColor: theme.palette.divider,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        borderColor: theme.palette.error.main,
                        color: 'error.main'
                      }
                    }}
                  >
                    <ClearIcon />
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
            
            {/* Active Filters Display */}
            {activeFilters > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                {filters.category !== 'All' && (
                  <FilterChip
                    label={`Category: ${filters.category}`}
                    onDelete={() => setFilters(prev => ({ ...prev, category: 'All' }))}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.roundId && (
                  <FilterChip
                    label={`Round: ${rounds.find(r => r._id === filters.roundId)?.name}`}
                    onDelete={() => setFilters(prev => ({ ...prev, roundId: '' }))}
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {filters.investorId && (
                  <FilterChip
                    label={`Investor: ${investors.find(i => i._id === filters.investorId)?.name}`}
                    onDelete={() => setFilters(prev => ({ ...prev, investorId: '' }))}
                    color="success"
                    variant="outlined"
                  />
                )}
                {filters.tag && (
                  <FilterChip
                    label={`Tag: ${filters.tag}`}
                    onDelete={() => setFilters(prev => ({ ...prev, tag: '' }))}
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </FilterSection>
        </Collapse>

        {/* Document List */}
        <Box>
          <DocumentList 
            documents={documents} 
            loading={loading} 
            onDeleteDocument={handleDeleteDocument}
            onUploadClick={() => setShowUploadDialog(true)}
          />
        </Box>

        {/* Upload Dialog */}
        <StyledDialog
          open={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Zoom}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            pt: 3,
            px: 3,
            fontWeight: 700,
            fontSize: '1.5rem',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                <CloudUploadIcon />
              </Avatar>
              <span>Upload New Document</span>
            </Stack>
            <IconButton onClick={() => setShowUploadDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <DocumentUploadForm 
              onDocumentUploaded={handleDocumentUploaded} 
              onCancel={() => setShowUploadDialog(false)}
            />
          </DialogContent>
        </StyledDialog>
      </Container>
    </Box>
  );
};

export default DocumentsPage;