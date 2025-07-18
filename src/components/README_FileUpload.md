# FileUpload Component

Beautiful drag-and-drop file upload component with validation and error handling.

## Overview

The FileUpload component provides a modern, accessible file upload interface with comprehensive validation, error handling, and visual feedback. It integrates seamlessly with our error handler system and supports multiple upload states.

## Features

🎯 **Drag & Drop Interface**
- Modern drag-and-drop area with visual feedback
- Click to browse file picker as fallback
- Smooth animations and state transitions

📁 **File Validation**
- File type validation (CSV, Excel only)
- File size validation (5MB limit)
- Empty file detection
- Real-time validation feedback

🚨 **Error Handling Integration**
- Uses centralized error handler
- User-friendly error messages with emojis
- Recovery suggestions for each error type
- "Try again" functionality

🎨 **Beautiful UI States**
- **Idle**: Clean upload prompt with instructions
- **Drag Active**: Visual feedback when dragging files
- **Uploading**: Progress bar with percentage
- **Success**: Confirmation with file details
- **Error**: Detailed error message with solutions

♿ **Accessibility**
- Keyboard navigation support (Enter/Space)
- ARIA labels and roles
- Screen reader friendly
- Focus management

📱 **Responsive Design**
- Works on mobile and desktop
- Touch-friendly interface
- Adaptive text sizing

## Component Props

```javascript
<FileUpload
  onFileSelect={handleFileSelect}    // Required: Success callback
  onError={handleError}              // Optional: Error callback  
  disabled={false}                   // Optional: Disable upload
  accept=".csv,.xlsx"                // Optional: File types
  maxSize={5242880}                  // Optional: Size limit (bytes)
  className=""                       // Optional: Additional CSS classes
/>
```

### Props Details

**`onFileSelect(file: File)`** *(required)*
- Called when file passes validation
- Receives the validated File object
- Use this to process the uploaded file

**`onError(error: Object)`** *(optional)*
- Called when validation fails
- Receives formatted error object from error handler
- Use for custom error handling/logging

**`disabled: boolean`** *(optional, default: false)*
- Disables all upload functionality
- Shows disabled styling
- Prevents drag/drop and click events

**`accept: string`** *(optional, default: ".csv,.xlsx")*
- File types to accept in file picker
- Doesn't affect drag/drop validation
- Uses file extension format

**`maxSize: number`** *(optional, default: 5MB)*
- Maximum file size in bytes
- Default: 5,242,880 bytes (5MB)
- Validated for all upload methods

**`className: string`** *(optional)*
- Additional CSS classes for root container
- Useful for custom spacing/styling
- Doesn't override component styles

## Component States

### 1. Idle State (Default)
```
┌─────────────────────────────────┐
│           📤                    │
│                                 │
│     Upload your data file       │
│                                 │
│  Drag and drop or click to      │
│           browse                │
│                                 │
│  Supports CSV and Excel files   │
│         up to 5 MB             │
└─────────────────────────────────┘
```

### 2. Drag Active State
```
┌─────────────────────────────────┐ ← Blue border, scale up
│           📤                    │
│                                 │
│     Drop your file here         │
│                                 │
│  [Visual feedback: blue glow]   │
│                                 │
└─────────────────────────────────┘
```

### 3. Uploading State
```
┌─────────────────────────────────┐
│           🔄                    │
│                                 │
│     Uploading file...           │
│                                 │
│  ████████░░░░░░░░░░░░░░░  73%   │
│                                 │
└─────────────────────────────────┘
```

### 4. Success State
```
┌─────────────────────────────────┐ ← Green border
│           ✅                    │
│                                 │
│  File uploaded successfully!    │
│                                 │
│      sales_data.csv             │
│         1.2 MB                  │
└─────────────────────────────────┘
```

### 5. Error State
```
┌─────────────────────────────────┐ ← Red border
│           📄                    │
│                                 │
│   Unsupported File Type         │
│                                 │
│ "document.pdf" is not supported │
│                                 │
│ How to fix:                     │
│ • Save as CSV file              │
│ • Export as Excel format        │
│ • Check file extension          │
│                                 │
│        [Try again]              │
└─────────────────────────────────┘
```

## Usage Examples

### Basic Usage

```javascript
import FileUpload from './components/FileUpload.jsx';

const MyComponent = () => {
  const handleFileSelect = (file) => {
    console.log('File uploaded:', file.name);
    // Process the file (parse, validate data, etc.)
  };

  const handleError = (error) => {
    console.error('Upload failed:', error.message);
    // Handle error (show notification, log, etc.)
  };

  return (
    <div>
      <h2>Upload Your Data</h2>
      <FileUpload 
        onFileSelect={handleFileSelect}
        onError={handleError}
      />
    </div>
  );
};
```

### Advanced Usage with State Management

