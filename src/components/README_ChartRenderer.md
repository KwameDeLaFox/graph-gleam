# ChartRenderer Component

Professional chart rendering component powered by Chart.js v4 with full data transformation and export capabilities.

## Overview

The ChartRenderer component provides a complete charting solution that transforms raw data into beautiful, interactive charts. It supports all major chart types, handles responsive design, includes export functionality, and integrates seamlessly with our data processing pipeline.

## Features

📊 **Complete Chart.js v4 Integration**
- All chart types: Bar, Line, Pie, Area charts
- Professional styling and theming
- Interactive tooltips and legends
- Responsive and mobile-friendly

🔄 **Intelligent Data Transformation**
- Automatic column type detection
- Smart data mapping for each chart type
- Handles mixed data types gracefully
- Supports up to 8 data series

🎨 **Beautiful Visual Design**
- Professional color schemes
- Smooth animations and transitions
- Light/dark theme support
- Customizable styling options

💾 **Export Functionality**
- PNG and JPEG image export
- High-quality canvas rendering
- Custom filename generation
- Embed code generation

⚡ **Performance & Reliability**
- Proper Chart.js instance cleanup
- Memory leak prevention
- Error handling with recovery
- Loading states and feedback

♿ **Accessibility & UX**
- Responsive design for all screen sizes
- Clear error messages
- Loading indicators
- Screen reader compatible

## Component Props

```javascript
<ChartRenderer
  data={parsedData}                    // Required: Array of data objects
  chartType="bar"                      // Required: Chart type (bar/line/pie/area)
  title="My Chart"                     // Optional: Chart title
  width={800}                          // Optional: Fixed width (px)
  height={400}                         // Optional: Fixed height (px)
  responsive={true}                    // Optional: Responsive behavior
  theme="light"                        // Optional: Light or dark theme
  onError={handleError}                // Optional: Error callback
  onRenderComplete={handleComplete}    // Optional: Render completion callback
  className="custom-class"             // Optional: Additional CSS classes
  ref={chartRef}                       // Optional: Ref for export methods
/>
```

### Props Details

**`data: Array`** *(required)*
- Array of objects from CSV/Excel parsers
- Format: `[{ column1: value1, column2: value2 }, ...]`
- Automatically detects numeric vs categorical columns

**`chartType: string`** *(required)*
- Chart type: `'bar'`, `'line'`, `'pie'`, or `'area'`
- Determines data transformation and Chart.js configuration
- Each type optimized for specific data patterns

**`title: string`** *(optional)*
- Chart title displayed at top
- Supports responsive font sizing
- Theme-aware color styling

**`width: number`** *(optional, default: 800)*
- Fixed width in pixels
- Ignored when `responsive={true}`
- Useful for specific layout requirements

**`height: number`** *(optional, default: 400)*
- Fixed height in pixels
- Used as minimum height when responsive
- Maintains aspect ratio

**`responsive: boolean`** *(optional, default: true)*
- Enables responsive behavior
- Adapts to container size
- Handles window resize events

**`theme: string`** *(optional, default: 'light')*
- Color theme: `'light'` or `'dark'`
- Affects text, grid, and background colors
- Consistent with app theming

**`themeId: string`** *(optional, default: 'corporate')*
- Theme identifier: `'corporate'`, `'pastel-fun'`, `'high-contrast'`
- Applies custom color schemes to chart
- Scoped to chart container only
- Overrides default theme colors

**`onError: Function`** *(optional)*
- Called when rendering fails
- Signature: `(error) => void`
- Use for custom error handling

**`onRenderComplete: Function`** *(optional)*
- Called when chart renders successfully
- Signature: `({ chartInstance, chartData, config }) => void`
- Access to Chart.js instance and metadata

**`className: string`** *(optional)*
- Additional CSS classes for container
- Useful for custom styling
- Doesn't override component styles

## Chart Types & Data Requirements

