# Graph Gleam - Development Rules & Workflow

## Table of Contents
1. [Tech Stack Guidelines](#tech-stack-guidelines)
2. [Task Breakdown Methodology](#task-breakdown-methodology)
3. [Error Handling Patterns](#error-handling-patterns)
4. [Code Organization](#code-organization)
5. [Component Structure](#component-structure)
6. [State Management](#state-management)
7. [File Naming Conventions](#file-naming-conventions)
8. [Testing Strategy](#testing-strategy)
9. [Performance Guidelines](#performance-guidelines)
10. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
11. [Lessons Learned](#lessons-learned)

---

## Tech Stack Guidelines

### React + Vite
- **Use functional components only** - no class components
- **Prefer React hooks** - useState, useEffect, useCallback, useMemo
- **Vite for fast development** - leverage HMR, use ES modules
- **TypeScript optional** - start with JS, can migrate later if needed

### Tailwind CSS
- **Mobile-first approach** - start with base styles, add `sm:`, `md:`, `lg:` breakpoints
- **Use Tailwind utilities over custom CSS** - avoid writing custom styles unless absolutely necessary
- **Component-level styling** - group related utilities together
- **Consistent spacing scale** - stick to Tailwind's spacing (4, 8, 16, 24, 32...)

### Chart.js v4
- **Tree-shake imports** - only import needed chart types and components
- **Use Chart.register()** - explicitly register chart types and plugins
- **Responsive by default** - set `responsive: true` and `maintainAspectRatio: false`
- **Clean up charts** - destroy chart instances to prevent memory leaks

### File Parsing
- **papaparse for CSV** - use `Papa.parse()` with error handling
- **xlsx for Excel** - use `XLSX.read()` and `XLSX.utils.sheet_to_json()`
- **Validate data immediately** - check for numeric columns, empty data
- **Stream large files** - use worker threads if files > 1MB

---

## Task Breakdown Methodology

### 1. Feature-Level Tasks (Epic)
Break major features into 3-5 smaller tasks:
```
Epic: File Upload System
├── Task 1: Basic drag-drop UI component
├── Task 2: File validation and error handling  
├── Task 3: CSV parsing integration
├── Task 4: Excel parsing integration
└── Task 5: Sample data loader
```

### 2. Task Sizing Rules
- **Small Task**: 1-2 hours, single component or utility
- **Medium Task**: 3-6 hours, component + integration + testing
- **Large Task**: 6+ hours, multiple components or complex logic

### 3. Task Dependency Order
1. **Core Infrastructure** - setup, routing, basic layout
2. **Data Layer** - parsing, validation, state management
3. **UI Components** - individual components, no integration
4. **Integration** - connect components to data layer
5. **Polish** - styling, error states, loading states

### 4. Definition of Done
Each task must include:
- [ ] Functional code implementation
- [ ] Error handling for edge cases
- [ ] Responsive design (mobile + desktop)
- [ ] Console error-free
- [ ] Matches PRD requirements

---

## Error Handling Patterns

### 1. File Upload Errors
```javascript
// Pattern: Consistent error structure
const handleFileError = (error, filename) => {
  const errorMap = {
    'size': `File "${filename}" is too large (max 5MB)`,
    'type': `File "${filename}" format not supported. Use CSV or Excel.`,
    'parse': `Unable to parse "${filename}". Check file format.`,
    'empty': `File "${filename}" appears to be empty.`,
    'no-numeric': `No numeric data found in "${filename}". Charts need numbers.`
  };
  
  return {
    type: error.type,
    message: errorMap[error.type] || 'Unknown error occurred',
    action: error.type === 'no-numeric' ? 'show-example' : 'try-again'
  };
};
```

### 2. Chart Rendering Errors
```javascript
// Pattern: Graceful degradation
const renderChart = (data, type) => {
  try {
    // Chart rendering logic
  } catch (error) {
    console.error('Chart render failed:', error);
    return {
      success: false,
      message: 'Unable to create chart. Please try a different chart type.',
      fallback: 'table' // Show data table instead
    };
  }
};
```

### 3. User-Facing Error Messages
- **Always actionable** - tell user what to do next
- **Specific, not generic** - avoid "Something went wrong"
- **Include context** - mention filename, data type, etc.
- **Provide alternatives** - suggest sample data, different format

---

## Code Organization

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   ├── charts/         # Chart-specific components
│   └── upload/         # File upload components
├── hooks/              # Custom React hooks
├── utils/              # Pure utility functions
│   ├── parsers/        # File parsing logic
│   ├── validators/     # Data validation
│   └── formatters/     # Data formatting
├── data/               # Sample data and constants
├── styles/             # Global CSS (minimal)
└── App.jsx             # Main app component
```

### Import Order
```javascript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js';

// 2. Internal utilities and hooks
import { parseCSV } from '../utils/parsers';
import { useFileUpload } from '../hooks';

// 3. Components (ui first, then features)
import { Button, Input } from '../components/ui';
import { ChartRenderer } from '../components/charts';

// 4. Constants and data
import { SAMPLE_DATA } from '../data/samples';
```

---

## Component Structure

### Standard Component Pattern
```javascript
// ComponentName.jsx
import React, { useState } from 'react';

const ComponentName = ({ 
  prop1, 
  prop2, 
  onAction,
  className = '' 
}) => {
  // 1. State declarations
  const [localState, setLocalState] = useState(null);
  
  // 2. Event handlers
  const handleAction = (data) => {
    // Validation
    if (!data) return;
    
    // Action
    setLocalState(data);
    onAction?.(data);
  };
  
  // 3. Render helpers (if needed)
  const renderContent = () => {
    if (!localState) return <EmptyState />;
    return <ContentView data={localState} />;
  };
  
  // 4. Main render
  return (
    <div className={`base-styles ${className}`}>
      {renderContent()}
    </div>
  );
};

export default ComponentName;
```

### Component Naming
- **PascalCase** for components: `FileUploader`, `ChartRenderer`
- **camelCase** for functions: `handleFileUpload`, `parseCSVData`
- **UPPER_CASE** for constants: `MAX_FILE_SIZE`, `SUPPORTED_TYPES`

---

## State Management

### Simple State Strategy
- **Local component state** for UI-only data (loading, errors, form inputs)
- **Lifted state** for shared data (parsed data, chart config)
- **No external state library** for MVP - keep it simple

### State Lifting Pattern
```javascript
// App.jsx - Main state container
const App = () => {
  const [uploadedData, setUploadedData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [error, setError] = useState(null);
  
  return (
    <div>
      <FileUploader 
        onDataLoaded={setUploadedData}
        onError={setError}
      />
      <ChartTypeSelector 
        value={chartType}
        onChange={setChartType}
        disabled={!uploadedData}
      />
      <ChartRenderer 
        data={uploadedData}
        type={chartType}
      />
    </div>
  );
};
```

---

## File Naming Conventions

### Components
- `ComponentName.jsx` - React components
- `index.js` - Re-export multiple components from directory

### Utilities
- `kebab-case.js` - utility functions: `csv-parser.js`, `data-validator.js`
- `camelCase` for function names inside files

### Assets
- `kebab-case` for all assets: `sales-sample.csv`, `expense-breakdown.xlsx`

### Directories
- `lowercase` - all directory names: `components`, `utils`, `hooks`

---

## Testing Strategy

### Manual Testing Checklist
For each component/feature:
- [ ] **Happy path** - normal usage works
- [ ] **Edge cases** - empty data, malformed files, huge files
- [ ] **Error states** - proper error messages show
- [ ] **Responsive** - works on mobile and desktop
- [ ] **Browser compatibility** - Chrome, Firefox, Safari, Edge

### File Testing Matrix
| File Type | Size | Data Type | Expected Result |
|-----------|------|-----------|-----------------|
| CSV | <1MB | Mixed text/numbers | ✅ Chart renders |
| CSV | >5MB | Any | ❌ Size error |
| CSV | <1MB | All text | ❌ No numeric data error |
| Excel | <1MB | Mixed text/numbers | ✅ Chart renders |
| Excel | Corrupted | Any | ❌ Parse error |

---

## Performance Guidelines

### File Processing
- **Show loading states** for files >100KB
- **Process in chunks** for files >1MB
- **Debounce chart updates** when user changes settings
- **Cleanup chart instances** to prevent memory leaks

### Chart Rendering
- **Limit data points** - sample large datasets to 1000 points max
- **Use Chart.js animation: false** for large datasets
- **Destroy and recreate** charts instead of updating for type changes

### Bundle Size
- **Tree-shake Chart.js** - only import needed chart types
- **Lazy load** sample data files
- **Use Vite's code splitting** for chart types if bundle gets large

---

## Common Pitfalls to Avoid

### 1. File Parsing Issues
❌ **Don't assume** CSV always uses commas  
✅ **Do detect** delimiter and handle different formats

❌ **Don't parse** entire file into memory for large files  
✅ **Do stream** and sample large files

### 2. Chart.js Gotchas
❌ **Don't forget** to destroy chart instances  
✅ **Do cleanup** in useEffect return or component unmount

❌ **Don't mutate** chart data directly  
✅ **Do create** new data objects for updates

### 3. React Patterns
❌ **Don't use** array indices as keys for dynamic lists  
✅ **Do use** stable unique identifiers

❌ **Don't update** state directly  
✅ **Do use** functional updates for complex state

### 4. Error Handling
❌ **Don't show** technical error messages to users  
✅ **Do provide** actionable, user-friendly messages

❌ **Don't fail silently**  
✅ **Do log** errors to console for debugging

---

## Lessons Learned

### 🚨 CRITICAL: ES Modules vs CommonJS Configuration

**Problem Encountered (2025-01-18):**
```
Failed to load PostCSS config: module is not defined in ES module scope
```

**Root Cause:**
- Vite projects with `"type": "module"` in package.json treat all .js files as ES modules
- Using `module.exports` (CommonJS syntax) in config files causes errors
- Need consistent module syntax throughout project

**Solution Pattern:**
```javascript
// ❌ WRONG - CommonJS in ES module project
module.exports = {
  plugins: { tailwindcss: {} }
};

// ✅ CORRECT - ES module syntax
export default {
  plugins: { tailwindcss: {} }
};
```

**Prevention Rules:**
1. **Check package.json** - if `"type": "module"` exists, use ES module syntax everywhere
2. **Config files consistency** - tailwind.config.js, postcss.config.js, vite.config.js must all use same syntax
3. **Always test config changes** - restart dev server after config changes
4. **Debugging tip** - errors mention "rename to .cjs" which indicates CommonJS vs ES module conflict

### 🔧 Tailwind CSS Setup Best Practices

**Lessons from setup process:**
1. **Use Tailwind CSS v3.x** - v4 has different config system, stick with stable v3
2. **Install with exact versions** - `tailwindcss@^3.4.0` to avoid v4 auto-install
3. **Always restart dev server** after Tailwind config changes
4. **Test with obvious styles** - use bright colors/borders to verify CSS is working
5. **Check browser dev tools** - look for PostCSS processing in network tab

### 📝 Configuration File Debugging

**When config files fail:**
1. **Read the error message carefully** - it usually tells you exactly what's wrong
2. **Check module syntax consistency** - ES modules vs CommonJS
3. **Verify file extensions** - .js vs .cjs vs .mjs
4. **Restart the dev server** - config changes often require restart
5. **Check for typos in config** - missing commas, incorrect property names

### 🚨 Security Vulnerability: xlsx Package

**Issue Discovered (2025-01-18):**
- xlsx package has high severity vulnerabilities (Prototype Pollution, ReDoS)
- CVE advisories: GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9

**Current Risk Assessment:**
- **Low for MVP** - client-side only processing, users upload their own files
- **Must address before production** - server-side or public deployment

**Mitigation Options:**
1. **Alternative libraries** - Consider `@sheet-js/pro` or `luckysheet`
2. **Sandboxing** - Process files in Web Workers
3. **File validation** - Strict validation before processing
4. **Regular audits** - Monitor for security updates

**Action Required:**
- ✅ Document vulnerability for tracking
- ⏭️ Address before production deployment
- 🔍 Evaluate alternatives during optimization phase

### 🔧 Chart.js Canvas Management Issues (2025-01-18)

**Problem Encountered:**
```
Canvas is already in use. Chart with ID '0' must be destroyed before the canvas with ID '' can be reused.
```

**Root Cause:**
- Chart.js instances not properly cleaned up before creating new ones
- React re-renders causing multiple chart instances on same canvas
- Concurrent chart rendering without proper synchronization

**Solution Pattern:**
```javascript
// 1. Proper cleanup with error handling
const cleanup = useCallback(() => {
  if (chartInstanceRef.current) {
    try {
      chartInstanceRef.current.destroy();
    } catch (error) {
      console.warn('Chart cleanup error:', error);
    } finally {
      chartInstanceRef.current = null;
    }
  }
}, []);

// 2. Prevent concurrent renders
const isRenderingRef = useRef(false);
const renderChart = useCallback(async () => {
  if (isRenderingRef.current) return;
  isRenderingRef.current = true;
  
  try {
    cleanup();
    await new Promise(resolve => setTimeout(resolve, 10)); // Ensure cleanup completes
    // ... chart creation
  } finally {
    isRenderingRef.current = false;
  }
}, [cleanup]);

// 3. Force fresh canvas with React keys
<canvas key={`chart-${chartType}-${data?.length || 0}`} ref={canvasRef} />
```

**Prevention Rules:**
1. **Always cleanup before create** - destroy existing Chart.js instances before new ones
2. **Use render flags** - prevent concurrent chart rendering with ref flags
3. **Add async delays** - small delays ensure cleanup completes before recreation
4. **Dynamic canvas keys** - force React to create fresh canvas elements
5. **Error-wrapped cleanup** - cleanup should never throw unhandled errors

### 🚫 React Error Boundary for White Screen Prevention (2025-01-18)

**Problem Encountered:**
White screen crashes when JavaScript errors occur in React components, especially during async data loading.

**Root Cause:**
- Unhandled JavaScript errors in React components cause entire app crash
- Async operations (file loading, parsing) can throw errors that aren't caught
- Default React behavior is white screen with no recovery options

**Solution Pattern:**
```javascript
// Error Boundary Component (class component required)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackUI onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Prevention Rules:**
1. **Always wrap apps** - use Error Boundary at root level
2. **Graceful fallbacks** - provide user-friendly error UI with recovery options
3. **Log for debugging** - capture error details in development
4. **Recovery actions** - "Try Again", "Reload", "Go Home" buttons

### 🔄 Circular Dependency Resolution (2025-01-18)

**Problem Encountered:**
```
ReferenceError: Cannot access 'cleanup' before initialization
```

**Root Cause:**
- Function `renderChart` trying to use `cleanup` in dependency array before `cleanup` is defined
- JavaScript temporal dead zone - variables/functions referenced before declaration
- useCallback dependency array including undeclared functions

**Solution Pattern:**
```javascript
// ❌ WRONG - circular dependency
const renderChart = useCallback(() => {
  cleanup(); // Error: cleanup not yet defined
}, [cleanup]); // cleanup referenced in deps but not declared yet

const cleanup = useCallback(() => { ... }, []);

// ✅ CORRECT - proper declaration order
const cleanup = useCallback(() => {
  // cleanup logic
}, []);

const renderChart = useCallback(() => {
  cleanup(); // cleanup is now properly defined
}, [cleanup]); // cleanup available in dependencies
```

**Prevention Rules:**
1. **Declare dependencies first** - define functions before using them in other useCallback deps
2. **Check dependency order** - ensure all dependency array items are declared above
3. **Use ESLint rules** - enable exhaustive-deps rule to catch these issues
4. **Test in strict mode** - React StrictMode helps identify these timing issues

### 📊 Chart.js v4 Controller Registration (2025-01-18)

**Problem Encountered:**
```
"bar" is not a registered controller.
```

**Root Cause:**
- Chart.js v4 requires explicit registration of both elements AND controllers
- Missing controller imports/registration prevents chart type rendering
- Elements alone (BarElement) are not sufficient - need BarController too

**Solution Pattern:**
```javascript
// ❌ INSUFFICIENT - elements only
import { BarElement, LineElement, ArcElement } from 'chart.js';
ChartJS.register(BarElement, LineElement, ArcElement);

// ✅ COMPLETE - elements + controllers
import { 
  BarElement, LineElement, ArcElement,
  BarController, LineController, PieController, DoughnutController
} from 'chart.js';

ChartJS.register(
  BarElement, LineElement, ArcElement,
  BarController, LineController, PieController, DoughnutController
);
```

**Chart.js Registration Rules:**
1. **Import both elements and controllers** - need pairs for each chart type
2. **Register all used chart types** - missing registration = runtime errors
3. **Include scale and plugin imports** - CategoryScale, LinearScale, Tooltip, Legend
4. **Test all chart types** - verify each chart type renders after registration

### 🛡️ Robust Async Data Loading (2025-01-18)

**Problem Encountered:**
Sample data loading causing app crashes due to unhandled fetch/parse errors.

**Solution Pattern:**
```javascript
const handleLoadSampleData = async (sampleType) => {
  // 1. Prevent concurrent loads
  if (isProcessing) return;

  try {
    // 2. Validate inputs
    if (!['csv', 'excel'].includes(sampleType)) {
      throw new Error(`Invalid sample type: ${sampleType}`);
    }

    // 3. Nested try-catch for different error types
    let sampleResult;
    try {
      sampleResult = await loadSample(sampleType);
    } catch (loadError) {
      throw new Error(`Unable to load ${sampleType.toUpperCase()} sample data`);
    }

    // 4. Validate data structure
    if (!sampleResult?.data?.length) {
      throw new Error('Sample data is empty or invalid');
    }

    // 5. Process through validation pipeline
    const validation = validateDataForCharting(sampleResult.data);
    if (!validation?.isValid) {
      throw new Error('Sample data validation failed');
    }

    // 6. Atomic state updates
    setUploadedFile(mockFile);
    setParsedData(sampleResult.data);
    setChartSuggestions(validation.suggestions);
    setSelectedChartType(validation.suggestions[0]?.chartType);

  } catch (error) {
    // 7. User-friendly error handling
    setError(getUserFriendlyMessage(error));
    resetState();
  } finally {
    setIsProcessing(false);
  }
};
```

**Async Error Handling Rules:**
1. **Validate inputs early** - check parameters before async operations
2. **Nested try-catch** - different error types need different handling
3. **Validate all async results** - never assume fetch/parse succeeded
4. **Atomic state updates** - update all related state together
5. **Always reset processing flags** - use finally blocks for cleanup

---

## Development Workflow

### 1. Before Starting a Task
- [ ] Review PRD requirements for this feature
- [ ] Check this rules file for relevant patterns
- [ ] Plan component structure and state flow
- [ ] Identify potential error scenarios

### 2. During Development
- [ ] Follow established patterns from this file
- [ ] Test error cases as you build
- [ ] Keep components small and focused
- [ ] Add console.logs for debugging, remove before commit

### 3. Task Completion
- [ ] Test happy path and error cases
- [ ] Check responsive design
- [ ] Verify no console errors
- [ ] Update this rules file if new patterns emerge

### 4. When Encountering Errors
- [ ] **Document the problem** in this file under "Lessons Learned"
- [ ] **Include the exact error message** for future reference
- [ ] **Explain the root cause** not just the fix
- [ ] **Provide prevention rules** to avoid repeating the issue

---

## Questions to Ask When Stuck

1. **Does this pattern exist elsewhere in the codebase?**
2. **What error cases am I not handling?**
3. **Is this component doing too many things?**
4. **Will this work on mobile?**
5. **What happens if the data is malformed/empty/huge?**
6. **Am I following the established file naming conventions?**
7. **Does this match the PRD requirements?**
8. **Is this an ES modules vs CommonJS issue?** ⭐ NEW
9. **Have I restarted the dev server after config changes?** ⭐ NEW

---

*This file should be updated as we discover new patterns and solve new problems during development.* 