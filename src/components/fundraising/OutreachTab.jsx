// src/components/fundraising/OutreachTab.jsx
// AI-personalized investor outreach: save the business write-up once, add a
// person, let the platform research them online, draft an email that
// connects your business to their history — then send it from your own
// mail app with one click.
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Stack, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Tooltip, Alert,
  CircularProgress, Divider, Collapse, Link, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';
import {
  getOutreachProfile, updateOutreachProfile, getOutreachTargets,
  createOutreachTarget, updateOutreachTarget, deleteOutreachTarget,
  researchOutreachTarget, draftOutreachEmail, markOutreachSent,
} from '../../services/api';

const STATUS_META = {
  new: { label: 'New', color: 'default' },
  researched: { label: 'Researched', color: 'info' },
  drafted: { label: 'Draft ready', color: 'primary' },
  sent: { label: 'Sent', color: 'success' },
};

const EMPTY_PERSON = { name: '', email: '', linkedinUrl: '', otherLinks: '', notes: '' };

const OutreachTab = () => {
  const [writeup, setWriteup] = useState('');
  const [savedWriteup, setSavedWriteup] = useState('');
  const [writeupOpen, setWriteupOpen] = useState(false);
  const [savingWriteup, setSavingWriteup] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);

  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [personOpen, setPersonOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personForm, setPersonForm] = useState(EMPTY_PERSON);
  const [savingPerson, setSavingPerson] = useState(false);
  const [personError, setPersonError] = useState('');

  const [detail, setDetail] = useState(null); // the open target
  const [busy, setBusy] = useState(''); // 'research' | 'draft' | 'save' | 'sent'
  const [feedback, setFeedback] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [detailError, setDetailError] = useState('');
  const [sentPromptOpen, setSentPromptOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, targetsRes] = await Promise.all([getOutreachProfile(), getOutreachTargets()]);
      setWriteup(profileRes.data.businessWriteup || '');
      setSavedWriteup(profileRes.data.businessWriteup || '');
      setAiAvailable(profileRes.data.aiAvailable !== false);
      setTargets(targetsRes.data.targets || []);
      setWriteupOpen(!(profileRes.data.businessWriteup || '').trim());
      setError('');
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not load outreach');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveWriteup = async () => {
    setSavingWriteup(true);
    try {
      await updateOutreachProfile({ businessWriteup: writeup });
      setSavedWriteup(writeup);
      setToast('Write-up saved');
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not save write-up');
    } finally {
      setSavingWriteup(false);
    }
  };

  const openAddPerson = () => {
    setEditingPerson(null);
    setPersonForm(EMPTY_PERSON);
    setPersonError('');
    setPersonOpen(true);
  };

  const openEditPerson = (t) => {
    setEditingPerson(t);
    setPersonForm({
      name: t.name || '', email: t.email || '', linkedinUrl: t.linkedinUrl || '',
      otherLinks: (t.otherLinks || []).join('\n'), notes: t.notes || '',
    });
    setPersonError('');
    setPersonOpen(true);
  };

  const savePerson = async () => {
    if (!personForm.name.trim()) { setPersonError('Name is required'); return; }
    setSavingPerson(true);
    setPersonError('');
    try {
      const payload = {
        name: personForm.name.trim(),
        email: personForm.email.trim() || undefined,
        linkedinUrl: personForm.linkedinUrl.trim() || undefined,
        otherLinks: personForm.otherLinks.split('\n').map(s => s.trim()).filter(Boolean),
        notes: personForm.notes.trim() || undefined,
      };
      if (editingPerson) {
        const res = await updateOutreachTarget(editingPerson._id, payload);
        if (detail && detail._id === editingPerson._id) setDetail(res.data.target);
      } else {
        await createOutreachTarget(payload);
      }
      setPersonOpen(false);
      await load();
    } catch (e) {
      setPersonError(e.response?.data?.msg || 'Could not save person');
    } finally {
      setSavingPerson(false);
    }
  };

  const removePerson = async (t) => {
    if (!window.confirm(`Remove ${t.name} from outreach?`)) return;
    try {
      await deleteOutreachTarget(t._id);
      if (detail && detail._id === t._id) setDetail(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not remove person');
    }
  };

  const openDetail = (t) => {
    setDetail(t);
    setDraftSubject(t.draft?.subject || '');
    setDraftBody(t.draft?.body || '');
    setFeedback('');
    setDetailError('');
  };

  const refreshTargetInState = (target) => {
    setDetail(target);
    setDraftSubject(target.draft?.subject || '');
    setDraftBody(target.draft?.body || '');
    setTargets(prev => prev.map(x => x._id === target._id ? target : x));
  };

  const runResearch = async () => {
    setBusy('research');
    setDetailError('');
    try {
      const res = await researchOutreachTarget(detail._id);
      refreshTargetInState(res.data.target);
    } catch (e) {
      setDetailError(e.response?.data?.msg || 'Research failed — try again');
    } finally {
      setBusy('');
    }
  };

  const runDraft = async (withFeedback) => {
    setBusy('draft');
    setDetailError('');
    try {
      const res = await draftOutreachEmail(detail._id, withFeedback ? { feedback } : {});
      refreshTargetInState(res.data.target);
      setFeedback('');
    } catch (e) {
      setDetailError(e.response?.data?.msg || 'Drafting failed — try again');
    } finally {
      setBusy('');
    }
  };

  const saveDraftEdits = async () => {
    setBusy('save');
    try {
      const res = await updateOutreachTarget(detail._id, { draft: { subject: draftSubject, body: draftBody } });
      refreshTargetInState(res.data.target);
      setToast('Draft saved');
    } catch (e) {
      setDetailError(e.response?.data?.msg || 'Could not save draft');
    } finally {
      setBusy('');
    }
  };

  const draftDirty = detail && (draftSubject !== (detail.draft?.subject || '') || draftBody !== (detail.draft?.body || ''));

  const openInMailApp = async () => {
    if (draftDirty) await saveDraftEdits();
    const mailto = `mailto:${encodeURIComponent(detail.email || '')}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`;
    window.location.href = mailto;
    setSentPromptOpen(true);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${draftSubject}\n\n${draftBody}`);
      setToast('Email copied to clipboard');
    } catch { setToast('Copy failed — select the text manually'); }
  };

  const confirmSent = async (addToPipeline) => {
    setBusy('sent');
    try {
      const res = await markOutreachSent(detail._id, { addToPipeline });
      refreshTargetInState(res.data.target);
      setSentPromptOpen(false);
      setToast(addToPipeline ? 'Marked sent · added to pipeline' : 'Marked as sent');
    } catch (e) {
      setDetailError(e.response?.data?.msg || 'Could not mark as sent');
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Personalized Outreach</Typography>
          <Typography variant="body2" color="text.secondary">
            Add a person, let the platform research them, get an email drafted around what they've actually backed — then send it from your own mailbox.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddPerson}>Add Person</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {!aiAvailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          AI research and drafting need an ANTHROPIC_API_KEY on the server. Adding people still works.
        </Alert>
      )}

      {/* Business write-up */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Stack
          direction="row" justifyContent="space-between" alignItems="center"
          sx={{ px: 2, py: 1.25, cursor: 'pointer' }} onClick={() => setWriteupOpen(o => !o)}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Your business write-up</Typography>
            {savedWriteup.trim()
              ? <Chip size="small" label="Saved" color="success" variant="outlined" />
              : <Chip size="small" label="Required for drafting" color="warning" />}
          </Stack>
          {writeupOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Stack>
        <Collapse in={writeupOpen}>
          <Box sx={{ px: 2, pb: 2 }}>
            <TextField
              fullWidth multiline minRows={5} maxRows={14}
              placeholder="What your business does, the problem, traction, team, why now. The richer this is, the sharper every drafted email gets."
              value={writeup} onChange={(e) => setWriteup(e.target.value)}
            />
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
              <Button variant="contained" size="small" onClick={saveWriteup} disabled={savingWriteup || writeup === savedWriteup}>
                {savingWriteup ? 'Saving…' : 'Save write-up'}
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      {/* Targets list */}
      {targets.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <TravelExploreIcon sx={{ fontSize: 42, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>No one in your outreach list yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add an investor's name, email and LinkedIn — the platform does the homework.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openAddPerson}>Add your first person</Button>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {targets.map(t => {
            const meta = STATUS_META[t.status] || STATUS_META.new;
            return (
              <Paper
                key={t._id} variant="outlined"
                sx={{ p: 1.75, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                onClick={() => openDetail(t)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {t.email || 'no email yet'}
                      {t.sentAt ? ` · sent ${formatDistanceToNow(new Date(t.sentAt), { addSuffix: true })}` : ''}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
                    <Chip size="small" label={meta.label} color={meta.color} variant={t.status === 'sent' ? 'filled' : 'outlined'} />
                    <Tooltip title="Edit details">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditPerson(t); }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); removePerson(t); }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Add / edit person dialog */}
      <Dialog open={personOpen} onClose={() => !savingPerson && setPersonOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPerson ? 'Edit person' : 'Add a person'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {personError && <Alert severity="error">{personError}</Alert>}
            <TextField label="Name" required autoFocus fullWidth value={personForm.name}
              onChange={(e) => setPersonForm(f => ({ ...f, name: e.target.value }))} />
            <TextField label="Email" type="email" fullWidth value={personForm.email}
              onChange={(e) => setPersonForm(f => ({ ...f, email: e.target.value }))} />
            <TextField label="LinkedIn URL" fullWidth value={personForm.linkedinUrl} placeholder="https://www.linkedin.com/in/…"
              onChange={(e) => setPersonForm(f => ({ ...f, linkedinUrl: e.target.value }))} />
            <TextField label="Other links (one per line)" fullWidth multiline minRows={2} value={personForm.otherLinks}
              placeholder="Fund website, Crunchbase, a podcast they were on…"
              onChange={(e) => setPersonForm(f => ({ ...f, otherLinks: e.target.value }))} />
            <TextField label="What you know about them" fullWidth multiline minRows={2} value={personForm.notes}
              placeholder='e.g. "Met at the Delhi founders dinner", "Angel, exited his edtech in 2022"'
              onChange={(e) => setPersonForm(f => ({ ...f, notes: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPersonOpen(false)} disabled={savingPerson}>Cancel</Button>
          <Button variant="contained" onClick={savePerson} disabled={savingPerson}>
            {savingPerson ? 'Saving…' : editingPerson ? 'Save' : 'Add person'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail dialog: research → draft → send */}
      <Dialog open={!!detail} onClose={() => !busy && setDetail(null)} maxWidth="md" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ pb: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {detail.name}
                <Chip size="small" label={(STATUS_META[detail.status] || STATUS_META.new).label}
                  color={(STATUS_META[detail.status] || STATUS_META.new).color} />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Typography variant="caption" color="text.secondary">
                {detail.email || 'no email'}{detail.linkedinUrl ? ' · ' : ''}
                {detail.linkedinUrl && <Link href={detail.linkedinUrl} target="_blank" rel="noopener">LinkedIn</Link>}
              </Typography>

              {detailError && <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setDetailError('')}>{detailError}</Alert>}

              {/* Research */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 0.75 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  <TravelExploreIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Research
                  {detail.research?.researchedAt && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {formatDistanceToNow(new Date(detail.research.researchedAt), { addSuffix: true })}
                    </Typography>
                  )}
                </Typography>
                <Button
                  size="small" variant={detail.research?.summary ? 'text' : 'contained'}
                  startIcon={busy === 'research' ? <CircularProgress size={14} /> : detail.research?.summary ? <RefreshIcon /> : <TravelExploreIcon />}
                  onClick={runResearch} disabled={!!busy || !aiAvailable}
                >
                  {busy === 'research' ? 'Researching… (~30s)' : detail.research?.summary ? 'Re-research' : 'Research online'}
                </Button>
              </Stack>
              {detail.research?.summary ? (
                <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 220, overflow: 'auto', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detail.research.summary}</Typography>
                  {(detail.research.sources || []).length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Sources: {detail.research.sources.map((s, i) => (
                          <span key={i}>{i > 0 && ' · '}<Link href={s.url} target="_blank" rel="noopener">{s.title?.slice(0, 50) || s.url}</Link></span>
                        ))}
                      </Typography>
                    </>
                  )}
                </Paper>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Not researched yet — the draft gets dramatically better with research.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Draft */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Email draft
                </Typography>
                <Button
                  size="small" variant={detail.draft?.body ? 'text' : 'contained'}
                  startIcon={busy === 'draft' ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
                  onClick={() => runDraft(false)} disabled={!!busy || !aiAvailable}
                >
                  {busy === 'draft' ? 'Drafting…' : detail.draft?.body ? 'Redraft' : 'Draft email'}
                </Button>
              </Stack>

              {(detail.draft?.body || draftBody) ? (
                <Stack spacing={1.25}>
                  <TextField
                    label="Subject" size="small" fullWidth value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value)}
                  />
                  <TextField
                    label="Body" fullWidth multiline minRows={7} maxRows={16} value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      size="small" fullWidth placeholder='Tweak it: "shorter", "more formal", "lead with traction"…'
                      value={feedback} onChange={(e) => setFeedback(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && feedback.trim()) { e.preventDefault(); runDraft(true); } }}
                    />
                    <Button size="small" variant="outlined" onClick={() => runDraft(true)} disabled={!!busy || !feedback.trim() || !aiAvailable}>
                      Redraft with feedback
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No draft yet. Save your business write-up, research the person, then hit Draft email.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
              {draftDirty && (
                <Button size="small" onClick={saveDraftEdits} disabled={!!busy}>
                  {busy === 'save' ? 'Saving…' : 'Save edits'}
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              <Button startIcon={<ContentCopyIcon />} onClick={copyEmail} disabled={!draftBody}>Copy</Button>
              <Button
                variant="contained" startIcon={<MailOutlineIcon />}
                onClick={openInMailApp} disabled={!draftBody || !detail.email || !!busy}
              >
                Open in my email app
              </Button>
              {detail.status !== 'sent' && (
                <Button startIcon={<CheckCircleIcon />} onClick={() => setSentPromptOpen(true)} disabled={!draftBody}>
                  Mark sent
                </Button>
              )}
              <Button onClick={() => setDetail(null)} disabled={!!busy}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Did-you-send prompt */}
      <Dialog open={sentPromptOpen} onClose={() => setSentPromptOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Did you send it?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Mark {detail?.name} as contacted. Adding them to your investor pipeline logs this email as the first interaction.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSentPromptOpen(false)} disabled={busy === 'sent'}>Not yet</Button>
          <Button onClick={() => confirmSent(false)} disabled={busy === 'sent'}>Sent (don't add)</Button>
          <Button variant="contained" onClick={() => confirmSent(true)} disabled={busy === 'sent'}>
            {busy === 'sent' ? 'Saving…' : 'Sent + add to pipeline'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast} autoHideDuration={2500} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default OutreachTab;