### Bar Chart (📊)
```javascript
// Best for: Category comparisons, rankings, discrete data
{
  data: [
    { Category: 'Sales', Value: 1200 },
    { Category: 'Marketing', Value: 800 },
    { Category: 'Support', Value: 600 }
  ],
  chartType: 'bar'
}
```

**Features:**
- Multiple data series support (up to 8)
- Automatic value formatting (1,200)
- Category-based grouping
- Horizontal hover interactions

### Line Chart (📈)
```javascript
// Best for: Trends over time, continuous data
{
  data: [
    { Month: 'Jan', Sales: 1200, Expenses: 800 },
    { Month: 'Feb', Sales: 1500, Expenses: 900 },
    { Month: 'Mar', Sales: 1800, Expenses: 950 }
  ],
  chartType: 'line'
}
```

**Features:**
- Smooth curve tensions (0.4)
- Interactive point markers
- Time series optimization
- Multiple line series

### Pie Chart (🥧)
```javascript
// Best for: Proportions, percentages, parts of whole
{
  data: [
    { Category: 'Desktop', Users: 2400 },
    { Category: 'Mobile', Users: 3600 },
    { Category: 'Tablet', Users: 1200 }
  ],
  chartType: 'pie'
}
```

**Features:**
- Automatic percentage calculations
- Legend with color coding
- Right-side legend positioning
- Optimal for 2-8 categories

### Area Chart (📈)
```javascript
// Best for: Cumulative values, volume over time
{
  data: [
    { Month: 'Jan', Revenue: 1200, Costs: 800 },
    { Month: 'Feb', Revenue: 1500, Costs: 900 },
    { Month: 'Mar', Revenue: 1800, Costs: 950 }
  ],
  chartType: 'area'
}
```

**Features:**
- Semi-transparent fill areas
- Stacked visualization option
- Time series optimization
- Gradient fill effects

## Data Transformation Logic

### Automatic Column Detection
```javascript
// Input data example
const data = [
  { Month: 'Jan', Sales: 1200, Region: 'North', Active: true },
  { Month: 'Feb', Sales: 1500, Region: 'South', Active: false }
];

// Automatic detection:
// numericColumns: ['Sales'] 
// categoricalColumns: ['Month', 'Region', 'Active']
// labels: ['Jan', 'Feb'] (from first categorical column)
```

### Chart-Specific Transformations

**Bar/Line/Area Charts:**
- X-axis: First categorical column or row indices
- Y-axis: All numeric columns (up to 8 series)
- Colors: Automatic from DEFAULT_COLORS palette
- Labels: Column names as dataset labels

**Pie Charts:**
- Labels: Values from first categorical column
- Data: Values from first numeric column
- Colors: Automatic color assignment
- Single series only

### Color Management
```javascript
// Automatic color assignment from constants
DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // green-500
  '#F59E0B', // yellow-500
  '#8B5CF6', // purple-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16'  // lime-500
];
```

## Export Functionality

### Using Ref Methods
```javascript
const chartRef = useRef(null);

// Export as PNG
const exportPNG = () => {
  if (chartRef.current) {
    chartRef.current.exportChart('png', 'my-chart');
  }
};

// Export as JPEG
const exportJPEG = () => {
  if (chartRef.current) {
    chartRef.current.exportChart('jpeg', 'my-chart');
  }
};

// Get Chart.js instance
const getChart = () => {
  return chartRef.current.getChartInstance();
};

// Manual re-render
const rerender = () => {
  chartRef.current.renderChart();
};
```

### Export Methods Available

**`exportChart(format, filename)`**
- Formats: `'png'`, `'jpeg'`
- Generates downloadable file
- Returns data URL

**`getChartInstance()`**
- Returns Chart.js instance
- Access to full Chart.js API
- For advanced customizations

**`renderChart()`**
- Manually trigger re-render
- Useful for dynamic updates
- Handles cleanup automatically

