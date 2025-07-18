// Centralized Error Handler for Graph Gleam
import { ERROR_TYPES } from './constants.js';

/**
 * Centralized error handling and formatting system
 * Provides consistent error messages, recovery suggestions, and logging
 */
export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * Add an error to the handler
   * @param {Object|string} error - Error object or message
   * @param {Object} context - Additional context for the error
   * @returns {Object} Formatted error object
   */
  addError(error, context = {}) {
    const formattedError = this.formatError(error, context);
    this.errors.push(formattedError);
    
    if (this.debugMode) {
      console.error('Error added:', formattedError);
    }
    
    return formattedError;
  }

  /**
   * Add a warning to the handler
   * @param {Object|string} warning - Warning object or message
   * @param {Object} context - Additional context for the warning
   * @returns {Object} Formatted warning object
   */
  addWarning(warning, context = {}) {
    const formattedWarning = this.formatWarning(warning, context);
    this.warnings.push(formattedWarning);
    
    if (this.debugMode) {
      console.warn('Warning added:', formattedWarning);
    }
    
    return formattedWarning;
  }

  /**
   * Format error into standardized structure
   * @param {Object|string} error - Raw error
   * @param {Object} context - Additional context
   * @returns {Object} Formatted error
   */
  formatError(error, context = {}) {
    // If error is already formatted, enhance it
    if (typeof error === 'object' && error.type) {
      return {
        ...error,
        ...context,
        timestamp: new Date().toISOString(),
        id: this.generateErrorId()
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        type: ERROR_TYPES.PARSE_ERROR,
        message: error,
        ...context,
        timestamp: new Date().toISOString(),
        id: this.generateErrorId()
      };
    }

    // Handle JavaScript Error objects
    if (error instanceof Error) {
      return {
        type: ERROR_TYPES.PARSE_ERROR,
        message: error.message,
        stack: this.debugMode ? error.stack : undefined,
        ...context,
        timestamp: new Date().toISOString(),
        id: this.generateErrorId()
      };
    }

    // Fallback for unknown error types
    return {
      type: ERROR_TYPES.PARSE_ERROR,
      message: 'An unknown error occurred',
      originalError: error,
      ...context,
      timestamp: new Date().toISOString(),
      id: this.generateErrorId()
    };
  }

  /**
   * Format warning into standardized structure
   * @param {Object|string} warning - Raw warning
   * @param {Object} context - Additional context
   * @returns {Object} Formatted warning
   */
  formatWarning(warning, context = {}) {
    if (typeof warning === 'object' && warning.type) {
      return {
        ...warning,
        ...context,
        severity: warning.severity || 'medium',
        timestamp: new Date().toISOString(),
        id: this.generateErrorId()
      };
    }

    return {
      type: 'general',
      message: typeof warning === 'string' ? warning : 'Unknown warning',
      severity: 'medium',
      ...context,
      timestamp: new Date().toISOString(),
      id: this.generateErrorId()
    };
  }

  /**
   * Get user-friendly error message for display
   * @param {Object} error - Error object
   * @returns {Object} User-friendly error information
   */
  getUserFriendlyError(error) {
    const errorType = error.type || ERROR_TYPES.PARSE_ERROR;
    const filename = error.filename || 'file';

    switch (errorType) {
      case ERROR_TYPES.FILE_SIZE:
        return {
          title: 'File Too Large',
          message: `The file "${filename}" is too large. Please use files smaller than 5MB.`,
          action: 'Try compressing your file or splitting it into smaller parts',
          icon: '📁',
          severity: 'error'
        };

      case ERROR_TYPES.FILE_TYPE:
        return {
          title: 'Unsupported File Type',
          message: `"${filename}" is not a supported file type. Please use CSV or Excel (.xlsx) files.`,
          action: 'Convert your file to CSV or Excel format and try again',
          icon: '📄',
          severity: 'error'
        };

      case ERROR_TYPES.EMPTY_FILE:
        return {
          title: 'Empty File',
          message: `"${filename}" appears to be empty or contains no data rows.`,
          action: 'Check your file has data and column headers, then try again',
          icon: '📋',
          severity: 'error'
        };

      case ERROR_TYPES.NO_NUMERIC_DATA:
        return {
          title: 'No Numeric Data Found',
          message: `"${filename}" doesn't contain any numeric data needed for charts.`,
          action: 'Ensure your file has at least one column with numbers',
          icon: '🔢',
          severity: 'error',
          example: error.example
        };

      case ERROR_TYPES.PARSE_ERROR:
        return {
          title: 'File Processing Error',
          message: `There was a problem reading "${filename}". ${error.message || 'The file may be corrupted or in an unexpected format.'}`,
          action: 'Try re-saving your file and uploading again',
          icon: '⚠️',
          severity: 'error'
        };

      default:
        return {
          title: 'Unexpected Error',
          message: error.message || 'Something went wrong while processing your file.',
          action: 'Please try again or contact support if the problem persists',
          icon: '❌',
          severity: 'error'
        };
    }
  }

  /**
   * Get recovery suggestions based on error type
   * @param {Object} error - Error object
   * @returns {Array} Array of recovery suggestions
   */
  getRecoverySuggestions(error) {
    const errorType = error.type || ERROR_TYPES.PARSE_ERROR;

    switch (errorType) {
      case ERROR_TYPES.FILE_SIZE:
        return [
          'Remove unnecessary columns or rows',
          'Split large dataset into smaller files',
          'Export as CSV instead of Excel to reduce file size',
          'Compress or zip the file before uploading'
        ];

      case ERROR_TYPES.FILE_TYPE:
        return [
          'Save your data as a CSV file (.csv)',
          'Export as Excel format (.xlsx)',
          'Ensure file extension matches the format',
          'Try our sample data to see the expected format'
        ];

      case ERROR_TYPES.EMPTY_FILE:
        return [
          'Check that your file contains data rows',
          'Ensure the first row has column headers',
          'Verify the file saved correctly from your source application',
          'Try opening the file to confirm it has content'
        ];

      case ERROR_TYPES.NO_NUMERIC_DATA:
        return [
          'Include at least one column with numeric values',
          'Remove text formatting from number columns',
          'Check that numbers aren\'t stored as text',
          'See our example data for proper formatting'
        ];

      case ERROR_TYPES.PARSE_ERROR:
        return [
          'Check that your file isn\'t corrupted',
          'Try re-saving from the original application',
          'Ensure consistent column formatting',
          'Remove special characters from headers'
        ];

      default:
        return [
          'Try uploading the file again',
          'Check that your file is a valid CSV or Excel format',
          'Use our sample data to test the system',
          'Contact support if the problem continues'
        ];
    }
  }

  /**
   * Clear all errors and warnings
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Get all errors
   * @returns {Array} Array of error objects
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Get all warnings
   * @returns {Array} Array of warning objects
   */
  getWarnings() {
    return [...this.warnings];
  }

  /**
   * Check if there are any errors
   * @returns {boolean} True if errors exist
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Check if there are any warnings
   * @returns {boolean} True if warnings exist
   */
  hasWarnings() {
    return this.warnings.length > 0;
  }

  /**
   * Get the most recent error
   * @returns {Object|null} Most recent error or null
   */
  getLatestError() {
    return this.errors.length > 0 ? this.errors[this.errors.length - 1] : null;
  }

  /**
   * Generate unique error ID
   * @returns {string} Unique error identifier
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export errors for debugging or logging
   * @returns {Object} Error report
   */
  exportErrorReport() {
    return {
      timestamp: new Date().toISOString(),
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      errors: this.errors,
      warnings: this.warnings,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };
  }
}

