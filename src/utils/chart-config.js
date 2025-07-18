// Chart.js configuration and utilities
import { Chart as ChartJS, registerables } from 'chart.js';
import { DEFAULT_COLORS, CHART_TYPES } from './constants.js';

// Register Chart.js components
ChartJS.register(...registerables);

// Base chart configuration
const baseConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
};

// Configuration for different chart types
export const getChartConfig = (type, data, options = {}) => {
  const config = {
    type,
    data,
    options: {
      ...baseConfig,
      ...options,
    },
  };

  // Type-specific configurations
  switch (type) {
    case CHART_TYPES.LINE:
      config.options.interaction = {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      };
      break;
      
    case CHART_TYPES.PIE:
      config.options.plugins.legend.position = 'right';
      break;
      
    case CHART_TYPES.AREA:
      config.type = 'line'; // Area is a line chart with fill
      if (config.data.datasets) {
        config.data.datasets.forEach(dataset => {
          dataset.fill = true;
          dataset.backgroundColor = dataset.backgroundColor || DEFAULT_COLORS[0] + '40'; // Add transparency
        });
      }
      break;
  }

  return config;
};

// Helper to create dataset with default styling
export const createDataset = (label, data, colorIndex = 0) => {
  const color = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
  
  return {
    label,
    data,
    backgroundColor: color + '80', // Add some transparency
    borderColor: color,
    borderWidth: 2,
  };
};

// Helper to prepare data for Chart.js
export const prepareChartData = (rawData, chartType) => {
  // This will be implemented when we build the data processing utilities
  // For now, return a placeholder structure
  return {
    labels: [],
    datasets: []
  };
};

export { ChartJS }; 