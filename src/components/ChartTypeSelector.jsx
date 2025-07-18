import React, { useState, useMemo } from 'react';
import { CHART_TYPES } from '../utils/constants.js';

/**
 * Chart Type Selector Component
 * Shows chart type options with smart recommendations based on data analysis
 */
const ChartTypeSelector = ({
  suggestions = [],
  selectedChartType = null,
  onChartTypeSelect,
  disabled = false,
  showConfidence = true,
  className = ''
}) => {
  const [hoveredType, setHoveredType] = useState(null);

  // Chart type definitions with visual representations and descriptions
  const chartTypeDefinitions = {
    [CHART_TYPES.BAR]: {
      name: 'Bar Chart',
      description: 'Compare values across categories',
      icon: '📊',
      visualExample: (
        <div className="flex items-end justify-center space-x-1 h-8">
          <div className="w-2 bg-blue-400 h-6"></div>
          <div className="w-2 bg-blue-400 h-4"></div>
          <div className="w-2 bg-blue-400 h-8"></div>
          <div className="w-2 bg-blue-400 h-3"></div>
        </div>
      ),
      bestFor: 'Comparing categories, showing rankings, discrete data',
      requirements: 'Categorical data + numeric values'
    },
    [CHART_TYPES.LINE]: {
      name: 'Line Chart',
      description: 'Show trends and changes over time',
      icon: '📈',
      visualExample: (
        <div className="flex items-center justify-center h-8 relative">
          <svg viewBox="0 0 40 20" className="w-10 h-5">
            <polyline
              points="2,18 10,12 18,8 26,10 34,4 38,6"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      ),
      bestFor: 'Time series, trends, continuous data, forecasting',
      requirements: 'Sequential data (dates/time) + numeric values'
    },
    [CHART_TYPES.PIE]: {
      name: 'Pie Chart',
      description: 'Show proportions and percentages',
      icon: '🥧',
      visualExample: (
        <div className="flex items-center justify-center h-8">
          <div className="w-8 h-8 rounded-full relative overflow-hidden bg-gray-200">
            <div className="absolute inset-0 bg-blue-400" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }}></div>
            <div className="absolute inset-0 bg-green-400" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 75% 100%)' }}></div>
            <div className="absolute inset-0 bg-yellow-400" style={{ clipPath: 'polygon(50% 50%, 75% 100%, 50% 100%)' }}></div>
          </div>
        </div>
      ),
      bestFor: 'Parts of a whole, percentages, composition',
      requirements: 'Categories (2-8 ideal) + numeric values'
    },
    [CHART_TYPES.AREA]: {
      name: 'Area Chart',
      description: 'Show cumulative totals over time',
      icon: '📈',
      visualExample: (
        <div className="flex items-center justify-center h-8 relative">
          <svg viewBox="0 0 40 20" className="w-10 h-5">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <polygon
              points="2,18 2,12 10,8 18,6 26,9 34,4 38,6 38,18"
              fill="url(#areaGradient)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="1"
            />
          </svg>
        </div>
      ),
      bestFor: 'Cumulative values, stacked data, volume over time',
      requirements: 'Time series + multiple numeric values'
    }
  };

  // Create recommendation map for quick lookup
  const recommendationMap = useMemo(() => {
    const map = {};
    suggestions.forEach(suggestion => {
      if (suggestion.chartType) {
        map[suggestion.chartType] = suggestion;
      }
    });
    return map;
  }, [suggestions]);

  // Get all chart types with their recommendation status
  const chartOptions = useMemo(() => {
    return Object.values(CHART_TYPES).map(chartType => {
      const definition = chartTypeDefinitions[chartType];
      const recommendation = recommendationMap[chartType];
      
      return {
        type: chartType,
        ...definition,
        isRecommended: !!recommendation,
        confidence: recommendation?.confidence || 0,
        reason: recommendation?.reason || null,
        disabled: disabled || (!recommendation && suggestions.length > 0)
      };
    });
  }, [chartTypeDefinitions, recommendationMap, disabled, suggestions]);

  // Sort chart options by confidence (recommended first)
  const sortedChartOptions = useMemo(() => {
    return [...chartOptions].sort((a, b) => {
      // If both are recommended, sort by confidence
      if (a.isRecommended && b.isRecommended) {
        return b.confidence - a.confidence;
      }
      // Recommended ones first
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      // If neither recommended, keep original order
      return 0;
    });
  }, [chartOptions]);

  /**
   * Handle chart type selection
   */
  const handleChartSelect = (chartType, chartOption) => {
    if (chartOption.disabled || !onChartTypeSelect) return;
    
    onChartTypeSelect(chartType, {
      confidence: chartOption.confidence,
      reason: chartOption.reason,
      recommendation: recommendationMap[chartType]
    });
  };

  /**
   * Get styling classes for chart option based on state
   */
  const getChartOptionClasses = (chartOption) => {
    const baseClasses = `
      relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
      flex flex-col items-center text-center min-h-32
    `;

    if (chartOption.disabled) {
      return baseClasses + ` 
        border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60
      `;
    }

    if (selectedChartType === chartOption.type) {
      return baseClasses + ` 
        border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-md
      `;
    }

    if (hoveredType === chartOption.type) {
      return baseClasses + ` 
        border-blue-300 bg-blue-25 shadow-lg transform scale-105
      `;
    }

    if (chartOption.isRecommended) {
      return baseClasses + ` 
        border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100
        shadow-sm
      `;
    }

    return baseClasses + ` 
      border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50
    `;
  };

  /**
   * Get confidence badge color
   */
  const getConfidenceBadgeColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  /**
   * Render chart option card
   */
  const renderChartOption = (chartOption) => {
    const isSelected = selectedChartType === chartOption.type;
    const isHovered = hoveredType === chartOption.type;

    return (
      <div
        key={chartOption.type}
        className={getChartOptionClasses(chartOption)}
        onClick={() => handleChartSelect(chartOption.type, chartOption)}
        onMouseEnter={() => !chartOption.disabled && setHoveredType(chartOption.type)}
        onMouseLeave={() => setHoveredType(null)}
        role="button"
        tabIndex={chartOption.disabled ? -1 : 0}
        aria-label={`Select ${chartOption.name} - ${chartOption.description}`}
        aria-pressed={isSelected}
        aria-disabled={chartOption.disabled}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !chartOption.disabled) {
            e.preventDefault();
            handleChartSelect(chartOption.type, chartOption);
          }
        }}
      >
        {/* Recommendation badge */}
        {chartOption.isRecommended && showConfidence && (
          <div className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-medium rounded-full border ${getConfidenceBadgeColor(chartOption.confidence)}`}>
            {chartOption.confidence}%
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Chart icon and visual */}
        <div className="mb-2">
          <div className="text-2xl mb-1">{chartOption.icon}</div>
          <div className="mb-2">
            {chartOption.visualExample}
          </div>
        </div>

        {/* Chart name */}
        <h3 className={`text-sm font-medium mb-1 ${chartOption.disabled ? 'text-gray-400' : ''}`}>
          {chartOption.name}
        </h3>

        {/* Chart description */}
        <p className={`text-xs mb-2 ${chartOption.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {chartOption.description}
        </p>

        {/* Recommendation reason */}
        {chartOption.isRecommended && chartOption.reason && (
          <div className="mt-auto">
            <p className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
              {chartOption.reason}
            </p>
          </div>
        )}

        {/* Disabled reason */}
        {chartOption.disabled && suggestions.length > 0 && (
          <div className="mt-auto">
            <p className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
              Not suitable for your data
            </p>
          </div>
        )}

        {/* Requirements hint on hover */}
        {(isHovered || isSelected) && !chartOption.disabled && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {chartOption.requirements}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`chart-type-selector ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Chart Type</h3>
        {suggestions.length > 0 ? (
          <p className="text-sm text-gray-600">
            Based on your data, we recommend these chart types:
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Upload data to see chart recommendations
          </p>
        )}
      </div>

      {/* Chart type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {sortedChartOptions.map(renderChartOption)}
      </div>

      {/* Help text */}
      {!disabled && suggestions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Chart Recommendations</h4>
              <div className="mt-1 text-sm text-blue-700">
                <p>Percentages show how well each chart type suits your data structure. Higher percentages mean better fit.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No data state */}
      {disabled && (
        <div className="mt-4 p-6 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">No data uploaded yet</p>
          <p className="text-xs text-gray-400">Upload a file to see chart recommendations</p>
        </div>
      )}
    </div>
  );
};

export default ChartTypeSelector; 