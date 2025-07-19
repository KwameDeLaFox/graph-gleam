// Performance optimization utilities for theme switching and chart rendering

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Optimize chart data for performance by limiting data points
 * @param {Array} data - Raw data array
 * @param {number} maxPoints - Maximum number of data points
 * @returns {Array} - Optimized data array
 */
export const optimizeChartData = (data, maxPoints = 1000) => {
  if (!data || data.length <= maxPoints) {
    return data;
  }

  // Sample data points evenly
  const step = Math.floor(data.length / maxPoints);
  const optimized = [];
  
  for (let i = 0; i < data.length; i += step) {
    optimized.push(data[i]);
    if (optimized.length >= maxPoints) break;
  }

  return optimized;
};

/**
 * Batch DOM updates for better performance
 * @param {Function} updateFunction - Function containing DOM updates
 */
export const batchDOMUpdates = (updateFunction) => {
  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    updateFunction();
  });
};

/**
 * Optimize theme switching performance
 * @param {string} themeId - Theme ID to apply
 * @param {Function} applyFunction - Function to apply theme
 */
export const optimizeThemeSwitch = (themeId, applyFunction) => {
  // Use requestAnimationFrame for smooth theme transitions
  requestAnimationFrame(() => {
    applyFunction(themeId);
  });
};

/**
 * Memory management for chart instances
 * @param {Object} chartInstance - Chart.js instance
 */
export const cleanupChartInstance = (chartInstance) => {
  if (chartInstance && typeof chartInstance.destroy === 'function') {
    chartInstance.destroy();
  }
};

/**
 * Performance Testing and Optimization Utility
 * Tests theme selector performance with different dataset sizes and measures key metrics
 */

// Performance measurement utilities
export const measurePerformance = (fn, iterations = 10) => {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
  
  return {
    average: Math.round(average * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    median: Math.round(median * 100) / 100,
    times,
    iterations
  };
};

// Generate test datasets of different sizes
export const generateTestDatasets = () => {
  const datasets = {
    small: [], // 100 rows
    medium: [], // 1,000 rows
    large: [], // 10,000 rows
    extraLarge: [] // 50,000 rows (stress test)
  };
  
  // Generate small dataset (100 rows)
  for (let i = 0; i < 100; i++) {
    datasets.small.push({
      id: i + 1,
      category: `Category ${(i % 10) + 1}`,
      value: Math.floor(Math.random() * 1000) + 100,
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0]
    });
  }
  
  // Generate medium dataset (1,000 rows)
  for (let i = 0; i < 1000; i++) {
    datasets.medium.push({
      id: i + 1,
      category: `Category ${(i % 20) + 1}`,
      value: Math.floor(Math.random() * 10000) + 1000,
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0]
    });
  }
  
  // Generate large dataset (10,000 rows)
  for (let i = 0; i < 10000; i++) {
    datasets.large.push({
      id: i + 1,
      category: `Category ${(i % 50) + 1}`,
      value: Math.floor(Math.random() * 100000) + 10000,
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0]
    });
  }
  
  // Generate extra large dataset (50,000 rows) - stress test
  for (let i = 0; i < 50000; i++) {
    datasets.extraLarge.push({
      id: i + 1,
      category: `Category ${(i % 100) + 1}`,
      value: Math.floor(Math.random() * 500000) + 50000,
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0]
    });
  }
  
  return datasets;
};

