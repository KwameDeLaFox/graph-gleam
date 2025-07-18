import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
} from 'chart.js';
import { CHART_TYPES, DEFAULT_COLORS, PERFORMANCE_THRESHOLDS } from '../utils/constants.js';
import { optimizeDataForCharting, getPerformanceChartOptions } from '../utils/performance-optimizer.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
);

/**
 * Chart Renderer Component
 * Renders charts using Chart.js with support for all chart types
 */
const ChartRenderer = React.forwardRef(({
  data = [],
  chartType = CHART_TYPES.BAR,
  title = '',
  width = 800,
  height = 400,
  responsive = true,
  theme = 'light',
  onError,
  onRenderComplete,
  className = ''
}, ref) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const isRenderingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState(null);

  /**
   * Transform parsed data into Chart.js format with performance optimization
   */
  const transformDataForChart = useCallback((rawData, type) => {
    if (!rawData || rawData.length === 0) {
      throw new Error('No data provided for chart rendering');
    }

    // Apply performance optimization for large datasets
    const optimization = optimizeDataForCharting(rawData, {
      maxPoints: PERFORMANCE_THRESHOLDS.MAX_CHART_POINTS,
      preservePattern: true,
      enableSampling: true
    });
    
    const data = optimization.data;

    const firstRow = data[0] || rawData[0];
    const columnNames = Object.keys(firstRow);
    
    // Find numeric and categorical columns using optimized data for analysis
    const numericColumns = columnNames.filter(col => {
      return data.some(row => {
        const value = row[col];
        return typeof value === 'number' || (!isNaN(Number(value)) && value !== '' && value !== null);
      });
    });

    const categoricalColumns = columnNames.filter(col => !numericColumns.includes(col));

    if (numericColumns.length === 0) {
      throw new Error('No numeric columns found for charting');
    }

    // Prepare labels (x-axis) using optimized data
    const labels = data.map((row, index) => {
      if (categoricalColumns.length > 0) {
        return String(row[categoricalColumns[0]] || `Row ${index + 1}`);
      }
      return `Row ${index + 1}`;
    });

    let datasets = [];

    switch (type) {
      case CHART_TYPES.PIE:
        // For pie charts, use first categorical column and first numeric column
        const values = data.map(row => Number(row[numericColumns[0]]) || 0);
        datasets = [{
          data: values,
          backgroundColor: DEFAULT_COLORS.slice(0, values.length),
          borderColor: DEFAULT_COLORS.slice(0, values.length).map(color => color),
          borderWidth: 2
        }];
        break;

      case CHART_TYPES.BAR:
      case CHART_TYPES.LINE:
      case CHART_TYPES.AREA:
        // For other charts, create datasets for each numeric column
        datasets = numericColumns.slice(0, 8).map((column, index) => {
          const values = data.map(row => Number(row[column]) || 0);
          const color = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
          
          // Performance-aware point radius
          const pointRadius = optimization.performance.disableAnimations ? 0 : 
                             (type === CHART_TYPES.LINE ? 3 : 0);
          
          return {
            label: column,
            data: values,
            backgroundColor: type === CHART_TYPES.AREA ? color + '33' : color + '80',
            borderColor: color,
            borderWidth: 2,
            fill: type === CHART_TYPES.AREA,
            tension: type === CHART_TYPES.LINE || type === CHART_TYPES.AREA ? 0.4 : 0,
            pointBackgroundColor: color,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: pointRadius
          };
        });
        break;

      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }

    return {
      labels,
      datasets,
      rawData: data, // Use optimized data
      originalData: rawData, // Keep reference to original
      optimization: optimization,
      columnInfo: {
        numeric: numericColumns,
        categorical: categoricalColumns
      }
    };
  }, []);

  /**
   * Get Chart.js configuration for chart type with performance optimization
   */
  const getChartConfig = useCallback((chartData, type) => {
    const dataSize = chartData.optimization?.originalSize || chartData.rawData?.length || 0;
    const performanceOptions = getPerformanceChartOptions(dataSize, type);
    const baseConfig = {
      type: type === CHART_TYPES.AREA ? 'line' : type,
      data: chartData,
      options: {
        ...performanceOptions,
        responsive: responsive,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            },
            color: theme === 'dark' ? '#ffffff' : '#374151',
            padding: 20
          },
          legend: {
            display: type !== CHART_TYPES.PIE || chartData.datasets[0]?.data?.length <= 8,
            position: type === CHART_TYPES.PIE ? 'right' : 'top',
            labels: {
              color: theme === 'dark' ? '#ffffff' : '#374151',
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            titleColor: theme === 'dark' ? '#ffffff' : '#374151',
            bodyColor: theme === 'dark' ? '#ffffff' : '#374151',
            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                if (type === CHART_TYPES.PIE) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
                return `${context.dataset.label}: ${context.parsed}`;
              }
            }
          }
        },
        scales: type === CHART_TYPES.PIE ? {} : {
          x: {
            ticks: {
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              maxTicksLimit: 12
            },
            grid: {
              color: theme === 'dark' ? '#374151' : '#f3f4f6',
              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: theme === 'dark' ? '#9ca3af' : '#6b7280'
            },
            grid: {
              color: theme === 'dark' ? '#374151' : '#f3f4f6',
              borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
            }
          }
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    // Chart-specific configurations
    switch (type) {
      case CHART_TYPES.BAR:
        baseConfig.options.scales.y.ticks.callback = function(value) {
          return value.toLocaleString();
        };
        break;

      case CHART_TYPES.LINE:
        baseConfig.options.elements = {
          point: {
            hoverRadius: 8,
            hoverBorderWidth: 3
          }
        };
        break;

      case CHART_TYPES.PIE:
        baseConfig.options.plugins.tooltip.callbacks.title = function() {
          return '';
        };
        break;

      case CHART_TYPES.AREA:
        baseConfig.options.plugins.filler = {
          propagate: false
        };
        baseConfig.options.elements = {
          point: {
            hoverRadius: 6,
            hoverBorderWidth: 2
          }
        };
        break;
    }

    return baseConfig;
  }, [responsive, title, theme]);

  /**
   * Cleanup chart instance
   */
  const cleanup = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (error) {
        console.warn('Chart cleanup error:', error);
      } finally {
        chartInstanceRef.current = null;
      }
    }
  }, []);

  /**
   * Render the chart
   */
  const renderChart = useCallback(async () => {
    if (!canvasRef.current || !data || data.length === 0) return;
    
    // Prevent concurrent renders
    if (isRenderingRef.current) {
      console.log('Chart render already in progress, skipping...');
      return;
    }

    isRenderingRef.current = true;
    setIsLoading(true);
    setRenderError(null);

    try {
      // Force cleanup of any existing chart instance
      cleanup();

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify canvas is available
      if (!canvasRef.current) {
        throw new Error('Canvas element not available');
      }

      // Transform data for Chart.js
      const chartData = transformDataForChart(data, chartType);
      
      // Get chart configuration
      const config = getChartConfig(chartData, chartType);

      // Get fresh canvas context
      const ctx = canvasRef.current.getContext('2d');
      
      // Clear any existing canvas content
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Create new chart instance
      chartInstanceRef.current = new ChartJS(ctx, config);

      // Call completion callback
      if (onRenderComplete) {
        onRenderComplete({
          chartInstance: chartInstanceRef.current,
          chartData: chartData,
          config: config
        });
      }

    } catch (error) {
      console.error('Chart rendering error:', error);
      setRenderError(error.message);
      
      if (onError) {
        onError(error);
      }
    } finally {
      isRenderingRef.current = false;
      setIsLoading(false);
    }
  }, [data, chartType, title, theme, transformDataForChart, getChartConfig, onError, onRenderComplete, cleanup]);

  /**
   * Resize handler for responsive charts
   */
  const handleResize = useCallback(() => {
    if (chartInstanceRef.current && responsive) {
      chartInstanceRef.current.resize();
    }
  }, [responsive]);

  // Render chart when dependencies change
  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Handle window resize
  useEffect(() => {
    if (responsive) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [responsive, handleResize]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  /**
   * Export chart as image
   */
  const exportChart = useCallback((format = 'png', filename = 'chart') => {
    if (!chartInstanceRef.current) {
      throw new Error('No chart available for export');
    }

    const canvas = chartInstanceRef.current.canvas;
    const url = canvas.toDataURL(`image/${format}`, 1.0);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return url;
  }, []);

  /**
   * Get chart instance for external access
   */
  const getChartInstance = useCallback(() => {
    return chartInstanceRef.current;
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    exportChart,
    getChartInstance,
    renderChart,
    cleanup
  }));

  if (renderError) {
    return (
      <div className={`chart-renderer-error ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Chart Rendering Error</h3>
          <p className="text-sm text-red-700 text-center max-w-md">
            {renderError}
          </p>
          <button
            onClick={renderChart}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-renderer ${className}`}>
      <div 
        className="relative"
        style={{ 
          width: responsive ? '100%' : width,
          height: responsive ? '100%' : height,
          minHeight: responsive ? height : 'auto'
        }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">Rendering chart...</p>
            </div>
          </div>
        )}

        {/* Chart canvas */}
        <canvas
          key={`chart-${chartType}-${data?.length || 0}`}
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{
            display: isLoading ? 'none' : 'block'
          }}
        />
      </div>

      {/* Chart info */}
      {!isLoading && !renderError && data.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {data.length} data points • {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart
        </div>
      )}
    </div>
  );
});

export default ChartRenderer; 