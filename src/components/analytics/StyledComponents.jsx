// src/components/analytics/StyledComponents.jsx
import { alpha, keyframes, styled } from '@mui/material/styles';
import { 
  Card, Paper, Box, Avatar, Chip, 
  Stack, Typography
} from '@mui/material';

// Animation keyframes
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

export const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.8), 0 0 30px rgba(66, 153, 225, 0.6); }
  100% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
`;

export const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
export const GlassCard = styled(Card)(({ theme, $glow = false }) => ({
  borderRadius: theme.spacing(2.5),
  backdropFilter: 'blur(20px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'visible',
  position: 'relative',
  animation: $glow ? `${glowAnimation} 2s ease-in-out infinite` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[20],
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

export const MetricCard = styled(Paper)(({ theme, color: colorProp = 'primary', $trend = 'neutral' }) => {
  const paletteColorObject = theme.palette[colorProp] || theme.palette.primary;
  const mainColor = paletteColorObject?.main || theme.palette.primary.main;
  const lightColor = paletteColorObject?.light || theme.palette.primary.light;

  return {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: `linear-gradient(135deg, ${alpha(mainColor, 0.1)} 0%, ${alpha(lightColor, 0.05)} 100%)`,
    border: `1px solid ${alpha(mainColor, 0.2)}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: `0 12px 24px -4px ${alpha(mainColor, 0.3)}`,
      border: `1px solid ${alpha(mainColor, 0.4)}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${mainColor}, ${lightColor})`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -50,
      right: -50,
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${alpha(mainColor, 0.1)} 0%, transparent 70%)`,
      animation: `${floatAnimation} 3s ease-in-out infinite`,
    },
    '& .metric-icon': {
      backgroundColor: alpha(mainColor, 0.15),
      color: mainColor,
      transition: 'all 0.3s ease',
    },
    '&:hover .metric-icon': {
      transform: 'rotate(15deg) scale(1.1)',
      backgroundColor: alpha(mainColor, 0.25),
    }
  };
});

export const PredictionCard = styled(Card)(({ theme, severity = 'info' }) => {
  const colors = {
    success: theme.palette.success,
    warning: theme.palette.warning,
    error: theme.palette.error,
    info: theme.palette.info
  };
  const color = colors[severity] || colors.info;
  
  return {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(color.main, 0.08),
    border: `2px solid ${alpha(color.main, 0.2)}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: alpha(color.main, 0.12),
      borderColor: alpha(color.main, 0.3),
      transform: 'translateX(4px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      backgroundColor: color.main,
    }
  };
});

export const HistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.25s ease-in-out',
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

export const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.15) rotate(10deg)',
    boxShadow: theme.shadows[8],
  }
}));

export const ScenarioChip = styled(Chip)(({ theme, $active }) => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  fontWeight: $active ? 700 : 500,
  ...$active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'scale(1.08)',
    boxShadow: theme.shadows[6],
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
  }
}));

export const InsightBox = styled(Box)(({ theme, severity = 'info' }) => {
  const colors = {
    high: theme.palette.error,
    medium: theme.palette.warning,
    low: theme.palette.info,
    positive: theme.palette.success
  };
  const color = colors[severity] || colors.info;
  
  return {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(color.main, 0.08),
    borderLeft: `5px solid ${color.main}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: alpha(color.main, 0.12),
      transform: 'translateX(8px)',
      boxShadow: `0 4px 12px ${alpha(color.main, 0.2)}`,
    },
    '& .insight-icon': {
      color: color.main,
      transition: 'all 0.3s ease',
    },
    '&:hover .insight-icon': {
      transform: 'scale(1.2) rotate(10deg)',
    }
  };
});

export const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    borderColor: theme.palette.primary.main,
  }
}));

export const SearchBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 2),
  borderRadius: theme.spacing(4),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: 400,
  '& .MuiInputBase-root': {
    borderRadius: theme.spacing(4),
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
  }
}));

export const ListViewItem = styled(Paper)(({ theme, $active }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.25s ease',
  cursor: 'pointer',
  border: `1px solid ${$active ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: $active ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.paper, 0.8),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

// Chart color schemes for consistency across the app
export const chartColors = {
  primary: ['#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9'],
  success: ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'],
  warning: ['#ff9800', '#ffa726', '#ffb74d', '#ffcc80', '#ffe0b2'],
  error: ['#f44336', '#ef5350', '#e57373', '#ef9a9a', '#ffcdd2'],
  mixed: ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'],
  pastel: ['#90caf9', '#80deea', '#a5d6a7', '#ffe082', '#f48fb1', '#ce93d8']
};