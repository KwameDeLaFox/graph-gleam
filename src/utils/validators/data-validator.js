// Data Validator Utility
import { ERROR_TYPES, CHART_TYPES, PERFORMANCE_THRESHOLDS } from '../constants.js';
import { validateLargeDataset } from '../performance-optimizer.js';

/**
 * Validate parsed data for chart compatibility and suggest chart types
 * @param {Array} data - Parsed data array (from CSV or Excel parser)
 * @param {Object} meta - Metadata from parser (filename, columns, etc.)
 * @returns {Object} Validation result with suggestions and errors
 */
export const validateDataForCharting = (data, meta = {}) => {
  try {
    // Basic data validation
    const basicValidation = validateBasicDataStructure(data, meta);
    if (!basicValidation.isValid) {
      return {
        isValid: false,
        errors: basicValidation.errors,
        suggestions: [],
        columnAnalysis: {},
        chartCompatibility: {},
        performance: { isLargeDataset: false, requiresOptimization: false }
      };
    }

    // Performance analysis for large datasets
    const performanceInfo = validateLargeDataset(data, { sampleSize: 1000 });
    const analysisData = performanceInfo.requiresOptimization ? performanceInfo.sampleData : data;

    // Analyze column types and characteristics (using sampled data for large datasets)
    const columnAnalysis = analyzeColumns(analysisData, meta.columns || []);
    
    // Validate chart compatibility
    const chartCompatibility = validateChartCompatibility(columnAnalysis, analysisData);
    
    // Generate chart suggestions
    const suggestions = generateChartSuggestions(columnAnalysis, chartCompatibility, analysisData);
    
    // Check for warnings (non-blocking issues)
    const warnings = generateWarnings(columnAnalysis, analysisData);
    
    // Add performance warnings for large datasets
    if (performanceInfo.isLargeDataset) {
      warnings.push({
        type: 'performance',
        severity: performanceInfo.requiresOptimization ? 'high' : 'medium',
        message: performanceInfo.requiresOptimization 
          ? `Large dataset (${data.length} rows) - using optimized rendering for performance`
          : `Medium dataset (${data.length} rows) - performance optimizations enabled`,
        suggestion: 'Charts will automatically optimize for performance'
      });
    }

    return {
      isValid: chartCompatibility.hasNumericData,
      errors: chartCompatibility.hasNumericData ? [] : [createNoNumericDataError(meta.filename)],
      warnings: warnings,
      suggestions: suggestions,
      columnAnalysis: columnAnalysis,
      chartCompatibility: chartCompatibility,
      performance: performanceInfo
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [{
        type: ERROR_TYPES.PARSE_ERROR,
        message: `Data validation failed: ${error.message}`,
        filename: meta.filename,
        action: 'check-data-format'
      }],
      suggestions: [],
      columnAnalysis: {},
      chartCompatibility: {}
    };
  }
};

/**
 * Validate basic data structure requirements
 * @param {Array} data - Data array to validate
 * @param {Object} meta - Metadata object
 * @returns {Object} Basic validation result
 */
