// src/components/auth/RegisterPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Button, TextField, Link, Grid, Box, Typography, Container, 
  Avatar, CircularProgress, Alert, Paper, useTheme, useMediaQuery,
  InputAdornment, IconButton, LinearProgress, Tooltip
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarsIcon from '@mui/icons-material/Stars';

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

const success = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
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

const SuccessAnimation = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(8px)',
  zIndex: 10,
  borderRadius: 16,
  animation: `${fadeIn} 0.5s ease-out forwards`,
  '& .success-icon': {
    color: theme.palette.success.main,
    fontSize: 80,
    animation: `${success} 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
  }
}));

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }) => {
  const theme = useTheme();
  
  // Calculate password strength
  const calculateStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    else if (password.length >= 6) strength += 15;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 25;
    
    return Math.min(100, strength);
  };
  
  const strength = calculateStrength(password);
  
  // Determine color based on strength
  const getStrengthColor = (strength) => {
    if (strength < 30) return theme.palette.error.main;
    if (strength < 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  // Determine label based on strength
  const getStrengthLabel = (strength) => {
    if (strength < 30) return 'Weak';
    if (strength < 70) return 'Good';
    return 'Strong';
  };
  
  return (
    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600,
            color: getStrengthColor(strength)
          }}
        >
          {getStrengthLabel(strength)}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.grey[300], 0.3),
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            background: `linear-gradient(90deg, 
              ${getStrengthColor(strength)} 0%, 
              ${alpha(getStrengthColor(strength), 0.8)} 100%)`
          }
        }}
      />
    </Box>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [meteors, setMeteors] = useState([]);
  const [stars, setStars] = useState([]);
  const { register } = useAuth();
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
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      setSuccess(result.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
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
            {success && (
              <SuccessAnimation>
                <CheckCircleOutlineIcon className="success-icon" />
                <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
                  Registration Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {success}
                </Typography>
              </SuccessAnimation>
            )}

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
              <StarsIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
              Create Founder Account
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
                '& .MuiTextField-root': { mb: 2 }
              }}
            >
              <AnimatedFormField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <AnimatedFormField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
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
                      <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
              
              {password && <PasswordStrengthIndicator password={password} />}
              
              <AnimatedFormField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockPersonIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showConfirmPassword ? "Hide password" : "Show password"}>
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
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
                  mt: 2, 
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
                ) : 'Register'}
              </PulsatingButton>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
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
                    Already have an account? Sign in
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

export default RegisterPage;