**`cleanup()`**
- Destroys Chart.js instance
- Prevents memory leaks
- Automatic on unmount

## Usage Examples

### Basic Usage
```javascript
import ChartRenderer from './components/ChartRenderer.jsx';

const MyChart = () => {
  const data = [
    { Month: 'Jan', Sales: 1200 },
    { Month: 'Feb', Sales: 1500 },
    { Month: 'Mar', Sales: 1800 }
  ];

  return (
    <ChartRenderer
      data={data}
      chartType="bar"
      title="Monthly Sales"
      responsive={true}
    />
  );
};
```

### With Export Functionality
```javascript
const ExportableChart = () => {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);

  const handleExport = () => {
    if (chartRef.current) {
      chartRef.current.exportChart('png', 'sales-chart');
    }
  };

  return (
    <div>
      <ChartRenderer
        ref={chartRef}
        data={data}
        chartType="line"
        title="Sales Trends"
        onRenderComplete={(info) => {
          console.log('Chart rendered:', info);
        }}
        onError={(error) => {
          console.error('Chart error:', error);
        }}
      />
      
      <button onClick={handleExport}>
        Export Chart
      </button>
    </div>
  );
};
```

### With Error Handling
```javascript
const RobustChart = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (error) => {
    setError(error.message);
    setIsLoading(false);
  };

  const handleComplete = () => {
    setError(null);
    setIsLoading(false);
  };

  if (error) {
    return <div className="error">Chart Error: {error}</div>;
  }

  return (
    <ChartRenderer
      data={data}
      chartType="pie"
      onError={handleError}
      onRenderComplete={handleComplete}
      className="my-chart"
    />
  );
};
```

### Integration with File Upload Flow
```javascript
const FullWorkflow = () => {
  const [parsedData, setParsedData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const chartRef = useRef(null);

  const handleFileUpload = async (file) => {
    // Parse file
    const result = await parseCSV(file);
    if (result.success) {
      setParsedData(result.data);
    }
  };

  return (
    <div>
      <FileUpload onFileSelect={handleFileUpload} />
      
      <ChartTypeSelector 
        onChartTypeSelect={setChartType}
        data={parsedData}
      />
      
      {parsedData && (
        <ChartRenderer
          ref={chartRef}
          data={parsedData}
          chartType={chartType}
          title={`Data Visualization - ${chartType}`}
          responsive={true}
        />
      )}
    </div>
  );
};
```

## Styling & Customization

### CSS Classes
```css
.chart-renderer                    /* Root container */
.chart-renderer canvas             /* Chart canvas element */
.chart-renderer-error             /* Error state container */
```

### Theme Customization
```javascript
// Light theme (default)
<ChartRenderer theme="light" data={data} chartType="bar" />

// Dark theme
<ChartRenderer theme="dark" data={data} chartType="bar" />

// Custom theme with themeId
<ChartRenderer 
  themeId="corporate" 
  data={data} 
  chartType="bar" 
/>

// Pastel fun theme
<ChartRenderer 
  themeId="pastel-fun" 
  data={data} 
  chartType="line" 
/>

// High contrast theme for accessibility
<ChartRenderer 
  themeId="high-contrast" 
  data={data} 
  chartType="bar" 
/>
```

### Available Themes

**Corporate Theme** (`themeId="corporate"`)
- Professional blues and grays
- Perfect for business presentations
- Clean, formal appearance

**Pastel Fun Theme** (`themeId="pastel-fun"`)
- Soft pastels and bright accents
- Great for creative projects
- Playful, colorful appearance

**High Contrast Theme** (`themeId="high-contrast"`)
- High contrast black, white, and bright colors
- Ideal for accessibility
- Bold, clear appearance

### Theme Integration with ThemeSelector

