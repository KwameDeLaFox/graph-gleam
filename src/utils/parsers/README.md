# File Parsers

This directory contains utilities for parsing different file formats used in Graph Gleam.

## CSV Parser (`csv-parser.js`)

Robust CSV file parser using papaparse with comprehensive error handling.

### Features
- ✅ **Automatic delimiter detection** (comma, semicolon, tab, pipe)
- ✅ **File size validation** (5MB limit, 50,000 row limit)
- ✅ **Error categorization** with user-friendly messages
- ✅ **Dynamic typing** - automatically converts numbers and booleans
- ✅ **Header cleaning** - trims whitespace from column names
- ✅ **Empty value handling** - converts empty strings to null

### Usage

```javascript
import { parseCSV, getCSVInfo } from './parsers/csv-parser.js';

// Full parsing
const result = await parseCSV(file);
if (result.success) {
  console.log('Data:', result.data);
  console.log('Metadata:', result.meta);
} else {
  console.log('Errors:', result.errors);
}

// Quick file info (without full parsing)
const info = await getCSVInfo(file);
if (info.isValid) {
  console.log('Columns:', info.columns);
  console.log('Delimiter:', info.delimiter);
}
```

### Return Format

```javascript
// Successful parse
{
  success: true,
  data: [...], // Array of objects with column headers as keys
  meta: {
    filename: "data.csv",
    fileSize: 1024,
    rowCount: 100,
    columnCount: 5,
    columns: ["Name", "Age", "City"],
    delimiter: ",",
    parseErrors: [],
    truncated: false
  },
  errors: []
}

// Failed parse
{
  success: false,
  data: null,
  meta: {
    filename: "data.csv",
    fileSize: 1024,
    error: "File too large"
  },
  errors: [{
    type: "size",
    message: "File is too large...",
    filename: "data.csv",
    action: "reduce-file-size"
  }]
}
```

### Error Types
- `size` - File too large or too many rows
- `type` - Invalid file type or extension
- `parse` - Parsing errors (malformed CSV)
- `empty` - Empty file or no valid data
- `no-numeric` - No numeric data found (handled by data validator)

### Supported Delimiters
- `,` (comma) - Default and most common
- `;` (semicolon) - Common in European locales
- `\t` (tab) - Tab-separated values
- `|` (pipe) - Less common but supported

### File Limits
- **Maximum file size:** 5MB
- **Maximum rows:** 50,000
- **Supported extensions:** `.csv`

## Excel Parser (`excel-parser.js`)

Robust Excel file parser using xlsx library with multi-sheet support and comprehensive error handling.

### Features
- ✅ **Multi-sheet workbook support** (auto-selects first sheet)
- ✅ **File size validation** (5MB limit, 50,000 row limit)
- ✅ **Error categorization** with user-friendly messages
- ✅ **Date handling** - preserves Excel dates as Date objects
- ✅ **Dynamic typing** - automatically converts numbers and booleans
- ✅ **Header cleaning** - trims whitespace and handles empty headers
- ✅ **Empty value handling** - converts empty cells to null

### Usage

```javascript
import { parseExcel, getExcelInfo, getExcelSheets } from './parsers/excel-parser.js';

// Full parsing (uses first sheet by default)
const result = await parseExcel(file);
if (result.success) {
  console.log('Data:', result.data);
  console.log('Metadata:', result.meta);
  console.log('Available sheets:', result.meta.availableSheets);
} else {
  console.log('Errors:', result.errors);
}

// Parse specific sheet
const sheetResult = await parseExcel(file, { sheetName: 'Sheet2' });

// Quick file info (without full parsing)
const info = await getExcelInfo(file);
if (info.isValid) {
  console.log('Sheets:', info.sheetNames);
  console.log('Columns:', info.columns);
}

// Get all sheet names
const sheets = await getExcelSheets(file);
```

### Return Format

Excel parser returns the same standardized format as CSV parser, with additional Excel-specific metadata:

```javascript
// Successful parse
{
  success: true,
  data: [...], // Array of objects with column headers as keys
  meta: {
    filename: "data.xlsx",
    fileSize: 17408,
    rowCount: 6,
    columnCount: 4,
    columns: ["Category", "Amount", "Percentage", "Description"],
    sheetName: "Expenses", // Currently parsed sheet
    availableSheets: ["Expenses", "Summary"], // All sheets in workbook
    totalSheets: 2,
    parseErrors: [],
    truncated: false
  },
  errors: []
}
```

### Excel-Specific Features
- **Sheet selection** - Parse specific sheets or auto-select first
- **Date preservation** - Excel dates maintained as Date objects
- **Empty header handling** - Generates column names for empty headers
- **Workbook inspection** - Get sheet names without full parsing
- **Memory optimization** - Skips styles and formatting for performance

### Supported Formats
- `.xlsx` (Office Open XML) - Primary format
- `.xls` (Excel 97-2003) - Legacy format support

### File Limits
- **Maximum file size:** 5MB
- **Maximum rows:** 50,000 per sheet
- **Supported extensions:** `.xlsx`, `.xls`

### Next Steps
- Data validator (`../validators/data-validator.js`) - Coming in Task 6 