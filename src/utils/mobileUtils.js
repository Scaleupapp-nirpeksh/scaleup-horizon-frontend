// src/utils/mobileUtils.js
import { useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';

/**
 * Custom hooks for mobile responsiveness
 */

// Hook to detect mobile devices
export const useIsMobile = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};

// Hook to detect tablet devices
export const useIsTablet = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between('sm', 'md'));
};

// Hook to detect touch devices
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  
  return isTouch;
};

// Hook to get device type
export const useDeviceType = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isDesktop) return 'desktop';
  return 'unknown';
};

// Hook for responsive values
export const useResponsive = (values) => {
  const deviceType = useDeviceType();
  
  const defaultValues = {
    mobile: values.mobile || values.default,
    tablet: values.tablet || values.default,
    desktop: values.desktop || values.default,
  };
  
  return defaultValues[deviceType] || values.default;
};

// Hook for viewport dimensions
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return viewport;
};

// Hook for orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      );
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return orientation;
};

// Responsive helper functions
export const getResponsiveValue = (baseValue, scaleFactor = 0.8) => {
  const deviceType = useDeviceType();
  
  if (deviceType === 'mobile') {
    return Math.round(baseValue * scaleFactor);
  }
  if (deviceType === 'tablet') {
    return Math.round(baseValue * ((1 + scaleFactor) / 2));
  }
  return baseValue;
};

// Touch-friendly click handler
export const useTouchClick = (onClick, onLongPress) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const minimumSwipeDistance = 50;
  const longPressDelay = 500;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress(e);
      }, longPressDelay);
      
      e.target.longPressTimer = timer;
    }
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    if (e.target.longPressTimer) {
      clearTimeout(e.target.longPressTimer);
    }
  };
  
  const onTouchEnd = (e) => {
    if (e.target.longPressTimer) {
      clearTimeout(e.target.longPressTimer);
    }
    
    if (!touchStart || !touchEnd) {
      onClick && onClick(e);
      return;
    }
    
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < minimumSwipeDistance) {
      onClick && onClick(e);
    }
  };
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onClick: !useIsTouchDevice() ? onClick : undefined,
  };
};

// Swipeable wrapper component
export const SwipeableWrapper = ({ children, onSwipeLeft, onSwipeRight, threshold = 50 }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    
    if (distance > threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    if (distance < -threshold && onSwipeRight) {
      onSwipeRight();
    }
  };
  
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
};

// Responsive grid utilities
export const getResponsiveGridSize = (desktop, tablet, mobile) => ({
  xs: mobile || 12,
  sm: tablet || desktop || 6,
  md: desktop || 4,
  lg: desktop || 3,
});

// Responsive spacing utilities
export const getResponsiveSpacing = (theme, desktop, tablet, mobile) => ({
  xs: theme.spacing(mobile || 2),
  sm: theme.spacing(tablet || 3),
  md: theme.spacing(desktop || 4),
});

// Responsive typography
export const getResponsiveFontSize = (desktop, tablet, mobile) => ({
  fontSize: {
    xs: mobile || '0.875rem',
    sm: tablet || '1rem',
    md: desktop || '1.125rem',
  },
});

// Viewport-based value calculator
export const useViewportValue = (percentage) => {
  const { width, height } = useViewport();
  
  return {
    vw: (width * percentage) / 100,
    vh: (height * percentage) / 100,
    vmin: Math.min(width, height) * percentage / 100,
    vmax: Math.max(width, height) * percentage / 100,
  };
};

// Export all utilities
export default {
  useIsMobile,
  useIsTablet,
  useIsTouchDevice,
  useDeviceType,
  useResponsive,
  useViewport,
  useOrientation,
  getResponsiveValue,
  useTouchClick,
  SwipeableWrapper,
  getResponsiveGridSize,
  getResponsiveSpacing,
  getResponsiveFontSize,
  useViewportValue,
};