// src/theme/mobileTheme.js
import { createTheme, alpha } from '@mui/material/styles';

// Create a mobile-optimized theme
export const createMobileOptimizedTheme = (mode = 'light') => {
  const baseTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
      },
      secondary: {
        main: '#8b5cf6',
        light: '#a78bfa',
        dark: '#7c3aed',
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
    },
    
    // Responsive typography
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      
      h1: {
        fontSize: '2.5rem',
        fontWeight: 800,
        lineHeight: 1.2,
        '@media (max-width:600px)': {
          fontSize: '2rem',
        },
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
        '@media (max-width:600px)': {
          fontSize: '1.5rem',
        },
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 700,
        lineHeight: 1.4,
        '@media (max-width:600px)': {
          fontSize: '1.25rem',
        },
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
        '@media (max-width:600px)': {
          fontSize: '1.125rem',
        },
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
        '@media (max-width:600px)': {
          fontSize: '0.875rem',
        },
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
        '@media (max-width:600px)': {
          fontSize: '0.875rem',
        },
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        '@media (max-width:600px)': {
          fontSize: '0.813rem',
        },
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        '@media (max-width:600px)': {
          fontSize: '0.875rem',
        },
      },
      caption: {
        fontSize: '0.75rem',
        '@media (max-width:600px)': {
          fontSize: '0.688rem',
        },
      },
    },
    
    // Responsive spacing
    spacing: 8,
    
    // Breakpoints
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    
    // Component overrides
    components: {
      // Mobile-optimized buttons
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            minHeight: 44, // Touch-friendly minimum height
            '@media (max-width:600px)': {
              minHeight: 48,
              padding: '10px 16px',
            },
          },
          sizeLarge: {
            '@media (max-width:600px)': {
              padding: '12px 24px',
              fontSize: '1rem',
            },
          },
        },
      },
      
      // Touch-friendly icon buttons
      MuiIconButton: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              padding: 12,
            },
          },
          sizeSmall: {
            '@media (max-width:600px)': {
              padding: 8,
            },
          },
        },
      },
      
      // Mobile-optimized cards
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            '@media (max-width:600px)': {
              borderRadius: 12,
            },
          },
        },
      },
      
      // Responsive dialogs
      MuiDialog: {
        styleOverrides: {
          paper: {
            '@media (max-width:600px)': {
              margin: 16,
              width: 'calc(100% - 32px)',
              maxHeight: 'calc(100% - 32px)',
            },
          },
        },
      },
      
      // Touch-friendly form controls
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              '@media (max-width:600px)': {
                minHeight: 48,
              },
            },
          },
        },
      },
      
      // Responsive tables
      MuiTableCell: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              padding: '12px 8px',
              fontSize: '0.813rem',
            },
          },
          head: {
            fontWeight: 700,
            '@media (max-width:600px)': {
              padding: '16px 8px',
            },
          },
        },
      },
      
      // Mobile-friendly tabs
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 48,
            '@media (max-width:600px)': {
              minHeight: 40,
            },
          },
          indicator: {
            height: 3,
          },
        },
      },
      
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 600,
            '@media (max-width:600px)': {
              minHeight: 40,
              minWidth: 80,
              padding: '6px 12px',
              fontSize: '0.813rem',
            },
          },
        },
      },
      
      // Touch-friendly chips
      MuiChip: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              height: 28,
              fontSize: '0.75rem',
            },
          },
          sizeSmall: {
            '@media (max-width:600px)': {
              height: 24,
              fontSize: '0.688rem',
            },
          },
        },
      },
      
      // Responsive app bar
      MuiAppBar: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              minHeight: 56,
            },
          },
        },
      },
      
      // Touch-friendly list items
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              minHeight: 48,
              paddingTop: 12,
              paddingBottom: 12,
            },
          },
        },
      },
      
      // Responsive grid
      MuiGrid: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              '&.MuiGrid-container': {
                width: 'calc(100% + 16px)',
                margin: -8,
                '& > .MuiGrid-item': {
                  padding: 8,
                },
              },
            },
          },
        },
      },
      
      // Mobile-optimized paper
      MuiPaper: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              borderRadius: 12,
            },
            elevation1: {
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            },
          },
        },
      },
    },
    
    // Custom mixins for mobile
    mixins: {
      toolbar: {
        minHeight: 64,
        '@media (min-width:0px) and (orientation: landscape)': {
          minHeight: 48,
        },
        '@media (min-width:600px)': {
          minHeight: 64,
        },
      },
    },
  });
  
  return baseTheme;
};

// Utility functions for responsive design
export const responsiveUtils = {
  // Get responsive padding
  getResponsivePadding: (theme) => ({
    xs: theme.spacing(2),
    sm: theme.spacing(3),
    md: theme.spacing(4),
  }),
  
  // Get responsive margin
  getResponsiveMargin: (theme) => ({
    xs: theme.spacing(1),
    sm: theme.spacing(2),
    md: theme.spacing(3),
  }),
  
  // Get responsive font size
  getResponsiveFontSize: (base) => ({
    xs: base * 0.875,
    sm: base * 0.9375,
    md: base,
  }),
  
  // Touch target size
  getTouchTargetSize: () => ({
    minWidth: 44,
    minHeight: 44,
  }),
  
  // Safe area insets for mobile devices
  getSafeAreaInsets: () => ({
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
  }),
};

// Mobile-specific styles
export const mobileStyles = {
  // Hide scrollbar on mobile
  hideScrollbar: {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  
  // Touch feedback
  touchRipple: {
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  },
  
  // Prevent text selection on mobile
  noSelect: {
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none',
  },
  
  // Smooth scrolling
  smoothScroll: {
    WebkitOverflowScrolling: 'touch',
    overflowY: 'auto',
  },
  
  // Full screen on mobile
  fullScreenMobile: {
    '@media (max-width:600px)': {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      borderRadius: 0,
    },
  },
  
  // Bottom sheet style
  bottomSheet: {
    '@media (max-width:600px)': {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  },
};

export default createMobileOptimizedTheme;