```javascript
import React, { useState } from 'react';
import FileUpload from './components/FileUpload.jsx';

const DataProcessor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processFile = async (uploadedFile) => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse the file
      const data = await parseFile(uploadedFile);
      
      // Validate data
      const validation = validateData(data);
      
      if (!validation.isValid) {
        throw new Error('Invalid data format');
      }
      
      setFile({
        original: uploadedFile,
        data: data,
        validation: validation
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileUpload
        onFileSelect={processFile}
        onError={(error) => setError(error.message)}
        disabled={loading}
      />
      
      {loading && <div>Processing file...</div>}
      {error && <div className="error">{error}</div>}
      {file && <div>File ready: {file.original.name}</div>}
    </div>
  );
};
```

### Custom Validation

```javascript
const CustomUpload = () => {
  const validateCustom = (file) => {
    // Additional custom validation
    if (file.name.includes('test')) {
      return {
        type: 'custom-error',
        message: 'Test files not allowed in production'
      };
    }
    return null; // Valid
  };

  const handleFileSelect = (file) => {
    const customError = validateCustom(file);
    if (customError) {
      handleError(customError);
      return;
    }
    
    // File is valid, process it
    processFile(file);
  };

  return (
    <FileUpload
      onFileSelect={handleFileSelect}
      maxSize={1024 * 1024} // 1MB limit
    />
  );
};
```

## Error Handling

The component integrates with our centralized error handler and provides specific error messages for each scenario:

### File Type Errors
- **Trigger**: Upload .pdf, .doc, .txt, etc.
- **Message**: "Unsupported File Type"
- **Solutions**: Convert to CSV/Excel, check extension

### File Size Errors
- **Trigger**: Upload file > 5MB
- **Message**: "File Too Large" 
- **Solutions**: Compress, split, use CSV format

### Empty File Errors
- **Trigger**: Upload 0-byte file
- **Message**: "Empty File"
- **Solutions**: Check file content, verify save process

### Processing Errors
- **Trigger**: JavaScript errors during upload
- **Message**: "File Processing Error"
- **Solutions**: Re-save file, check format

## Styling & Customization

### CSS Classes

The component uses these CSS classes for styling:

```css
.file-upload-component          /* Root container */
.file-upload-component .border-dashed  /* Upload area border */
.file-upload-component .bg-gray-50     /* Default background */
.file-upload-component .bg-blue-50     /* Drag active background */
.file-upload-component .bg-red-50      /* Error background */
.file-upload-component .bg-green-50    /* Success background */
```

### State-Based Styling

The component automatically applies appropriate styles based on state:

- **Idle**: Gray border, subtle hover effects
- **Drag Active**: Blue border, scale transform, shadow
- **Error**: Red border and background
- **Success**: Green border and background
- **Disabled**: Reduced opacity, no-drop cursor

### Custom Styling

```javascript
// Add custom wrapper styling
<FileUpload 
  className="my-4 max-w-md mx-auto"
  onFileSelect={handleFile}
/>

// Override default styles with CSS
.file-upload-component {
  border-radius: 16px;
}

.file-upload-component .border-dashed {
  border-width: 3px;
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Focus the upload area
- **Enter/Space**: Open file picker
- **Escape**: Clear focus (native behavior)

### Screen Reader Support
- Upload area labeled as "File upload area"
- Progress announced during upload
- Error messages read automatically
- Success confirmations announced

### Focus Management
- Visible focus indicator
- Logical tab order
- Focus preserved during state changes

## Integration with Other Components

### With Error Display Component
```javascript
const [errors, setErrors] = useState([]);

<FileUpload 
  onError={(error) => setErrors([...errors, error])}
/>
<ErrorDisplay errors={errors} />
```

### With Chart Type Selector
```javascript
const [file, setFile] = useState(null);

<FileUpload onFileSelect={setFile} />
<ChartTypeSelector 
  disabled={!file}
  data={file?.data}
/>
```

### With Progress Tracking
```javascript
const [uploadState, setUploadState] = useState('idle');

<FileUpload 
  onFileSelect={(file) => {
    setUploadState('processing');
    processFile(file).then(() => {
      setUploadState('complete');
    });
  }}
/>
```

## Performance Considerations

- **File Size Validation**: Checked immediately, no reading large files
- **Memory Efficient**: Only stores File object, not contents
- **Debounced Animations**: Smooth transitions without performance issues
- **Event Cleanup**: Proper cleanup of event listeners

## Browser Compatibility

- **Modern Browsers**: Full drag/drop support
- **Older Browsers**: Graceful fallback to file picker
- **Mobile**: Touch-optimized interface
- **Safari**: Tested file handling edge cases

## Testing

The component has been tested with:
- ✅ Valid CSV files
- ✅ Valid Excel files (.xlsx)
- ✅ Invalid file types (.pdf, .doc, .txt)
- ✅ Oversized files (>5MB)
- ✅ Empty files (0 bytes)
- ✅ Drag and drop functionality
- ✅ Click to browse functionality
- ✅ Keyboard navigation
- ✅ Error recovery flows
- ✅ Multiple upload attempts
- ✅ File picker reset behavior

The FileUpload component provides a complete, production-ready file upload solution that ensures excellent user experience while maintaining data integrity through comprehensive validation. 