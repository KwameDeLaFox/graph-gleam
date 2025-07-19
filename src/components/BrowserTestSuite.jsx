import React, { useState, useEffect } from 'react';
import {
  runComprehensiveBrowserTest,
  logBrowserTestResults,
  quickCompatibilityCheck,
  testThemeCompatibility
} from '../utils/browser-testing';

const BrowserTestSuite = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [quickCheck, setQuickCheck] = useState(null);

  // Run quick compatibility check on mount
  useEffect(() => {
    const check = quickCompatibilityCheck();
    setQuickCheck(check);
  }, []);

  const runFullTest = async () => {
    setIsRunning(true);
    try {
      const results = await runComprehensiveBrowserTest();
      logBrowserTestResults(results);
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const runThemeTest = () => {
    const themeResults = testThemeCompatibility();
    console.log('🎨 Theme Compatibility Test:', themeResults);
    return themeResults;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🌐 Browser Compatibility Test Suite
        </h2>
        <p className="text-muted-foreground">
          Test theme selector compatibility across different browsers
        </p>
      </div>

      {/* Quick Check Results */}
      {quickCheck && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Quick Compatibility Check
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Browser</div>
              <div className="font-medium">{quickCheck.browser}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Version</div>
              <div className="font-medium">{quickCheck.version}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">CSS Variables</div>
              <div className={quickCheck.cssVariables ? 'text-green-600' : 'text-red-600'}>
                {quickCheck.cssVariables ? '✅' : '❌'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Chart.js</div>
              <div className={quickCheck.chartJS ? 'text-green-600' : 'text-red-600'}>
                {quickCheck.chartJS ? '✅' : '❌'}
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              quickCheck.compatible 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {quickCheck.compatible ? '✅ Compatible' : '❌ Not Compatible'}
            </span>
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={runFullTest}
          disabled={isRunning}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running Tests...
            </>
          ) : (
            <>
              🔍 Run Full Test Suite
            </>
          )}
        </button>
        
        <button
          onClick={runThemeTest}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
        >
          🎨 Test Theme Compatibility
        </button>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="space-y-4">
          {/* Overall Results */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Test Results
              </h3>
              <div className={`text-2xl font-bold ${getStatusColor(testResults.compatibilityScore)}`}>
                {getStatusIcon(testResults.compatibilityScore)} {testResults.compatibilityScore}%
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Browser</div>
                <div className="font-medium">{testResults.browser.browser} {testResults.browser.version}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{testResults.status}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Mobile</div>
                <div className="font-medium">{testResults.browser.isMobile ? 'Yes' : 'No'}</div>
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
          {testResults.tests && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Detailed Test Results
              </h4>
              
              <div className="space-y-4">
                {/* CSS Variables Test */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">CSS Variables</div>
                    <div className="text-sm text-muted-foreground">Custom CSS properties support</div>
                  </div>
                  <div className={testResults.tests.cssVariables?.supported ? 'text-green-600' : 'text-red-600'}>
                    {testResults.tests.cssVariables?.supported ? '✅' : '❌'}
                  </div>
                </div>

                {/* Chart.js Test */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">Chart.js Compatibility</div>
                    <div className="text-sm text-muted-foreground">Canvas and 2D context support</div>
                  </div>
                  <div className={testResults.tests.chartJS?.supported ? 'text-green-600' : 'text-red-600'}>
                    {testResults.tests.chartJS?.supported ? '✅' : '❌'}
                  </div>
                </div>

                {/* Theme Switching Performance */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">Theme Switching Performance</div>
                    <div className="text-sm text-muted-foreground">
                      Average: {testResults.tests.themeSwitching?.average?.toFixed(2)}ms
                    </div>
                  </div>
                  <div className={testResults.tests.themeSwitching?.meetsRequirement ? 'text-green-600' : 'text-red-600'}>
                    {testResults.tests.themeSwitching?.meetsRequirement ? '✅' : '❌'}
                  </div>
                </div>

                {/* Export Functionality */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">Export Functionality</div>
                    <div className="text-sm text-muted-foreground">PNG/JPEG export support</div>
                  </div>
                  <div className={testResults.tests.export?.supported ? 'text-green-600' : 'text-red-600'}>
                    {testResults.tests.export?.supported ? '✅' : '❌'}
                  </div>
                </div>

                {/* Responsive Design */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">Responsive Design</div>
                    <div className="text-sm text-muted-foreground">
                      Current: {testResults.tests.responsive?.currentBreakpoint}
                    </div>
                  </div>
                  <div className="text-green-600">✅</div>
                </div>

                {/* Accessibility */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">Accessibility</div>
                    <div className="text-sm text-muted-foreground">ARIA and keyboard navigation</div>
                  </div>
                  <div className={testResults.tests.accessibility?.supported ? 'text-green-600' : 'text-red-600'}>
                    {testResults.tests.accessibility?.supported ? '✅' : '❌'}
                  </div>
                </div>

                {/* Memory Usage */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-medium">Memory API</div>
                    <div className="text-sm text-muted-foreground">
                      {testResults.tests.memory?.supported ? 'Supported' : 'Not supported'}
                    </div>
                  </div>
                  <div className={testResults.tests.memory?.supported ? 'text-green-600' : 'text-yellow-600'}>
                    {testResults.tests.memory?.supported ? '✅' : '⚠️'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Browser Recommendations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Browser Recommendations
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Chrome 60+</div>
              <div className="text-muted-foreground">Full support for all theme selector features</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Firefox 60+</div>
              <div className="text-muted-foreground">Full support for all theme selector features</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Safari 12+</div>
              <div className="text-muted-foreground">Full support for all theme selector features</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Edge 79+</div>
              <div className="text-muted-foreground">Full support for all theme selector features</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-red-600 mt-1">❌</div>
            <div>
              <div className="font-medium">Internet Explorer</div>
              <div className="text-muted-foreground">Not supported - please use a modern browser</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserTestSuite; 