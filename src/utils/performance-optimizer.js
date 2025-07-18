// Performance Optimization Utility
import { PERFORMANCE_THRESHOLDS } from './constants.js';

/**
 * Optimize dataset for chart rendering with sampling and performance improvements
 * @param {Array} data - Raw data array
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized data and metadata
 */
export const optimizeDataForCharting = (data, options = {}) => {
  const {
    maxPoints = PERFORMANCE_THRESHOLDS.MAX_CHART_POINTS,
    preservePattern = true,
    enableSampling = true
  } = options;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      data: [],
      isOptimized: false,
      originalSize: 0,
      optimizedSize: 0,
      samplingMethod: 'none',
      performance: {
        disableAnimations: false,
        useDownsampling: false
      }
    };
  }

  const originalSize = data.length;
  let optimizedData = [...data];
  let samplingMethod = 'none';
  
  // Performance settings based on data size
  const performance = {
    disableAnimations: originalSize > PERFORMANCE_THRESHOLDS.ANIMATION_THRESHOLD,
    useDownsampling: originalSize > PERFORMANCE_THRESHOLDS.LARGE_DATASET,
    chunkProcessing: originalSize > PERFORMANCE_THRESHOLDS.CHUNK_SIZE
  };

  // Apply sampling if dataset is large
  if (enableSampling && originalSize > maxPoints) {
    if (originalSize > PERFORMANCE_THRESHOLDS.SAMPLING_THRESHOLD) {
      // Intelligent sampling for very large datasets
      optimizedData = intelligentSample(data, maxPoints, preservePattern);
      samplingMethod = 'intelligent';
    } else {
      // Simple uniform sampling for moderately large datasets
      optimizedData = uniformSample(data, maxPoints);
      samplingMethod = 'uniform';
    }
  }

  return {
    data: optimizedData,
    isOptimized: optimizedData.length !== originalSize,
    originalSize: originalSize,
    optimizedSize: optimizedData.length,
    samplingMethod: samplingMethod,
    performance: performance,
    reductionRatio: originalSize > 0 ? (originalSize - optimizedData.length) / originalSize : 0
  };
};

/**
 * Intelligent sampling that preserves data patterns and extremes
 * @param {Array} data - Original data array
 * @param {number} targetSize - Target number of data points
 * @param {boolean} preservePattern - Whether to preserve data patterns
 * @returns {Array} Sampled data array
 */
const intelligentSample = (data, targetSize, preservePattern = true) => {
  if (data.length <= targetSize) return data;

  if (!preservePattern) {
    return uniformSample(data, targetSize);
  }

  // Strategy: Keep first/last points + uniform sampling + outliers
  const sampledData = [];
  const numericColumns = getNumericColumns(data);
  
  // Always keep first and last points
  sampledData.push(data[0]);
  if (data.length > 1) {
    sampledData.push(data[data.length - 1]);
  }
  
  // Calculate step size for uniform sampling
  const middlePointsNeeded = Math.max(0, targetSize - 2);
  const step = data.length > 2 ? (data.length - 2) / middlePointsNeeded : 1;
  
  // Add uniformly sampled points from the middle
  for (let i = 1; i < middlePointsNeeded && i * step + 1 < data.length - 1; i++) {
    const index = Math.round(i * step + 1);
    if (index < data.length - 1 && !sampledData.includes(data[index])) {
      sampledData.push(data[index]);
    }
  }
  
  // Add outliers if we have numeric data and room for more points
  if (numericColumns.length > 0 && sampledData.length < targetSize) {
    const outliers = findOutliers(data, numericColumns[0], targetSize - sampledData.length);
    outliers.forEach(outlier => {
      if (!sampledData.includes(outlier)) {
        sampledData.push(outlier);
      }
    });
  }
  
  // Sort by original index to maintain order
  return sampledData
    .sort((a, b) => data.indexOf(a) - data.indexOf(b))
    .slice(0, targetSize);
};

/**
 * Simple uniform sampling - takes every nth element
 * @param {Array} data - Original data array
 * @param {number} targetSize - Target number of data points
 * @returns {Array} Uniformly sampled data array
 */
const uniformSample = (data, targetSize) => {
  if (data.length <= targetSize) return data;
  
  const step = data.length / targetSize;
  const sampledData = [];
  
  for (let i = 0; i < targetSize; i++) {
    const index = Math.floor(i * step);
    if (index < data.length) {
      sampledData.push(data[index]);
    }
  }
  
  return sampledData;
};

