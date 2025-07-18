# Centralized Error Handler

Unified error handling and user experience system for Graph Gleam.

## Overview

The Error Handler provides a centralized system for managing all errors and warnings across the application. It standardizes error formatting, provides user-friendly messages, offers recovery suggestions, and maintains error state.

## Core Features

🚨 **Centralized Management** - Single source of truth for all errors
📝 **Standardized Formatting** - Consistent error structure across components  
😊 **User-Friendly Messages** - Clear, actionable error descriptions
🔧 **Recovery Suggestions** - Helpful steps users can take to resolve issues
📊 **State Management** - Track errors and warnings globally
🐛 **Debug Support** - Development logging and error reporting

## Architecture

### ErrorHandler Class

Main class that manages error state and formatting:

```javascript
import { ErrorHandler } from './error-handler.js';

const errorHandler = new ErrorHandler();
errorHandler.addError('Something went wrong');
errorHandler.hasErrors(); // true
errorHandler.getErrors(); // Array of formatted errors
```

### Global Instance

Pre-configured global instance for application-wide use:

```javascript
import { getErrorState, clearErrors } from './error-handler.js';

const state = getErrorState();
clearErrors(); // Reset global state
```

## Error Types Supported

Based on `ERROR_TYPES` from constants:

| Type | Description | User Message | Recovery Actions |
|------|-------------|--------------|------------------|
| `FILE_SIZE` | File exceeds 5MB limit | "File Too Large" | Compress, split, use CSV |
| `FILE_TYPE` | Unsupported format | "Unsupported File Type" | Convert to CSV/Excel |
| `EMPTY_FILE` | No data found | "Empty File" | Check file content, headers |
| `NO_NUMERIC_DATA` | No chartable data | "No Numeric Data Found" | Add numeric columns |
| `PARSE_ERROR` | Processing failure | "File Processing Error" | Re-save, check format |

## Core Functions

### Error Management

```javascript
// Add errors with context
addError(error, context)
addWarning(warning, context)

// Check error state
hasErrors()
hasWarnings()
getLatestError()

// Clear state
clear()
```

### Specialized Handlers

```javascript
// File upload errors
handleFileUploadError(file, error)

// Parser result errors
handleParsingErrors(parseResult, filename)

// Validation errors and warnings
handleValidationErrors(validationResult)
```

### User Interface Functions

```javascript
// Get display-ready error information
getUserFriendlyError(error)

// Get actionable recovery steps
getRecoverySuggestions(error)

// Get complete error state
getErrorState()
```

## Error Structure

### Standard Error Format

```javascript
{
  type: 'error-type',           // ERROR_TYPES constant
  message: 'Error description', // Technical message
  filename: 'file.csv',        // File context
  action: 'suggested-action',   // Recovery action type
  timestamp: '2024-01-01T...',  // ISO timestamp
  id: 'err_123_abc',           // Unique identifier
  // Additional context fields...
}
```

### User-Friendly Error Format

```javascript
{
  title: 'File Too Large',           // Display title
  message: 'The file is too big...',// User message
  action: 'Try compressing...',      // Suggested action
  icon: '📁',                       // UI icon
  severity: 'error',                // error|warning|info
  example: { /* example data */ }   // For NO_NUMERIC_DATA
}
```

## Usage Examples

### Basic Error Handling

```javascript
import { addError, getErrorState } from './error-handler.js';

try {
  // Some operation that might fail
  processFile(file);
} catch (error) {
  addError(error, { filename: file.name });
  
  const state = getErrorState();
  if (state.hasErrors) {
    displayErrors(state.errors);
  }
}
```

### File Upload Integration

```javascript
import { handleFileUploadError } from './error-handler.js';

const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    return handleFileUploadError(file, {
      type: ERROR_TYPES.FILE_SIZE,
      message: 'File exceeds size limit'
    });
  }
  return null;
};
```

### Parser Integration

```javascript
import { handleParsingErrors } from './error-handler.js';

const result = await parseCSV(file);
if (!result.success) {
  const errors = handleParsingErrors(result, file.name);
  // Errors are automatically added to global state
}
```

### Data Validation Integration

```javascript
import { handleValidationErrors } from './error-handler.js';

const validation = validateDataForCharting(data, meta);
const results = handleValidationErrors(validation);

// results.errors = formatted validation errors
// results.warnings = formatted validation warnings
```

### UI Error Display

