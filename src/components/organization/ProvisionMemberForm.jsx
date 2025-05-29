// src/components/organization/ProvisionMemberForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import {
  Box, Button, TextField, Typography, CircularProgress, Alert, Paper,
  FormControl, InputLabel, Select, MenuItem, Grid, Tooltip, IconButton,
  Snackbar, Link as MuiLink
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const glow = keyframes`
  0% { box-shadow: 0 0 5px ${alpha('#6C63FF', 0.5)}, 0 0 10px ${alpha('#6C63FF', 0.3)}; }
  50% { box-shadow: 0 0 20px ${alpha('#6C63FF', 0.8)}, 0 0 30px ${alpha('#6C63FF', 0.5)}; }
  100% { box-shadow: 0 0 5px ${alpha('#6C63FF', 0.5)}, 0 0 10px ${alpha('#6C63FF', 0.3)}; }
`;

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.grey[900], 0.95)})`
    : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.grey[100], 0.9)})`,
  backdropFilter: 'blur(15px) saturate(180%)',
  WebkitBackdropFilter: 'blur(15px) saturate(180%)',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 12px 30px ${alpha(theme.palette.common.black, 0.5)}`
    : `0 12px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  maxWidth: 600,
  margin: 'auto',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 40%)`,
    transform: 'rotate(0deg)',
    animation: `${keyframes`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `} 30s linear infinite`,
    zIndex: 0,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s ease-in-out',
    backgroundColor: alpha(theme.palette.action.hover, 0.03),
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.default, 0.5),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
      },
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  marginBottom: theme.spacing(2.5),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.2, 3),
  fontWeight: 700,
  fontSize: '1rem',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 6px 15px ${alpha(theme.palette.primary.dark, 0.2)}`,
  '&:hover': {
    transform: 'translateY(-3px) scale(1.03)',
    boxShadow: `0 10px 20px ${alpha(theme.palette.primary.dark, 0.3)}`,
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
  }
}));

const SetupLinkDisplay = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  border: `1px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  wordBreak: 'break-all',
  position: 'relative',
}));

const ProvisionMemberForm = () => {
  const { activeOrganization, user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member'); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null); // To store { msg, setupLink, instructions }
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const canProvision = activeOrganization && user && activeOrganization.role === 'owner';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canProvision) {
      setError("You do not have permission to invite members to this organization.");
      return;
    }
    if (!email || !name || !role) {
      setError("Please fill in all fields: Email, Name, and Role.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccessInfo(null);

    try {
      const response = await api.provisionNewMember({ email, name, role });
      setSuccessInfo({
        msg: response.data.msg,
        setupLink: response.data.setupLink,
        instructions: response.data.instructions,
      });
      // Clear form on success
      setEmail('');
      setName('');
      setRole('member');
    } catch (err) {
      setError(err.response?.data?.msg || "An unexpected error occurred while provisioning the member.");
      console.error("Provision member error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (successInfo?.setupLink) {
      navigator.clipboard.writeText(successInfo.setupLink)
        .then(() => {
          setSnackbarOpen(true);
        })
        .catch(err => {
          console.error('Failed to copy setup link: ', err);
          setError("Failed to copy link. Please copy it manually.");
        });
    }
  };

  if (!canProvision && activeOrganization) { // User is in an org but not an owner
    return (
      <Alert severity="warning" sx={{m:2}}>
        Member provisioning is restricted to organization owners.
      </Alert>
    );
  }
  if (!activeOrganization) { // No active org selected
     return (
      <Alert severity="info" sx={{m:2}}>
        Please select an active organization to manage members.
      </Alert>
    );
  }


  return (
    <Box sx={{ p: {xs: 2, md: 4}, position: 'relative', zIndex: 1 }}>
      <FormContainer>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PersonAddAlt1Icon sx={{ fontSize: 50, color: 'primary.main', mb:1 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 700}}>
            Invite New Member
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Provision a new member for your organization: <strong>{activeOrganization?.name}</strong>.
            They will receive a setup link to create their account.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                id="member-name"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                InputProps={{
                  startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                id="member-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{mb: 2.5}}>
                <InputLabel id="member-role-label">Role</InputLabel>
                <Select
                  labelId="member-role-label"
                  id="member-role"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                  sx={{ borderRadius: 1.5, '& .MuiSelect-select': { display: 'flex', alignItems: 'center'}}}
                  MenuProps={{ PaperProps: { sx: { borderRadius: 1.5 }}}}
                  startAdornment={<AdminPanelSettingsIcon color="action" sx={{ mr: 1, ml: -0.5 }} />}
                >
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="owner">Owner (Grants full control)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <PersonAddAlt1Icon />}
          >
            {loading ? 'Provisioning Member...' : 'Provision Member & Get Setup Link'}
          </SubmitButton>
        </Box>

        {successInfo && (
          <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ mt: 3, borderRadius: 1.5, display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography fontWeight="bold">{successInfo.msg}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{successInfo.instructions}</Typography>
            </Box>
          </Alert>
        )}
        {successInfo?.setupLink && (
            <SetupLinkDisplay>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Share this secure setup link with the new member:
              </Typography>
              <MuiLink href={successInfo.setupLink} target="_blank" rel="noopener noreferrer" sx={{fontWeight: 'medium', display:'block', mb:1}}>
                {successInfo.setupLink}
              </MuiLink>
              <Tooltip title="Copy Link">
                <IconButton 
                  onClick={handleCopyToClipboard} 
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    color: 'primary.main',
                    '&:hover': { backgroundColor: alpha('#6C63FF', 0.1)}
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </SetupLinkDisplay>
          )}
      </FormContainer>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Setup link copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ProvisionMemberForm;
