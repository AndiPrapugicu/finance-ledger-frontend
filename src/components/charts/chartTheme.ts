// Chart theme configuration matching the dark platform design
export const chartTheme = {
  colors: {
    // Platform primary colors
    primary: '#06B6D4', // cyan-500 - matches platform accent
    secondary: '#F97316', // orange-500 - matches platform secondary
    success: '#10B981', // emerald-500 - for income/positive
    danger: '#EF4444', // red-500 - for expenses/negative
    warning: '#F59E0B', // amber-500 - for warnings
    info: '#3B82F6', // blue-500 - for information
    purple: '#8B5CF6', // violet-500 - for special categories
    pink: '#EC4899', // pink-500 - for personal
    
    // Platform background colors
    background: {
      dark: '#1F2937', // gray-800 - matches platform cards
      darker: '#111827', // gray-900 - matches platform background
      card: 'rgba(31, 41, 55, 0.8)', // semi-transparent gray-800
    },
    
    // Platform text colors
    text: {
      primary: '#FFFFFF', // white text
      secondary: '#9CA3AF', // gray-400 for subtitles
      muted: '#6B7280', // gray-500 for disabled
    },
    
    // Platform gradients (matching existing UI)
    gradients: {
      cyan: ['#06B6D4', '#0891B2'], // cyan gradient
      orange: ['#F97316', '#EA580C'], // orange gradient
      green: ['#10B981', '#059669'], // emerald gradient
      red: ['#EF4444', '#DC2626'], // red gradient
      purple: ['#8B5CF6', '#7C3AED'], // violet gradient
    }
  },
  
  // Chart-specific color palettes matching platform
  palettes: {
    financial: [
      '#10B981', // emerald - income (matches platform positive)
      '#EF4444', // red - expenses (matches platform negative)
      '#06B6D4', // cyan - balance (matches platform primary)
      '#F97316', // orange - other (matches platform secondary)
      '#8B5CF6', // violet - investments
      '#EC4899', // pink - personal
    ],
    
    // Account types (matching platform icon colors)
    accountTypes: [
      '#06B6D4', // cyan - for checking/cash
      '#F97316', // orange - for savings
      '#EF4444', // red - for credit cards
      '#8B5CF6', // violet - for investments
      '#10B981', // emerald - for assets
      '#F59E0B', // amber - for other
    ],
    
    // Spending categories (matching platform design)
    categories: [
      '#06B6D4', // cyan - housing (matches house icon)
      '#EC4899', // pink - personal (matches user icon)
      '#F97316', // orange - transportation (matches car icon)
      '#10B981', // emerald - food & dining
      '#8B5CF6', // violet - entertainment
      '#F59E0B', // amber - utilities
      '#3B82F6', // blue - healthcare
      '#EF4444', // red - debt payments
    ],
  },

  // Dark theme default options
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: 'transparent', // Transparent background
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF', // White text for dark theme
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif', // Match platform font
            weight: '500',
          },
          usePointStyle: true,
          padding: 16,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Dark tooltip
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151', // gray-700 border
        borderWidth: 1,
        cornerRadius: 12, // Rounded corners like platform
        titleFont: {
          size: 14,
          weight: '600',
          family: 'Inter, system-ui, sans-serif',
        },
        bodyFont: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
        padding: 12,
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        border: {
          display: false, // Remove axis borders
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
          lineWidth: 1,
        },
        ticks: {
          color: '#9CA3AF', // gray-400 for dark theme
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif',
          },
          padding: 8,
        },
      },
      y: {
        border: {
          display: false, // Remove axis borders
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
          lineWidth: 1,
        },
        ticks: {
          color: '#9CA3AF', // gray-400 for dark theme
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif',
          },
          padding: 8,
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
      },
      line: {
        borderWidth: 3, // Slightly thicker lines
        tension: 0.4, // Smooth curves
      },
      bar: {
        borderRadius: 6, // Rounded bars like platform
        borderSkipped: false,
      },
      arc: {
        borderWidth: 2,
        borderColor: '#1F2937', // gray-800 to separate segments
      },
    },
  },

  // Helper functions with platform-consistent formatting
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  formatLargeNumber: (value: number): string => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${Math.round(value)}`;
  },

  // Platform-specific gradients for chart backgrounds
  createGradient: (ctx: CanvasRenderingContext2D, colors: string[]) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
  },
};

export default chartTheme;