# ChartTypeSelector Component

Smart chart type selector with AI-powered recommendations and beautiful visual previews.

## Overview

The ChartTypeSelector component provides an intelligent chart type selection interface that analyzes your data and recommends the most suitable chart types with confidence scores. It features beautiful visual previews, interactive states, and seamless integration with our data validation system.

## Features

🧠 **Smart Recommendations**
- Data-driven chart suggestions with confidence scores
- Automatically sorts chart types by suitability
- Explains why each chart type is recommended
- Disables inappropriate chart types with explanations

🎨 **Beautiful Visual Previews**
- Mini chart visualizations for each type
- Interactive hover effects with tooltips
- Confidence badges (90%+ green, 75%+ blue, etc.)
- Selected state indicators with checkmarks

📊 **Chart Type Support**
- **Bar Charts** (📊): Category comparisons
- **Line Charts** (📈): Trends over time  
- **Pie Charts** (🥧): Proportions and percentages
- **Area Charts** (📈): Cumulative data over time

♿ **Accessibility & UX**
- Full keyboard navigation (Tab, Enter, Space)
- ARIA labels and screen reader support
- Clear disabled states with explanations
- Responsive design for all screen sizes

⚡ **Performance Optimized**
- Memoized chart option calculations
- Efficient re-renders on data changes
- Lightweight SVG chart previews
- Smart state management

## Component Props

```javascript
<ChartTypeSelector
  suggestions={chartSuggestions}        // Required: Array from data validator
  selectedChartType={selectedType}      // Optional: Currently selected type
  onChartTypeSelect={handleSelection}   // Required: Selection callback
  disabled={false}                      // Optional: Disable all interactions
  showConfidence={true}                 // Optional: Show confidence badges
  className=""                          // Optional: Additional CSS classes
/>
```

### Props Details

**`suggestions: Array`** *(required)*
- Chart recommendations from data validator
- Format: `[{ chartType: 'bar', confidence: 90, reason: '...' }]`
- Empty array shows disabled state

**`selectedChartType: string`** *(optional)*
- Currently selected chart type ('bar', 'line', 'pie', 'area')
- null for no selection
- Updates visual selection state

**`onChartTypeSelect: Function`** *(required)*
- Called when user selects a chart type
- Signature: `(chartType, metadata) => void`
- Metadata includes confidence, reason, recommendation object

**`disabled: boolean`** *(optional, default: false)*
- Disables all chart options
- Shows "No data uploaded" state
- Prevents interactions

**`showConfidence: boolean`** *(optional, default: true)*
- Show/hide confidence percentage badges
- Useful for simpler interfaces
- Recommendations still sorted by confidence

**`className: string`** *(optional)*
- Additional CSS classes for root container
- For custom spacing or styling
- Doesn't override component styles

## Visual States

### 1. No Data State (Disabled)
```
┌─────────────────────────────────────────────────────────────┐
│  Choose Chart Type                                          │
│  Upload data to see chart recommendations                   │
│                                                             │
│  [Disabled Bar] [Disabled Line] [Disabled Pie] [Disabled Area] │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 No data uploaded yet                            │   │
│  │  Upload a file to see chart recommendations         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Smart Recommendations State
```
┌─────────────────────────────────────────────────────────────┐
│  Choose Chart Type                                          │
│  Based on your data, we recommend these chart types:       │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │📊 90%   │ │🥧 85%   │ │📈 75%   │ │📈       │          │
│  │   ✓     │ │         │ │         │ │ disabled │          │
│  │Bar Chart│ │Pie Chart│ │Line Ch. │ │Area Ch. │          │
│  │Compare  │ │Proport. │ │Trends   │ │Not suit.│          │
│  │categor. │ │& percent│ │over time│ │for data │          │
│  │🟢 Ideal │ │         │ │         │ │         │          │
│  │for comp.│ │         │ │         │ │         │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  ℹ️ Chart Recommendations                                   │
│  Percentages show how well each chart type suits your      │
│  data structure. Higher percentages mean better fit.       │
└─────────────────────────────────────────────────────────────┘
```

### 3. Hover State with Tooltip
```
┌─────────┐
│📊 90%   │ ← Confidence badge
│   ✓     │ ← Selected indicator  
│Bar Chart│
│Compare  │
│categor. │
│🟢 Ideal │ ← Recommendation reason
│for comp.│
└─────────┘
    ↓
