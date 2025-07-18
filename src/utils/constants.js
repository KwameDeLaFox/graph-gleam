// Constants for Graph Gleam application

// File upload constraints
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const MAX_ROWS = 50000;

// Performance optimization thresholds
export const PERFORMANCE_THRESHOLDS = {
  LARGE_DATASET: 1000, // Start optimization at 1000+ rows
  SAMPLING_THRESHOLD: 5000, // Start sampling at 5000+ rows
  MAX_CHART_POINTS: 2000, // Maximum data points to render in charts
  CHUNK_SIZE: 1000, // Process data in chunks for large files
  ANIMATION_THRESHOLD: 500 // Disable animations for datasets larger than this
};

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  CSV: '.csv',
  EXCEL: '.xlsx'
};

export const SUPPORTED_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Chart types
export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line', 
  PIE: 'pie',
  AREA: 'area'
};

// Chart.js default colors
export const DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500  
  '#10B981', // green-500
  '#F59E0B', // yellow-500
  '#8B5CF6', // purple-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16'  // lime-500
];

// Error types
export const ERROR_TYPES = {
  FILE_SIZE: 'size',
  FILE_TYPE: 'type', 
  PARSE_ERROR: 'parse',
  EMPTY_FILE: 'empty',
  NO_NUMERIC_DATA: 'no-numeric'
}; 