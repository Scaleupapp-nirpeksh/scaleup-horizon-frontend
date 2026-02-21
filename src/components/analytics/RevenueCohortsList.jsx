// src/components/analytics/RevenueCohortsList.jsx
import React from 'react';
import {
  Box, Grid, Typography, Stack, Avatar, IconButton,
  Chip, Menu, MenuItem, List, ListItemIcon, ListItemText, Pagination,
  ToggleButtonGroup, ToggleButton, TextField, Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { SearchBox, HistoryCard, ListViewItem } from './StyledComponents';
import { formatDate, formatCurrency } from './formatters';

const RevenueCohortsList = ({
  cohorts,
  selectedCohort,
  setSelectedCohort,
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

  // Filter and sort cohorts
  const getFilteredItems = () => {
    let filtered = cohorts;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = cohorts.filter(item => {
        const nameField = item.cohortName || '';
        const channelField = item.acquisitionChannel || '';
        const productField = item.productType || '';
        return nameField.toLowerCase().includes(query) || 
               channelField.toLowerCase().includes(query) || 
               productField.toLowerCase().includes(query);
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.cohortStartDate);
      const dateB = new Date(b.cohortStartDate);
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
          Revenue Cohort Analysis
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
              placeholder="Search cohorts..."
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
          {getPageItems().map((cohort) => (
            <Grid item xs={12} sm={6} md={4} key={cohort._id}>
              <HistoryCard>
                <Box sx={{ p: 2 }}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha('#9c27b0', 0.1), // Purple color
                        color: '#9c27b0'
                      }}
                    >
                      <PeopleIcon />
                    </Avatar>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, cohort._id)}
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
                      setSelectedCohort(cohort);
                      onSetViewMode('charts');
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {cohort.cohortName}
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
                      {cohort.productType ? `${cohort.productType} users` : 'User cohort'} via {cohort.acquisitionChannel || 'multiple channels'}
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
                      label={`${cohort.initialUsers} users`}
                      color="secondary"
                      variant="outlined"
                      icon={<PeopleIcon />}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {formatDate(cohort.cohortStartDate)}
                    </Typography>
                  </Stack>
                </Box>
              </HistoryCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <List sx={{ width: '100%' }}>
          {getPageItems().map((cohort) => (
            <ListViewItem
              key={cohort._id}
              $active={selectedCohort?._id === cohort._id}
              onClick={() => {
                setSelectedCohort(cohort);
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
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {cohort.cohortName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Started {formatDate(cohort.cohortStartDate)} • {cohort.initialUsers} initial users
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={cohort.cohortType}
                        color="secondary"
                      />
                      <Chip
                        size="small"
                        label={cohort.acquisitionChannel || 'Mixed channels'}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`LTV: ${formatCurrency(cohort.projectedLTV || cohort.actualLTV || 0)}`}
                        color="success"
                        icon={<AttachMoneyIcon fontSize="small" />}
                      />
                      {cohort.ltcacRatio > 3 && (
                        <Chip
                          size="small"
                          label={`LTV:CAC ${cohort.ltcacRatio.toFixed(1)}x`}
                          color="info"
                          icon={<TrendingUpIcon fontSize="small" />}
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, cohort._id);
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
            const cohort = cohorts.find(c => c._id === selectedItemId);
            if (cohort) {
              setSelectedCohort(cohort);
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
            const cohort = cohorts.find(c => c._id === selectedItemId);
            if (cohort) {
              onEditItem('cohort', cohort);
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
            const cohort = cohorts.find(c => c._id === selectedItemId);
            onDeleteItem({
              type: 'cohort',
              id: selectedItemId,
              name: cohort?.cohortName || 'this cohort'
            });
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const cohort = cohorts.find(c => c._id === selectedItemId);
            if (cohort) {
              setSelectedCohort(cohort);
              // This would trigger a projection generation
              // Implementation would depend on your app's state management
              onSetViewMode('charts');
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ShowChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Generate Projections</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Return button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => onSetViewMode('charts')}
        >
          Return to Active Cohort
        </Button>
      </Box>
    </Box>
  );
};

export default RevenueCohortsList;