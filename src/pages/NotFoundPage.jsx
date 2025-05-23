// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => (
  <Container component="main" maxWidth="sm" sx={{ textAlign: 'center', mt: 8, py: 4 }}>
    <Box sx={{ mb: 3 }}>
      <ErrorOutlineIcon sx={{ fontSize: 80, color: 'primary.main' }} />
    </Box>
    <Typography variant="h3" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
      404 - Page Not Found
    </Typography>
    <Typography variant="h6" color="text.secondary" sx={{mb:3}}>
      Sorry, the page you are looking for does not exist or has been moved.
    </Typography>
    <Button component={RouterLink} to="/" variant="contained" size="large">
      Go to Dashboard
    </Button>
  </Container>
);
export default NotFoundPage;