┌─────────────────────────────────┐ ← Tooltip on hover
│ Categorical data + numeric values │
└─────────────────────────────────┘
```

## Chart Type Definitions

### Bar Chart (📊)
```javascript
{
  name: 'Bar Chart',
  description: 'Compare values across categories',
  icon: '📊',
  visualExample: [||||] // Mini bar chart visualization
  bestFor: 'Comparing categories, showing rankings, discrete data',
  requirements: 'Categorical data + numeric values'
}
```

**Recommended for:**
- Sales by region/month
- Survey responses
- Rankings and comparisons
- Discrete category data

### Line Chart (📈)
```javascript
{
  name: 'Line Chart', 
  description: 'Show trends and changes over time',
  icon: '📈',
  visualExample: /\/\/ // SVG line visualization
  bestFor: 'Time series, trends, continuous data, forecasting',
  requirements: 'Sequential data (dates/time) + numeric values'
}
```

**Recommended for:**
- Stock prices over time
- Website traffic trends
- Temperature readings
- Revenue growth

### Pie Chart (🥧)
```javascript
{
  name: 'Pie Chart',
  description: 'Show proportions and percentages', 
  icon: '🥧',
  visualExample: ●◐◑ // CSS pie chart visualization
  bestFor: 'Parts of a whole, percentages, composition',
  requirements: 'Categories (2-8 ideal) + numeric values'
}
```

**Recommended for:**
- Market share breakdown
- Budget allocation
- Survey demographics
- Expense categories

### Area Chart (📈)
```javascript
{
  name: 'Area Chart',
  description: 'Show cumulative totals over time',
  icon: '📈', 
  visualExample: ▲▲▲ // SVG area visualization
  bestFor: 'Cumulative values, stacked data, volume over time',
  requirements: 'Time series + multiple numeric values'
}
```

**Recommended for:**
- Cumulative sales
- Stacked revenue streams
- Volume over time
- Multi-series data

## Usage Examples

### Basic Integration

```javascript
import ChartTypeSelector from './components/ChartTypeSelector.jsx';

const MyApp = () => {
  const [selectedChart, setSelectedChart] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const handleChartSelect = (chartType, metadata) => {
    console.log('Selected:', chartType, 'Confidence:', metadata.confidence);
    setSelectedChart(chartType);
  };

  return (
    <ChartTypeSelector
      suggestions={suggestions}
      selectedChartType={selectedChart}
      onChartTypeSelect={handleChartSelect}
    />
  );
};
```

### With Data Validator Integration

```javascript
import { validateDataForCharting } from './utils/validators/data-validator.js';

