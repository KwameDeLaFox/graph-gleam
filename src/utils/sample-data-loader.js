// Sample data loader utility
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Sample data file information
export const SAMPLE_FILES = {
  SALES_CSV: {
    name: 'Sales Sample (CSV)',
    filename: 'sales_sample.csv',
    type: 'csv',
    description: 'Monthly sales data - perfect for bar, line, or area charts',
    chartTypes: ['bar', 'line', 'area'],
    columns: ['Month', 'Revenue', 'Expenses', 'Profit', 'Customers', 'Orders']
  },
  EXPENSES_EXCEL: {
    name: 'Expenses Sample (Excel)',
    filename: 'expense_breakdown.xlsx', 
    type: 'excel',
    description: 'Expense breakdown by category - ideal for pie charts',
    chartTypes: ['pie'],
    columns: ['Category', 'Amount', 'Percentage', 'Description']
  },

};

// Load CSV sample data
export const loadCSVSample = async () => {
  try {
    console.log('Fetching CSV sample from /sales_sample.csv');
    const response = await fetch('/sales_sample.csv');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV sample: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('CSV text loaded, length:', csvText.length);
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV sample file is empty');
    }
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Papa parse results:', results);
          
          if (results.errors && results.errors.length > 0) {
            console.error('Papa parse errors:', results.errors);
            reject(new Error('CSV parsing failed: ' + results.errors[0].message));
          } else if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in CSV sample'));
          } else {
            console.log('CSV sample loaded successfully:', results.data.length, 'rows');
            resolve({
              data: results.data,
              filename: 'sales_sample.csv',
              type: 'csv',
              meta: SAMPLE_FILES.SALES_CSV
            });
          }
        },
        error: (error) => {
          console.error('Papa parse error:', error);
          reject(new Error('CSV parsing error: ' + error.message));
        }
      });
    });
  } catch (error) {
    console.error('CSV sample loading error:', error);
    throw new Error('Failed to load CSV sample: ' + error.message);
  }
};

// Load Excel sample data  
export const loadExcelSample = async () => {
  try {
    console.log('Fetching Excel sample from /expense_breakdown.xlsx');
    const response = await fetch('/expense_breakdown.xlsx');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Excel sample: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('Excel arrayBuffer loaded, size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Excel sample file is empty');
    }
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('Excel workbook loaded, sheets:', workbook.SheetNames);
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Excel sample file');
    }
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      throw new Error(`Sheet "${firstSheetName}" not found in Excel sample`);
    }
    
    // Convert to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log('Excel sample loaded successfully:', data.length, 'rows');
    
    if (!data || data.length === 0) {
      throw new Error('No data found in Excel sample');
    }
    
    return {
      data,
      filename: 'expense_breakdown.xlsx',
      type: 'excel',
      meta: SAMPLE_FILES.EXPENSES_EXCEL
    };
  } catch (error) {
    console.error('Excel sample loading error:', error);
    throw new Error('Failed to load Excel sample: ' + error.message);
  }
};



// Generic sample loader that detects file type
export const loadSampleData = async (sampleKey) => {
  const sampleInfo = SAMPLE_FILES[sampleKey];
  
  if (!sampleInfo) {
    throw new Error('Unknown sample data key: ' + sampleKey);
  }
  
  if (sampleInfo.type === 'csv') {
    return loadCSVSample();
  } else if (sampleInfo.type === 'excel') {
    return loadExcelSample();
  } else {
    throw new Error('Unsupported sample data type: ' + sampleInfo.type);
  }
};

// Get sample data info without loading
export const getSampleInfo = (sampleKey) => {
  return SAMPLE_FILES[sampleKey] || null;
};

// Get all available samples
export const getAllSamples = () => {
  return Object.entries(SAMPLE_FILES).map(([key, info]) => ({
    key,
    ...info
  }));
}; 