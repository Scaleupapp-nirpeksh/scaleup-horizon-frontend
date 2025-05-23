// src/components/common/AlertMessage.jsx
import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';

const AlertMessage = ({ message, severity, title }) => {
  if (!message) return null;

  return (
    <Collapse in={!!message}>
      <Alert severity={severity || 'info'} sx={{ mb: 2, width: '100%' }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Collapse>
  );
};

export default AlertMessage;