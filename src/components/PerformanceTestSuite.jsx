import React, { useState, useRef } from 'react';
import {
  runComprehensivePerformanceTest,
  logPerformanceTestResults,
  generateTestDatasets,
  measurePerformance
} from '../utils/performance-optimizer';

const PerformanceTestSuite = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  // const [performanceMonitor] = useState(createPerformanceMonitor());
  const chartRendererRef = useRef(null);

  const runFullPerformanceTest = async () => {
    setIsRunning(true);
    setCurrentTest('Comprehensive Performance Test');
    
    try {
      const results = await runComprehensivePerformanceTest(chartRendererRef);
      logPerformanceTestResults(results);
      setTestResults(results);
    } catch (error) {
      console.error('Performance test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runDatasetSizeTest = async () => {
    setIsRunning(true);
    setCurrentTest('Dataset Size Test');
    
    try {
      const datasets = generateTestDatasets();
      const results = {
        timestamp: new Date().toISOString(),
        datasets: {},
        summary: {}
      };
      
      // Test each dataset size
      for (const [size, data] of Object.entries(datasets)) {
        setCurrentTest(`Testing ${size} dataset (${data.length} rows)`);
        
        const performance = measurePerformance(() => {
          // Simulate chart rendering with data
          if (chartRendererRef && chartRendererRef.current) {
            chartRendererRef.current.updateData(data);
          }
        }, 5);
        
        results.datasets[size] = {
          rows: data.length,
          ...performance,
          meetsRequirement: performance.average <= 50
        };
        
        // Small delay to prevent UI freezing
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Calculate summary
      const allMeets = Object.values(results.datasets).every(d => d.meetsRequirement);
      results.summary = {
        overallScore: allMeets ? 100 : 50,
        status: allMeets ? 'Excellent' : 'Needs Optimization',
        totalDatasets: Object.keys(results.datasets).length,
        passedTests: Object.values(results.datasets).filter(d => d.meetsRequirement).length
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Dataset test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runThemeSwitchingTest = async () => {
    setIsRunning(true);
    setCurrentTest('Theme Switching Test');
    
    try {
      const themes = ['corporate', 'pastel-fun', 'high-contrast'];
      const results = {
        timestamp: new Date().toISOString(),
        themes: {},
        summary: {}
      };
      
      // Test theme switching performance
      for (const theme of themes) {
        setCurrentTest(`Testing theme: ${theme}`);
        
        const performance = measurePerformance(() => {
          // Simulate theme switching
          if (chartRendererRef && chartRendererRef.current) {
            chartRendererRef.current.updateTheme(theme);
          }
        }, 10);
        
        results.themes[theme] = {
          ...performance,
          meetsRequirement: performance.average <= 300
        };
        
        // Small delay to prevent UI freezing
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Calculate summary
      const allMeets = Object.values(results.themes).every(t => t.meetsRequirement);
      const averageTime = Object.values(results.themes).reduce((sum, t) => sum + t.average, 0) / themes.length;
      
      results.summary = {
        overallScore: allMeets ? 100 : 50,
        status: allMeets ? 'Excellent' : 'Needs Optimization',
        averageThemeSwitchTime: Math.round(averageTime * 100) / 100,
        totalThemes: themes.length,
        passedTests: Object.values(results.themes).filter(t => t.meetsRequirement).length
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Theme switching test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runMemoryUsageTest = async () => {
    setIsRunning(true);
    setCurrentTest('Memory Usage Test');
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        memorySnapshots: [],
        summary: {}
      };
      
      if ('memory' in performance) {
        const themes = ['corporate', 'pastel-fun', 'high-contrast'];
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // Record initial memory
        results.memorySnapshots.push({
          operation: 'Initial',
          used: initialMemory,
          total: performance.memory.totalJSHeapSize,
          timestamp: Date.now()
        });
        
        // Perform theme switching operations
        for (let i = 0; i < 20; i++) {
          for (const theme of themes) {
            setCurrentTest(`Theme switching iteration ${i + 1}, theme: ${theme}`);
            
            if (chartRendererRef && chartRendererRef.current) {
              chartRendererRef.current.updateTheme(theme);
            }
            
            // Record memory after each operation
            results.memorySnapshots.push({
              operation: `Theme Switch ${i + 1} - ${theme}`,
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              timestamp: Date.now()
            });
          }
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreaseKB = Math.round(memoryIncrease / 1024 * 100) / 100;
        
        results.summary = {
          initialMemory: Math.round(initialMemory / 1024 * 100) / 100,
          finalMemory: Math.round(finalMemory / 1024 * 100) / 100,
          memoryIncrease: memoryIncreaseKB,
          stable: memoryIncrease < 1024 * 1024, // Less than 1MB increase
          overallScore: memoryIncrease < 1024 * 1024 ? 100 : 50,
          status: memoryIncrease < 1024 * 1024 ? 'Stable' : 'Memory Leak Detected'
        };
      } else {
        results.summary = {
          supported: false,
          message: 'Memory API not supported in this browser',
          overallScore: 0,
          status: 'Not Supported'
        };
      }
      
      setTestResults(results);
    } catch (error) {
      console.error('Memory usage test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (score) => {
    if (score >= 90) return '✅';
    if (score >= 70) return '⚠️';
    if (score >= 50) return '⚠️';
    return '❌';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          ⚡ Performance Test Suite
        </h2>
        <p className="text-muted-foreground">
          Test theme selector performance with different dataset sizes and measure key metrics
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={runFullPerformanceTest}
          disabled={isRunning}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning && currentTest === 'Comprehensive Performance Test' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running...
            </>
          ) : (
            <>
              ⚡ Run Full Performance Test
            </>
          )}
        </button>
        
        <button
          onClick={runDatasetSizeTest}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          📊 Test Dataset Sizes
        </button>
        
        <button
          onClick={runThemeSwitchingTest}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          🎨 Test Theme Switching
        </button>
        
        <button
          onClick={runMemoryUsageTest}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          🧠 Test Memory Usage
        </button>
      </div>

      {/* Current Test Status */}
      {isRunning && currentTest && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="font-medium text-foreground">Running Test</div>
              <div className="text-sm text-muted-foreground">{currentTest}</div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="space-y-4">
          {/* Overall Results */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Test Results
              </h3>
              <div className={`text-2xl font-bold ${getStatusColor(testResults.summary?.overallScore || 0)}`}>
                {getStatusIcon(testResults.summary?.overallScore || 0)} {testResults.summary?.overallScore || 0}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{testResults.summary?.status || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Timestamp</div>
                <div className="font-medium">{new Date(testResults.timestamp).toLocaleTimeString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tests Passed</div>
                <div className="font-medium">
                  {testResults.summary?.passedTests || 0} / {testResults.summary?.totalDatasets || testResults.summary?.totalThemes || 0}
                </div>
              </div>
            </div>

            {testResults.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="text-destructive font-medium">Test Error:</div>
                <div className="text-destructive/80 text-sm">{testResults.error}</div>
              </div>
            )}
          </div>

          {/* Detailed Test Results */}
          {testResults.datasets && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Dataset Size Performance
              </h4>
              
              <div className="space-y-4">
                {Object.entries(testResults.datasets).map(([size, data]) => (
                  <div key={size} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{size} Dataset</div>
                      <div className="text-sm text-muted-foreground">
                        {data.rows} rows • Average: {data.average}ms • Range: {data.min}ms - {data.max}ms
                      </div>
                    </div>
                    <div className={data.meetsRequirement ? 'text-green-600' : 'text-red-600'}>
                      {data.meetsRequirement ? '✅' : '❌'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResults.themes && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Theme Switching Performance
              </h4>
              
              <div className="space-y-4">
                {Object.entries(testResults.themes).map(([theme, data]) => (
                  <div key={theme} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{theme.replace('-', ' ')} Theme</div>
                      <div className="text-sm text-muted-foreground">
                        Average: {data.average}ms • Range: {data.min}ms - {data.max}ms
                      </div>
                    </div>
                    <div className={data.meetsRequirement ? 'text-green-600' : 'text-red-600'}>
                      {data.meetsRequirement ? '✅' : '❌'}
                    </div>
                  </div>
                ))}
                
                {testResults.summary?.averageThemeSwitchTime && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="font-medium text-primary">Overall Average Theme Switch Time</div>
                    <div className="text-2xl font-bold text-primary">{testResults.summary.averageThemeSwitchTime}ms</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {testResults.memorySnapshots && testResults.memorySnapshots.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Memory Usage Analysis
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Initial Memory</div>
                    <div className="font-medium">{formatBytes(testResults.summary.initialMemory * 1024)}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Final Memory</div>
                    <div className="font-medium">{formatBytes(testResults.summary.finalMemory * 1024)}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Memory Increase</div>
                    <div className={`font-medium ${testResults.summary.stable ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.summary.memoryIncrease}KB {testResults.summary.stable ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Memory stability: {testResults.summary.stable ? 'Stable (no memory leaks detected)' : 'Unstable (potential memory leak)'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Requirements */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Performance Requirements
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Theme Switching: ≤300ms</div>
              <div className="text-muted-foreground">Theme switching should complete within 300ms</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Chart Rendering: ≤50ms for 1,000 rows</div>
              <div className="text-muted-foreground">Chart rendering should complete within 50ms for 1,000 row datasets</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Memory Stability: ≤1MB increase</div>
              <div className="text-muted-foreground">Memory usage should remain stable during theme switching</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Export Performance: ≤1 second</div>
              <div className="text-muted-foreground">PNG/JPEG export should complete within 1 second</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTestSuite; 