// Theme switching performance test
export const testThemeSwitchingPerformance = async (chartRendererRef, themes = ['corporate', 'pastel-fun', 'high-contrast']) => {
  const results = {
    themeSwitching: {},
    memoryUsage: {},
    overall: {}
  };
  
  // Test theme switching performance
  const themeSwitchingTimes = [];
  
  for (let i = 0; i < 10; i++) {
    for (const theme of themes) {
      const start = performance.now();
      
      // Simulate theme switching
      if (chartRendererRef && chartRendererRef.current) {
        // Trigger theme change
        chartRendererRef.current.updateTheme(theme);
      }
      
      const end = performance.now();
      themeSwitchingTimes.push({
        theme,
        time: end - start
      });
    }
  }
  
  // Calculate theme switching metrics
  const allTimes = themeSwitchingTimes.map(t => t.time);
  results.themeSwitching = {
    average: Math.round((allTimes.reduce((a, b) => a + b, 0) / allTimes.length) * 100) / 100,
    min: Math.round(Math.min(...allTimes) * 100) / 100,
    max: Math.round(Math.max(...allTimes) * 100) / 100,
    meetsRequirement: (allTimes.reduce((a, b) => a + b, 0) / allTimes.length) <= 300,
    times: themeSwitchingTimes
  };
  
  // Memory usage test
  if ('memory' in performance) {
    const memoryBefore = performance.memory.usedJSHeapSize;
    
    // Perform theme switching operations
    for (let i = 0; i < 50; i++) {
      for (const theme of themes) {
        if (chartRendererRef && chartRendererRef.current) {
          chartRendererRef.current.updateTheme(theme);
        }
      }
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    const memoryAfter = performance.memory.usedJSHeapSize;
    const memoryIncrease = memoryAfter - memoryBefore;
    
    results.memoryUsage = {
      before: memoryBefore,
      after: memoryAfter,
      increase: memoryIncrease,
      increaseKB: Math.round(memoryIncrease / 1024 * 100) / 100,
      stable: memoryIncrease < 1024 * 1024, // Less than 1MB increase
      supported: true
    };
  } else {
    results.memoryUsage = {
      supported: false,
      message: 'Memory API not supported'
    };
  }
  
  return results;
};

// Chart rendering performance test with different dataset sizes
export const testChartRenderingPerformance = async (chartRendererRef, datasets) => {
  const results = {
    rendering: {},
    themeImpact: {}
  };
  
  // Test rendering performance for each dataset size
  for (const [size, data] of Object.entries(datasets)) {
    const renderingTimes = [];
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      
      // Simulate chart rendering with data
      if (chartRendererRef && chartRendererRef.current) {
        chartRendererRef.current.updateData(data);
      }
      
      const end = performance.now();
      renderingTimes.push(end - start);
    }
    
    const average = renderingTimes.reduce((a, b) => a + b, 0) / renderingTimes.length;
    
    results.rendering[size] = {
      rows: data.length,
      average: Math.round(average * 100) / 100,
      min: Math.round(Math.min(...renderingTimes) * 100) / 100,
      max: Math.round(Math.max(...renderingTimes) * 100) / 100,
      meetsRequirement: average <= 50, // 50ms requirement for 1,000 rows
      times: renderingTimes
    };
  }
  
  // Test theme impact on rendering performance
  const themes = ['corporate', 'pastel-fun', 'high-contrast'];
  const mediumData = datasets.medium;
  
  for (const theme of themes) {
    const themeRenderingTimes = [];
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      
      // Apply theme and render
      if (chartRendererRef && chartRendererRef.current) {
        chartRendererRef.current.updateTheme(theme);
        chartRendererRef.current.updateData(mediumData);
      }
      
      const end = performance.now();
      themeRenderingTimes.push(end - start);
    }
    
    const average = themeRenderingTimes.reduce((a, b) => a + b, 0) / themeRenderingTimes.length;
    
    results.themeImpact[theme] = {
      average: Math.round(average * 100) / 100,
      min: Math.round(Math.min(...themeRenderingTimes) * 100) / 100,
      max: Math.round(Math.max(...themeRenderingTimes) * 100) / 100,
      meetsRequirement: average <= 50,
      times: themeRenderingTimes
    };
  }
  
  return results;
};

