// src/components/financials/CommitmentsTab.jsx
// Commitments & pending payments — the informal liabilities (team dues,
// founder reimbursements, vendor dues) that never hit the expense ledger
// but absolutely hit the runway.
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Stack, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Tooltip, Alert,
  CircularProgress, Divider, LinearProgress, FormControlLabel, Switch,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PaymentsIcon from '@mui/icons-material/Payments';
import { format } from 'date-fns';
import {
  getCommitments, createCommitment, updateCommitment, deleteCommitment,
  addCommitmentPayment,
} from '../../services/api';

const CATEGORIES = [
  { value: 'team_dues', label: 'Team dues' },
  { value: 'founder_reimbursement', label: 'Founder reimbursement' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'loan', label: 'Loan' },
  { value: 'other', label: 'Other' },
];

const STATUS_CHIP = {
  pending: { label: 'Pending', color: 'warning' },
  partially_paid: { label: 'Partially paid', color: 'info' },
  settled: { label: 'Settled', color: 'success' },
  waived: { label: 'Waived', color: 'default' },
};

const fmtINR = (n) => {
  if (n === null || n === undefined) return '—';
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const safeDate = (d, fmt = 'd MMM yyyy') => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : format(dt, fmt);
};

const EMPTY_FORM = {
  direction: 'payable', counterparty: '', title: '', category: 'other',
  totalAmount: '', dueDate: '', payWhen: '', business: '', notes: '',
  includeInRunway: true,
};

