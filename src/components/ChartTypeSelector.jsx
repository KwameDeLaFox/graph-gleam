import React, { useState, useEffect } from 'react';
import { getChartSuggestions } from '../utils/chart-config';

const ChartTypeSelector = ({ selectedType, onTypeChange, data }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      setLoading(true);
      try {
        const chartSuggestions = getChartSuggestions(data);
        setSuggestions(chartSuggestions);
        
        // Auto-select the best chart type if none is selected
        if (!selectedType && chartSuggestions.length > 0) {
          onTypeChange(chartSuggestions[0].type);
        }
      } catch (error) {
        console.error('Error getting chart suggestions:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [data, selectedType, onTypeChange]);

  const chartTypes = [
    {
      type: 'bar',
      name: 'Bar Chart',
      description: 'Compare values across categories',
      icon: '📊',
      suitableFor: ['categorical', 'numerical', 'comparison']
    },
    {
      type: 'line',
      name: 'Line Chart',
      description: 'Show trends over time or continuous data',
      icon: '📈',
      suitableFor: ['time-series', 'trends', 'continuous']
    },
    {
      type: 'pie',
      name: 'Pie Chart',
      description: 'Show parts of a whole',
      icon: '🥧',
      suitableFor: ['proportions', 'percentages', 'composition']
    },
    {
      type: 'doughnut',
      name: 'Doughnut Chart',
      description: 'Show parts of a whole with center space',
      icon: '🍩',
      suitableFor: ['proportions', 'percentages', 'composition']
    },
    {
      type: 'area',
      name: 'Area Chart',
      description: 'Show volume and trends over time',
      icon: '📊',
      suitableFor: ['time-series', 'volume', 'trends']
    },
    {
      type: 'scatter',
      name: 'Scatter Plot',
      description: 'Show correlation between two variables',
      icon: '🔍',
      suitableFor: ['correlation', 'distribution', 'outliers']
    }
  ];

  const getSuggestionForType = (type) => {
    return suggestions.find(s => s.type === type);
  };

  const handleChartTypeSelect = (chartType) => {
    onTypeChange(chartType);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-muted-foreground">Analyzing data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartTypes.map((chartType) => {
          const suggestion = getSuggestionForType(chartType.type);
          const isSelected = selectedType === chartType.type;
          const confidence = suggestion?.confidence || 0;
          
          return (
            <button
              key={chartType.type}
              onClick={() => handleChartTypeSelect(chartType.type)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              {/* Confidence indicator */}
              {suggestion && (
                <div className="absolute top-2 right-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    confidence >= 80
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : confidence >= 60
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {confidence}%
                  </div>
                </div>
              )}

              {/* Chart icon */}
              <div className="text-3xl mb-3">{chartType.icon}</div>

              {/* Chart name */}
              <h3 className="font-semibold text-foreground mb-1">
                {chartType.name}
              </h3>

              {/* Chart description */}
              <p className="text-sm text-muted-foreground mb-3">
                {chartType.description}
              </p>

              {/* AI recommendation */}
              {suggestion && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">AI Recommendation:</span> {suggestion.reason}
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected chart info */}
      {selectedType && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">
                Selected: {chartTypes.find(c => c.type === selectedType)?.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {chartTypes.find(c => c.type === selectedType)?.description}
              </p>
              {getSuggestionForType(selectedType) && (
                <p className="text-xs text-muted-foreground mt-1">
                  AI confidence: {getSuggestionForType(selectedType).confidence}% - {getSuggestionForType(selectedType).reason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data insights */}
      {data && data.length > 0 && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <h4 className="font-medium text-foreground mb-3">Data Insights</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Rows</div>
              <div className="font-medium text-foreground">{data.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Columns</div>
              <div className="font-medium text-foreground">{Object.keys(data[0] || {}).length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Numeric</div>
              <div className="font-medium text-foreground">
                {Object.keys(data[0] || {}).filter(key => 
                  typeof data[0][key] === 'number' || !isNaN(data[0][key])
                ).length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Text</div>
              <div className="font-medium text-foreground">
                {Object.keys(data[0] || {}).filter(key => 
                  typeof data[0][key] === 'string' && isNaN(data[0][key])
                ).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartTypeSelector; 