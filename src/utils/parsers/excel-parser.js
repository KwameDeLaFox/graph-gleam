// Excel Parser Utility
import * as XLSX from 'xlsx';
import { MAX_FILE_SIZE, MAX_ROWS, ERROR_TYPES } from '../constants.js';

/**
 * Parse Excel file with comprehensive error handling and validation
 * @param {File} file - The Excel file to parse
 * @param {Object} options - Parsing options
 * @returns {Promise<Object>} Parsed data and metadata
 */
export const parseExcel = async (file, options = {}) => {
  try {
    // Validate file before parsing
    const validation = validateExcelFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse Excel workbook
    const workbook = await parseWorkbookWithXLSX(arrayBuffer, options);
    
    // Get worksheet (default to first sheet)
    const sheetName = options.sheetName || workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No worksheets found in Excel file');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Worksheet "${sheetName}" not found`);
    }

    // Convert worksheet to JSON with headers
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Get raw arrays first
      defval: null, // Use null for empty cells
      blankrows: false, // Skip blank rows
      ...options.xlsxOptions
    });

    // Process the raw data to create proper objects with headers
    const processedData = processRawExcelData(rawData, file.name);
    
    // Validate processed data
    const dataValidation = validateParsedData(processedData.data, file.name);
    if (!dataValidation.isValid) {
      throw new Error(dataValidation.error);
    }

    // Return standardized format (matching CSV parser)
    return {
      success: true,
      data: processedData.data,
      meta: {
        filename: file.name,
        fileSize: file.size,
        rowCount: processedData.data.length,
        columnCount: processedData.columns.length,
        columns: processedData.columns,
        sheetName: sheetName,
        availableSheets: workbook.SheetNames,
        totalSheets: workbook.SheetNames.length,
        parseErrors: [],
        truncated: false
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
 * Validate Excel file before parsing
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
const validateExcelFile = (file) => {
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
      error: `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Try reducing the file size or exporting specific sheets.`,
      type: ERROR_TYPES.FILE_SIZE
    };
  }

  // Check if file is empty or suspiciously small for Excel
  if (file.size === 0) {
    return {
      isValid: false,
      error: `File "${file.name}" appears to be empty (0 bytes).`,
      type: ERROR_TYPES.EMPTY_FILE
    };
  }

  // Excel files are typically at least 4KB due to XML structure
  if (file.size < 1024) {
    return {
      isValid: false,
      error: `File "${file.name}" is too small to be a valid Excel file (${file.size} bytes). Excel files are typically at least 1KB.`,
      type: ERROR_TYPES.PARSE_ERROR
    };
  }

  // Enhanced file type validation
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.xlsx', '.xls'];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `File "${file.name}" does not appear to be an Excel file. Expected .xlsx or .xls extension. Please save your data as an Excel file.`,
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
 * Parse Excel workbook using xlsx library with error handling
 * @param {ArrayBuffer} arrayBuffer - File data as array buffer
 * @param {Object} options - Parsing options
 * @returns {Promise<Object>} Workbook object
 */
const parseWorkbookWithXLSX = async (arrayBuffer, options = {}) => {
  try {
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true, // Parse dates as Date objects
      cellNF: false, // Don't include number format
      cellStyles: false, // Don't include styles (reduces memory)
      ...options.xlsxOptions
    });

    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Invalid Excel file: No worksheets found');
    }

    return workbook;

  } catch (error) {
    // Handle specific xlsx parsing errors
    if (error.message.includes('Unsupported file type') || 
        error.message.includes('ZIP read error') ||
        error.message.includes('file corrupted')) {
      throw new Error('Excel file appears to be corrupted or in an unsupported format');
    }
    
    throw new Error(`Excel parsing error: ${error.message}`);
  }
};

/**
 * Process raw Excel data into standardized format
 * @param {Array} rawData - Raw array data from xlsx
 * @param {string} filename - Original filename for error context
 * @returns {Object} Processed data with headers and rows
 */