/**
 * Find outliers in numeric data for intelligent sampling
 * @param {Array} data - Data array
 * @param {string} column - Column name to analyze
 * @param {number} maxOutliers - Maximum number of outliers to return
 * @returns {Array} Array of outlier data points
 */
const findOutliers = (data, column, maxOutliers = 10) => {
  const values = data
    .map(row => Number(row[column]))
    .filter(val => !isNaN(val));
  
  if (values.length === 0) return [];
  
  // Calculate quartiles
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  // Find outlier data points
  const outliers = data.filter(row => {
    const value = Number(row[column]);
    return !isNaN(value) && (value < lowerBound || value > upperBound);
  });
  
  return outliers.slice(0, maxOutliers);
};

/**
 * Get numeric column names from data
 * @param {Array} data - Data array
 * @returns {Array} Array of numeric column names
 */
const getNumericColumns = (data) => {
  if (!data || data.length === 0) return [];
  
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  return columns.filter(column => {
    return data.some(row => {
      const value = row[column];
      return typeof value === 'number' || (!isNaN(Number(value)) && value !== '' && value !== null);
    });
  });
};

/**
 * Process large datasets in chunks to prevent UI blocking
 * @param {Array} data - Large data array
 * @param {Function} processor - Processing function
 * @param {number} chunkSize - Size of each chunk
 * @returns {Promise<Array>} Processed data
 */
export const processInChunks = async (data, processor, chunkSize = PERFORMANCE_THRESHOLDS.CHUNK_SIZE) => {
  const results = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const processedChunk = await processor(chunk);
    results.push(...processedChunk);
    
    // Allow UI to update between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

/**
 * Get recommended Chart.js options for performance based on data size
 * @param {number} dataSize - Number of data points
 * @param {string} chartType - Type of chart
 * @returns {Object} Optimized Chart.js options
 */
export const getPerformanceChartOptions = (dataSize, chartType = 'bar') => {
  const baseOptions = {
    animation: {
      duration: dataSize > PERFORMANCE_THRESHOLDS.ANIMATION_THRESHOLD ? 0 : 750
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Large dataset optimizations
  if (dataSize > PERFORMANCE_THRESHOLDS.LARGE_DATASET) {
    baseOptions.parsing = false; // Disable data parsing for performance
    baseOptions.normalized = true; // Use normalized data
    
    // Reduce point radius for line charts with many points
    if (chartType === 'line' || chartType === 'area') {
      baseOptions.elements = {
        point: {
          radius: dataSize > PERFORMANCE_THRESHOLDS.SAMPLING_THRESHOLD ? 0 : 2
        }
      };
    }
    
    // Optimize tooltips for large datasets
    baseOptions.plugins = {
      tooltip: {
        enabled: dataSize < PERFORMANCE_THRESHOLDS.SAMPLING_THRESHOLD,
        mode: 'nearest',
        intersect: false
      }
    };
  }

  // Very large dataset - aggressive optimizations
  if (dataSize > PERFORMANCE_THRESHOLDS.SAMPLING_THRESHOLD) {
    baseOptions.interaction = {
      mode: 'point',
      intersect: true
    };
    
    // Disable hover animations
    baseOptions.hover = {
      animationDuration: 0
    };
    
    // Simplify scales
    baseOptions.scales = {
      x: {
        ticks: {
          maxTicksLimit: 10
        }
      },
      y: {
        ticks: {
          maxTicksLimit: 8
        }
      }
    };
  }

  return baseOptions;
};

/**
 * Memory-conscious data validation for large datasets
 * @param {Array} data - Data to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with memory optimization
 */
export const validateLargeDataset = (data, options = {}) => {
  const { sampleSize = 1000 } = options;
  
  // For very large datasets, validate only a sample
  const sampleData = data.length > PERFORMANCE_THRESHOLDS.SAMPLING_THRESHOLD 
    ? uniformSample(data, sampleSize)
    : data;
  
  return {
    isLargeDataset: data.length > PERFORMANCE_THRESHOLDS.LARGE_DATASET,
    requiresOptimization: data.length > PERFORMANCE_THRESHOLDS.SAMPLING_THRESHOLD,
    sampleSize: sampleData.length,
    originalSize: data.length,
    sampleData: sampleData
  };
}; 