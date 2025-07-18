# Sample Data Files

This directory contains sample data files for testing and demonstration purposes.

## Files Created

### 📊 sales_sample.csv
- **Size:** 467 bytes
- **Format:** CSV with headers
- **Use Case:** Demonstrates bar charts, line charts, and area charts
- **Data:** Monthly business metrics for a full year

**Columns:**
- `Month` - Calendar months (January - December)
- `Revenue` - Monthly revenue in dollars
- `Expenses` - Monthly expenses in dollars  
- `Profit` - Monthly profit (Revenue - Expenses)
- `Customers` - Number of customers
- `Orders` - Number of orders processed

**Chart Recommendations:**
- **Bar Chart:** Compare revenue, expenses, profit by month
- **Line Chart:** Show trends over time for any metric
- **Area Chart:** Visualize cumulative values or filled trends

### 📈 expense_breakdown.xlsx
- **Size:** 17KB
- **Format:** Excel workbook (.xlsx)
- **Use Case:** Demonstrates pie charts and categorical data
- **Data:** Business expense breakdown by category

**Columns:**
- `Category` - Expense category name
- `Amount` - Dollar amount for each category
- `Percentage` - Percentage of total expenses
- `Description` - Detailed description of each category

**Chart Recommendations:**
- **Pie Chart:** Show expense distribution by category
- **Bar Chart:** Compare expense amounts across categories

## Usage

### In Development
Files are available in both:
- `src/data/` - Source files for development
- `public/` - Public files accessible via HTTP

### Sample Data Loader
Use the `sample-data-loader.js` utility:

```javascript
import { loadSampleData, SAMPLE_FILES } from '../utils/sample-data-loader.js';

// Load CSV sample
const csvData = await loadSampleData('SALES_CSV');

// Load Excel sample  
const excelData = await loadSampleData('EXPENSES_EXCEL');
```

## File Specifications

### Requirements Met ✅
- [x] Both files < 1MB (well under limit)
- [x] Proper headers included
- [x] Mix of text and numeric data
- [x] Demonstrate different chart types
- [x] Realistic business data
- [x] Valid file formats (CSV, XLSX)

### Data Quality
- **No missing values** - All cells populated
- **Consistent formatting** - Numbers, dates, text properly formatted
- **Realistic ranges** - Business-appropriate values
- **Chart-friendly** - Data structured for easy visualization 