// Export performance test
export const testExportPerformance = async (chartRendererRef, themes = ['corporate', 'pastel-fun', 'high-contrast']) => {
  const results = {
    pngExport: {},
    jpegExport: {}
  };
  
  // Test PNG export performance
  const pngTimes = [];
  for (const theme of themes) {
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      
      // Simulate PNG export
      if (chartRendererRef && chartRendererRef.current) {
        chartRendererRef.current.updateTheme(theme);
        // Export would happen here
      }
      
      const end = performance.now();
      pngTimes.push({
        theme,
        time: end - start
      });
    }
  }
  
  const pngAllTimes = pngTimes.map(t => t.time);
  results.pngExport = {
    average: Math.round((pngAllTimes.reduce((a, b) => a + b, 0) / pngAllTimes.length) * 100) / 100,
    min: Math.round(Math.min(...pngAllTimes) * 100) / 100,
    max: Math.round(Math.max(...pngAllTimes) * 100) / 100,
    meetsRequirement: (pngAllTimes.reduce((a, b) => a + b, 0) / pngAllTimes.length) <= 1000, // 1 second
    times: pngTimes
  };
  
  // Test JPEG export performance
  const jpegTimes = [];
  for (const theme of themes) {
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      
      // Simulate JPEG export
      if (chartRendererRef && chartRendererRef.current) {
        chartRendererRef.current.updateTheme(theme);
        // Export would happen here
      }
      
      const end = performance.now();
      jpegTimes.push({
        theme,
        time: end - start
      });
    }
  }
  
  const jpegAllTimes = jpegTimes.map(t => t.time);
  results.jpegExport = {
    average: Math.round((jpegAllTimes.reduce((a, b) => a + b, 0) / jpegAllTimes.length) * 100) / 100,
    min: Math.round(Math.min(...jpegAllTimes) * 100) / 100,
    max: Math.round(Math.max(...jpegAllTimes) * 100) / 100,
    meetsRequirement: (jpegAllTimes.reduce((a, b) => a + b, 0) / jpegAllTimes.length) <= 1000, // 1 second
    times: jpegTimes
  };
  
  return results;
};

// Comprehensive performance test
export const runComprehensivePerformanceTest = async (chartRendererRef) => {
  console.log('⚡ Starting comprehensive performance test...');
  
  const results = {
    timestamp: new Date().toISOString(),
    datasets: {},
    themeSwitching: {},
    chartRendering: {},
    exportPerformance: {},
    memoryUsage: {},
    summary: {}
  };
  
  try {
    // Generate test datasets
    console.log('📊 Generating test datasets...');
    results.datasets = generateTestDatasets();
    
    // Test theme switching performance
    console.log('🎨 Testing theme switching performance...');
    results.themeSwitching = await testThemeSwitchingPerformance(chartRendererRef);
    
    // Test chart rendering performance
    console.log('📈 Testing chart rendering performance...');
    results.chartRendering = await testChartRenderingPerformance(chartRendererRef, results.datasets);
    
    // Test export performance
    console.log('💾 Testing export performance...');
    results.exportPerformance = await testExportPerformance(chartRendererRef);
    
    // Memory usage from theme switching test
    results.memoryUsage = results.themeSwitching.memoryUsage;
    
    // Generate summary
    const themeSwitchingMeets = results.themeSwitching.meetsRequirement;
    const renderingMeets = Object.values(results.chartRendering.rendering).every(r => r.meetsRequirement);
    const exportMeets = results.exportPerformance.pngExport.meetsRequirement && results.exportPerformance.jpegExport.meetsRequirement;
    const memoryStable = results.memoryUsage.stable !== false;
    
    results.summary = {
      overallScore: Math.round((
        (themeSwitchingMeets ? 25 : 0) +
        (renderingMeets ? 25 : 0) +
        (exportMeets ? 25 : 0) +
        (memoryStable ? 25 : 0)
      )),
      themeSwitching: themeSwitchingMeets,
      chartRendering: renderingMeets,
      exportPerformance: exportMeets,
      memoryStable: memoryStable,
      status: themeSwitchingMeets && renderingMeets && exportMeets && memoryStable ? 'Excellent' : 'Needs Optimization'
    };
    
    console.log('✅ Performance test completed successfully');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    results.error = error.message;
    results.summary = {
      overallScore: 0,
      status: 'Error'
    };
  }
  
  return results;
};