const CommitmentsTab = () => {
  const [loading, setLoading] = useState(true);
  const [commitments, setCommitments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [showSettled, setShowSettled] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // commitment being edited, or null
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', date: '', notes: '' });
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCommitments();
      setCommitments(res.data.commitments || []);
      setSummary(res.data.summary || null);
      setError('');
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not load commitments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      direction: c.direction,
      counterparty: c.counterparty || '',
      title: c.title || '',
      category: c.category || 'other',
      totalAmount: c.totalAmount ?? '',
      dueDate: c.dueDate ? c.dueDate.slice(0, 10) : '',
      payWhen: c.payWhen || '',
      business: c.business || '',
      notes: c.notes || '',
      includeInRunway: c.includeInRunway !== false,
    });
    setFormError('');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.counterparty.trim()) { setFormError('Who is this owed to / from?'); return; }
    if (!form.totalAmount || Number(form.totalAmount) <= 0) { setFormError('Enter an amount greater than 0'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        totalAmount: Number(form.totalAmount),
        dueDate: form.dueDate || null,
      };
      if (editing) await updateCommitment(editing._id, payload);
      else await createCommitment(payload);
      setFormOpen(false);
      await load();
    } catch (e) {
      setFormError(e.response?.data?.msg || 'Could not save commitment');
    } finally {
      setSaving(false);
    }
  };

  const handleWaive = async (c) => {
    try {
      await updateCommitment(c._id, { status: c.status === 'waived' ? 'pending' : 'waived' });
      await load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not update commitment');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete the commitment to ${c.counterparty} (${fmtINR(c.totalAmount)})? This cannot be undone.`)) return;
    try {
      await deleteCommitment(c._id);
      await load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not delete commitment');
    }
  };

  const openPay = (c) => {
    setPayTarget(c);
    const outstanding = Math.max(0, c.totalAmount - (c.amountPaid || 0));
    setPayForm({ amount: String(outstanding), date: '', notes: '' });
    setPayError('');
  };

  const handlePay = async () => {
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) { setPayError('Enter an amount greater than 0'); return; }
    setPaySaving(true);
    setPayError('');
    try {
      await addCommitmentPayment(payTarget._id, {
        amount,
        date: payForm.date || undefined,
        notes: payForm.notes || undefined,
      });
      setPayTarget(null);
      await load();
    } catch (e) {
      setPayError(e.response?.data?.msg || 'Could not record payment');
    } finally {
      setPaySaving(false);
    }
  };

  const visible = commitments.filter(c =>
    showSettled ? true : !['settled', 'waived'].includes(c.status));
  const payables = visible.filter(c => c.direction === 'payable');
  const receivables = visible.filter(c => c.direction === 'receivable');

  const summaryCard = (label, value, sub, color) => (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 160 }}>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color: color || 'text.primary' }}>{value}</Typography>
      {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
    </Paper>
  );

  const renderTable = (rows, title) => (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>{title}</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Counterparty</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>For</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Paid</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Outstanding</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Due</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((c) => {
              const outstanding = c.status === 'waived' ? 0 : Math.max(0, c.totalAmount - (c.amountPaid || 0));
              const chip = STATUS_CHIP[c.status] || STATUS_CHIP.pending;
              const catLabel = CATEGORIES.find(x => x.value === c.category)?.label || 'Other';
              const pct = c.totalAmount > 0 ? Math.min(100, Math.round(((c.amountPaid || 0) / c.totalAmount) * 100)) : 0;
              return (
                <TableRow key={c._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.counterparty}</Typography>
                    {c.business && <Typography variant="caption" color="text.secondary">{c.business}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.title || '—'}</Typography>
                    {c.payWhen && <Typography variant="caption" color="text.secondary">{c.payWhen}</Typography>}
                  </TableCell>
                  <TableCell><Chip label={catLabel} size="small" variant="outlined" /></TableCell>
                  <TableCell align="right">{fmtINR(c.totalAmount)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ minWidth: 90 }}>
                      <Typography variant="body2">{fmtINR(c.amountPaid || 0)}</Typography>
                      {c.status === 'partially_paid' && (
                        <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, mt: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: outstanding > 0 ? 'error.main' : 'success.main' }}>
                      {fmtINR(outstanding)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {safeDate(c.dueDate) || c.payWhen || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell><Chip label={chip.label} size="small" color={chip.color} variant={c.status === 'settled' ? 'filled' : 'outlined'} /></TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={0}>
                      {!['settled', 'waived'].includes(c.status) && (
                        <Tooltip title="Record payment">
                          <IconButton size="small" color="primary" onClick={() => openPay(c)}>
                            <PaymentsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(c)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(c)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Commitments &amp; Pending Payments</Typography>
          <Typography variant="body2" color="text.secondary">
            Informal dues that never hit the books — team salaries on hold, founder reimbursements, vendor promises. These reduce your honest runway.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={<Switch size="small" checked={showSettled} onChange={(e) => setShowSettled(e.target.checked)} />}
            label={<Typography variant="body2">Show settled</Typography>}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Commitment</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {summary && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          {summaryCard('We owe', fmtINR(summary.payableOutstanding),
            `${summary.payableCount} open commitment${summary.payableCount === 1 ? '' : 's'}`, 'error.main')}
          {summaryCard('Counts against runway', fmtINR(summary.runwayImpact),
            'subtracted from cash for honest runway', 'warning.main')}
          {summaryCard('Owed to us', fmtINR(summary.receivableOutstanding),
            `${summary.receivableCount} open receivable${summary.receivableCount === 1 ? '' : 's'}`, 'success.main')}
        </Stack>
      )}

      {visible.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>No open commitments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Track money you owe (or are owed) informally — pending salaries, reimbursements, vendor dues.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>Add your first commitment</Button>
        </Paper>
      ) : (
        <>
          {payables.length > 0 && renderTable(payables, 'WE OWE')}
          {receivables.length > 0 && renderTable(receivables, 'OWED TO US')}
        </>
      )}

      {/* ---------- Add / Edit dialog ---------- */}
      <Dialog open={formOpen} onClose={() => !saving && setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Commitment' : 'Add Commitment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <ToggleButtonGroup
              value={form.direction} exclusive size="small" color="primary"
              onChange={(e, v) => v && setForm(f => ({ ...f, direction: v }))}
            >
              <ToggleButton value="payable">We owe</ToggleButton>
              <ToggleButton value="receivable">Owed to us</ToggleButton>
            </ToggleButtonGroup>
            <TextField
              label={form.direction === 'payable' ? 'Owed to (person / company)' : 'Owed by (person / company)'}
              value={form.counterparty} required autoFocus fullWidth
              onChange={(e) => setForm(f => ({ ...f, counterparty: e.target.value }))}
            />
            <TextField
              label="What is it for?" value={form.title} fullWidth
              placeholder="e.g. 3 months pending salary, AWS reimbursement"
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Amount (₹)" type="number" value={form.totalAmount} required fullWidth
                onChange={(e) => setForm(f => ({ ...f, totalAmount: e.target.value }))}
              />
              <TextField
                label="Category" select value={form.category} fullWidth
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Due date" type="date" value={form.dueDate} fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
              <TextField
                label="Or pay when…" value={form.payWhen} fullWidth
                placeholder="e.g. After FFF round closes"
                onChange={(e) => setForm(f => ({ ...f, payWhen: e.target.value }))}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Business (optional)" value={form.business} fullWidth
                placeholder="e.g. ScaleUp"
                onChange={(e) => setForm(f => ({ ...f, business: e.target.value }))}
              />
            </Stack>
            <TextField
              label="Notes" value={form.notes} fullWidth multiline minRows={2}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
            {form.direction === 'payable' && (
              <FormControlLabel
                control={<Switch checked={form.includeInRunway} onChange={(e) => setForm(f => ({ ...f, includeInRunway: e.target.checked }))} />}
                label={<Typography variant="body2">Count against runway (subtract from cash in honest-runway math)</Typography>}
              />
            )}
            {editing && (
              <>
                <Divider />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {editing.status === 'waived' ? 'This commitment is waived.' : 'No longer owed?'}
                  </Typography>
                  <Button size="small" onClick={() => { handleWaive(editing); setFormOpen(false); }}>
                    {editing.status === 'waived' ? 'Un-waive' : 'Mark as waived'}
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add commitment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Record payment dialog ---------- */}
      <Dialog open={!!payTarget} onClose={() => !paySaving && setPayTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Record payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {payError && <Alert severity="error">{payError}</Alert>}
            {payTarget && (
              <Typography variant="body2" color="text.secondary">
                {payTarget.counterparty} — {fmtINR(Math.max(0, payTarget.totalAmount - (payTarget.amountPaid || 0)))} outstanding
              </Typography>
            )}
            <TextField
              label="Amount paid (₹)" type="number" value={payForm.amount} required autoFocus fullWidth
              onChange={(e) => setPayForm(f => ({ ...f, amount: e.target.value }))}
            />
            <TextField
              label="Date" type="date" value={payForm.date} fullWidth
              InputLabelProps={{ shrink: true }} helperText="Leave blank for today"
              onChange={(e) => setPayForm(f => ({ ...f, date: e.target.value }))}
            />
            <TextField
              label="Notes" value={payForm.notes} fullWidth
              onChange={(e) => setPayForm(f => ({ ...f, notes: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayTarget(null)} disabled={paySaving}>Cancel</Button>
          <Button variant="contained" onClick={handlePay} disabled={paySaving}>
            {paySaving ? 'Recording…' : 'Record payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommitmentsTab;