```javascript
import React, { useState } from 'react';
import ChartRenderer from './ChartRenderer';
import ThemeSelector from './ThemeSelector';

function ChartWithTheme() {
  const [selectedTheme, setSelectedTheme] = useState('corporate');
  const [chartData, setChartData] = useState(/* your data */);

  return (
    <div>
      <ChartRenderer 
        data={chartData}
        chartType="bar"
        themeId={selectedTheme}
      />
      
      <ThemeSelector 
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
      />
    </div>
  );
}
```

### Responsive Behavior
```javascript
// Full responsive (recommended)
<ChartRenderer responsive={true} height={400} />

// Fixed size
<ChartRenderer responsive={false} width={800} height={400} />

// Container-constrained
<div style={{ width: '100%', height: '500px' }}>
  <ChartRenderer responsive={true} />
</div>
```

## Error Handling

### Common Error Scenarios

**No Data Provided:**
```javascript
// Error: "No data provided for chart rendering"
<ChartRenderer data={[]} chartType="bar" />
```

**No Numeric Columns:**
```javascript
// Error: "No numeric columns found for charting"
const textOnlyData = [
  { name: 'John', city: 'NYC' },
  { name: 'Jane', city: 'LA' }
];
<ChartRenderer data={textOnlyData} chartType="bar" />
```

**Unsupported Chart Type:**
```javascript
// Error: "Unsupported chart type: scatter"
<ChartRenderer data={data} chartType="scatter" />
```

### Error Recovery
```javascript
const handleError = (error) => {
  console.error('Chart error:', error);
  
  // Show user-friendly message
  setErrorMessage(getUserFriendlyErrorMessage(error));
  
  // Optional: Fallback to different chart type
  if (error.message.includes('numeric columns')) {
    setChartType('bar'); // Try different type
  }
};
```

## Performance Considerations

- **Memory Management**: Automatic Chart.js instance cleanup
- **Resize Handling**: Efficient resize event debouncing
- **Data Processing**: Optimized column detection algorithms
- **Rendering**: Canvas-based for smooth animations
- **Export**: High-quality image generation

## Browser Compatibility

- **Modern Browsers**: Full Chart.js v4 support
- **Canvas Support**: Required for chart rendering
- **Export**: HTML5 canvas toDataURL support
- **Mobile**: Touch-optimized interactions

## Integration Points

### With Data Validator
```javascript
// Validator provides chart suggestions
const validation = validateDataForCharting(data);
if (validation.isValid) {
  // Use recommended chart type
  const bestChart = validation.suggestions[0];
  return (
    <ChartRenderer 
      data={data} 
      chartType={bestChart.chartType}
      title={`Recommended: ${bestChart.reason}`}
    />
  );
}
```

### With Error Handler
```javascript
import { getUserFriendlyError } from '../utils/error-handler.js';

const handleChartError = (error) => {
  const friendlyError = getUserFriendlyError(error);
  // Display user-friendly error message
};
```

### With File Parsers
```javascript
// Direct integration with parser output
const csvResult = await parseCSV(file);
if (csvResult.success) {
  return (
    <ChartRenderer 
      data={csvResult.data}
      chartType="bar"
      title={csvResult.meta.filename}
    />
  );
}
```

## Advanced Features

### Chart.js Instance Access
```javascript
// Access full Chart.js API
const chart = chartRef.current.getChartInstance();

// Update data dynamically
chart.data.datasets[0].data = newData;
chart.update();

// Add custom plugins
chart.options.plugins.customPlugin = { /* config */ };
```

### Custom Styling
```javascript
// Override default colors
const customColors = ['#FF6384', '#36A2EB', '#FFCE56'];

// Custom configuration via Chart.js instance
useEffect(() => {
  if (chartRef.current) {
    const chart = chartRef.current.getChartInstance();
    chart.data.datasets.forEach((dataset, i) => {
      dataset.backgroundColor = customColors[i];
    });
    chart.update();
  }
}, [chartRef.current]);
```

The ChartRenderer component provides a complete, production-ready charting solution that transforms raw data into beautiful, interactive visualizations while maintaining excellent performance and user experience. 