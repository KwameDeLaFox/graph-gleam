// CSV Parser Utility
import Papa from 'papaparse';
import { MAX_FILE_SIZE, MAX_ROWS, ERROR_TYPES } from '../constants.js';

/**
 * Parse CSV file with comprehensive error handling and validation
 * @param {File} file - The CSV file to parse
 * @param {Object} options - Parsing options
 * @returns {Promise<Object>} Parsed data and metadata
 */
export const parseCSV = async (file, options = {}) => {
  try {
    // Validate file before parsing
    const validation = validateCSVFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Detect delimiter
    const delimiter = await detectDelimiter(file);
    
    // Configure papaparse options
    const parseConfig = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: delimiter,
      transformHeader: (header) => header.trim(), // Clean whitespace
      transform: (value) => {
        // Handle empty strings and convert to null for consistency
        if (value === '' || value === undefined) return null;
        return value;
      },
      ...options
    };

    // Parse the file
    const parseResult = await parseFileWithPapa(file, parseConfig);
    
    // Validate parsed data
    const dataValidation = validateParsedData(parseResult.data, file.name);
    if (!dataValidation.isValid) {
      throw new Error(dataValidation.error);
    }

    // Return standardized format
    return {
      success: true,
      data: parseResult.data,
      meta: {
        filename: file.name,
        fileSize: file.size,
        rowCount: parseResult.data.length,
        columnCount: parseResult.meta.fields?.length || 0,
        columns: parseResult.meta.fields || [],
        delimiter: delimiter,
        parseErrors: parseResult.errors,
        truncated: parseResult.meta.truncated || false
      },
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      data: null,
      meta: {
        filename: file.name,
        fileSize: file.size,
        error: error.message
      },
      errors: [categorizeError(error, file.name)]
    };
  }
};

/**
 * Validate CSV file before parsing
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
const validateCSVFile = (file) => {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided',
      type: ERROR_TYPES.EMPTY_FILE
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Try reducing the file size or splitting into smaller files.`,
      type: ERROR_TYPES.FILE_SIZE
    };
  }

  // Check if file is empty or suspiciously small
  if (file.size === 0) {
    return {
      isValid: false,
      error: `File "${file.name}" appears to be empty (0 bytes).`,
      type: ERROR_TYPES.EMPTY_FILE
    };
  }

  if (file.size < 10) {
    return {
      isValid: false,
      error: `File "${file.name}" is too small to contain valid CSV data (${file.size} bytes).`,
      type: ERROR_TYPES.EMPTY_FILE
    };
  }

  // Enhanced file type validation
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.csv')) {
    return {
      isValid: false,
      error: `File "${file.name}" does not appear to be a CSV file. Expected .csv extension. Please save your data as a CSV file.`,
      type: ERROR_TYPES.FILE_TYPE
    };
  }

  // Additional filename validation for security
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: `Filename "${file.name}" is too long (over 255 characters).`,
      type: ERROR_TYPES.FILE_TYPE
    };
  }

  // Check for suspicious filename patterns
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      isValid: false,
      error: `Filename "${file.name}" contains invalid characters.`,
      type: ERROR_TYPES.FILE_TYPE
    };
  }

  return { isValid: true };
};

/**
 * Detect CSV delimiter by sampling the file
 * @param {File} file - CSV file to analyze
 * @returns {Promise<string>} Detected delimiter
 */
const detectDelimiter = async (file) => {
  try {
    // Read first 1KB to detect delimiter
    const sampleSize = Math.min(1024, file.size);
    const sampleBlob = file.slice(0, sampleSize);
    const sampleText = await sampleBlob.text();

    // Skip escaped quotes and content within quotes
    const cleanText = sampleText.replace(/"[^"]*"/g, '');

    // Count potential delimiters in clean text
    const delimiters = [',', ';', '\t', '|'];
    const counts = {};

    delimiters.forEach(delimiter => {
      // Escape special regex characters
      const escaped = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      counts[delimiter] = (cleanText.match(new RegExp(escaped, 'g')) || []).length;
    });

    // Find delimiter with highest count
    let bestDelimiter = ','; // Default
    let highestCount = 0;

    Object.entries(counts).forEach(([delimiter, count]) => {
      if (count > highestCount) {
        highestCount = count;
        bestDelimiter = delimiter;
      }
    });

    // Only use detected delimiter if it appears multiple times
    // This helps avoid false positives from single occurrences
    return highestCount >= 2 ? bestDelimiter : ',';

  } catch (error) {
    console.warn('Delimiter detection failed, defaulting to comma:', error);
    return ',';
  }
};

/**
 * Parse file using papaparse with promise wrapper
 * @param {File} file - File to parse
 * @param {Object} config - Papaparse configuration
 * @returns {Promise<Object>} Parse results
 */
