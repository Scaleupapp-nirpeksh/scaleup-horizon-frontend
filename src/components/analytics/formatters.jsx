// src/components/analytics/formatters.jsx

// Format currency in INR
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };
  
  // Format date to readable format
  export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format percentage value
  export const formatPercentage = (value) => {
    return `${((value || 0) * 100).toFixed(1)}%`;
  };
  
  // Calculate relative time (how long ago)
  export const getRelativeTime = (date) => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now - past);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date);
    }
  };