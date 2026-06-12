// src/pages/DataRoomPublicPage.jsx
// Public investor-facing view of a data room — token link, no login.
// Clean, restrained, professional: this page is seen by investors.
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Container, Paper, Typography, Button, Stack, TextField,
  CircularProgress, Alert, Divider, List, ListItem, ListItemIcon,
  ListItemText, Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api/horizon';
const pub = axios.create({ baseURL: API_BASE_URL });

const fmtSize = (b) => {
  if (!b && b !== 0) return '';
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  if (b >= 1024) return `${Math.round(b / 1024)} KB`;
  return `${b} B`;
};

const docIcon = (type = '') => {
  if (type.includes('pdf')) return <PictureAsPdfIcon color="error" />;
  if (type.includes('sheet') || type.includes('csv') || type.includes('excel')) return <TableChartIcon color="success" />;
  if (type.startsWith('image/')) return <ImageIcon color="info" />;
  return <DescriptionIcon color="action" />;
};

const DataRoomPublicPage = () => {
  const { token } = useParams();
  const [meta, setMeta] = useState(null);
  const [room, setRoom] = useState(null); // after enter: { name, description, documents }
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState('');
  const [gateError, setGateError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    let alive = true;
    pub.get(`/public/data-rooms/${token}`)
      .then(res => { if (alive) { setMeta(res.data); setError(''); } })
      .catch(e => { if (alive) setError(e.response?.data?.msg || 'This data room is unavailable.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [token]);

  const enter = useCallback(async (withEmail) => {
    setEntering(true);
    setGateError('');
    try {
      const res = await pub.post(`/public/data-rooms/${token}/enter`, withEmail ? { email: withEmail } : {});
      setRoom(res.data);
    } catch (e) {
      setGateError(e.response?.data?.msg || 'Could not open the data room');
    } finally {
      setEntering(false);
    }
  }, [token]);

  // Rooms without an email gate open straight away
  useEffect(() => {
    if (meta && !meta.requireEmail && !room) enter();
  }, [meta, room, enter]);

  const visitLink = async (link) => {
    setDownloading(`link-${link.id}`);
    try {
      const res = await pub.post(`/public/data-rooms/${token}/links/${link.id}/visit`, email ? { email } : {});
      window.open(res.data.url, '_blank', 'noopener');
    } catch (e) {
      setGateError(e.response?.data?.msg || 'Could not open the link — try again');
    } finally {
      setDownloading(null);
    }
  };

  const download = async (doc) => {
    setDownloading(doc.id);
    try {
      const res = await pub.post(`/public/data-rooms/${token}/documents/${doc.id}/download`, email ? { email } : {});
      window.open(res.data.downloadUrl, '_blank', 'noopener');
    } catch (e) {
      setGateError(e.response?.data?.msg || 'Download failed — try again');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="sm">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderTop: '3px solid #4f46e5' }}>
            <LockIcon sx={{ fontSize: 38, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Data room unavailable</Typography>
            <Typography variant="body2" color="text.secondary">{error}</Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: { xs: 3, md: 4 }, borderTop: '3px solid #4f46e5' }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
              {meta?.organizationName || 'Data room'}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{(room || meta)?.name}</Typography>
            {(room || meta)?.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {(room || meta).description}
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />

            {!room ? (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {meta.documentCount} document{meta.documentCount === 1 ? '' : 's'}
                  {meta.linkCount > 0 ? ` and ${meta.linkCount} link${meta.linkCount === 1 ? '' : 's'}` : ''} shared with you
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your email to view the documents.
                </Typography>
                {gateError && <Alert severity="error" sx={{ mb: 2 }}>{gateError}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    size="small" fullWidth type="email" placeholder="you@fund.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enter(email); } }}
                    disabled={entering}
                  />
                  <Button variant="contained" onClick={() => enter(email)} disabled={entering || !email.trim()}>
                    {entering ? 'Opening…' : 'View documents'}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box>
                {gateError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGateError('')}>{gateError}</Alert>}
                {(room.links || []).length > 0 && (
                  <>
                    <List disablePadding>
                      {room.links.map(link => (
                        <ListItem
                          key={link.id} disableGutters divider
                          secondaryAction={
                            <Button
                              size="small" variant="outlined"
                              startIcon={downloading === `link-${link.id}` ? <CircularProgress size={14} /> : <OpenInNewIcon />}
                              onClick={() => visitLink(link)} disabled={!!downloading}
                            >
                              Visit
                            </Button>
                          }
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}><LanguageIcon color="primary" /></ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{link.title}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary" component="span">{link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                <List disablePadding>
                  {(room.documents || []).map(doc => (
                    <ListItem
                      key={doc.id} disableGutters divider
                      secondaryAction={
                        <Button
                          size="small" variant="outlined" startIcon={downloading === doc.id ? <CircularProgress size={14} /> : <DownloadIcon />}
                          onClick={() => download(doc)} disabled={!!downloading}
                        >
                          Open
                        </Button>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>{docIcon(doc.fileType)}</ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{doc.fileName}</Typography>}
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center" component="span">
                            {doc.category && <Chip size="small" label={doc.category} variant="outlined" sx={{ height: 18, fontSize: 11 }} />}
                            <Typography variant="caption" color="text.secondary" component="span">{fmtSize(doc.fileSize)}</Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {(room.documents || []).length === 0 && (room.links || []).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    Nothing in this room yet.
                  </Typography>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Shared securely via ScaleUp Horizon. Downloads are logged for the room owner.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default DataRoomPublicPage;