const parseFileWithPapa = (file, config) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      ...config,
      complete: (results) => {
        if (results.errors.length > 0) {
          // Filter out acceptable warnings
          const criticalErrors = results.errors.filter(error => 
            error.type === 'Quotes' || error.type === 'FieldMismatch'
          );
          
          if (criticalErrors.length > 0) {
            reject(new Error(`CSV parsing failed: ${criticalErrors[0].message}`));
            return;
          }
        }
        
        resolve(results);
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message || error}`));
      }
    });
  });
};

/**
 * Validate parsed CSV data
 * @param {Array} data - Parsed data array
 * @param {string} filename - Original filename
 * @returns {Object} Validation result
 */
const validateParsedData = (data, filename) => {
  // Check if data exists
  if (!data) {
    return {
      isValid: false,
      error: `Failed to parse "${filename}". Data is null or undefined.`,
      type: ERROR_TYPES.PARSE_ERROR
    };
  }

  // Check if data is an array
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      error: `Invalid data structure in "${filename}". Expected array of objects.`,
      type: ERROR_TYPES.PARSE_ERROR
    };
  }

  // Check if data is empty
  if (data.length === 0) {
    return {
      isValid: false,
      error: `No data found in "${filename}". File may be empty, contain only headers, or all rows may be invalid.`,
      type: ERROR_TYPES.EMPTY_FILE
    };
  }

  // Check row limit
  if (data.length > MAX_ROWS) {
    return {
      isValid: false,
      error: `File "${filename}" has too many rows (${data.length}). Maximum is ${MAX_ROWS} rows. Consider splitting the file or using data sampling.`,
      type: ERROR_TYPES.FILE_SIZE
    };
  }

  // Check if all rows are empty objects or have no meaningful data
  const nonEmptyRows = data.filter(row => {
    if (!row || typeof row !== 'object') return false;
    return Object.values(row).some(value => 
      value !== null && value !== undefined && value !== '' && value !== 'undefined'
    );
  });

  if (nonEmptyRows.length === 0) {
    return {
      isValid: false,
      error: `No valid data rows found in "${filename}". All rows appear to be empty or contain only empty values.`,
      type: ERROR_TYPES.EMPTY_FILE
    };
  }

  // Warn about low data quality if most rows are empty
  const dataQuality = nonEmptyRows.length / data.length;
  if (dataQuality < 0.5) {
    console.warn(`Data quality warning: Only ${Math.round(dataQuality * 100)}% of rows in "${filename}" contain valid data.`);
  }

  // Check for suspiciously uniform data
  if (data.length > 1) {
    const firstRow = data[0];
    const allSame = data.every(row => 
      Object.keys(firstRow).every(key => row[key] === firstRow[key])
    );
    
    if (allSame) {
      console.warn(`Data uniformity warning: All rows in "${filename}" appear to be identical.`);
    }
  }

  return { isValid: true };
};

/**
 * Categorize error for consistent error handling
 * @param {Error} error - The error object
 * @param {string} filename - Original filename
 * @returns {Object} Categorized error
 */
const categorizeError = (error, filename) => {
  const message = error.message.toLowerCase();
  
  if (message.includes('too large') || message.includes('too many rows')) {
    return {
      type: ERROR_TYPES.FILE_SIZE,
      message: error.message,
      filename,
      action: 'reduce-file-size'
    };
  }
  
  if (message.includes('empty') || message.includes('no data')) {
    return {
      type: ERROR_TYPES.EMPTY_FILE,
      message: error.message,
      filename,
      action: 'check-file-content'
    };
  }
  
  if (message.includes('csv') || message.includes('extension')) {
    return {
      type: ERROR_TYPES.FILE_TYPE,
      message: error.message,
      filename,
      action: 'use-csv-file'
    };
  }
  
  // Default to parse error
  return {
    type: ERROR_TYPES.PARSE_ERROR,
    message: error.message,
    filename,
    action: 'check-file-format'
  };
};

/**
 * Get basic info about a CSV file without fully parsing it
 * @param {File} file - CSV file to inspect
 * @returns {Promise<Object>} Basic file information
 */
export const getCSVInfo = async (file) => {
  try {
    const validation = validateCSVFile(file);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error,
        type: validation.type
      };
    }

    const delimiter = await detectDelimiter(file);
    
    // Read first few lines to get column headers
    const sampleSize = Math.min(2048, file.size);
    const sampleBlob = file.slice(0, sampleSize);
    const sampleText = await sampleBlob.text();
    const lines = sampleText.split('\n');
    const headerLine = lines[0];
    
    const headers = headerLine
      .split(delimiter)
      .map(h => h.trim().replace(/^["']|["']$/g, '')); // Remove quotes

    return {
      isValid: true,
      filename: file.name,
      fileSize: file.size,
      delimiter,
      estimatedColumns: headers.length,
      columns: headers,
      estimatedRows: Math.max(0, lines.length - 1) // Rough estimate
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Failed to analyze CSV file: ${error.message}`,
      type: ERROR_TYPES.PARSE_ERROR
    };
  }
}; 