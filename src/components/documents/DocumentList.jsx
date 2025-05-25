// src/components/documents/DocumentList.jsx
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, alpha,
  IconButton, Tooltip, Divider, Chip, Link as MuiLink, Grid, Card, CardContent,
  CardActions, Button, TextField, InputAdornment, Menu, MenuItem, Fade, Grow,
  Stack, useTheme, LinearProgress, Badge, ToggleButton, ToggleButtonGroup,
  Collapse, CardMedia, Skeleton, ButtonGroup, FormControl, Select, InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LaunchIcon from '@mui/icons-material/Launch';
import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ArchiveIcon from '@mui/icons-material/Archive';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SortIcon from '@mui/icons-material/Sort';
import LoadingSpinner from '../common/LoadingSpinner';
import { downloadDocumentLink, deleteDocument as deleteDocApi } from '../../services/api';
// Animation components will use MUI's built-in transitions

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  position: 'relative',
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    '& .file-actions': {
      opacity: 1,
    },
    '& .preview-overlay': {
      opacity: 1,
    }
  }
}));

const FileTypeChip = styled(Chip)(({ theme, filetype }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 24,
  backgroundColor: getFileTypeColor(filetype, theme).bg,
  color: getFileTypeColor(filetype, theme).color,
  border: `1px solid ${getFileTypeColor(filetype, theme).border}`,
  zIndex: 1
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[4],
    }
  }
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1.5),
  transition: 'all 0.3s',
}));

const EmptyStateContainer = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
  transition: 'all 0.3s',
  cursor: 'pointer',
  '&:hover': {
    border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  }
}));

// Helper Functions
function getFileTypeColor(fileType, theme) {
  if (fileType?.includes('pdf')) return { 
    bg: alpha(theme.palette.error.main, 0.1), 
    color: theme.palette.error.dark,
    border: alpha(theme.palette.error.main, 0.3)
  };
  if (fileType?.includes('image')) return { 
    bg: alpha(theme.palette.success.main, 0.1), 
    color: theme.palette.success.dark,
    border: alpha(theme.palette.success.main, 0.3)
  };
  if (fileType?.includes('sheet') || fileType?.includes('excel') || fileType?.includes('csv')) return { 
    bg: alpha(theme.palette.info.main, 0.1), 
    color: theme.palette.info.dark,
    border: alpha(theme.palette.info.main, 0.3)
  };
  if (fileType?.includes('video')) return { 
    bg: alpha(theme.palette.secondary.main, 0.1), 
    color: theme.palette.secondary.dark,
    border: alpha(theme.palette.secondary.main, 0.3)
  };
  return { 
    bg: alpha(theme.palette.grey[500], 0.1), 
    color: theme.palette.grey[700],
    border: alpha(theme.palette.grey[500], 0.3)
  };
}

const getFileIcon = (fileType, size = 'medium') => {
  const iconSize = size === 'large' ? 40 : size === 'small' ? 20 : 28;
  const iconProps = { sx: { fontSize: iconSize } };
  
  if (fileType?.includes('pdf')) return <PictureAsPdfIcon {...iconProps} />;
  if (fileType?.includes('image')) return <ImageIcon {...iconProps} />;
  if (fileType?.includes('sheet') || fileType?.includes('excel') || fileType?.includes('csv')) return <TableChartIcon {...iconProps} />;
  if (fileType?.includes('doc') || fileType?.includes('docx')) return <ArticleIcon {...iconProps} />;
  if (fileType?.includes('code') || fileType?.includes('json') || fileType?.includes('xml')) return <CodeIcon {...iconProps} />;
  if (fileType?.includes('video')) return <MovieIcon {...iconProps} />;
  if (fileType?.includes('audio')) return <AudiotrackIcon {...iconProps} />;
  if (fileType?.includes('zip') || fileType?.includes('rar')) return <ArchiveIcon {...iconProps} />;
  return <InsertDriveFileIcon {...iconProps} />;
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileTypeLabel = (fileType) => {
  if (!fileType) return 'File';
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('image')) return 'Image';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'Spreadsheet';
  if (fileType.includes('csv')) return 'CSV';
  if (fileType.includes('doc')) return 'Document';
  if (fileType.includes('video')) return 'Video';
  if (fileType.includes('audio')) return 'Audio';
  if (fileType.includes('zip') || fileType.includes('rar')) return 'Archive';
  return 'File';
};

