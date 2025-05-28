// src/components/auth/LoginPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, TextField, Link, Grid, Box, Typography, Container, 
  Avatar, CircularProgress, Alert, Paper, useTheme, useMediaQuery,
  InputAdornment, IconButton
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  0% {
    transform: rotate(215deg) translateX(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: rotate(215deg) translateX(-500px);
    opacity: 0;
  }
`;

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
    : `linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)`,
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: theme.palette.mode === 'dark'
      ? `radial-gradient(circle at 15% 85%, ${alpha('#3b82f6', 0.1)} 0%, transparent 25%),
         radial-gradient(circle at 85% 15%, ${alpha('#8b5cf6', 0.1)} 0%, transparent 25%)`
      : `radial-gradient(circle at 15% 85%, ${alpha('#3b82f6', 0.08)} 0%, transparent 25%),
         radial-gradient(circle at 85% 15%, ${alpha('#8b5cf6', 0.08)} 0%, transparent 25%)`,
    zIndex: 0
  }
}));

const FloatingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 4, 4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 5,
  borderRadius: 16,
  backdropFilter: 'blur(20px)',
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.9),
  boxShadow: theme.palette.mode === 'dark'
    ? `0 10px 40px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 10px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    padding: '2px',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.5)} 0%, transparent 50%, ${alpha(theme.palette.secondary.main, 0.5)} 100%)`,
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    WebkitMaskComposite: 'xor',
    pointerEvents: 'none'
  }
}));

const StyledLogo = styled(Box)(({ theme }) => ({
  width: 140,
  height: 140,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const LogoGlow = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
  animation: `${pulse} 3s ease-in-out infinite`,
}));

const LogoCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 110,
  height: 110,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
}));

const OrbitingElement = styled(Box)(({ theme, delay }) => ({
  position: 'absolute',
  width: 20,
  height: 20,
  animation: `${orbit} 10s linear infinite`,
  animationDelay: delay,
}));

const OrbitingCircle = styled(Box)(({ theme, color = 'primary' }) => ({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: theme.palette[color].main,
  boxShadow: `0 0 15px ${alpha(theme.palette[color].main, 0.7)}`,
}));

const AnimatedFormField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s ease',
    '&.Mui-focused': {
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const PulsatingButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
    animation: `${shimmer} 2s infinite`,
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const Star = styled(Box)(({ theme, size = 2, top, left, delay = 0 }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#4F46E5',
  opacity: Math.random() * 0.7 + 0.3,
  animation: `${pulse} ${Math.random() * 3 + 2}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const Meteor = styled(Box)(({ theme, delay = 0, top = 0 }) => ({
  position: 'absolute',
  top: `${top}%`,
  right: 0,
  width: '100px',
  height: '1px',
  background: 'linear-gradient(to right, transparent, #fff)',
  transform: 'rotate(215deg)',
  animation: `${meteor} ${Math.random() * 2 + 2}s linear infinite`,
  animationDelay: `${delay}s`,
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 0 15px #fff',
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
  const [meteors, setMeteors] = useState([]);
  const [stars, setStars] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const logoRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Create stars
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5
    }));
    setStars(newStars);

    // Create meteors at intervals
    const createMeteor = () => {
      setMeteors(prev => {
        if (prev.length > 10) {
          const newMeteors = [...prev];
          newMeteors.shift();
          return [...newMeteors, { id: Date.now(), top: Math.random() * 80, delay: 0 }];
        }
        return [...prev, { id: Date.now(), top: Math.random() * 80, delay: 0 }];
      });
    };

    const meteorInterval = setInterval(createMeteor, 2000);
    createMeteor(); // Create one immediately

    return () => clearInterval(meteorInterval);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleMouseMove = (e) => {
    if (!logoRef.current) return;
    
    const rect = logoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate distance from center (0,0)
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
    
    // Normalize to get values between -10 and 10 degrees
    const rotateX = (y / maxDistance) * 10;
    const rotateY = (x / maxDistance) * -10;
    
    logoRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!logoRef.current) return;
    logoRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  };

  return (
    <PageContainer>
      {/* Stars background */}
      {stars.map(star => (
        <Star 
          key={star.id} 
          size={star.size} 
          top={star.top} 
          left={star.left} 
          delay={star.delay}
        />
      ))}

      {/* Meteors */}
      {theme.palette.mode === 'dark' && meteors.map(meteor => (
        <Meteor key={meteor.id} delay={meteor.delay} top={meteor.top} />
      ))}

      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          animation: `${fadeIn} 0.8s ease-out forwards`
        }}>
          <FloatingCard elevation={0}>
            <StyledLogo 
              ref={logoRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              sx={{ transition: 'transform 0.2s ease-out' }}
            >
              <LogoGlow />
              <LogoCircle>
                <RocketLaunchIcon sx={{ fontSize: 50, color: '#fff' }} />
              </LogoCircle>
              
              {/* Orbiting elements */}
              <OrbitingElement delay="0s">
                <OrbitingCircle color="secondary" />
              </OrbitingElement>
              <OrbitingElement delay="-3.33s">
                <OrbitingCircle color="info" />
              </OrbitingElement>
              <OrbitingElement delay="-6.66s">
                <OrbitingCircle color="warning" />
              </OrbitingElement>
            </StyledLogo>

            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-0.02em',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
                textAlign: 'center'
              }}
            >
              ScaleUp Horizon
            </Typography>
            
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'text.secondary', 
                mb: 3, 
                fontWeight: 500,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <StarOutlineIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
              Accelerate Your Growth Journey
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 3, 
                  borderRadius: 2,
                  animation: `${fadeIn} 0.3s ease-out forwards`
                }}
              >
                {error}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              noValidate 
              sx={{ 
                width: '100%',
                mt: 1,
                '& .MuiTextField-root': { mb: 2.5 }
              }}
            >
              <AnimatedFormField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <AnimatedFormField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <PulsatingButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  height: 48,
                }}
                endIcon={loading ? undefined : <ArrowForwardIcon />}
              >
                {loading ? (
                  <CircularProgress 
                    size={24} 
                    thickness={5}
                    sx={{ color: 'white' }} 
                  />
                ) : 'Sign In'}
              </PulsatingButton>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      textDecoration: 'none',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '0%',
                        height: '2px',
                        bottom: '-2px',
                        left: 0,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        transition: 'width 0.3s ease',
                      },
                      '&:hover::after': {
                        width: '100%',
                      }
                    }}
                  >
                    Don't have an account? Sign Up
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