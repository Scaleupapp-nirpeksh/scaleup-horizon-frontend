// src/components/fundraising/InvestorUpdatesTab.jsx
// One-click investor updates: generate a draft from live data, edit the
// intro and asks, pick recipients, preview the actual email, send.
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Stack, TextField, Button, Checkbox, Chip,
  Divider, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Snackbar, Alert, Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import { format } from 'date-fns';
import {
  getInvestors, buildInvestorUpdateDraft, sendInvestorUpdate, getInvestorUpdates
} from '../../services/api';

const InvestorUpdatesTab = () => {
  const [investors, setInvestors] = useState([]);
  const [history, setHistory] = useState([]);
  const [intro, setIntro] = useState('');
  const [asks, setAsks] = useState('');
  const [subject, setSubject] = useState('');
  const [draft, setDraft] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [extraEmails, setExtraEmails] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [invRes, histRes] = await Promise.all([getInvestors(), getInvestorUpdates()]);
      setInvestors((invRes.data || []).filter(i => i.email));
      setHistory(histRes.data || []);
    } catch (err) {
      console.error('Error loading investor updates data:', err);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateDraft = async () => {
    setDrafting(true);
    try {
      const res = await buildInvestorUpdateDraft({ intro, asks });
      setDraft(res.data);
      if (!subject) setSubject(res.data.subject);
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not build the draft' });
    } finally {
      setDrafting(false);
    }
  };

  const recipients = [
    ...investors.filter(i => selectedIds.includes(i._id))
      .map(i => ({ email: i.email, name: i.name, investorId: i._id })),
    ...extraEmails.split(/[,;\s]+/).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      .map(e => ({ email: e })),
  ];

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await sendInvestorUpdate({ subject, intro, asks, recipients });
      setMessage({ type: 'success', text: res.data.msg });
      setConfirmOpen(false);
      setSelectedIds([]);
      setExtraEmails('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Send failed' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Compose column */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Compose update
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              The numbers — cash, burn, runway, users, fundraise progress, shipped work —
              are pulled live from your workspace. You only write the human parts.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Intro (optional)"
                multiline minRows={3} maxRows={8} fullWidth
                placeholder="Hi all — quick update on the month. The headline: …"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
              />
              <TextField
                label="Asks — how investors can help (optional)"
                multiline minRows={2} maxRows={6} fullWidth
                placeholder="Intros to ed-tech CFOs · A strong senior React engineer · …"
                value={asks}
                onChange={(e) => setAsks(e.target.value)}
              />
              <Button
                variant="outlined"
                startIcon={drafting ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={generateDraft}
                disabled={drafting}
              >
                {draft ? 'Regenerate preview' : 'Generate preview'}
              </Button>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Recipients
            </Typography>
            {investors.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No investors with email addresses yet — add emails on the Investors tab,
                or use the field below.
              </Typography>
            ) : (
              <Stack sx={{ maxHeight: 220, overflowY: 'auto' }}>
                {investors.map(inv => (
                  <FormControlLabel
                    key={inv._id}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(inv._id)}
                        onChange={(e) => setSelectedIds(prev =>
                          e.target.checked ? [...prev, inv._id] : prev.filter(id => id !== inv._id))}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {inv.name} <Typography component="span" variant="caption" color="text.secondary">({inv.email}) · {inv.status}</Typography>
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            )}
            <TextField
              label="Other emails (comma-separated)"
              size="small" fullWidth sx={{ mt: 1.5 }}
              value={extraEmails}
              onChange={(e) => setExtraEmails(e.target.value)}
            />

            <TextField
              label="Subject"
              size="small" fullWidth sx={{ mt: 2 }}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Generated automatically — edit if you like"
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              sx={{ mt: 2 }}
              disabled={!draft || recipients.length === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Send to {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
            </Button>
          </Paper>
        </Grid>

        {/* Preview column */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, minHeight: 480 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Email preview
            </Typography>
            {!draft ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 380 }}>
                <Typography variant="body2" color="text.secondary">
                  Click "Generate preview" to see the exact email your investors will receive.
                </Typography>
              </Stack>
            ) : (
              <Box
                component="iframe"
                title="Investor update preview"
                srcDoc={draft.html}
                sx={{ width: '100%', height: 560, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              />
            )}
          </Paper>
        </Grid>

        {/* History */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <HistoryIcon fontSize="small" color="action" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Sent updates
              </Typography>
            </Stack>
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing sent yet — your first update will appear here.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1}>
                {history.map(u => (
                  <Stack key={u._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{u.subject}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')} · sent by {u.sentBy?.name || '—'}
                      </Typography>
                    </Box>
                    <Chip size="small" label={`${u.sentCount} sent${u.failedCount ? ` · ${u.failedCount} failed` : ''}`} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Send confirmation */}
      <Dialog open={confirmOpen} onClose={() => !sending && setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Send this update?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Real emails will be sent to <b>{recipients.length}</b> recipient{recipients.length === 1 ? '' : 's'}:
          </Typography>
          <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.5, mt: 1.5 }}>
            {recipients.map(r => <Chip key={r.email} size="small" label={r.email} />)}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={sending}>Cancel</Button>
          <Button variant="contained" onClick={handleSend} disabled={sending}
            startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}>
            {sending ? 'Sending…' : 'Send now'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={5000} onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={message?.type || 'info'} onClose={() => setMessage(null)}>
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvestorUpdatesTab;