const getCategoryIcon = (category) => {
  const iconMap = {
    'pitch-deck': <BusinessIcon />,
    'financial': <MonetizationOnIcon />,
    'legal': <DescriptionIcon />,
    'product': <ArticleIcon />,
    'other': <FolderIcon />
  };
  return iconMap[category] || <FolderIcon />;
};

const DocumentList = ({ documents, loading, onDeleteDocument, onUploadClick }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  // Filter and sort documents
  const processedDocuments = useMemo(() => {
    let filtered = documents || [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0);
        case 'type':
          return (a.fileType || '').localeCompare(b.fileType || '');
        case 'date':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [documents, searchQuery, filterCategory, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(documents?.map(doc => doc.category) || []);
    return ['all', ...Array.from(cats).filter(Boolean)];
  }, [documents]);

  const handleDownload = async (e, docId, fileName) => {
    e.stopPropagation();
    try {
      const response = await downloadDocumentLink(docId);
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error getting download link:", error);
      alert("Could not get download link.");
    }
  };

  const handleDelete = (e, docId, fileName) => {
    e.stopPropagation();
    if (onDeleteDocument) {
      onDeleteDocument(docId, fileName);
    }
  };

  const handleMenuOpen = (event, doc) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Grow in>
        <EmptyStateContainer elevation={0} onClick={onUploadClick}>
          <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            No documents yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Upload your first document to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            size="large"
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Upload Document
          </Button>
        </EmptyStateContainer>
      </Grow>
    );
  }

  const renderGridView = () => (
    <Grid container spacing={3}>
      {processedDocuments.map((doc, index) => (
        <Grid item xs={12} sm={6} md={4} key={doc._id}>
          <Grow in timeout={300 + index * 50}>
            <StyledCard>
              <FileTypeChip 
                label={getFileTypeLabel(doc.fileType)} 
                size="small"
                filetype={doc.fileType}
              />
              
              <CardContent>
                <CategoryIcon sx={{ 
                  bgcolor: alpha(getFileTypeColor(doc.fileType, theme).color, 0.1),
                  color: getFileTypeColor(doc.fileType, theme).color,
                }}>
                  {getFileIcon(doc.fileType, 'large')}
                </CategoryIcon>

                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {doc.fileName}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Chip
                    icon={getCategoryIcon(doc.category)}
                    label={doc.category || 'uncategorized'}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      borderRadius: 1.5,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(doc.fileSize)}
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>

                {(doc.associatedRoundId?.name || doc.associatedInvestorId?.name) && (
                  <Stack spacing={0.5} sx={{ mb: 1 }}>
                    {doc.associatedRoundId?.name && (
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                        Round: {doc.associatedRoundId.name}
                      </Typography>
                    )}
                    {doc.associatedInvestorId?.name && (
                      <Typography variant="caption" color="secondary" sx={{ fontWeight: 500 }}>
                        Investor: {doc.associatedInvestorId.name}
                      </Typography>
                    )}
                  </Stack>
                )}

                {doc.tags && doc.tags.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {doc.tags.slice(0, 3).map(tag => (
                      <Chip
                        key={tag}
                        icon={<LocalOfferIcon />}
                        label={tag}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 20,
                          '& .MuiChip-icon': { fontSize: 12 }
                        }}
                      />
                    ))}
                    {doc.tags.length > 3 && (
                      <Chip
                        label={`+${doc.tags.length - 3}`}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Stack>
                )}
              </CardContent>

              <CardActions className="file-actions" sx={{ 
                opacity: 0,
                transition: 'opacity 0.3s',
                justifyContent: 'space-between',
                px: 2,
                pb: 2
              }}>
                <ButtonGroup size="small" variant="outlined">
                  <Tooltip title="Download">
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={(e) => handleDownload(e, doc._id, doc.fileName)}
                    >
                      Download
                    </Button>
                  </Tooltip>
                </ButtonGroup>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, doc)}
                >
                  <MoreVertIcon />
                </IconButton>
              </CardActions>
            </StyledCard>
          </Grow>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <List sx={{ p: 0 }}>
        {processedDocuments.map((doc, index) => (
          <Fade in timeout={300 + index * 30} key={doc._id}>
            <ListItem
              sx={{
                py: 2,
                px: 3,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
                borderBottom: index < processedDocuments.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Avatar sx={{ 
                      width: 22, 
                      height: 22, 
                      bgcolor: getFileTypeColor(doc.fileType, theme).bg,
                      border: `2px solid ${theme.palette.background.paper}`
                    }}>
                      {getFileIcon(doc.fileType, 'small')}
                    </Avatar>
                  }
                >
                  <Avatar sx={{ 
                    bgcolor: alpha(getFileTypeColor(doc.fileType, theme).color, 0.1),
                    width: 48,
                    height: 48
                  }}>
                    {getCategoryIcon(doc.category)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {doc.fileName}
                    </Typography>
                    <Chip
                      label={getFileTypeLabel(doc.fileType)}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        bgcolor: getFileTypeColor(doc.fileType, theme).bg,
                        color: getFileTypeColor(doc.fileType, theme).color,
                        border: `1px solid ${getFileTypeColor(doc.fileType, theme).border}`,
                      }}
                    />
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {doc.category || 'uncategorized'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(doc.fileSize)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </Typography>
                      {doc.associatedRoundId?.name && (
                        <Chip label={`Round: ${doc.associatedRoundId.name}`} size="small" color="primary" variant="outlined" />
                      )}
                    </Stack>
                    {doc.tags && doc.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5}>
                        {doc.tags.map(tag => (
                          <Chip
                            key={tag}
                            icon={<LocalOfferIcon />}
                            label={tag}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 18 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                }
              />

              <Stack direction="row" spacing={1}>
                <Tooltip title="Download">
                  <IconButton 
                    color="primary"
                    onClick={(e) => handleDownload(e, doc._id, doc.fileName)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <IconButton
                  onClick={(e) => handleMenuOpen(e, doc)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Stack>
            </ListItem>
          </Fade>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box>
      {/* Header Controls */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <SearchBar
          placeholder="Search documents..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filterCategory}
            label="Category"
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {cat !== 'all' && getCategoryIcon(cat)}
                  <span>{cat === 'all' ? 'All Categories' : cat}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          startIcon={<SortIcon />}
          onClick={(e) => setSortMenuAnchor(e.currentTarget)}
          variant="outlined"
          size="small"
        >
          Sort by {sortBy}
        </Button>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="grid">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Documents Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {processedDocuments.length} document{processedDocuments.length !== 1 ? 's' : ''} found
      </Typography>

      {/* Document Views */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <MenuItem onClick={(e) => {
          handleDownload(e, selectedDoc?._id, selectedDoc?.fileName);
          handleMenuClose();
        }}>
          <DownloadIcon sx={{ mr: 1.5 }} fontSize="small" />
          Download
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <LaunchIcon sx={{ mr: 1.5 }} fontSize="small" />
          Preview
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ShareIcon sx={{ mr: 1.5 }} fontSize="small" />
          Share
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <InfoIcon sx={{ mr: 1.5 }} fontSize="small" />
          Details
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={(e) => {
            handleDelete(e, selectedDoc?._id, selectedDoc?.fileName);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1.5 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <MenuItem 
          onClick={() => { setSortBy('date'); setSortMenuAnchor(null); }}
          selected={sortBy === 'date'}
        >
          Date (Newest First)
        </MenuItem>
        <MenuItem 
          onClick={() => { setSortBy('name'); setSortMenuAnchor(null); }}
          selected={sortBy === 'name'}
        >
          Name (A-Z)
        </MenuItem>
        <MenuItem 
          onClick={() => { setSortBy('size'); setSortMenuAnchor(null); }}
          selected={sortBy === 'size'}
        >
          Size (Largest First)
        </MenuItem>
        <MenuItem 
          onClick={() => { setSortBy('type'); setSortMenuAnchor(null); }}
          selected={sortBy === 'type'}
        >
          Type
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DocumentList;