// Global error handler instance
const globalErrorHandler = new ErrorHandler();

/**
 * Handle file upload errors
 * @param {File} file - File object that caused the error
 * @param {Object|string} error - Error details
 * @returns {Object} Formatted error
 */
export const handleFileUploadError = (file, error) => {
  const context = {
    filename: file?.name || 'unknown file',
    fileSize: file?.size || 0,
    fileType: file?.type || 'unknown'
  };

  return globalErrorHandler.addError(error, context);
};

/**
 * Handle parsing errors from CSV/Excel parsers
 * @param {Object} parseResult - Result from parser
 * @param {string} filename - Name of the file
 * @returns {Array} Array of formatted errors
 */
export const handleParsingErrors = (parseResult, filename) => {
  if (!parseResult.errors || parseResult.errors.length === 0) {
    return [];
  }

  return parseResult.errors.map(error => {
    return globalErrorHandler.addError(error, { filename });
  });
};

/**
 * Handle validation errors from data validator
 * @param {Object} validationResult - Result from data validator
 * @returns {Array} Array of formatted errors and warnings
 */
export const handleValidationErrors = (validationResult) => {
  const results = {
    errors: [],
    warnings: []
  };

  // Handle validation errors
  if (validationResult.errors && validationResult.errors.length > 0) {
    results.errors = validationResult.errors.map(error => {
      return globalErrorHandler.addError(error);
    });
  }

  // Handle validation warnings
  if (validationResult.warnings && validationResult.warnings.length > 0) {
    results.warnings = validationResult.warnings.map(warning => {
      return globalErrorHandler.addWarning(warning);
    });
  }

  return results;
};

