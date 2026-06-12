// src/components/fundraising/DataRoomTab.jsx
// Investor data rooms: curate documents into a shareable, tokenized link
// and see exactly who viewed and downloaded what.
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Stack, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Tooltip, Alert,
  CircularProgress, Divider, FormControlLabel, Switch, Checkbox, List,
  ListItemButton, ListItemIcon, ListItemText, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import { format, formatDistanceToNow } from 'date-fns';
import {
  getDataRooms, createDataRoom, getDataRoomById, updateDataRoom,
  regenerateDataRoomLink, deleteDataRoom, getDocuments,
  getDataRoomLinkLibrary, deleteSavedLink,
} from '../../services/api';

const safeDate = (d, fmt = 'd MMM yyyy, h:mm a') => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : format(dt, fmt);
};

const fmtSize = (b) => {
  if (!b && b !== 0) return '';
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  if (b >= 1024) return `${Math.round(b / 1024)} KB`;
  return `${b} B`;
};

const roomUrl = (token) => `${window.location.origin}/room/${token}`;

const EMPTY_FORM = { name: '', description: '', requireEmail: true, expiresAt: '', documentIds: [], selectedLinkUrls: [], links: [] };

const DataRoomTab = () => {
  const [rooms, setRooms] = useState([]);
  const [docs, setDocs] = useState([]);
  const [linkLibrary, setLinkLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [detail, setDetail] = useState(null); // populated room with access log
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [roomsRes, docsRes, libRes] = await Promise.all([
        getDataRooms(),
        getDocuments().catch(() => ({ data: [] })),
        getDataRoomLinkLibrary().catch(() => ({ data: { links: [] } })),
      ]);
      setRooms(roomsRes.data.dataRooms || []);
      const d = docsRes.data?.documents || docsRes.data || [];
      setDocs(Array.isArray(d) ? d : []);
      setLinkLibrary(libRes.data?.links || []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not load data rooms');
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

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      name: room.name,
      description: room.description || '',
      requireEmail: room.requireEmail !== false,
      expiresAt: room.expiresAt ? room.expiresAt.slice(0, 10) : '',
      documentIds: (room.documents || []).map(d => d.document?._id || d.document).filter(Boolean),
      selectedLinkUrls: (room.links || [])
        .filter(l => linkLibrary.some(s => s.url === l.url))
        .map(l => l.url),
      links: (room.links || [])
        .filter(l => !linkLibrary.some(s => s.url === l.url))
        .map(l => ({ title: l.title, url: l.url })),
    });
    setFormError('');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Give the data room a name'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        requireEmail: form.requireEmail,
        expiresAt: form.expiresAt || null,
        documentIds: form.documentIds,
        links: [
          ...linkLibrary
            .filter(s => form.selectedLinkUrls.includes(s.url))
            .map(s => ({ title: s.title, url: s.url, description: s.description })),
          ...form.links.filter(l => l.title.trim() && /^https?:\/\/.+/i.test(l.url.trim())),
        ],
      };
      if (editing) await updateDataRoom(editing._id, payload);
      else await createDataRoom(payload);
      setFormOpen(false);
      await load();
    } catch (e) {
      setFormError(e.response?.data?.msg || 'Could not save data room');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async (room) => {
    try {
      await navigator.clipboard.writeText(roomUrl(room.shareToken));
      setToast('Share link copied');
    } catch {
      setToast(roomUrl(room.shareToken));
    }
  };

  const toggleActive = async (room) => {
    try {
      await updateDataRoom(room._id, { isActive: !room.isActive });
      await load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not update data room');
    }
  };

  const regenerate = async (room) => {
    if (!window.confirm('Regenerate the link? Anyone holding the current link loses access immediately.')) return;
    try {
      await regenerateDataRoomLink(room._id);
      setToast('New link generated');
      await load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not regenerate link');
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete data room "${room.name}"? The documents themselves are not deleted.`)) return;
    try {
      await deleteDataRoom(room._id);
      await load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not delete data room');
    }
  };

  const openDetail = async (room) => {
    setDetailLoading(true);
    try {
      const res = await getDataRoomById(room._id);
      setDetail(res.data.dataRoom);
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not load access log');
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleDoc = (id) => {
    setForm(f => ({
      ...f,
      documentIds: f.documentIds.includes(id)
        ? f.documentIds.filter(x => x !== id)
        : [...f.documentIds, id],
    }));
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Investor Data Rooms</Typography>
          <Typography variant="body2" color="text.secondary">
            Share a curated set of documents with investors via one link — and see who opened what, when.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Data Room</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {rooms.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <FolderSharedIcon sx={{ fontSize: 42, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>No data rooms yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bundle your pitch deck, financials and legal documents into one investor-ready link.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>Create your first data room</Button>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {rooms.map(room => {
            const expired = room.expiresAt && new Date(room.expiresAt) < new Date();
            const open = room.isActive && !expired;
            return (
              <Paper key={room._id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} alignItems={{ md: 'center' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{room.name}</Typography>
                      <Chip
                        size="small"
                        label={open ? 'Live' : expired ? 'Expired' : 'Disabled'}
                        color={open ? 'success' : 'default'}
                        variant={open ? 'filled' : 'outlined'}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {(room.documents || []).length} document{(room.documents || []).length === 1 ? '' : 's'}
                      {(room.links || []).length > 0 ? ` · ${(room.links || []).length} link${(room.links || []).length === 1 ? '' : 's'}` : ''}
                      {' · '}{room.viewCount || 0} visit{(room.viewCount || 0) === 1 ? '' : 's'}
                      {room.lastAccessedAt ? ` · last opened ${formatDistanceToNow(new Date(room.lastAccessedAt), { addSuffix: true })}` : ' · never opened'}
                      {room.expiresAt ? ` · expires ${safeDate(room.expiresAt, 'd MMM yyyy')}` : ''}
                      {room.requireEmail ? ' · email-gated' : ''}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} flexShrink={0}>
                    <Tooltip title="Copy share link"><IconButton color="primary" onClick={() => copyLink(room)}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Who viewed what"><IconButton onClick={() => openDetail(room)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton onClick={() => openEdit(room)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title={room.isActive ? 'Disable link' : 'Enable link'}>
                      <Switch size="small" checked={room.isActive} onChange={() => toggleActive(room)} sx={{ alignSelf: 'center' }} />
                    </Tooltip>
                    <Tooltip title="Regenerate link"><IconButton onClick={() => regenerate(room)}><AutorenewIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(room)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onClose={() => !saving && setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Data Room' : 'New Data Room'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Name" required fullWidth autoFocus placeholder="e.g. FFF Round — Due Diligence"
              value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Note for visitors (optional)" fullWidth multiline minRows={2}
              placeholder="Shown at the top of the room"
              value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Expires on (optional)" type="date" value={form.expiresAt}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 190 }}
                onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
              <FormControlLabel
                control={<Switch checked={form.requireEmail} onChange={(e) => setForm(f => ({ ...f, requireEmail: e.target.checked }))} />}
                label={<Typography variant="body2">Ask visitors for their email</Typography>}
              />
            </Stack>
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Links ({form.selectedLinkUrls.length + form.links.filter(l => l.title.trim() && l.url.trim()).length} selected) — website, pitch site, demo video…
            </Typography>
            {linkLibrary.length > 0 && (
              <List dense sx={{ maxHeight: 180, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {linkLibrary.map(s => (
                  <ListItemButton
                    key={s._id} dense
                    onClick={() => setForm(f => ({
                      ...f,
                      selectedLinkUrls: f.selectedLinkUrls.includes(s.url)
                        ? f.selectedLinkUrls.filter(u => u !== s.url)
                        : [...f.selectedLinkUrls, s.url],
                    }))}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Checkbox edge="start" size="small" checked={form.selectedLinkUrls.includes(s.url)} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <ListItemText
                      primary={s.title}
                      secondary={s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    />
                    <Tooltip title="Remove from library">
                      <IconButton
                        size="small" edge="end"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await deleteSavedLink(s._id);
                            setLinkLibrary(lib => lib.filter(x => x._id !== s._id));
                            setForm(f => ({ ...f, selectedLinkUrls: f.selectedLinkUrls.filter(u => u !== s.url) }));
                          } catch { /* noop */ }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                ))}
              </List>
            )}
            {form.links.map((l, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small" label="Title" value={l.title} sx={{ flex: 1 }}
                  onChange={(e) => setForm(f => ({ ...f, links: f.links.map((x, j) => j === i ? { ...x, title: e.target.value } : x) }))}
                />
                <TextField
                  size="small" label="URL" value={l.url} placeholder="https://…" sx={{ flex: 2 }}
                  error={!!l.url.trim() && !/^https?:\/\/.+/i.test(l.url.trim())}
                  onChange={(e) => setForm(f => ({ ...f, links: f.links.map((x, j) => j === i ? { ...x, url: e.target.value } : x) }))}
                />
                <IconButton size="small" onClick={() => setForm(f => ({ ...f, links: f.links.filter((_, j) => j !== i) }))}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button
              size="small" startIcon={<LinkIcon />} sx={{ alignSelf: 'flex-start' }}
              onClick={() => setForm(f => ({ ...f, links: [...f.links, { title: '', url: '' }] }))}
            >
              Add new link
            </Button>
            {form.links.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                New links are saved to your library for next time.
              </Typography>
            )}
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Documents ({form.documentIds.length} selected)
            </Typography>
            {docs.length === 0 ? (
              <Alert severity="info" variant="outlined">
                No documents uploaded yet — add them on the Documents page first.
              </Alert>
            ) : (
              <List dense sx={{ maxHeight: 260, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {docs.map(d => (
                  <ListItemButton key={d._id} dense onClick={() => toggleDoc(d._id)}>
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Checkbox edge="start" size="small" checked={form.documentIds.includes(d._id)} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <ListItemText
                      primary={d.fileName}
                      secondary={`${d.category || 'Other'}${d.fileSize ? ` · ${fmtSize(d.fileSize)}` : ''}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create data room'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Access log dialog */}
      <Dialog open={!!detail || detailLoading} onClose={() => setDetail(null)} maxWidth="md" fullWidth>
        {detailLoading ? (
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></DialogContent>
        ) : detail && (
          <>
            <DialogTitle sx={{ pb: 0.5 }}>{detail.name} — activity</DialogTitle>
            <DialogContent>
              <Typography variant="caption" color="text.secondary">
                {detail.viewCount || 0} visit{(detail.viewCount || 0) === 1 ? '' : 's'} total · link: {roomUrl(detail.shareToken)}
              </Typography>
              {(detail.accessLog || []).length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">No visits yet. Share the link to start tracking.</Typography>
                </Paper>
              ) : (
                <TableContainer sx={{ mt: 1.5, maxHeight: 420 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>When</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Who</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.accessLog.map((l, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{safeDate(l.at)}</TableCell>
                          <TableCell>{l.email || 'Anonymous'}</TableCell>
                          <TableCell>
                            {l.action === 'download_doc' ? (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <DownloadIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                                <Typography variant="body2">{l.fileName || 'Document'}</Typography>
                              </Stack>
                            ) : l.action === 'view_link' ? (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <LinkIcon sx={{ fontSize: 15, color: 'info.main' }} />
                                <Typography variant="body2">Visited {l.fileName || l.linkUrl || 'link'}</Typography>
                              </Stack>
                            ) : (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <InsertDriveFileIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                                <Typography variant="body2">Opened the room</Typography>
                              </Stack>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetail(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={!!toast} autoHideDuration={2500} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default DataRoomTab;