const validateBasicDataStructure = (data, meta) => {
  const errors = [];

  // Check if data exists
  if (!data || !Array.isArray(data)) {
    errors.push({
      type: ERROR_TYPES.EMPTY_FILE,
      message: 'No data provided for validation',
      filename: meta.filename,
      action: 'check-file-content'
    });
  }

  // Check if data is empty
  if (data && data.length === 0) {
    errors.push({
      type: ERROR_TYPES.EMPTY_FILE,
      message: `No data rows found in "${meta.filename || 'file'}"`,
      filename: meta.filename,
      action: 'check-file-content'
    });
  }

  // Check if data has columns
  if (data && data.length > 0) {
    const firstRow = data[0];
    if (!firstRow || typeof firstRow !== 'object' || Object.keys(firstRow).length === 0) {
      errors.push({
        type: ERROR_TYPES.PARSE_ERROR,
        message: 'Data structure is invalid - no columns detected',
        filename: meta.filename,
        action: 'check-file-format'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Analyze column types and characteristics
 * @param {Array} data - Data array
 * @param {Array} columnNames - Column names
 * @returns {Object} Column analysis results
 */
const analyzeColumns = (data, columnNames = []) => {
  const analysis = {};
  
  // Get column names from data if not provided
  const columns = columnNames.length > 0 ? columnNames : Object.keys(data[0] || {});
  
  columns.forEach(columnName => {
    analysis[columnName] = analyzeColumn(data, columnName);
  });

  return analysis;
};

/**
 * Analyze a single column for type and characteristics
 * @param {Array} data - Data array
 * @param {string} columnName - Name of column to analyze
 * @returns {Object} Column analysis
 */
const analyzeColumn = (data, columnName) => {
  const values = data.map(row => row[columnName]).filter(val => val !== null && val !== undefined && val !== '');
  const totalValues = data.length;
  const nonEmptyValues = values.length;
  const emptyCount = totalValues - nonEmptyValues;

  // Type analysis
  const typeAnalysis = analyzeColumnTypes(values);
  
  // Statistical analysis for numeric columns
  const stats = typeAnalysis.primaryType === 'number' ? calculateStats(values) : null;
  
  // Pattern analysis
  const patterns = analyzePatterns(values, columnName);

  return {
    name: columnName,
    totalValues: totalValues,
    nonEmptyValues: nonEmptyValues,
    emptyCount: emptyCount,
    emptyPercentage: (emptyCount / totalValues) * 100,
    typeAnalysis: typeAnalysis,
    stats: stats,
    patterns: patterns,
    isChartable: typeAnalysis.primaryType === 'number' || typeAnalysis.primaryType === 'date',
    isCategorical: typeAnalysis.primaryType === 'string' && values.length > 0,
    uniqueValues: [...new Set(values)].length,
    uniquePercentage: (([...new Set(values)].length) / nonEmptyValues) * 100
  };
};

/**
 * Analyze types within a column
 * @param {Array} values - Non-empty values from column
 * @returns {Object} Type analysis
 */
const analyzeColumnTypes = (values) => {
  const typeCounts = {
    number: 0,
    string: 0,
    date: 0,
    boolean: 0,
    object: 0
  };

  values.forEach(value => {
    if (typeof value === 'number' && !isNaN(value)) {
      typeCounts.number++;
    } else if (value instanceof Date) {
      typeCounts.date++;
    } else if (typeof value === 'boolean') {
      typeCounts.boolean++;
    } else if (typeof value === 'string') {
      // Check if string represents a number
      const numValue = Number(value);
      if (!isNaN(numValue) && value.trim() !== '') {
        typeCounts.number++;
      } else {
        typeCounts.string++;
      }
    } else {
      typeCounts.object++;
    }
  });

  // Determine primary type
  const total = values.length;
  const primaryType = Object.entries(typeCounts).reduce((a, b) => 
    typeCounts[a[0]] > typeCounts[b[0]] ? a : b
  )[0];

  // Calculate type percentages
  const typePercentages = {};
  Object.entries(typeCounts).forEach(([type, count]) => {
    typePercentages[type] = (count / total) * 100;
  });

  return {
    typeCounts: typeCounts,
    typePercentages: typePercentages,
    primaryType: primaryType,
    isHomogeneous: typePercentages[primaryType] > 90, // 90%+ same type
    isMixed: Object.values(typeCounts).filter(count => count > 0).length > 1
  };
};

/**
 * Calculate statistical measures for numeric columns
 * @param {Array} values - Numeric values
 * @returns {Object} Statistical analysis
 */
const calculateStats = (values) => {
  const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val));
  
  if (numericValues.length === 0) return null;

  const sorted = [...numericValues].sort((a, b) => a - b);
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / numericValues.length;
  
  return {
    count: numericValues.length,
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
    sum: sum,
    mean: mean,
    median: sorted[Math.floor(sorted.length / 2)],
    range: Math.max(...numericValues) - Math.min(...numericValues),
    hasNegatives: numericValues.some(val => val < 0),
    hasDecimals: numericValues.some(val => val % 1 !== 0),
    isAllPositive: numericValues.every(val => val >= 0),
    isAllIntegers: numericValues.every(val => val % 1 === 0)
  };
};

/**
 * Analyze patterns in column data
 * @param {Array} values - Column values
 * @param {string} columnName - Column name for context
 * @returns {Object} Pattern analysis
 */
const analyzePatterns = (values, columnName) => {
  const patterns = {
    isTimeSeriesCandidate: false,
    isCategoryCandidate: false,
    isPercentageCandidate: false,
    isIdCandidate: false
  };

  const lowerColumnName = columnName.toLowerCase();
  
  // Time series patterns
  if (lowerColumnName.includes('date') || lowerColumnName.includes('time') || 
      lowerColumnName.includes('month') || lowerColumnName.includes('year') ||
      lowerColumnName.includes('day')) {
    patterns.isTimeSeriesCandidate = true;
  }

  // Category patterns
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length > 1 && uniqueValues.length <= Math.min(20, values.length * 0.5)) {
    patterns.isCategoryCandidate = true;
  }

  // Percentage patterns
  if (lowerColumnName.includes('percent') || lowerColumnName.includes('%')) {
    patterns.isPercentageCandidate = true;
  }

  // ID patterns
  if (lowerColumnName.includes('id') || lowerColumnName.includes('key') ||
      uniqueValues.length === values.length) {
    patterns.isIdCandidate = true;
  }

  return patterns;
};

/**
 * Validate chart compatibility based on column analysis
 * @param {Object} columnAnalysis - Analysis of all columns
 * @param {Array} data - Original data
 * @returns {Object} Chart compatibility assessment
 */
const validateChartCompatibility = (columnAnalysis, data) => {
  const columns = Object.values(columnAnalysis);
  const numericColumns = columns.filter(col => col.isChartable && col.typeAnalysis.primaryType === 'number');
  const categoricalColumns = columns.filter(col => col.isCategorical);
  const dateColumns = columns.filter(col => col.typeAnalysis.primaryType === 'date');

  return {
    hasNumericData: numericColumns.length > 0,
    hasCategories: categoricalColumns.length > 0,
    hasDates: dateColumns.length > 0,
    numericColumnCount: numericColumns.length,
    categoricalColumnCount: categoricalColumns.length,
    dateColumnCount: dateColumns.length,
    isTimeSeriesCandidate: dateColumns.length > 0 && numericColumns.length > 0,
    isPieChartCandidate: categoricalColumns.length > 0 && numericColumns.length > 0,
    isBarChartCandidate: (categoricalColumns.length > 0 || dateColumns.length > 0) && numericColumns.length > 0,
    isLineChartCandidate: data.length >= 3 && numericColumns.length > 0,
    totalColumns: columns.length,
    usableColumns: columns.filter(col => col.isChartable || col.isCategorical).length
  };
};

/**
 * Generate chart type suggestions based on data analysis
 * @param {Object} columnAnalysis - Column analysis results
 * @param {Object} chartCompatibility - Chart compatibility assessment
 * @param {Array} data - Original data
 * @returns {Array} Array of chart suggestions
 */
const generateChartSuggestions = (columnAnalysis, chartCompatibility, data) => {
  const suggestions = [];

  if (!chartCompatibility.hasNumericData) {
    return [{
      chartType: null,
      confidence: 0,
      reason: 'No numeric data found for charting',
      requirements: 'Charts require at least one column with numeric values'
    }];
  }

  // Bar chart suggestions
  if (chartCompatibility.isBarChartCandidate) {
    const confidence = chartCompatibility.hasCategories ? 90 : 70;
    suggestions.push({
      chartType: CHART_TYPES.BAR,
      confidence: confidence,
      reason: chartCompatibility.hasCategories ? 
        'Categorical data with numeric values - ideal for comparison' :
        'Numeric data suitable for bar chart visualization',
      suitableColumns: getRecommendedColumns(columnAnalysis, 'bar')
    });
  }

  // Line chart suggestions
  if (chartCompatibility.isLineChartCandidate) {
    const confidence = chartCompatibility.isTimeSeriesCandidate ? 95 : 75;
    suggestions.push({
      chartType: CHART_TYPES.LINE,
      confidence: confidence,
      reason: chartCompatibility.isTimeSeriesCandidate ?
        'Time series data - perfect for showing trends over time' :
        'Sequential numeric data suitable for trend visualization',
      suitableColumns: getRecommendedColumns(columnAnalysis, 'line')
    });
  }

  // Pie chart suggestions
  if (chartCompatibility.isPieChartCandidate) {
    const categoricalCols = Object.values(columnAnalysis).filter(col => col.isCategorical);
    const hasGoodCategories = categoricalCols.some(col => col.uniqueValues >= 2 && col.uniqueValues <= 8);
    
    if (hasGoodCategories) {
      suggestions.push({
        chartType: CHART_TYPES.PIE,
        confidence: 85,
        reason: 'Categorical data with numeric values - good for showing proportions',
        suitableColumns: getRecommendedColumns(columnAnalysis, 'pie')
      });
    }
  }

  // Area chart suggestions  
  if (chartCompatibility.isTimeSeriesCandidate && data.length >= 5) {
    suggestions.push({
      chartType: CHART_TYPES.AREA,
      confidence: 80,
      reason: 'Time series data with multiple points - suitable for cumulative visualization',
      suitableColumns: getRecommendedColumns(columnAnalysis, 'area')
    });
  }

  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Get recommended columns for specific chart type
 * @param {Object} columnAnalysis - Column analysis results
 * @param {string} chartType - Chart type to get recommendations for
 * @returns {Object} Recommended columns for chart type
 */
const getRecommendedColumns = (columnAnalysis, chartType) => {
  const numericCols = Object.values(columnAnalysis).filter(col => 
    col.isChartable && col.typeAnalysis.primaryType === 'number'
  );
  const categoricalCols = Object.values(columnAnalysis).filter(col => col.isCategorical);
  const dateCols = Object.values(columnAnalysis).filter(col => 
    col.typeAnalysis.primaryType === 'date'
  );

  const recommendations = {
    xAxis: [],
    yAxis: [],
    categories: []
  };

  switch (chartType) {
    case 'bar':
      recommendations.xAxis = [...categoricalCols, ...dateCols].map(col => col.name);
      recommendations.yAxis = numericCols.map(col => col.name);
      break;
    
    case 'line':
    case 'area':
      recommendations.xAxis = dateCols.length > 0 ? dateCols.map(col => col.name) : 
                             categoricalCols.map(col => col.name);
      recommendations.yAxis = numericCols.map(col => col.name);
      break;
    
    case 'pie':
      recommendations.categories = categoricalCols.filter(col => 
        col.uniqueValues >= 2 && col.uniqueValues <= 8
      ).map(col => col.name);
      recommendations.values = numericCols.map(col => col.name);
      break;
  }

  return recommendations;
};

/**
 * Generate warnings for data quality issues
 * @param {Object} columnAnalysis - Column analysis results
 * @param {Array} data - Original data
 * @returns {Array} Array of warning messages
 */
const generateWarnings = (columnAnalysis, data) => {
  const warnings = [];

  // Check for high percentage of missing values
  Object.values(columnAnalysis).forEach(col => {
    if (col.emptyPercentage > 25) {
      warnings.push({
        type: 'missing-data',
        message: `Column "${col.name}" has ${col.emptyPercentage.toFixed(1)}% missing values`,
        severity: col.emptyPercentage > 50 ? 'high' : 'medium'
      });
    }
  });

  // Check for mixed data types
  Object.values(columnAnalysis).forEach(col => {
    if (col.typeAnalysis.isMixed && !col.typeAnalysis.isHomogeneous) {
      warnings.push({
        type: 'mixed-types',
        message: `Column "${col.name}" contains mixed data types`,
        severity: 'medium'
      });
    }
  });

  // Check for small dataset
  if (data.length < 3) {
    warnings.push({
      type: 'small-dataset',
      message: 'Dataset is very small - charts may not be meaningful',
      severity: 'low'
    });
  }

  return warnings;
};

/**
 * Create standardized error for no numeric data
 * @param {string} filename - Filename for context
 * @returns {Object} Standardized error object
 */
const createNoNumericDataError = (filename) => {
  return {
    type: ERROR_TYPES.NO_NUMERIC_DATA,
    message: `No numeric data found in "${filename || 'file'}". Charts need at least one column with numbers.`,
    filename: filename,
    action: 'show-example',
    example: {
      description: 'Here\'s an example of data format that works:',
      headers: ['Month', 'Sales', 'Expenses'],
      rows: [
        ['January', 1200, 800],
        ['February', 1500, 900],
        ['March', 1800, 950]
      ]
    }
  };
};

/**
 * Quick validation to check if data has any numeric columns
 * @param {Array} data - Data array to check
 * @returns {boolean} True if numeric data exists
 */
export const hasNumericData = (data) => {
  if (!data || data.length === 0) return false;

  const firstRow = data[0];
  if (!firstRow) return false;

  return Object.values(firstRow).some(value => {
    if (typeof value === 'number' && !isNaN(value)) return true;
    if (typeof value === 'string') {
      const numValue = Number(value);
      return !isNaN(numValue) && value.trim() !== '';
    }
    return false;
  });
};

/**
 * Get chart type recommendations for data
 * @param {Array} data - Parsed data
 * @param {Object} meta - Metadata from parser
 * @returns {Array} Array of recommended chart types
 */
export const getChartRecommendations = (data, meta = {}) => {
  const validation = validateDataForCharting(data, meta);
  return validation.suggestions || [];
}; 