/**
 * Get user-friendly error for display in UI
 * @param {Object} error - Error object
 * @returns {Object} User-friendly error information
 */
export const getUserFriendlyError = (error) => {
  return globalErrorHandler.getUserFriendlyError(error);
};

/**
 * Get recovery suggestions for an error
 * @param {Object} error - Error object
 * @returns {Array} Recovery suggestions
 */
export const getRecoverySuggestions = (error) => {
  return globalErrorHandler.getRecoverySuggestions(error);
};

/**
 * Clear all errors and warnings
 */
export const clearErrors = () => {
  globalErrorHandler.clear();
};

/**
 * Get current error state
 * @returns {Object} Current errors and warnings
 */
export const getErrorState = () => {
  return {
    errors: globalErrorHandler.getErrors(),
    warnings: globalErrorHandler.getWarnings(),
    hasErrors: globalErrorHandler.hasErrors(),
    hasWarnings: globalErrorHandler.hasWarnings(),
    latestError: globalErrorHandler.getLatestError()
  };
};

/**
 * Create error report for debugging
 * @returns {Object} Detailed error report
 */
export const createErrorReport = () => {
  return globalErrorHandler.exportErrorReport();
};

// Export the global instance for direct use if needed
export { globalErrorHandler };

// Convenience functions for common error scenarios
export const createFileError = (filename, message, errorType = ERROR_TYPES.PARSE_ERROR) => {
  return {
    type: errorType,
    message,
    filename,
    action: 'check-file-format'
  };
};

export const createValidationError = (message, data = {}) => {
  return {
    type: ERROR_TYPES.NO_NUMERIC_DATA,
    message,
    ...data,
    action: 'show-example'
  };
};

export const createParseError = (message, filename, details = {}) => {
  return {
    type: ERROR_TYPES.PARSE_ERROR,
    message,
    filename,
    ...details,
    action: 'check-data-format'
  };
};

/**
 * General purpose error handler - formats error and returns user-friendly version
 * @param {Error|Object|string} error - Error to handle
 * @param {Object} context - Additional context
 * @returns {Object} User-friendly error object
 */
export const handleError = (error, context = {}) => {
  // Add error to global handler
  const formattedError = globalErrorHandler.addError(error, context);
  
  // Return user-friendly version
  return globalErrorHandler.getUserFriendlyError(formattedError);
};