```javascript
import { getUserFriendlyError, getRecoverySuggestions } from './error-handler.js';

const ErrorDisplay = ({ error }) => {
  const friendly = getUserFriendlyError(error);
  const suggestions = getRecoverySuggestions(error);
  
  return (
    <div className="error-card">
      <div className="error-header">
        <span className="icon">{friendly.icon}</span>
        <h3>{friendly.title}</h3>
      </div>
      <p>{friendly.message}</p>
      <p className="action">{friendly.action}</p>
      
      {suggestions.length > 0 && (
        <div className="suggestions">
          <h4>How to fix this:</h4>
          <ul>
            {suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

## Integration Points

### CSV Parser Integration

```javascript
// parsers/csv-parser.js returns errors in standard format
const csvResult = await parseCSV(file);
const errors = handleParsingErrors(csvResult, file.name);
```

### Excel Parser Integration

```javascript
// parsers/excel-parser.js returns errors in standard format  
const excelResult = await parseExcel(file);
const errors = handleParsingErrors(excelResult, file.name);
```

### Data Validator Integration

```javascript
// validators/data-validator.js returns errors and warnings
const validation = validateDataForCharting(data, meta);
const results = handleValidationErrors(validation);
```

## Error Recovery Flows

### File Size Error Recovery

1. **Error Detection**: File > 5MB
2. **User Message**: "File Too Large" with friendly explanation
3. **Recovery Suggestions**: 
   - Remove unnecessary columns/rows
   - Split into smaller files
   - Export as CSV (smaller)
   - Compress file

### No Numeric Data Recovery

1. **Error Detection**: Data validator finds no numeric columns
2. **User Message**: "No Numeric Data Found" with example
3. **Recovery Suggestions**:
   - Add numeric columns
   - Remove text formatting
   - Check data types
   - View example format

### Parse Error Recovery

1. **Error Detection**: File parsing fails
2. **User Message**: "File Processing Error" with details
3. **Recovery Suggestions**:
   - Check file isn't corrupted
   - Re-save from source
   - Check formatting consistency
   - Remove special characters

## State Management

### Global Error State

```javascript
{
  errors: Array,        // All current errors
  warnings: Array,      // All current warnings  
  hasErrors: boolean,   // Quick error check
  hasWarnings: boolean, // Quick warning check
  latestError: Object   // Most recent error
}
```

### State Operations

```javascript
// Get current state
const state = getErrorState();

// Clear all errors and warnings
clearErrors();

// Check for specific conditions
if (state.hasErrors) {
  // Show error UI
}

if (state.hasWarnings) {
  // Show warning notifications
}
```

## Development Features

### Debug Mode

Automatic console logging in development:

```javascript
// In development, errors are logged automatically
errorHandler.addError('Test error');
// Console: "Error added: { type: 'parse', message: 'Test error', ... }"
```

### Error Reporting

Generate detailed reports for debugging:

```javascript
import { createErrorReport } from './error-handler.js';

const report = createErrorReport();
// Returns: {
//   timestamp: '2024-01-01T...',
//   errorCount: 3,
//   warningCount: 1,
//   errors: [...],
//   warnings: [...],
//   userAgent: 'Mozilla/5.0...',
//   url: 'http://localhost:5173'
// }
```

### Unique Error IDs

Each error gets a unique identifier for tracking:

```javascript
{
  id: 'err_1704067200000_abc123def',
  // timestamp_randomString format
}
```

## Testing

The error handler has been thoroughly tested:

✅ **Basic functionality** - Error/warning addition and retrieval  
✅ **File upload errors** - Size, type, validation with file context  
✅ **Parser integration** - CSV/Excel error handling  
✅ **Validation integration** - Data validator errors and warnings  
✅ **User-friendly messages** - All error types with proper formatting  
✅ **Recovery suggestions** - Actionable steps for each error type  
✅ **State management** - Global state operations  
✅ **Convenience functions** - Helper functions for common scenarios  
✅ **Clear functionality** - State reset operations

## Performance Considerations

- **Memory Efficient**: Errors are stored as lightweight objects
- **Lazy Formatting**: User-friendly formatting only when requested
- **Global State**: Single instance prevents memory leaks
- **Auto-Cleanup**: Clear functions prevent state buildup

## Best Practices

### DO
- Use specific error types from `ERROR_TYPES`
- Provide filename context when available
- Clear errors between operations
- Use convenience functions for common scenarios
- Display user-friendly messages in UI

### DON'T
- Create custom error types without updating constants
- Ignore warnings - they indicate data quality issues
- Display technical error messages to users
- Let error state accumulate indefinitely
- Handle errors inconsistently across components

The Error Handler ensures consistent, user-friendly error handling throughout Graph Gleam while providing developers with the tools needed for effective debugging and error resolution. 