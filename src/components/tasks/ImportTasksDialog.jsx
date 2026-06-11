// src/components/tasks/ImportTasksDialog.jsx
// CSV import with server-side dry-run preview before anything is written.
// Columns (header row required, case-insensitive): Title*, Description,
// Category, Subcategory, Priority, Status, Assignee (email), Due Date,
// Start Date, Tags, Parent (epic key e.g. SLT-50), Type (epic|task)
import React, { useState } from 'react';
import {
  Alert, Autocomplete, Button, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { importTasksCsv } from '../../services/api';

const ImportTasksDialog = ({ open, onClose, epics = [], onImported }) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [defaultEpic, setDefaultEpic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const reset = () => {
    setCsvText(''); setFileName(''); setDefaultEpic(null);
    setPreview(null); setSummary(null); setError(''); setDone(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(String(ev.target.result || ''));
    reader.onerror = () => setError('Could not read the file');
    reader.readAsText(file);
    // allow re-selecting the same file
    e.target.value = '';
  };

  const runDryRun = async () => {
    setBusy(true); setError(''); setDone(null);
    try {
      const res = await importTasksCsv({
        csv: csvText,
        dryRun: true,
        defaultParentKey: defaultEpic?.taskKey || undefined
      });
      setPreview(res.data.preview || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Preview failed');
      setPreview(null); setSummary(null);
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    setBusy(true); setError('');
    try {
      const res = await importTasksCsv({
        csv: csvText,
        dryRun: false,
        defaultParentKey: defaultEpic?.taskKey || undefined
      });
      setDone(res.data);
      onImported && onImported();
    } catch (err) {
      setError(err.response?.data?.msg || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Import Tasks from CSV</DialogTitle>
      <DialogContent>
        {done ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 56 }} />
            <Typography variant="h6">{done.msg}</Typography>
            {done.createdKeys?.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Created: {done.createdKeys.slice(0, 20).join(', ')}
                {done.createdKeys.length > 20 ? ` …and ${done.createdKeys.length - 20} more` : ''}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
              Header row required. Recognized columns: <b>Title</b> (required), Description, Category,
              Subcategory, Priority, Status, Assignee (email), Due Date, Start Date, Tags, Parent
              (epic key like SLT-50), Type (epic/task). Save your Excel sheet as CSV first.
            </Alert>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                Choose .csv file
                <input type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
              </Button>
              {fileName && <Chip label={fileName} onDelete={() => { setFileName(''); setCsvText(''); setPreview(null); }} />}
              <Autocomplete
                options={epics}
                getOptionLabel={(o) => `${o.taskKey ? o.taskKey + ' — ' : ''}${o.title}`}
                value={defaultEpic}
                onChange={(e, v) => setDefaultEpic(v)}
                size="small"
                sx={{ minWidth: 280, flex: 1 }}
                renderInput={(params) => (
                  <TextField {...params} label="Default parent epic (for rows without a Parent column)" />
                )}
              />
            </Stack>

            <TextField
              label="Or paste CSV here"
              multiline
              minRows={4}
              maxRows={10}
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setPreview(null); }}
              placeholder={'Title,Priority,Status,Due Date,Assignee\nCall the bank,high,todo,2026-07-01,nirpeksh@scaleupapp.club'}
              sx={{ fontFamily: 'monospace' }}
            />

            {error && <Alert severity="error">{error}</Alert>}

            {summary && (
              <Alert severity={summary.errorRows > 0 ? 'warning' : 'success'}>
                {summary.validRows} of {summary.totalRows} rows are ready to import
                {summary.errorRows > 0 ? ` — ${summary.errorRows} row(s) have errors and will be skipped` : ''}.
              </Alert>
            )}

            {preview && preview.length > 0 && (
              <TableContainer sx={{ maxHeight: 320, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell />
                      <TableCell>Title</TableCell>
                      <TableCell>Parent</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Issues</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.map((row) => (
                      <TableRow key={row.row} sx={{ bgcolor: row.ok ? 'inherit' : 'rgba(244,67,54,0.06)' }}>
                        <TableCell>{row.row}</TableCell>
                        <TableCell>
                          {row.ok
                            ? <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />
                            : <ErrorOutlineIcon color="error" sx={{ fontSize: '1rem' }} />}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 240 }}>
                          <Typography variant="body2" noWrap>{row.title}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant="caption" noWrap>{row.parent || '—'}</Typography>
                        </TableCell>
                        <TableCell><Typography variant="caption">{row.status}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{row.priority}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{row.dueDate || '—'}</Typography></TableCell>
                        <TableCell sx={{ maxWidth: 260 }}>
                          {[...(row.errors || []), ...(row.warnings || [])].map((msg, i) => (
                            <Typography key={i} variant="caption" display="block"
                              color={(row.errors || []).includes(msg) ? 'error' : 'text.secondary'}>
                              {msg}
                            </Typography>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose}>{done ? 'Close' : 'Cancel'}</Button>
        {!done && (
          <>
            <Button
              variant="outlined"
              onClick={runDryRun}
              disabled={!csvText.trim() || busy}
              startIcon={busy ? <CircularProgress size={16} /> : null}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              onClick={runImport}
              disabled={!preview || !summary || summary.validRows === 0 || busy}
              startIcon={busy ? <CircularProgress size={16} /> : <UploadFileIcon />}
            >
              Import {summary ? `${summary.validRows} task${summary.validRows === 1 ? '' : 's'}` : ''}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportTasksDialog;
