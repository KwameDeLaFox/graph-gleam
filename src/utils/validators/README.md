# Data Validator Module

Comprehensive data validation and chart compatibility analysis for Graph Gleam.

## Overview

The data validator analyzes parsed CSV/Excel data to:
- Detect column types (numeric, text, date, boolean)
- Validate chart compatibility 
- Suggest optimal chart types with confidence scores
- Identify data quality issues
- Provide actionable error messages

## Core Functions

### `validateDataForCharting(data, meta)`

Main validation function that performs comprehensive analysis.

**Parameters:**
- `data` (Array): Parsed data from CSV or Excel parser
- `meta` (Object): Metadata object with filename, columns, etc.

**Returns:** Object with validation results:
```javascript
{
  isValid: boolean,           // Can data be charted?
  errors: Array,              // Error objects if validation fails
  warnings: Array,            // Non-blocking data quality warnings
  suggestions: Array,         // Chart type suggestions with confidence
  columnAnalysis: Object,     // Detailed column analysis
  chartCompatibility: Object  // Chart type compatibility assessment
}
```

### `hasNumericData(data)`

Quick check for numeric data presence.

**Parameters:**
- `data` (Array): Data array to check

**Returns:** Boolean - true if numeric data found

### `getChartRecommendations(data, meta)`

Get chart type recommendations only.

**Parameters:**
- `data` (Array): Parsed data
- `meta` (Object): Metadata from parser

**Returns:** Array of chart suggestions

## Column Analysis

The validator performs detailed analysis of each column:

### Type Detection
- **Numeric**: Numbers, numeric strings
- **String**: Text, categories
- **Date**: Date objects, date patterns
- **Boolean**: True/false values
- **Mixed**: Multiple types in same column

### Pattern Recognition
- **Time Series**: Date/time column names and patterns
- **Categorical**: Limited unique values suitable for grouping
- **Percentage**: Column names containing "percent" or "%"
- **ID Fields**: Unique identifiers, keys

### Statistical Analysis (Numeric columns)
- Count, min, max, sum, mean, median
- Range, negatives, decimals detection
- Data distribution characteristics

## Chart Compatibility

### Chart Type Requirements

**Bar Charts:**
- Requires: 1+ numeric columns
- Optimal: Categorical or date columns for X-axis
- Confidence: 90% with categories, 70% without

**Line Charts:**
- Requires: 1+ numeric columns, 3+ data points
- Optimal: Time series data
- Confidence: 95% for time series, 75% otherwise

**Pie Charts:**
- Requires: 1+ numeric columns, 1+ categorical columns
- Optimal: 2-8 categories for readability
- Confidence: 85% with good categories

**Area Charts:**
- Requires: 1+ numeric columns, 5+ data points
- Optimal: Time series data
- Confidence: 80% for time series

## Error Handling

### Error Types

```javascript
ERROR_TYPES.EMPTY_FILE     // No data or empty file
ERROR_TYPES.PARSE_ERROR    // Invalid data structure
ERROR_TYPES.NO_NUMERIC_DATA // No chartable numeric data
```

### Error Format

```javascript
{
  type: 'error-type',
  message: 'User-friendly message',
  filename: 'file.csv',
  action: 'suggested-action',
  example: {               // For NO_NUMERIC_DATA errors
    description: 'Example description',
    headers: ['Month', 'Sales'],
    rows: [['Jan', 100], ['Feb', 150]]
  }
}
```

## Warnings System

Non-blocking data quality warnings:

### Missing Data
- High percentage of empty values (>25%)
- Severity: medium (>25%), high (>50%)

### Mixed Types
- Columns containing multiple data types
- Affects chart accuracy and appearance

### Small Datasets
- Very small datasets (<3 rows)
- Charts may not be meaningful

## Usage Examples

### Basic Validation
```javascript
import { validateDataForCharting } from './validators/data-validator.js';

const data = [
  { Month: 'Jan', Sales: 100, Expenses: 80 },
  { Month: 'Feb', Sales: 150, Expenses: 90 }
];

const result = validateDataForCharting(data, { filename: 'sales.csv' });

if (result.isValid) {
  console.log('Chart suggestions:', result.suggestions);
  // Expected: [{ chartType: 'bar', confidence: 90, ... }]
} else {
  console.log('Validation errors:', result.errors);
}
```

### Quick Numeric Check
```javascript
import { hasNumericData } from './validators/data-validator.js';

const hasNumbers = hasNumericData(data);
// Quick boolean check for chartability
```

### Chart Recommendations Only
```javascript
import { getChartRecommendations } from './validators/data-validator.js';

const suggestions = getChartRecommendations(data, { filename: 'data.csv' });
// Returns only the suggestions array
```

## Column Analysis Details

### Categorical Data Detection
- Unique values ≤ 50% of total values
- Unique values ≤ 20 absolute maximum
- Text-based columns with reasonable variety

### Numeric Data Validation
- Handles numeric strings ("123" → 123)
- Detects percentages, currencies, negative numbers
- Distinguishes integers vs decimals
- Calculates statistical measures

### Time Series Recognition
- Column names: date, time, month, year, day
- Date object detection
- Sequential patterns in data

## Integration with Parsers

Works seamlessly with CSV and Excel parsers:

```javascript
// With CSV parser
const csvResult = await parseCSV(file);
if (csvResult.success) {
  const validation = validateDataForCharting(csvResult.data, csvResult.meta);
}

// With Excel parser  
const excelResult = await parseExcel(file);
if (excelResult.success) {
  const validation = validateDataForCharting(excelResult.data, excelResult.meta);
}
```

## Performance Considerations

- Optimized for datasets up to 50,000 rows
- Efficient type detection algorithms
- Statistical calculations only for numeric columns
- Memory-conscious pattern analysis

## Testing

The validator has been tested with:
- ✅ Multi-column numeric data (sales_sample.csv)
- ✅ Categorical + numeric data (expense_breakdown.xlsx)  
- ✅ Text-only data (error handling)
- ✅ Mixed data types
- ✅ Small datasets
- ✅ Empty/malformed data

## Error Recovery

Graceful handling of edge cases:
- Corrupted data structures
- Unexpected value types
- Missing columns or metadata
- Zero-row datasets
- All-empty columns

The validator ensures the application remains stable while providing helpful feedback to users about data issues and how to resolve them. 