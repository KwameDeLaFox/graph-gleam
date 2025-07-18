import React, { useState, useRef } from 'react';
import FileUpload from './components/FileUpload.jsx';
import ChartTypeSelector from './components/ChartTypeSelector.jsx';
import ChartRenderer from './components/ChartRenderer.jsx';
import { parseCSV } from './utils/parsers/csv-parser.js';
import { parseExcel } from './utils/parsers/excel-parser.js';
import { validateDataForCharting } from './utils/validators/data-validator.js';
import { loadCSVSample, loadExcelSample } from './utils/sample-data-loader.js';
import { runFullBrowserTestSuite, applyBrowserOptimizations } from './utils/browser-testing.js';
import { initializeAccessibility, addUXEnhancements, announceToScreenReader } from './utils/accessibility-helpers.js';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [chartSuggestions, setChartSuggestions] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [browserCompatibility, setBrowserCompatibility] = useState(null);
  
  // Chart renderer ref for export functionality
  const chartRef = useRef(null);

  // Initialize app features on startup
  useEffect(() => {
    try {
      // Apply browser-specific optimizations
      applyBrowserOptimizations();
      
      // Initialize accessibility features
      initializeAccessibility();
      
      // Add UX enhancements
      addUXEnhancements();
      
      // Run compatibility tests (in development only to avoid console spam)
      if (import.meta.env.DEV) {
        const browserTest = runFullBrowserTestSuite();
        setBrowserCompatibility(browserTest);
        
        // Show critical warnings to users
        const criticalWarnings = browserTest.compatibility.warnings.filter(w => w.severity === 'critical');
        if (criticalWarnings.length > 0) {
          const warningMessage = criticalWarnings.map(w => w.message).join('\n');
          console.warn('Browser compatibility issues detected:', warningMessage);
        }
      }
      
      // Welcome message for screen readers
      setTimeout(() => {
        announceToScreenReader('Graph Gleam application loaded. Upload a data file to begin creating charts.');
      }, 1000);
      
    } catch (err) {
      console.warn('App initialization failed:', err);
    }
  }, []);

  // Handle file upload and processing
  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Processing file:', file.name);
      
      // Parse the file based on type
      let parseResult;
      if (file.name.toLowerCase().endsWith('.csv')) {
        parseResult = await parseCSV(file);
      } else if (file.name.toLowerCase().endsWith('.xlsx')) {
        parseResult = await parseExcel(file);
      } else {
        throw new Error('Unsupported file type');
      }

      if (!parseResult.success) {
        throw new Error(parseResult.errors?.[0]?.message || 'Failed to parse file');
      }

      console.log('Parse result:', parseResult);
      
      // Validate data for charting
      const validation = validateDataForCharting(parseResult.data, parseResult.meta);
      console.log('Validation result:', validation);

      if (!validation.isValid) {
        throw new Error(validation.errors?.[0]?.message || 'Data is not suitable for charting');
      }

      // Success! Update state
      setUploadedFile(file);
      setParsedData(parseResult.data);
      setChartSuggestions(validation.suggestions);
      setSelectedChartType(null); // Reset selection
      
      // Auto-select the highest confidence chart type
      if (validation.suggestions.length > 0) {
        const bestSuggestion = validation.suggestions[0];
        setSelectedChartType(bestSuggestion.chartType);
      }

    } catch (err) {
      console.error('File processing error:', err);
      setError(err.message);
      // Reset state on error
      setUploadedFile(null);
      setParsedData(null);
      setChartSuggestions([]);
      setSelectedChartType(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle chart type selection
  const handleChartTypeSelect = (chartType, metadata) => {
    console.log('Chart type selected:', chartType, metadata);
    setSelectedChartType(chartType);
  };

  // Handle chart export
  const handleExportChart = (format = 'png') => {
    if (chartRef.current && uploadedFile) {
      try {
        const filename = `${uploadedFile.name.split('.')[0]}_${selectedChartType}_chart`;
        chartRef.current.exportChart(format, filename);
      } catch (error) {
        console.error('Export failed:', error);
        setError(`Export failed: ${error.message}`);
      }
    }
  };

  // Handle chart render completion
  const handleChartRenderComplete = (chartInfo) => {
    console.log('Chart rendered successfully:', chartInfo);
  };

  // Handle chart render error
  const handleChartRenderError = (error) => {
    console.error('Chart render error:', error);
    setError(`Chart rendering failed: ${error.message}`);
  };

  // Handle sample data loading
  const handleLoadSampleData = async (sampleType) => {
    // Prevent multiple concurrent loads
    if (isProcessing) {
      console.log('Sample data loading already in progress');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Loading sample data:', sampleType);
      
      // Validate sample type
      if (!sampleType || !['csv', 'excel'].includes(sampleType)) {
        throw new Error(`Invalid sample type: ${sampleType}`);
      }

      let sampleResult;
      try {
        if (sampleType === 'csv') {
          sampleResult = await loadCSVSample();
        } else if (sampleType === 'excel') {
          sampleResult = await loadExcelSample();
        }
      } catch (loadError) {
        console.error('Sample data loading failed:', loadError);
        throw new Error(`Unable to load ${sampleType.toUpperCase()} sample data. Please check that the sample files are available.`);
      }

      // Validate loaded data structure
      if (!sampleResult || !sampleResult.data || !Array.isArray(sampleResult.data)) {
        throw new Error('Invalid sample data structure received');
      }

      if (sampleResult.data.length === 0) {
        throw new Error('Sample data is empty');
      }

      console.log('Sample data loaded successfully:', sampleResult.data.length, 'rows');
      
      // Process sample data through validation (same as uploaded files)
      let validation;
      try {
        validation = validateDataForCharting(sampleResult.data, {
          filename: sampleResult.filename,
          columns: Object.keys(sampleResult.data[0] || {})
        });
      } catch (validationError) {
        console.error('Sample data validation failed:', validationError);
        throw new Error('Sample data validation failed. The data format may be corrupted.');
      }
      
      console.log('Sample validation result:', validation);

      if (!validation || !validation.isValid) {
        const errorMsg = validation?.errors?.[0]?.message || 'Sample data validation failed';
        throw new Error(`Sample data validation failed: ${errorMsg}`);
      }

      if (!validation.suggestions || validation.suggestions.length === 0) {
        throw new Error('No chart recommendations could be generated for this sample data');
      }

      // Create a mock file object for consistency
      const mockFile = {
        name: sampleResult.filename,
        size: JSON.stringify(sampleResult.data).length,
        type: sampleType === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };

      // Success! Update state atomically
      setUploadedFile(mockFile);
      setParsedData(sampleResult.data);
      setChartSuggestions(validation.suggestions);
      setSelectedChartType(null); // Reset selection
      
      // Auto-select the highest confidence chart type
      const bestSuggestion = validation.suggestions[0];
      if (bestSuggestion && bestSuggestion.chartType) {
        console.log('Auto-selecting chart type:', bestSuggestion.chartType, 'with confidence:', bestSuggestion.confidence);
        setSelectedChartType(bestSuggestion.chartType);
        
        // Announce to screen readers
        announceToScreenReader(
          `Sample data loaded successfully. ${sampleResult.data.length} rows of data. ` +
          `Recommended chart type: ${bestSuggestion.chartType} with ${bestSuggestion.confidence}% confidence.`
        );
      }

      console.log('Sample data loading completed successfully');

    } catch (err) {
      console.error('Sample data loading error:', err);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to load sample data';
      if (err.message) {
        userMessage = err.message;
      } else if (err.toString) {
        userMessage = err.toString();
      }
      
      setError(userMessage);
      
      // Reset state on error
      setUploadedFile(null);
      setParsedData(null);
      setChartSuggestions([]);
      setSelectedChartType(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Graph Gleam
              </h1>
              <span className="ml-2 text-xs sm:text-sm text-gray-500 hidden xs:inline">
                Turn data → chart
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-8">
          
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Upload Your Data
            </h2>
            
            {/* File Upload Component */}
            <FileUpload
              onFileSelect={handleFileUpload}
              onError={(error) => {
                console.error('Upload error:', error);
                setError(error.message || 'Upload failed');
              }}
              disabled={isProcessing}
            />

            {/* File Info Display */}
            {uploadedFile && !isProcessing && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">File Processed Successfully</h3>
                    <div className="mt-1 text-sm text-green-700">
                      <p>{uploadedFile.name}</p>
                      <p className="text-xs">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • {parsedData?.length || 0} rows
                        {chartSuggestions.length > 0 && ` • ${chartSuggestions.length} chart types recommended`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Processing File</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>Parsing data and analyzing chart compatibility...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sample Data */}
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-500 mb-3">
                Or try a sample:
              </p>
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={() => handleLoadSampleData('csv')}
                  disabled={isProcessing}
                  className="w-full text-left px-3 sm:px-4 py-3 sm:py-2 text-sm bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center touch-manipulation"
                >
                  <span className="mr-3 text-lg sm:text-base">📊</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Sales Sample (CSV)</div>
                    <div className="text-xs text-gray-500 mt-0.5">Monthly sales data - perfect for bar, line, area charts</div>
                  </div>
                  {isProcessing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                  )}
                </button>
                <button 
                  onClick={() => handleLoadSampleData('excel')}
                  disabled={isProcessing}
                  className="w-full text-left px-3 sm:px-4 py-3 sm:py-2 text-sm bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center touch-manipulation"
                >
                  <span className="mr-3 text-lg sm:text-base">💰</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Expenses Sample (Excel)</div>
                    <div className="text-xs text-gray-500 mt-0.5">Expense breakdown by category - ideal for pie charts</div>
                  </div>
                  {isProcessing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <ChartTypeSelector
              suggestions={chartSuggestions}
              selectedChartType={selectedChartType}
              onChartTypeSelect={handleChartTypeSelect}
              disabled={!parsedData || isProcessing}
              showConfidence={true}
            />
          </div>

          {/* Chart Preview Area */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">
                Chart Preview
              </h2>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {isProcessing ? (
                <div className="flex items-center justify-center h-96 bg-gray-50">
                  <div className="text-blue-600 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg">Processing your data...</p>
                    <p className="text-sm mt-1 text-blue-500">
                      Analyzing data structure and generating chart recommendations
                    </p>
                  </div>
                </div>
              ) : parsedData && selectedChartType ? (
                <div className="p-4">
                  <div className="w-full overflow-hidden" style={{ minHeight: '300px' }}>
                    <ChartRenderer
                      ref={chartRef}
                      data={parsedData}
                      chartType={selectedChartType}
                      title={`${uploadedFile?.name || 'Data'} - ${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart`}
                      height={400}
                      responsive={true}
                      theme="light"
                      onRenderComplete={handleChartRenderComplete}
                      onError={handleChartRenderError}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Chart metadata */}
                                      <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                          <span>📊 {parsedData.length} data points</span>
                          <span>📈 {selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} chart</span>
                          <span className="truncate">📁 {uploadedFile?.name}</span>
                          {parsedData.length > 1000 && (
                            <span className="text-blue-600 font-medium">⚡ Optimized</span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                          {chartSuggestions.find(s => s.chartType === selectedChartType) && (
                            <div className="text-green-600 font-medium text-xs sm:text-sm">
                              AI Confidence: {chartSuggestions.find(s => s.chartType === selectedChartType).confidence}%
                            </div>
                          )}
                          {parsedData.length > 5000 && (
                            <div className="text-orange-600 font-medium text-xs sm:text-sm">
                              🔄 Sampled for performance
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              ) : uploadedFile ? (
                <div className="flex items-center justify-center h-96 bg-yellow-50">
                  <div className="text-yellow-600 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-lg">Select a chart type to preview</p>
                    <p className="text-sm mt-1">
                      Data loaded: {uploadedFile.name} ({parsedData?.length || 0} rows)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50">
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <p className="text-lg">Upload data to see your chart</p>
                    <p className="text-sm mt-1">
                      Supports CSV and Excel files up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Export Buttons */}
            {parsedData && selectedChartType && !isProcessing && (
              <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  onClick={() => handleExportChart('png')}
                  disabled={!chartRef.current}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PNG
                </button>
                <button 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  onClick={() => handleExportChart('jpeg')}
                  disabled={!chartRef.current}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Download JPEG
                </button>
                <button 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  onClick={() => {
                    if (chartRef.current) {
                      const canvas = chartRef.current.getChartInstance()?.canvas;
                      if (canvas) {
                        const dataURL = canvas.toDataURL('image/png');
                        navigator.clipboard.writeText(`<img src="${dataURL}" alt="Chart" />`);
                        alert('Embed code copied to clipboard!');
                      }
                    }
                  }}
                  disabled={!chartRef.current}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Embed Code
                </button>
              </div>
            )}
          </div>

          {/* Status/Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
