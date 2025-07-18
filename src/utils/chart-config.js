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

// Helper to suggest appropriate chart types based on data
export const getChartSuggestions = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  const suggestions = [];
  const headers = Object.keys(data[0] || {});
  
  // Count numeric vs text columns
  const numericColumns = headers.filter(header => {
    return data.some(row => typeof row[header] === 'number' || !isNaN(parseFloat(row[header])));
  });
  
  const textColumns = headers.filter(header => {
    return data.every(row => typeof row[header] === 'string' || isNaN(parseFloat(row[header])));
  });

  // Bar chart - good for categorical data
  if (textColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      type: CHART_TYPES.BAR,
      name: 'Bar Chart',
      score: 90,
      reason: 'Great for comparing categories'
    });
  }

  // Line chart - good for time series or continuous data
  if (numericColumns.length >= 2) {
    suggestions.push({
      type: CHART_TYPES.LINE,
      name: 'Line Chart', 
      score: 85,
      reason: 'Perfect for showing trends over time'
    });
  }

  // Pie chart - good for parts of a whole
  if (textColumns.length === 1 && numericColumns.length === 1 && data.length <= 10) {
    suggestions.push({
      type: CHART_TYPES.PIE,
      name: 'Pie Chart',
      score: 75,
      reason: 'Shows proportions of categories'
    });
  }

  // Area chart - similar to line but filled
  if (numericColumns.length >= 2) {
    suggestions.push({
      type: CHART_TYPES.AREA,
      name: 'Area Chart',
      score: 70,
      reason: 'Shows cumulative trends'
    });
  }

  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
};

export { ChartJS };