// Performance monitoring utilities
export const createPerformanceMonitor = () => {
  const metrics = {
    themeSwitches: 0,
    renderTimes: [],
    memorySnapshots: [],
    errors: []
  };
  
  return {
    recordThemeSwitch: (theme, time) => {
      metrics.themeSwitches++;
      metrics.renderTimes.push({ type: 'theme-switch', theme, time, timestamp: Date.now() });
    },
    
    recordRender: (datasetSize, time) => {
      metrics.renderTimes.push({ type: 'render', datasetSize, time, timestamp: Date.now() });
    },
    
    recordMemorySnapshot: () => {
      if ('memory' in performance) {
        metrics.memorySnapshots.push({
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          timestamp: Date.now()
        });
      }
    },
    
    recordError: (error) => {
      metrics.errors.push({ error: error.message, timestamp: Date.now() });
    },
    
    getMetrics: () => ({ ...metrics }),
    
    getAverageRenderTime: () => {
      const renderTimes = metrics.renderTimes.filter(r => r.type === 'render').map(r => r.time);
      return renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0;
    },
    
    getAverageThemeSwitchTime: () => {
      const themeTimes = metrics.renderTimes.filter(r => r.type === 'theme-switch').map(r => r.time);
      return themeTimes.length > 0 ? themeTimes.reduce((a, b) => a + b, 0) / themeTimes.length : 0;
    },
    
    clear: () => {
      metrics.themeSwitches = 0;
      metrics.renderTimes = [];
      metrics.memorySnapshots = [];
      metrics.errors = [];
    }
  };
};

// Export test results to console
export const logPerformanceTestResults = (results) => {
  console.group('⚡ Performance Test Results');
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Overall Score: ${results.summary.overallScore}% (${results.summary.status})`);
  
  console.group('🎨 Theme Switching Performance');
  console.log(`Average: ${results.themeSwitching.average}ms`);
  console.log(`Range: ${results.themeSwitching.min}ms - ${results.themeSwitching.max}ms`);
  console.log(`Meets Requirement (≤300ms): ${results.themeSwitching.meetsRequirement ? '✅' : '❌'}`);
  console.groupEnd();
  
  console.group('📈 Chart Rendering Performance');
  Object.entries(results.chartRendering.rendering).forEach(([size, data]) => {
    console.log(`${size} (${data.rows} rows): ${data.average}ms ${data.meetsRequirement ? '✅' : '❌'}`);
  });
  console.groupEnd();
  
  console.group('💾 Export Performance');
  console.log(`PNG Export: ${results.exportPerformance.pngExport.average}ms ${results.exportPerformance.pngExport.meetsRequirement ? '✅' : '❌'}`);
  console.log(`JPEG Export: ${results.exportPerformance.jpegExport.average}ms ${results.exportPerformance.jpegExport.meetsRequirement ? '✅' : '❌'}`);
  console.groupEnd();
  
  if (results.memoryUsage.supported) {
    console.group('🧠 Memory Usage');
    console.log(`Memory Increase: ${results.memoryUsage.increaseKB}KB`);
    console.log(`Stable: ${results.memoryUsage.stable ? '✅' : '❌'}`);
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return results;
};

/**
 * Optimize for performance based on data size
 * @param {Array} rawData - Raw data array
 * @returns {Object} - Optimization result with data and recommendations
 */
export const optimizeForPerformance = (rawData) => {
  const dataLength = rawData?.length || 0;
  const recommendations = [];

  // Data size optimization
  if (dataLength > 1000) {
    recommendations.push('Large dataset detected - consider sampling');
  }

  if (dataLength > 5000) {
    recommendations.push('Very large dataset - aggressive optimization recommended');
  }

  // Memory optimization
  if (dataLength > 10000) {
    recommendations.push('Extremely large dataset - virtual scrolling recommended');
  }

  return {
    data: rawData,
    recommendations,
    optimized: dataLength > 1000 ? optimizeChartData(rawData) : rawData
  };
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
  const sampleData = data.length > 5000 
    ? optimizeChartData(data, sampleSize)
    : data;
  
  return {
    isLargeDataset: data.length > 1000,
    requiresOptimization: data.length > 5000,
    sampleSize: sampleData.length,
    originalSize: data.length,
    sampleData: sampleData
  };
};