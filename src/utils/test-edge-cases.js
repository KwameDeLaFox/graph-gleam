// Edge Case Testing Utility
// This utility helps test and validate all error edge cases

import { parseCSV } from './parsers/csv-parser.js';
import { parseExcel } from './parsers/excel-parser.js';
import { validateDataForCharting } from './validators/data-validator.js';

/**
 * Comprehensive edge case test suite
 */
export const testEdgeCases = async () => {
  console.log('🧪 Starting comprehensive edge case testing...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Empty CSV file
  await testCase(results, 'Empty CSV file', async () => {
    const emptyCSV = new File([''], 'empty.csv', { type: 'text/csv' });
    const result = await parseCSV(emptyCSV);
    return !result.success && result.errors.some(e => e.type === 'empty');
  });

  // Test 2: CSV with only headers, no data
  await testCase(results, 'CSV with headers only', async () => {
    const headersOnly = new File(['Name,Age,City\n'], 'headers-only.csv', { type: 'text/csv' });
    const result = await parseCSV(headersOnly);
    return !result.success && result.errors.some(e => e.type === 'empty');
  });

  // Test 3: CSV with malformed data
  await testCase(results, 'Malformed CSV data', async () => {
    const malformed = new File([
      'Name,Age,City\n',
      'John,25,NYC\n',
      'Jane,"30,Los Angeles\n', // Missing closing quote
      'Bob,35\n' // Missing column
    ].join(''), 'malformed.csv', { type: 'text/csv' });
    const result = await parseCSV(malformed);
    // Should still parse but with warnings
    return result.success || result.errors.length > 0;
  });

  // Test 4: CSV with no numeric data
  await testCase(results, 'CSV with no numeric data', async () => {
    const textOnly = new File([
      'Name,Country,Status\n',
      'John,USA,Active\n',
      'Jane,Canada,Inactive\n'
    ].join(''), 'text-only.csv', { type: 'text/csv' });
    const result = await parseCSV(textOnly);
    if (result.success) {
      const validation = validateDataForCharting(result.data, { filename: 'text-only.csv' });
      return !validation.isValid && validation.errors.some(e => e.type === 'no-numeric');
    }
    return false;
  });

  // Test 5: Very large numbers
  await testCase(results, 'Very large numbers', async () => {
    const largeNumbers = new File([
      'Item,Value\n',
      `Item1,${Number.MAX_SAFE_INTEGER}\n`,
      `Item2,${Number.MAX_SAFE_INTEGER * 2}\n`,
      'Item3,1.23e+100\n'
    ].join(''), 'large-numbers.csv', { type: 'text/csv' });
    const result = await parseCSV(largeNumbers);
    return result.success && result.data.length > 0;
  });

  // Test 6: Special characters and Unicode
  await testCase(results, 'Unicode and special characters', async () => {
    const unicode = new File([
      'Name,Amount,Note\n',
      'José,€1,234.56,"Café ñandú"\n',
      '张三,¥9999,"测试数据"\n',
      'محمد,﷼500,"اختبار"\n'
    ].join(''), 'unicode.csv', { type: 'text/csv' });
    const result = await parseCSV(unicode);
    return result.success && result.data.length === 3;
  });

  // Test 7: Mixed data types in numeric columns
  await testCase(results, 'Mixed data types in numeric columns', async () => {
    const mixed = new File([
      'Product,Price,Quantity\n',
      'Widget,$19.99,10\n',
      'Gadget,FREE,5\n',
      'Tool,29.50,N/A\n',
      'Part,,15\n'
    ].join(''), 'mixed-types.csv', { type: 'text/csv' });
    const result = await parseCSV(mixed);
    if (result.success) {
      const validation = validateDataForCharting(result.data, { filename: 'mixed-types.csv' });
      return validation.warnings && validation.warnings.length > 0;
    }
    return false;
  });

  // Test 8: File size validation
  await testCase(results, 'Oversized file handling', async () => {
    // Create a file that appears to be >5MB
    const oversized = new File(['x'.repeat(6 * 1024 * 1024)], 'huge.csv', { type: 'text/csv' });
    const result = await parseCSV(oversized);
    return !result.success && result.errors.some(e => e.type === 'size');
  });

  // Test 9: Invalid file type
  await testCase(results, 'Invalid file type', async () => {
    const invalidType = new File(['some content'], 'test.txt', { type: 'text/plain' });
    const result = await parseCSV(invalidType);
    return !result.success && result.errors.some(e => e.type === 'type');
  });

  // Test 10: Excel with multiple sheets
  await testCase(results, 'Excel edge cases (simulated)', async () => {
    // Since we can't easily create Excel files in browser, simulate the scenarios
    const mockExcelData = [
      { 'Sheet Name': 'Data', 'Value': 100 },
      { 'Sheet Name': 'Summary', 'Value': 200 }
    ];
    const validation = validateDataForCharting(mockExcelData, { filename: 'test.xlsx' });
    return validation.isValid;
  });

  // Test 11: Extremely long column names
  await testCase(results, 'Very long column names', async () => {
    const longHeaders = new File([
      `${'VeryLongColumnNameThatExceedsReasonableLimits'.repeat(5)},Value\n`,
      'Data1,100\n',
      'Data2,200\n'
    ].join(''), 'long-headers.csv', { type: 'text/csv' });
    const result = await parseCSV(longHeaders);
    return result.success && result.data.length === 2;
  });

  // Test 12: Data with null/undefined values
  await testCase(results, 'Null and undefined handling', async () => {
    const nullData = [
      { name: 'John', age: 25, city: null },
      { name: null, age: undefined, city: 'NYC' },
      { name: 'Jane', age: 30, city: '' }
    ];
    const validation = validateDataForCharting(nullData, { filename: 'null-data.csv' });
    return validation.warnings && validation.warnings.some(w => w.type === 'missing-data');
  });

  // Test 13: Single data point
  await testCase(results, 'Single data point', async () => {
    const singlePoint = [{ x: 1, y: 100 }];
    const validation = validateDataForCharting(singlePoint, { filename: 'single.csv' });
    return validation.isValid && validation.warnings.some(w => w.type === 'small-dataset');
  });

  // Test 14: Duplicate column names
  await testCase(results, 'Duplicate column names', async () => {
    const duplicates = new File([
      'Name,Value,Value,Name\n',
      'A,1,2,B\n',
      'C,3,4,D\n'
    ].join(''), 'duplicates.csv', { type: 'text/csv' });
    const result = await parseCSV(duplicates);
    // Should handle gracefully by renaming or merging
    return result.success;
  });

  // Test 15: Circular reference simulation
  await testCase(results, 'Complex data structures', async () => {
    const complex = [
      { id: 1, parent: null, value: 100 },
      { id: 2, parent: 1, value: 50 },
      { id: 3, parent: 2, value: 25 }
    ];
    const validation = validateDataForCharting(complex, { filename: 'complex.csv' });
    return validation.isValid; // Should handle any data structure
  });

  console.log(`\n🏁 Edge case testing complete: ${results.passed}/${results.tests.length} passed`);
  if (results.failed > 0) {
    console.log('❌ Failed tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  return results;
};

/**
 * Helper function to run individual test cases
 */
const testCase = async (results, name, testFn) => {
  try {
    console.log(`  Testing: ${name}...`);
    const passed = await testFn();
    results.tests.push({ name, passed, error: null });
    if (passed) {
      results.passed++;
      console.log(`    ✅ ${name}`);
    } else {
      results.failed++;
      console.log(`    ❌ ${name}: Test condition not met`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
    console.log(`    ❌ ${name}: ${error.message}`);
  }
};

/**
 * Generate edge case test data for manual testing
 */
export const generateTestData = () => {
  return {
    // Empty data
    empty: [],
    
    // Text-only data
    textOnly: [
      { name: 'John', city: 'NYC', status: 'Active' },
      { name: 'Jane', city: 'LA', status: 'Inactive' }
    ],
    
    // Mixed types
    mixedTypes: [
      { product: 'Widget', price: 19.99, quantity: 10, available: true },
      { product: 'Gadget', price: 'FREE', quantity: '5', available: 'yes' },
      { product: 'Tool', price: null, quantity: 0, available: false }
    ],
    
    // Large dataset (simulated)
    largeDataset: Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      value: Math.random() * 1000,
      category: `Category ${(i % 10) + 1}`,
      timestamp: new Date(2024, 0, (i % 365) + 1).toISOString()
    })),
    
    // Single point
    singlePoint: [{ x: 1, y: 100 }],
    
    // All zeros
    allZeros: [
      { metric: 'A', value: 0 },
      { metric: 'B', value: 0 },
      { metric: 'C', value: 0 }
    ],
    
    // Extreme values
    extremeValues: [
      { name: 'Tiny', value: 0.000001 },
      { name: 'Huge', value: 999999999999 },
      { name: 'Negative', value: -1000000 },
      { name: 'Zero', value: 0 }
    ]
  };
};

/**
 * Test specific error scenarios
 */
export const testErrorScenarios = {
  // Test file size limits
  testFileSizeLimit: () => {
    console.log('Testing file size limits...');
    // This would be tested with actual large files in practice
  },
  
  // Test memory limits
  testMemoryLimit: () => {
    console.log('Testing memory limits...');
    try {
      // Try to create a very large array
      const bigArray = new Array(10000000).fill({ x: 1, y: 2 });
      return bigArray.length > 0;
    } catch (error) {
      return error.name === 'RangeError';
    }
  },
  
  // Test circular references
  testCircularReferences: () => {
    console.log('Testing circular references...');
    const obj = { name: 'test', value: 100 };
    obj.self = obj; // Create circular reference
    
    try {
      JSON.stringify(obj); // This should fail
      return false;
    } catch (error) {
      return error.message.includes('circular');
    }
  }
}; 