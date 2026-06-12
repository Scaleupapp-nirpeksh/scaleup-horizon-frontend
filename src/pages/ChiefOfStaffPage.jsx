// src/pages/ChiefOfStaffPage.jsx
// The AI Chief of Staff: a ranked daily brief (what needs you today) plus,
// when the server has an LLM key configured, free-form Q&A over live org data.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Container, Paper, Typography, Button, Stack, Chip, TextField,
  CircularProgress, Alert, IconButton, Tooltip, Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SendIcon from '@mui/icons-material/Send';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getChiefBrief, askChief } from '../services/api';

const AREA_LABEL = {
  tasks: 'Tasks', money: 'Money', fundraising: 'Fundraising',
  growth: 'Growth', team: 'Team', meetings: 'Meetings',
};

const SEVERITY_META = {
  critical: { label: 'Critical', color: 'error', icon: <ErrorOutlineIcon fontSize="small" /> },
  warning: { label: 'Needs attention', color: 'warning', icon: <WarningAmberIcon fontSize="small" /> },
  info: { label: 'Worth knowing', color: 'info', icon: <InfoOutlinedIcon fontSize="small" /> },
  win: { label: 'Wins', color: 'success', icon: <EmojiEventsIcon fontSize="small" /> },
};

const ChiefOfStaffPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [thread, setThread] = useState([]); // { q, a | error, pending }
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const threadEndRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getChiefBrief();
      setBrief(res.data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not load the brief');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread]);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setQuestion('');
    setAsking(true);
    setThread(prev => [...prev, { q, pending: true }]);
    try {
      const res = await askChief({ question: q });
      setThread(prev => prev.map((t, i) => i === prev.length - 1 ? { q, a: res.data.answer } : t));
    } catch (e) {
      setThread(prev => prev.map((t, i) => i === prev.length - 1
        ? { q, error: e.response?.data?.msg || 'Could not get an answer' } : t));
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  const grouped = { critical: [], warning: [], info: [], win: [] };
  (brief?.insights || []).forEach(i => (grouped[i.severity] || grouped.info).push(i));

  const insightRow = (insight, idx) => {
    const meta = SEVERITY_META[insight.severity];
    return (
      <Paper
        key={idx} variant="outlined"
        sx={{
          p: 1.75, mb: 1, cursor: insight.link ? 'pointer' : 'default',
          borderLeft: 4, borderLeftColor: `${meta.color}.main`,
          '&:hover': insight.link ? { borderColor: 'primary.main' } : {},
        }}
        onClick={() => insight.link && navigate(insight.link)}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{ color: `${meta.color}.main`, mt: 0.25 }}>{meta.icon}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{insight.title}</Typography>
              <Chip size="small" label={AREA_LABEL[insight.area] || insight.area} variant="outlined" sx={{ height: 20 }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{insight.detail}</Typography>
          </Box>
          {insight.link && <ArrowForwardIcon fontSize="small" sx={{ color: 'text.disabled', mt: 0.5 }} />}
        </Stack>
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Chief of Staff</Typography>
        </Stack>
        <Tooltip title="Refresh">
          <IconButton onClick={load}><RefreshIcon /></IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {brief?.generatedAt ? `As of ${format(new Date(brief.generatedAt), 'd MMM, h:mm a')}` : ''} — everything that needs you, ranked.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Focus for today */}
      {(brief?.focus || []).length > 0 && (
        <Paper sx={{ p: 2.5, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}` }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.5 }}>
            FOCUS TODAY
          </Typography>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {brief.focus.map((f, i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start"
                sx={{ cursor: f.link ? 'pointer' : 'default' }} onClick={() => f.link && navigate(f.link)}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.4 }}>{i + 1}</Typography>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.detail}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Insights grouped by severity */}
      {(brief?.insights || []).length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>All clear</Typography>
          <Typography variant="body2" color="text.secondary">
            Nothing needs your attention right now. Add tasks, finance data and your pipeline to get sharper insights.
          </Typography>
        </Paper>
      ) : (
        ['critical', 'warning', 'info', 'win'].map(sev => grouped[sev].length > 0 && (
          <Box key={sev} sx={{ mb: 2.5 }}>
            <Typography variant="overline" color={`${SEVERITY_META[sev].color}.main`} sx={{ fontWeight: 800, letterSpacing: 1.5 }}>
              {SEVERITY_META[sev].label} ({grouped[sev].length})
            </Typography>
            <Box sx={{ mt: 0.5 }}>{grouped[sev].map(insightRow)}</Box>
          </Box>
        ))
      )}

      <Divider sx={{ my: 3 }} />

      {/* Ask panel */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Ask your Chief of Staff</Typography>
      {brief?.ask ? (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Questions are answered against your live data — tasks, money, pipeline, KPIs.
          </Typography>
          {thread.length > 0 && (
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {thread.map((t, i) => (
                <Box key={i}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.q}</Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    {t.pending ? <CircularProgress size={18} /> : t.error
                      ? <Typography variant="body2" color="error.main">{t.error}</Typography>
                      : <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{t.a}</Typography>}
                  </Paper>
                </Box>
              ))}
              <div ref={threadEndRef} />
            </Stack>
          )}
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth size="small" placeholder='e.g. "How much can I spend this month and keep 6 months runway?"'
              value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAsk(); } }}
              disabled={asking}
            />
            <Button variant="contained" endIcon={<SendIcon />} onClick={handleAsk} disabled={asking || !question.trim()}>
              Ask
            </Button>
          </Stack>
        </>
      ) : (
        <Alert severity="info" variant="outlined">
          Conversational Q&amp;A activates once an <code>ANTHROPIC_API_KEY</code> is added to the server environment.
          The brief above works without it.
        </Alert>
      )}
    </Container>
  );
};

export default ChiefOfStaffPage;
