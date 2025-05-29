// src/components/auth/LoginPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, TextField, Link, Grid, Box, Typography, Container, 
  CircularProgress, Alert, Paper, useTheme,
  InputAdornment, IconButton
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

// Re-using animations and styled components from RegisterPage/CompleteSetupPage for consistency
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const orbit = keyframes`
  0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const meteor = keyframes`
  0% { transform: rotate(215deg) translateX(0); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
`;

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
    : `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[50]} 100%)`,
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: theme.palette.mode === 'dark'
      ? `radial-gradient(circle at 15% 85%, ${alpha(theme.palette.primary.dark, 0.15)} 0%, transparent 30%),
         radial-gradient(circle at 85% 15%, ${alpha(theme.palette.secondary.dark, 0.15)} 0%, transparent 30%)`
      : `radial-gradient(circle at 15% 85%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 30%),
         radial-gradient(circle at 85% 15%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 30%)`,
    zIndex: 0,
    pointerEvents: 'none',
  }
}));

const FloatingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 4, 4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 5,
  borderRadius: 20,
  backdropFilter: 'blur(25px) saturate(150%)',
  WebkitBackdropFilter: 'blur(25px) saturate(150%)',
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.75)
    : alpha(theme.palette.background.paper, 0.85),
  boxShadow: theme.palette.mode === 'dark'
    ? `0 16px 70px ${alpha(theme.palette.common.black, 0.4)}`
    : `0 16px 70px ${alpha(theme.palette.primary.main, 0.2)}`,
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    padding: '2px',
    background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.secondary.main, 0.7)}, ${alpha(theme.palette.primary.main, 0.7)})`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    zIndex: -1,
  }
}));

const StyledLogo = styled(Box)(({ theme }) => ({
  width: 150,
  height: 150,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: theme.spacing(2.5),
}));

const LogoGlow = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '120%',
  height: '120%',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.35)} 0%, transparent 65%)`,
  animation: `${pulse} 3.5s ease-in-out infinite alternate`,
  zIndex: 0,
}));

const LogoCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 110,
  height: 110,
  borderRadius: '50%',
  background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  boxShadow: `0 10px 35px ${alpha(theme.palette.primary.dark, 0.5)}`,
}));

const OrbitingElement = styled(Box)(({ theme, delay }) => ({
  position: 'absolute',
  width: 22,
  height: 22,
  animation: `${orbit} 12s linear infinite`,
  animationDelay: delay,
  zIndex: 0,
}));

const OrbitingCircle = styled(Box)(({ theme, color = 'primary' }) => ({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: theme.palette[color].light,
  boxShadow: `0 0 18px ${alpha(theme.palette[color].main, 0.8)}`,
}));

const AnimatedFormField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s ease-in-out',
    backgroundColor: alpha(theme.palette.action.hover, 0.05),
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
    }
  },
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const PulsatingButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  fontWeight: 700,
  letterSpacing: '0.5px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.dark, 0.25)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.dark, 0.35)}`,
    '&::after': { left: '100%' }
  },
  '&:active': { transform: 'translateY(0) scale(0.98)' },
}));

const Star = styled(Box)(({ theme, size = 2, top, left, delay = 0 }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.8) : alpha(theme.palette.primary.main, 0.7),
  opacity: Math.random() * 0.6 + 0.2,
  animation: `${pulse} ${Math.random() * 4 + 3}s ease-in-out infinite alternate`,
  animationDelay: `${delay}s`,
  zIndex: 1,
}));