const DataChartFlow = () => {
  const [data, setData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const processData = (parsedData) => {
    // Validate data and get suggestions
    const validation = validateDataForCharting(parsedData);
    
    if (validation.isValid) {
      setData(parsedData);
      setSuggestions(validation.suggestions);
    }
  };

  return (
    <div>
      <FileUpload onFileSelect={processData} />
      <ChartTypeSelector
        suggestions={suggestions}
        disabled={!data}
        onChartTypeSelect={(type, meta) => {
          console.log(`${type} selected with ${meta.confidence}% confidence`);
        }}
      />
    </div>
  );
};
```

### Advanced State Management

```javascript
const AdvancedChartSelector = () => {
  const [chartState, setChartState] = useState({
    data: null,
    suggestions: [],
    selectedType: null,
    isProcessing: false
  });

  const updateSelection = (chartType, metadata) => {
    setChartState(prev => ({
      ...prev,
      selectedType: chartType,
      metadata: metadata
    }));
    
    // Trigger chart rendering
    renderChart(chartType, chartState.data, metadata);
  };

  return (
    <ChartTypeSelector
      suggestions={chartState.suggestions}
      selectedChartType={chartState.selectedType}
      onChartTypeSelect={updateSelection}
      disabled={chartState.isProcessing || !chartState.data}
      className="my-6"
    />
  );
};
```

### Custom Confidence Display

```javascript
const SimpleChartSelector = () => {
  return (
    <ChartTypeSelector
      suggestions={suggestions}
      showConfidence={false}  // Hide percentage badges
      selectedChartType={selected}
      onChartTypeSelect={(type) => {
        // Simplified selection without metadata
        setSelected(type);
      }}
    />
  );
};
```

## Integration with Data Validator

The component seamlessly integrates with our data validator system:

```javascript
// Data validator returns suggestions in this format:
const suggestions = [
  {
    chartType: 'bar',
    confidence: 90,
    reason: 'Categorical data with numeric values - ideal for comparison',
    suitableColumns: {
      xAxis: ['Month', 'Category'],
      yAxis: ['Sales', 'Revenue']
    }
  },
  {
    chartType: 'pie', 
    confidence: 85,
    reason: 'Categorical data with numeric values - good for showing proportions',
    suitableColumns: {
      categories: ['Category'],
      values: ['Sales']
    }
  }
];

// Component automatically sorts by confidence and applies appropriate styling
```

## Styling & Customization

### CSS Classes

```css
.chart-type-selector                    /* Root container */
.chart-type-selector .grid              /* Chart grid layout */
.chart-type-selector [role="button"]    /* Individual chart cards */
.chart-type-selector .border-blue-500   /* Selected state */
.chart-type-selector .border-green-200  /* Recommended state */
.chart-type-selector .opacity-60        /* Disabled state */
```

### State-Based Styling

- **Disabled**: Gray with reduced opacity
- **Recommended**: Green border and background
- **Selected**: Blue border with ring and checkmark
- **Hovered**: Scale transform with shadow
- **Default**: Clean gray border

### Custom Styling

```javascript
<ChartTypeSelector 
  className="max-w-4xl mx-auto"
  suggestions={suggestions}
  selectedChartType={selected}
  onChartTypeSelect={handleSelect}
/>
```

```css
.chart-type-selector {
  --chart-border-radius: 12px;
  --chart-hover-scale: 1.02;
}

.chart-type-selector [role="button"] {
  min-height: 140px; /* Taller cards */
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between chart options
- **Enter/Space**: Select chart type
- **Focus**: Clear visual indicators
- **Skip**: Disabled items not focusable

### Screen Reader Support
- Chart type and description announced
- Selection state communicated
- Confidence scores read aloud
- Disabled reasons explained

### Visual Accessibility
- High contrast color combinations
- Clear disabled vs enabled states
- Consistent hover and focus indicators
- Readable typography at all sizes

## Performance Considerations

- **Memoized Calculations**: Chart options computed only when suggestions change
- **Efficient Re-renders**: Only updates when props actually change
- **Lightweight Visuals**: SVG previews instead of heavy graphics
- **Smart Sorting**: Pre-sorted by confidence for consistent display

## Browser Compatibility

- **Modern Browsers**: Full feature support
- **Older Browsers**: Graceful degradation of animations
- **Mobile**: Touch-optimized interactions
- **High DPI**: Crisp visuals on retina displays

## Error Handling

The component gracefully handles edge cases:

```javascript
// Empty suggestions array
<ChartTypeSelector suggestions={[]} /> // Shows disabled state

// Invalid suggestions format
<ChartTypeSelector suggestions={null} /> // Falls back to empty array

// Missing required props
<ChartTypeSelector /> // Shows disabled state with helpful message
```

## Testing

The component has been tested with:
- ✅ All 4 chart types with various confidence levels
- ✅ Empty and invalid suggestion arrays  
- ✅ Disabled state interactions
- ✅ Keyboard navigation and accessibility
- ✅ Selection and hover states
- ✅ Responsive design on different screen sizes
- ✅ Integration with data validator
- ✅ Performance with large datasets

The ChartTypeSelector provides an intelligent, beautiful, and accessible way for users to choose the perfect chart type for their data, backed by AI-powered recommendations and confidence scoring. 