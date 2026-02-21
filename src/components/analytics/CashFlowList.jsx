// src/components/analytics/CashFlowList.jsx
import React from 'react';
import {
  Box, Grid, Typography, Stack, Avatar, IconButton,
  Chip, Menu, MenuItem, List, ListItemIcon, ListItemText, Pagination,
  ToggleButtonGroup, ToggleButton, TextField, Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
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
import { getRelativeTime } from './formatters';

const CashFlowList = ({
  forecasts,
  selectedForecast,
  setSelectedForecast,
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

  // Filter and sort forecasts
  const getFilteredItems = () => {
    let filtered = forecasts;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = forecasts.filter(item => {
        const nameField = item.forecastName || '';
        const descField = item.description || '';
        const typeField = item.forecastType || '';
        return nameField.toLowerCase().includes(query) || 
               descField.toLowerCase().includes(query) || 
               typeField.toLowerCase().includes(query);
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
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
          Cash Flow Forecast History
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
              placeholder="Search forecasts..."
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
          {getPageItems().map((forecast) => (
            <Grid item xs={12} sm={6} md={4} key={forecast._id}>
              <HistoryCard>
                <Box sx={{ p: 2 }}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha('#00bcd4', 0.1), // Info color
                        color: '#00bcd4'
                      }}
                    >
                      <AccountBalanceIcon />
                    </Avatar>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, forecast._id)}
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
                      setSelectedForecast(forecast);
                      onSetViewMode('charts');
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {forecast.forecastName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 0.5, 
                        height: 40, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}
                    >
                      {forecast.description || `${forecast.forecastType} forecast`}
                    </Typography>
                  </Box>
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    sx={{ mt: 2 }}
                  >
                    <Chip
                      size="small"
                      label={forecast.forecastType}
                      color="info"
                      variant="outlined"
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {getRelativeTime(forecast.createdAt)}
                    </Typography>
                  </Stack>
                </Box>
              </HistoryCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <List sx={{ width: '100%' }}>
          {getPageItems().map((forecast) => (
            <ListViewItem
              key={forecast._id}
              $active={selectedForecast?._id === forecast._id}
              onClick={() => {
                setSelectedForecast(forecast);
                onSetViewMode('charts');
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#00bcd4', 0.1),
                      color: '#00bcd4'
                    }}
                  >
                    <AccountBalanceIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {forecast.forecastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {forecast.description || `${forecast.forecastType} forecast`}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={forecast.forecastType}
                        color="info"
                      />
                      <Chip
                        size="small"
                        label={`${forecast.granularity} forecast`}
                        variant="outlined"
                      />
                      {forecast.requiresAdditionalFunding && (
                        <Chip
                          size="small"
                          label="Funding needed"
                          color="warning"
                        />
                      )}
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
                    {getRelativeTime(forecast.createdAt)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, forecast._id);
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
            const forecast = forecasts.find(f => f._id === selectedItemId);
            if (forecast) {
              setSelectedForecast(forecast);
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
            const forecast = forecasts.find(f => f._id === selectedItemId);
            if (forecast) {
              onEditItem('forecast', forecast);
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
            const forecast = forecasts.find(f => f._id === selectedItemId);
            onDeleteItem({
              type: 'forecast',
              id: selectedItemId,
              name: forecast?.forecastName || 'this forecast'
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
          Return to Active Forecast
        </Button>
      </Box>
    </Box>
  );
};

export default CashFlowList;