const Meteor = styled(Box)(({ theme, delay = 0, top = 0 }) => ({
  position: 'absolute',
  top: `${top}%`,
  right: 0,
  width: '120px',
  height: '1.5px',
  background: `linear-gradient(to right, transparent, ${alpha(theme.palette.common.white, 0.7)})`,
  transform: 'rotate(215deg)',
  animation: `${meteor} ${Math.random() * 3 + 3}s linear infinite`,
  animationDelay: `${delay}s`,
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    boxShadow: `0 0 18px ${alpha(theme.palette.common.white, 0.8)}`,
    top: '-2px',
    right: 0,
  }
}));


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth(); // Get isAuthenticated to redirect if already logged in
  const navigate = useNavigate();
  const theme = useTheme();
  const logoRef = useRef(null);
  const [stars, setStars] = useState([]);
  const [meteors, setMeteors] = useState([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const newStars = Array.from({ length: 60 }, (_, i) => ({ id: i, top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 2.5 + 0.5, delay: Math.random() * 6 }));
    setStars(newStars);
    const createMeteor = () => setMeteors(prev => [...(prev.length > 8 ? prev.slice(1) : prev), { id: Date.now(), top: Math.random() * 70 + 10, delay: 0 }]);
    const meteorInterval = setInterval(createMeteor, 2500);
    createMeteor();
    return () => clearInterval(meteorInterval);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      // AuthContext now handles storing activeOrganization and memberships.
      // The login function in AuthContext also updates isAuthenticated state.
      // The useEffect above will handle navigation if isAuthenticated becomes true.
      // If direct navigation is preferred here:
      navigate('/dashboard'); 
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };
  
  const handleMouseMove = (e) => {
    if (!logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (y / (rect.height / 2)) * 8;
    const rotateY = (x / (rect.width / 2)) * -8;
    logoRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!logoRef.current) return;
    logoRef.current.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
  };

  return (
    <PageContainer>
      {stars.map(star => ( <Star key={star.id} size={star.size} top={star.top} left={star.left} delay={star.delay}/> ))}
      {theme.palette.mode === 'dark' && meteors.map(m => ( <Meteor key={m.id} delay={m.delay} top={m.top} /> ))}
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `${fadeIn} 0.8s ease-out forwards`}}>
          <FloatingCard elevation={0}>
            <StyledLogo ref={logoRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} sx={{ transition: 'transform 0.1s ease-out' }}>
              <LogoGlow />
              <LogoCircle>
                <RocketLaunchIcon sx={{ fontSize: 55, color: theme.palette.common.white }} />
              </LogoCircle>
              <OrbitingElement delay="0s"><OrbitingCircle color="secondary" /></OrbitingElement>
              <OrbitingElement delay="-4s"><OrbitingCircle color="info" /></OrbitingElement>
              <OrbitingElement delay="-8s"><OrbitingCircle color="warning" /></OrbitingElement>
            </StyledLogo>

            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 70%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5, textAlign: 'center' }}>
              ScaleUp Horizon
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3, fontWeight: 500, textAlign: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StarOutlineIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
              Accelerate Your Growth Journey
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2.5, borderRadius: 2, animation: `${fadeIn} 0.3s ease-out forwards`}}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1, '& .MuiTextField-root': { mb: 2.5 } }}>
              <AnimatedFormField required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon color="action" /></InputAdornment>), }} />
              
              <AnimatedFormField required fullWidth name="password" label="Password" type={showPassword ? "text" : "password"} id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment>),
                  endAdornment: (<InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                  </InputAdornment>)
                }} />

              <PulsatingButton type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2, height: 52 }}>
                {loading ? <CircularProgress size={26} thickness={5} sx={{ color: 'white' }} /> : 'Sign In'}
                {!loading && <ArrowForwardIcon sx={{ ml: 1, fontSize: '1.2rem' }}/>}
              </PulsatingButton>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component={RouterLink} to="/register-owner" /* Updated link */ sx={{ color: theme.palette.primary.main, fontWeight: 500, textDecoration: 'none', position: 'relative',
                      '&::after': { content: '""', position: 'absolute', width: '0%', height: '2px', bottom: '-3px', left: '0',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        transition: 'width 0.35s ease-in-out', },
                      '&:hover::after': { width: '100%', }
                    }}>
                    Don't have an account? Create one
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </FloatingCard>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default LoginPage;
