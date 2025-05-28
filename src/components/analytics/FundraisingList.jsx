// src/components/analytics/FundraisingList.jsx
import React from 'react';
import {
  Box, Grid, Typography, Stack, Avatar, IconButton,
  Chip, Menu, MenuItem, List, ListItemIcon, ListItemText, Pagination,
  ToggleButtonGroup, ToggleButton, TextField, Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { SearchBox, HistoryCard, ListViewItem } from './StyledComponents';
import { formatCurrency, formatDate, getRelativeTime } from './formatters';

const FundraisingList = ({
  predictions,
  selectedPrediction,
  setSelectedPrediction,
  onSetViewMode,
  onEditItem,
  onDeleteItem,
  itemsPerPage = 6,
  onFilter
}) => {
  const [listView, setListView] = React.useState('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [selectedItemId, setSelectedItemId] = React.useState(null);

  // Handle menu actions
  const handleMenuOpen = (event, itemId) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedItemId(null);
  };

  // Filter and sort predictions
  const getFilteredItems = () => {
    let filtered = predictions;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = predictions.filter(item => {
        const nameField = item.predictionName || '';
        const roundType = item.roundType || '';
        return nameField.toLowerCase().includes(query) || roundType.toLowerCase().includes(query);
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.currentDate || a.createdAt);
      const dateB = new Date(b.currentDate || b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filtered;
  };

  // Get paginated items
  const getPageItems = () => {
    const filteredItems = getFilteredItems();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

  // Update filter
  React.useEffect(() => {
    if (onFilter) {
      onFilter({ 
        searchQuery, 
        sortOrder 
      });
    }
  }, [searchQuery, sortOrder, onFilter]);

  return (
    <Box>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">
          Fundraising Prediction History
        </Typography>
        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            value={listView}
            exclusive
            onChange={(e, newView) => newView && setListView(newView)}
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <SearchBox>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
            <TextField
              variant="standard"
              placeholder="Search predictions..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
          </SearchBox>
          <IconButton
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            size="small"
          >
            <SortIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      
      {listView === 'grid' ? (
        <Grid container spacing={2}>
          {getPageItems().map((prediction) => (
            <Grid item xs={12} sm={6} md={4} key={prediction._id}>
              <HistoryCard>
                <Box sx={{ p: 2 }}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha('#9c27b0', 0.1), // Secondary color
                        color: '#9c27b0'
                      }}
                    >
                      <RocketLaunchIcon />
                    </Avatar>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, prediction._id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Box
                    sx={{ 
                      mt: 2, 
                      cursor: 'pointer' 
                    }}
                    onClick={() => {
                      setSelectedPrediction(prediction);
                      onSetViewMode('charts');
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {prediction.predictionName}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={prediction.roundType}
                        color="secondary"
                      />
                      <Chip
                        size="small"
                        label={`${Math.round((prediction.overallProbability || 0) * 100)}% Confidence`}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2">
                      {formatCurrency(prediction.targetRoundSize)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {getRelativeTime(prediction.currentDate || prediction.createdAt)}
                    </Typography>
                  </Stack>
                </Box>
              </HistoryCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <List sx={{ width: '100%' }}>
          {getPageItems().map((prediction) => (
            <ListViewItem
              key={prediction._id}
              $active={selectedPrediction?._id === prediction._id}
              onClick={() => {
                setSelectedPrediction(prediction);
                onSetViewMode('charts');
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#9c27b0', 0.1),
                      color: '#9c27b0'
                    }}
                  >
                    <RocketLaunchIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {prediction.predictionName}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formatCurrency(prediction.targetRoundSize)} at {formatCurrency(prediction.targetValuation)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={prediction.roundType}
                        color="secondary"
                      />
                      <Chip
                        size="small"
                        label={`${Math.round((prediction.overallProbability || 0) * 100)}% Confidence`}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    {getRelativeTime(prediction.currentDate || prediction.createdAt)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, prediction._id);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </ListViewItem>
          ))}
        </List>
      )}
      
      {/* Pagination */}
      {getFilteredItems().length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(getFilteredItems().length / itemsPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
      
      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const prediction = predictions.find(p => p._id === selectedItemId);
            if (prediction) {
              setSelectedPrediction(prediction);
              onSetViewMode('charts');
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const prediction = predictions.find(p => p._id === selectedItemId);
            if (prediction) {
              onEditItem('prediction', prediction);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const prediction = predictions.find(p => p._id === selectedItemId);
            onDeleteItem({
              type: 'prediction',
              id: selectedItemId,
              name: prediction?.predictionName || 'this prediction'
            });
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Return button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => onSetViewMode('charts')}
        >
          Return to Active Prediction
        </Button>
      </Box>
    </Box>
  );
};

export default FundraisingList;