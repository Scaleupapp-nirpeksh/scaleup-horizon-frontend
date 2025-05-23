// src/pages/FinancialsPage.jsx
// Page to host financial forms and lists using MUI.
import React, { useState, useEffect, useCallback } from 'react';
import ExpenseForm from '../components/financials/ExpenseForm';
import RevenueForm from '../components/financials/RevenueForm';
import BankAccountForm from '../components/financials/BankAccountForm';
import { getExpenses, getRevenue, getBankAccounts, deleteExpense, deleteRevenue, deleteBankAccount } from '../services/api';
import { 
  Container, Grid, Typography, Box, Paper, List, ListItem, ListItemText, IconButton, Divider, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

const FinancialsPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  
  const [accountToEdit, setAccountToEdit] = useState(null);
  // Add similar states for editing expense and revenue if needed later
  
  const [loading, setLoading] = useState({ expenses: false, revenue: false, bankAccounts: false });
  const [error, setError] = useState('');
  const [globalMessage, setGlobalMessage] = useState({type: '', text: ''});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: '' });


  const fetchData = useCallback(async () => {
    setLoading({ expenses: true, revenue: true, bankAccounts: true });
    setError('');
    try {
      const [expensesRes, revenueRes, bankAccountsRes] = await Promise.all([
        getExpenses({ limit: 10, sort: '-date' }), // Fetch recent 10 for display
        getRevenue({ limit: 10, sort: '-date' }),
        getBankAccounts()
      ]);
      setExpenses(expensesRes.data || []);
      setRevenues(revenueRes.data || []);
      setBankAccounts(bankAccountsRes.data || []);
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Failed to load financial data. Please try again.");
      setGlobalMessage({type: 'error', text: "Failed to load financial data."});
    } finally {
      setLoading({ expenses: false, revenue: false, bankAccounts: false });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataAddedOrUpdated = () => {
    fetchData(); // Refetch all data
    setGlobalMessage({type: 'success', text: 'Data updated successfully!'});
    setTimeout(() => setGlobalMessage({type: '', text: ''}), 3000);
  };
  
  const handleEditAccount = (account) => {
    setAccountToEdit(account);
    const formSection = document.getElementById('bank-account-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditAccount = () => {
    setAccountToEdit(null);
  };

  const openDeleteDialog = (id, type) => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete({ id: null, type: '' });
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete.id || !itemToDelete.type) return;
    
    try {
      if (itemToDelete.type === 'expense') await deleteExpense(itemToDelete.id);
      else if (itemToDelete.type === 'revenue') await deleteRevenue(itemToDelete.id);
      else if (itemToDelete.type === 'bankAccount') await deleteBankAccount(itemToDelete.id);
      
      setGlobalMessage({type: 'success', text: `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted successfully!`});
      fetchData(); // Refresh data
    } catch (err) {
      console.error(`Error deleting ${itemToDelete.type}:`, err);
      setGlobalMessage({type: 'error', text: `Failed to delete ${itemToDelete.type}.`});
    } finally {
      closeDeleteDialog();
    }
  };


  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Financial Management
      </Typography>
      
      <AlertMessage message={globalMessage.text} severity={globalMessage.type || 'info'} />
      {error && <AlertMessage message={error} severity="error" />}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ExpenseForm onExpenseAdded={handleDataAddedOrUpdated} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RevenueForm onRevenueAdded={handleDataAddedOrUpdated} />
        </Grid>
      </Grid>
      
      <Box mt={4} id="bank-account-form-section">
        <BankAccountForm 
            onAccountUpdated={handleDataAddedOrUpdated} 
            accountToEditProp={accountToEdit} 
            onCancelEdit={handleCancelEditAccount}
            key={accountToEdit ? accountToEdit._id : 'new-bank-account'} // Force re-render on edit change
        />
      </Box>

      <Box mt={5}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
          Recent Financial Activities
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">Bank Accounts</Typography>
              {loading.bankAccounts ? <LoadingSpinner message="Loading accounts..."/> : bankAccounts.length > 0 ? (
                <List dense>
                  {bankAccounts.map(acc => (
                    <React.Fragment key={acc._id}>
                      <ListItem
                        secondaryAction={
                          <>
                            <Tooltip title="Edit/Update Balance">
                              <IconButton edge="end" aria-label="edit" onClick={() => handleEditAccount(acc)} size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                             <Tooltip title="Delete Account">
                              <IconButton edge="end" aria-label="delete" onClick={() => openDeleteDialog(acc._id, 'bankAccount')} size="small" sx={{ml: 1}}>
                                <DeleteIcon fontSize="small" color="error"/>
                              </IconButton>
                            </Tooltip>
                          </>
                        }
                      >
                        <ListItemText 
                          primary={`${acc.accountName} (${acc.bankName})`} 
                          secondary={`Balance: ₹${acc.currentBalance.toLocaleString()}`} 
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : <Typography variant="body2" color="text.secondary">No bank accounts added yet.</Typography>}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="error.main">Recent Expenses (Max 5)</Typography>
              {loading.expenses ? <LoadingSpinner message="Loading expenses..."/> : expenses.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.slice(0,5).map(exp => (
                        <TableRow key={exp._id} hover>
                          <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                          <TableCell sx={{maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={exp.description}>{exp.description}</TableCell>
                          <TableCell align="right">₹{exp.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {/* <IconButton size="small" onClick={() => {}}><EditIcon fontSize="inherit"/></IconButton> */}
                            <IconButton size="small" onClick={() => openDeleteDialog(exp._id, 'expense')}><DeleteIcon fontSize="inherit" color="error"/></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : <Typography variant="body2" color="text.secondary">No expenses recorded yet.</Typography>}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="success.main">Recent Revenue (Max 5)</Typography>
              {loading.revenue ? <LoadingSpinner message="Loading revenue..."/> : revenues.length > 0 ? (
                 <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                         <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {revenues.slice(0,5).map(rev => (
                        <TableRow key={rev._id} hover>
                          <TableCell>{new Date(rev.date).toLocaleDateString()}</TableCell>
                          <TableCell sx={{maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={rev.description}>{rev.description}</TableCell>
                          <TableCell align="right">₹{rev.amount.toLocaleString()}</TableCell>
                           <TableCell>
                            {/* <IconButton size="small" onClick={() => {}}><EditIcon fontSize="inherit"/></IconButton> */}
                            <IconButton size="small" onClick={() => openDeleteDialog(rev._id, 'revenue')}><DeleteIcon fontSize="inherit" color="error"/></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : <Typography variant="body2" color="text.secondary">No revenue recorded yet.</Typography>}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default FinancialsPage;
