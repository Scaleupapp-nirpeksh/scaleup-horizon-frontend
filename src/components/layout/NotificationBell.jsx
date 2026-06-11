// src/components/layout/NotificationBell.jsx
// Header bell: unread badge, dropdown list, mark-as-read, deep link to tasks.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge, Box, Button, CircularProgress, Divider, IconButton,
  Menu, Stack, Tooltip, Typography, alpha, useTheme
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CommentIcon from '@mui/icons-material/Comment';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { formatDistanceToNow } from 'date-fns';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';

const POLL_INTERVAL_MS = 60000;

const typeIcon = (type) => {
  switch (type) {
    case 'task_assigned': return <AssignmentIndIcon fontSize="small" color="primary" />;
    case 'task_comment': return <CommentIcon fontSize="small" color="action" />;
    case 'comment_mention': return <AlternateEmailIcon fontSize="small" color="secondary" />;
    case 'task_due': return <AccessTimeIcon fontSize="small" color="warning" />;
    default: return <InfoOutlinedIcon fontSize="small" color="action" />;
  }
};

const NotificationBell = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications({ limit: 15 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Silent: the bell should never break the header
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const handleOpen = async (e) => {
    setAnchorEl(e.currentTarget);
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  const handleItemClick = async (notification) => {
    setAnchorEl(null);
    if (!notification.isRead) {
      markNotificationRead(notification._id).catch(() => {});
      setUnreadCount(c => Math.max(0, c - 1));
    }
    const taskId = notification.relatedTask?._id || notification.relatedTask;
    navigate(taskId ? `/tasks?task=${taskId}` : '/tasks');
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 480, borderRadius: 2 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<DoneAllIcon />} onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
        </Stack>
        <Divider />

        {loading && notifications.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <NotificationsNoneIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <Box
              key={n._id}
              onClick={() => handleItemClick(n)}
              sx={{
                px: 2, py: 1.25, cursor: 'pointer',
                bgcolor: n.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.06),
                borderLeft: n.isRead ? '3px solid transparent' : `3px solid ${theme.palette.primary.main}`,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ pt: 0.25 }}>{typeIcon(n.type)}</Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 600, lineHeight: 1.3 }}>
                    {n.title}
                  </Typography>
                  {n.message && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', whiteSpace: 'pre-line'
                      }}
                    >
                      {n.message}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