const processRawExcelData = (rawData, filename) => {
  if (!rawData || rawData.length === 0) {
    throw new Error(`No data found in Excel file "${filename}"`);
  }

  // Extract headers from first row
  const headerRow = rawData[0];
  if (!headerRow || headerRow.length === 0) {
    throw new Error(`No header row found in Excel file "${filename}"`);
  }

  // Clean and validate headers
  const columns = headerRow.map((header, index) => {
    if (header === null || header === undefined || header === '') {
      return `Column_${index + 1}`; // Generate column name for empty headers
    }
    return String(header).trim();
  });

  // Process data rows
  const dataRows = rawData.slice(1); // Skip header row
  const processedData = [];

  dataRows.forEach((row, rowIndex) => {
    if (!row || row.length === 0) return; // Skip empty rows
    
    // Check if row has any non-empty values
    const hasData = row.some(cell => cell !== null && cell !== undefined && cell !== '');
    if (!hasData) return; // Skip rows with all empty cells

    // Create object with column headers as keys
    const rowObject = {};
    columns.forEach((columnName, colIndex) => {
      let cellValue = row[colIndex];
      
      // Handle different data types
      if (cellValue === undefined || cellValue === '') {
        cellValue = null;
      } else if (cellValue instanceof Date) {
        // Keep dates as Date objects - they'll be serialized properly
        cellValue = cellValue;
      } else if (typeof cellValue === 'string') {
        // Try to convert string numbers to actual numbers
        const trimmed = cellValue.trim();
        const numValue = Number(trimmed);
        if (!isNaN(numValue) && trimmed !== '') {
          cellValue = numValue;
        } else {
          cellValue = trimmed;
        }
      }
      
      rowObject[columnName] = cellValue;
    });

    processedData.push(rowObject);
  });

  return {
    data: processedData,
    columns: columns
  };
};

/**
 * Validate parsed Excel data
 * @param {Array} data - Parsed data array
 * @param {string} filename - Original filename
 * @returns {Object} Validation result
 */
const validateParsedData = (data, filename) => {
  // Check if data is empty
  if (!data || data.length === 0) {
    return {
      isValid: false,
      error: `No data found in "${filename}". File may be empty or contain only headers.`,
      type: ERROR_TYPES.EMPTY_FILE
    };
  }

  // Check row limit
  if (data.length > MAX_ROWS) {
    return {
      isValid: false,
      error: `File "${filename}" has too many rows (${data.length}). Maximum is ${MAX_ROWS} rows.`,
      type: ERROR_TYPES.FILE_SIZE
    };
  }

  // Check if all rows are empty objects
  const nonEmptyRows = data.filter(row => 
    Object.values(row).some(value => value !== null && value !== undefined && value !== '')
  );

  if (nonEmptyRows.length === 0) {
    return {
      isValid: false,
      error: `No valid data rows found in "${filename}".`,
      type: ERROR_TYPES.EMPTY_FILE
    };
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
  
  if (message.includes('empty') || message.includes('no data') || message.includes('no header')) {
    return {
      type: ERROR_TYPES.EMPTY_FILE,
      message: error.message,
      filename,
      action: 'check-file-content'
    };
  }
  
  if (message.includes('excel') || message.includes('xlsx') || message.includes('extension')) {
    return {
      type: ERROR_TYPES.FILE_TYPE,
      message: error.message,
      filename,
      action: 'use-excel-file'
    };
  }
  
  if (message.includes('corrupted') || message.includes('unsupported') || message.includes('zip')) {
    return {
      type: ERROR_TYPES.PARSE_ERROR,
      message: error.message,
      filename,
      action: 'check-file-format'
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
 * Get basic info about an Excel file without fully parsing it
 * @param {File} file - Excel file to inspect
 * @returns {Promise<Object>} Basic file information
 */
export const getExcelInfo = async (file) => {
  try {
    const validation = validateExcelFile(file);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error,
        type: validation.type
      };
    }

    // Read just enough to get workbook structure
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      bookSheets: true, // Only read sheet names
      bookProps: false, // Don't read properties
      cellStyles: false // Don't read styles
    });

    // Get first sheet info
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[firstSheetName];
    
    // Get range to estimate size
    const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1:A1');
    const estimatedRows = Math.max(0, range.e.r); // End row
    const estimatedColumns = Math.max(1, range.e.c + 1); // End column + 1

    // Try to get first row as headers
    const headerRow = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      range: 0 // Just first row
    })[0] || [];

    const columns = headerRow.map((header, index) => {
      if (header === null || header === undefined || header === '') {
        return `Column_${index + 1}`;
      }
      return String(header).trim();
    });

    return {
      isValid: true,
      filename: file.name,
      fileSize: file.size,
      totalSheets: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames,
      defaultSheet: firstSheetName,
      estimatedRows: estimatedRows,
      estimatedColumns: estimatedColumns,
      columns: columns
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Failed to analyze Excel file: ${error.message}`,
      type: ERROR_TYPES.PARSE_ERROR
    };
  }
};

/**
 * Parse specific sheet from Excel workbook
 * @param {File} file - Excel file
 * @param {string} sheetName - Name of sheet to parse
 * @returns {Promise<Object>} Parsed data from specific sheet
 */
export const parseExcelSheet = async (file, sheetName) => {
  return parseExcel(file, { sheetName });
};

/**
 * Get list of all sheets in Excel workbook
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Array of sheet names
 */
export const getExcelSheets = async (file) => {
  try {
    const info = await getExcelInfo(file);
    return info.isValid ? info.sheetNames : [];
  } catch (error) {
    console.warn('Failed to get Excel sheets:', error);
    return [];
  }
}; 