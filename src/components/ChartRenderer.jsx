import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea, Scatter } from 'react-chartjs-2';
import { optimizeForPerformance } from '../utils/performance-optimizer';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

const ChartRenderer = ({ data, chartType, isLoading }) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data || !chartType) return;

    try {
      const { chartData, options } = prepareChartData(data, chartType);
      setChartData(chartData);
      setChartOptions(options);
      setError(null);
    } catch (err) {
      console.error('Chart preparation error:', err);
      setError(err.message);
    }
  }, [data, chartType]);

  const prepareChartData = (rawData, type) => {
    if (!rawData || rawData.length === 0) {
      throw new Error('No data provided for chart');
    }

    // Optimize data for performance
    const optimizationResult = optimizeForPerformance(rawData);
    const optimizedData = optimizationResult.data;
    
    // Get column names
    const columns = Object.keys(optimizedData[0] || {});
    if (columns.length === 0) {
      throw new Error('No columns found in data');
    }

    // Find numeric and categorical columns
    const numericColumns = columns.filter(col => 
      typeof optimizedData[0][col] === 'number' || !isNaN(optimizedData[0][col])
    );
    const categoricalColumns = columns.filter(col => 
      typeof optimizedData[0][col] === 'string' && isNaN(optimizedData[0][col])
    );

    // Get chart colors from CSS custom properties (design system integration)
    const getChartColors = () => {
      const colorVars = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
      const colors = [];
      
      colorVars.forEach((colorVar, index) => {
        try {
          // Get the HSL values from CSS custom property
          const hslValues = getComputedStyle(document.documentElement)
            .getPropertyValue(colorVar)
            .trim();
          
          if (hslValues) {
            // CSS stores HSL as "151.3274 66.8639% 66.8627%" - convert to "hsl(151.3274, 66.8639%, 66.8627%)"
            const hslColor = `hsl(${hslValues.replace(/\s+/g, ', ')})`;
            colors.push(hslColor);
          } else {
            // Fallback colors if CSS custom properties fail
            const fallbacks = [
              'hsl(151, 67%, 67%)', // Green
              'hsl(217, 91%, 60%)', // Blue
              'hsl(258, 89%, 66%)', // Purple  
              'hsl(38, 92%, 50%)',  // Orange
              'hsl(160, 84%, 39%)'  // Emerald
            ];
            colors.push(fallbacks[index] || `hsl(${index * 60}, 70%, 55%)`);
          }
        } catch (error) {
          console.warn(`Failed to get color for ${colorVar}:`, error);
          // Ultimate fallback
          const fallbacks = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#10b981'];
          colors.push(fallbacks[index] || '#6b7280');
        }
      });
      
      return colors;
    };

    const colors = getChartColors();
    console.log('Chart colors from design system:', colors);
    
    // Helper function to add transparency to colors
    const addTransparency = (color, opacity = 0.2) => {
      if (color.startsWith('hsl(')) {
        return color.replace('hsl(', `hsla(`).replace(')', `, ${opacity})`);
      } else if (color.startsWith('#')) {
        // Convert hex to rgba with opacity
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return color;
    };

    let chartData = {};
    let options = {};

    switch (type) {
      case 'bar':
        chartData = prepareBarChartData(optimizedData, numericColumns, categoricalColumns, colors);
        options = getBarChartOptions();
        break;
      case 'line':
        chartData = prepareLineChartData(optimizedData, numericColumns, categoricalColumns, colors);
        options = getLineChartOptions();
        break;
      case 'pie':
        chartData = preparePieChartData(optimizedData, numericColumns, categoricalColumns, colors);
        options = getPieChartOptions();
        break;
      case 'doughnut':
        chartData = preparePieChartData(optimizedData, numericColumns, categoricalColumns, colors);
        options = getDoughnutChartOptions();
        break;
      case 'area':
        chartData = prepareAreaChartData(optimizedData, numericColumns, categoricalColumns, colors);
        options = getAreaChartOptions();
        break;
      case 'scatter':
        chartData = prepareScatterChartData(optimizedData, numericColumns, colors);
        options = getScatterChartOptions();
        break;
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }

    return { chartData, options };
  };

  const prepareBarChartData = (data, numericCols, categoricalCols, colors) => {
    const labels = data.map(row => row[categoricalCols[0]] || 'Unknown');
    const datasets = numericCols.map((col, index) => ({
      label: col,
      data: data.map(row => parseFloat(row[col]) || 0),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    return { labels, datasets };
  };

  const prepareLineChartData = (data, numericCols, categoricalCols, colors) => {
    const labels = data.map(row => row[categoricalCols[0]] || 'Unknown');
    const datasets = numericCols.map((col, index) => ({
      label: col,
      data: data.map(row => parseFloat(row[col]) || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: addTransparency(colors[index % colors.length], 0.1),
      borderWidth: 2,
      fill: false,
      tension: 0.4,
    }));

    return { labels, datasets };
  };

  const preparePieChartData = (data, numericCols, categoricalCols, colors) => {
    const labels = data.map(row => row[categoricalCols[0]] || 'Unknown');
    const values = data.map(row => parseFloat(row[numericCols[0]]) || 0);

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: 'var(--border)',
        borderWidth: 1,
      }]
    };
  };

  const prepareAreaChartData = (data, numericCols, categoricalCols, colors) => {
    const labels = data.map(row => row[categoricalCols[0]] || 'Unknown');
    const datasets = numericCols.map((col, index) => ({
      label: col,
      data: data.map(row => parseFloat(row[col]) || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: addTransparency(colors[index % colors.length], 0.3),
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }));

    return { labels, datasets };
  };

  const prepareScatterChartData = (data, numericCols, colors) => {
    if (numericCols.length < 2) {
      throw new Error('Scatter plot requires at least 2 numeric columns');
    }

    const xCol = numericCols[0];
    const yCol = numericCols[1];

    return {
      datasets: [{
        label: `${yCol} vs ${xCol}`,
        data: data.map(row => ({
          x: parseFloat(row[xCol]) || 0,
          y: parseFloat(row[yCol]) || 0,
        })),
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderWidth: 1,
        pointRadius: 4,
      }]
    };
  };

  const getBaseChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--foreground)',
          font: {
            family: 'var(--font-sans)',
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'var(--popover)',
        titleColor: 'var(--popover-foreground)',
        bodyColor: 'var(--popover-foreground)',
        borderColor: 'var(--border)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: 'var(--font-sans)',
          weight: '600',
        },
        bodyFont: {
          family: 'var(--font-sans)',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'var(--border)',
        },
        ticks: {
          color: 'var(--muted-foreground)',
          font: {
            family: 'var(--font-sans)',
          },
        },
      },
      y: {
        grid: {
          color: 'var(--border)',
        },
        ticks: {
          color: 'var(--muted-foreground)',
          font: {
            family: 'var(--font-sans)',
          },
        },
      },
    },
  });

  const getBarChartOptions = () => ({
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      title: {
        display: true,
        text: 'Bar Chart',
        color: 'var(--foreground)',
        font: {
          family: 'var(--font-sans)',
          size: 16,
          weight: '600',
        },
      },
    },
  });

  const getLineChartOptions = () => ({
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      title: {
        display: true,
        text: 'Line Chart',
        color: 'var(--foreground)',
        font: {
          family: 'var(--font-sans)',
          size: 16,
          weight: '600',
        },
      },
    },
  });

  const getPieChartOptions = () => ({
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      title: {
        display: true,
        text: 'Pie Chart',
        color: 'var(--foreground)',
        font: {
          family: 'var(--font-sans)',
          size: 16,
          weight: '600',
        },
      },
    },
  });

  const getDoughnutChartOptions = () => ({
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      title: {
        display: true,
        text: 'Doughnut Chart',
        color: 'var(--foreground)',
        font: {
          family: 'var(--font-sans)',
          size: 16,
          weight: '600',
        },
      },
    },
    cutout: '60%',
  });

  const getAreaChartOptions = () => ({
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      title: {
        display: true,
        text: 'Area Chart',
        color: 'var(--foreground)',
        font: {
          family: 'var(--font-sans)',
          size: 16,
          weight: '600',
        },
      },
    },
  });

  const getScatterChartOptions = () => ({
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      title: {
        display: true,
        text: 'Scatter Plot',
        color: 'var(--foreground)',
        font: {
          family: 'var(--font-sans)',
          size: 16,
          weight: '600',
        },
      },
    },
  });

  const renderChart = () => {
    if (!chartData || !chartOptions) return null;

    const chartProps = {
      ref: chartRef,
      data: chartData,
      options: chartOptions,
    };

    // Wrap chart in isolated container to prevent CSS interference
    const chartElement = (() => {
      switch (chartType) {
        case 'bar':
          return <Bar {...chartProps} />;
        case 'line':
          return <Line {...chartProps} />;
        case 'pie':
          return <Pie {...chartProps} />;
        case 'doughnut':
          return <Doughnut {...chartProps} />;
        case 'area':
          return <Line {...chartProps} />;
        case 'scatter':
          return <Scatter {...chartProps} />;
        default:
          return <div className="text-center text-muted-foreground">Unsupported chart type</div>;
      }
    })();

    return (
      <div className="chart-container" style={{
        // Isolate from global CSS
        all: 'initial',
        fontFamily: 'var(--font-sans, "Outfit", sans-serif)',
        fontSize: '14px',
        // Restore Chart.js defaults
        display: 'block',
        position: 'relative',
        height: '400px',
        width: '100%',
        // Ensure canvas renders properly
        overflow: 'hidden'
      }}>
        <style>
          {`
            .chart-container canvas {
              display: block !important;
              height: 100% !important;
              width: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
            }
          `}
        </style>
        {chartElement}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg border border-border">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="text-center">
          <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-destructive-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-medium text-destructive mb-2">Chart Error</h3>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="h-96 w-full">
          {renderChart()}
        </div>
      </div>
      
      {/* Chart metadata */}
      {chartData && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span>📊 {data.length} data points</span>
              <span>📈 {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart</span>
              {data.length > 1000 && (
                <span className="text-primary font-medium">⚡ Optimized for performance</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (chartRef.current) {
                    const canvas = chartRef.current.canvas;
                    const link = document.createElement('a');
                    link.download = `chart-${chartType}-${Date.now()}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartRenderer; 