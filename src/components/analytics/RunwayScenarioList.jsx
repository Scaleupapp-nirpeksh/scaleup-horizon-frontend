// src/components/analytics/RunwayScenarioList.jsx
import React from 'react';
import {
  Box, Grid, Typography, Stack, Avatar, IconButton,
  Chip, Menu, MenuItem, List, ListItemIcon, ListItemText, Pagination,
  ToggleButtonGroup, ToggleButton, TextField, Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
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
import { formatDate, getRelativeTime } from './formatters';

const RunwayScenarioList = ({
  scenarios,
  selectedScenario,
  setSelectedScenario,
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

  // Filter and sort scenarios
  const getFilteredItems = () => {
    let filtered = scenarios;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = scenarios.filter(item => {
        const nameField = item.name || '';
        const descField = item.description || '';
        return nameField.toLowerCase().includes(query) || descField.toLowerCase().includes(query);
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
          Runway Scenario History
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
              placeholder="Search scenarios..."
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
          {getPageItems().map((scenario) => (
            <Grid item xs={12} sm={6} md={4} key={scenario._id}>
              <HistoryCard>
                <Box sx={{ p: 2 }}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha('#3f51b5', 0.1),
                        color: '#3f51b5'
                      }}
                    >
                      <TimelineIcon />
                    </Avatar>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, scenario._id)}
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
                      setSelectedScenario(scenario);
                      onSetViewMode('charts');
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {scenario.name}
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
                      {scenario.description || 'No description provided'}
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
                      label={`${scenario.totalRunwayMonths || 0} months`}
                      color={scenario.totalRunwayMonths > 12 ? "success" : "warning"}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {getRelativeTime(scenario.createdAt)}
                    </Typography>
                  </Stack>
                </Box>
              </HistoryCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <List sx={{ width: '100%' }}>
          {getPageItems().map((scenario) => (
            <ListViewItem
              key={scenario._id}
              $active={selectedScenario?._id === scenario._id}
              onClick={() => {
                setSelectedScenario(scenario);
                onSetViewMode('charts');
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#3f51b5', 0.1),
                      color: '#3f51b5'
                    }}
                  >
                    <TimelineIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {scenario.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {scenario.description || 'No description provided'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${scenario.totalRunwayMonths || 0} months`}
                        color={scenario.totalRunwayMonths > 12 ? "success" : "warning"}
                      />
                      <Chip
                        size="small"
                        label={scenario.scenarioType}
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
                    {getRelativeTime(scenario.createdAt)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, scenario._id)}
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
            const scenario = scenarios.find(s => s._id === selectedItemId);
            if (scenario) {
              setSelectedScenario(scenario);
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
            const scenario = scenarios.find(s => s._id === selectedItemId);
            if (scenario) {
              onEditItem('scenario', scenario);
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
            const scenario = scenarios.find(s => s._id === selectedItemId);
            onDeleteItem({
              type: 'scenario',
              id: selectedItemId,
              name: scenario?.name || 'this scenario'
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
          Return to Active Scenario
        </Button>
      </Box>
    </Box>
  );
};

export default RunwayScenarioList;