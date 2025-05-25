// src/components/common/ResponsiveTable.jsx
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Typography, Box, Stack, Chip, IconButton,
  useMediaQuery, useTheme, Divider, alpha, Collapse, Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Styled Components
const MobileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const MobileCardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const DataRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  },
}));

const ScrollableTableContainer = styled(TableContainer)(({ theme }) => ({
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: alpha(theme.palette.divider, 0.1),
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 4,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

/**
 * ResponsiveTable - A table component that transforms into cards on mobile
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions
 *   - { field: string, headerName: string, width?: number, renderCell?: function, align?: string }
 * @param {Array} props.rows - Array of data rows
 * @param {Function} props.onRowClick - Optional click handler for rows
 * @param {string} props.keyField - Field to use as key (default: 'id' or '_id')
 * @param {boolean} props.stickyHeader - Whether to use sticky header on desktop
 * @param {number} props.maxHeight - Maximum height for scrollable table
 * @param {Object} props.mobileConfig - Configuration for mobile view
 *   - { primaryField: string, secondaryField: string, showExpanded: boolean }
 */
const ResponsiveTable = ({
  columns,
  rows,
  onRowClick,
  keyField,
  stickyHeader = true,
  maxHeight,
  mobileConfig = {},
  actions,
  ...otherProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedRows, setExpandedRows] = React.useState({});

  const getRowKey = (row) => {
    if (keyField) return row[keyField];
    return row.id || row._id || JSON.stringify(row);
  };

  const handleExpandClick = (rowKey) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowKey]: !prev[rowKey]
    }));
  };

  const getCellValue = (row, column) => {
    if (column.renderCell) {
      return column.renderCell({ row, value: row[column.field] });
    }
    return row[column.field];
  };

  // Mobile Card View
  if (isMobile) {
    const { primaryField, secondaryField, chipField, showExpanded = true } = mobileConfig;
    
    return (
      <Stack spacing={2}>
        {rows.map((row) => {
          const rowKey = getRowKey(row);
          const isExpanded = expandedRows[rowKey];
          
          // Determine primary and secondary display fields
          const primaryColumn = columns.find(col => col.field === primaryField) || columns[0];
          const secondaryColumn = columns.find(col => col.field === secondaryField) || columns[1];
          const chipColumn = columns.find(col => col.field === chipField);
          
          return (
            <MobileCard key={rowKey}>
              <MobileCardHeader onClick={() => showExpanded && handleExpandClick(rowKey)}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {getCellValue(row, primaryColumn)}
                    </Typography>
                    {secondaryColumn && (
                      <Typography variant="body2" color="text.secondary">
                        {getCellValue(row, secondaryColumn)}
                      </Typography>
                    )}
                  </Box>
                  
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {chipColumn && (
                      <Box>{getCellValue(row, chipColumn)}</Box>
                    )}
                    {actions && (
                      <Box onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </Box>
                    )}
                    {showExpanded && (
                      <IconButton size="small">
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              </MobileCardHeader>
              
              {showExpanded && (
                <Collapse in={isExpanded}>
                  <CardContent>
                    {columns
                      .filter(col => 
                        col.field !== primaryField && 
                        col.field !== secondaryField && 
                        col.field !== chipField
                      )
                      .map((column) => (
                        <DataRow key={column.field}>
                          <Typography variant="caption" color="text.secondary">
                            {column.headerName}
                          </Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            {getCellValue(row, column)}
                          </Box>
                        </DataRow>
                      ))}
                  </CardContent>
                </Collapse>
              )}
            </MobileCard>
          );
        })}
      </Stack>
    );
  }

  // Desktop Table View
  return (
    <ScrollableTableContainer 
      component={Paper}
      sx={{ maxHeight, borderRadius: 2 }}
    >
      <Table stickyHeader={stickyHeader} {...otherProps}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.field}
                align={column.align || 'left'}
                sx={{
                  fontWeight: 700,
                  backgroundColor: theme.palette.background.paper,
                  width: column.width,
                  minWidth: column.minWidth,
                }}
              >
                {column.headerName}
              </TableCell>
            ))}
            {actions && (
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 700, 
                  backgroundColor: theme.palette.background.paper,
                  width: 100 
                }}
              >
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const rowKey = getRowKey(row);
            return (
              <TableRow
                key={rowKey}
                hover
                onClick={() => onRowClick && onRowClick(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.field} align={column.align || 'left'}>
                    {getCellValue(row, column)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollableTableContainer>
  );
};

// Example usage component showing how to implement ResponsiveTable
export const ResponsiveTableExample = () => {
  const theme = useTheme();
  
  // Example columns definition
  const columns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      renderCell: ({ value }) => new Date(value).toLocaleDateString()
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      minWidth: 200 
    },
    { 
      field: 'type', 
      headerName: 'Type',
      renderCell: ({ value }) => (
        <Chip 
          label={value} 
          size="small" 
          color={value === 'income' ? 'success' : 'error'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      align: 'right',
      renderCell: ({ value }) => `₹${value.toLocaleString()}`
    },
  ];
  
  // Example data
  const rows = [
    { id: 1, date: new Date(), description: 'Office Rent', type: 'expense', amount: 50000 },
    { id: 2, date: new Date(), description: 'Client Payment', type: 'income', amount: 150000 },
    // ... more rows
  ];
  
  // Example actions
  const actions = (row) => (
    <Stack direction="row" spacing={0.5}>
      <IconButton size="small" onClick={() => console.log('Edit', row)}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => console.log('Delete', row)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
  
  return (
    <ResponsiveTable
      columns={columns}
      rows={rows}
      onRowClick={(row) => console.log('Row clicked:', row)}
      mobileConfig={{
        primaryField: 'description',
        secondaryField: 'date',
        chipField: 'type',
        showExpanded: true
      }}
      actions={actions}
      stickyHeader
      maxHeight={400}
    />
  );
};

export default ResponsiveTable;