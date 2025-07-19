import React, { useState, useRef } from 'react';
import {
  runComprehensiveUXTest,
  logUXTestResults,
  userFlowScenarios,
  testUserFlow,
  testThemeSelectionIntuitiveness,
  testResponsiveDesign
} from '../utils/user-experience-testing';

const UXTestSuite = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const chartRendererRef = useRef(null);
  const fileUploadRef = useRef(null);

  const runFullUXTest = async () => {
    setIsRunning(true);
    setCurrentTest('Comprehensive UX Test');
    
    try {
      const results = await runComprehensiveUXTest(chartRendererRef, fileUploadRef);
      logUXTestResults(results);
      setTestResults(results);
    } catch (error) {
      console.error('UX test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runUserFlowTest = async (scenarioKey) => {
    setIsRunning(true);
    setCurrentTest(`User Flow: ${userFlowScenarios[scenarioKey].name}`);
    
    try {
      const scenario = userFlowScenarios[scenarioKey];
      const results = {
        timestamp: new Date().toISOString(),
        userFlows: {}
      };
      
      results.userFlows[scenarioKey] = await testUserFlow(scenario, chartRendererRef, fileUploadRef);
      setTestResults(results);
    } catch (error) {
      console.error('User flow test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runThemeIntuitivenessTest = async () => {
    setIsRunning(true);
    setCurrentTest('Theme Selection Intuitiveness');
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        themeIntuitiveness: testThemeSelectionIntuitiveness()
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Theme intuitiveness test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // const runExportTest = async () => {
  //   setIsRunning(true);
  //   setCurrentTest('Export Functionality');
    
  //   try {
  //     const results = {
  //       timestamp: new Date().toISOString(),
  //       exportFunctionality: await testExportWithThemes(chartRendererRef)
  //     };
      
  //     setTestResults(results);
  //   } catch (error) {
  //     console.error('Export test failed:', error);
  //     setTestResults({ error: error.message });
  //   } finally {
  //     setIsRunning(false);
  //     setCurrentTest('');
  //   }
  // };

  // const runThemeResetTest = async () => {
  //   setIsRunning(true);
  //   setCurrentTest('Theme Reset Behavior');
    
  //   try {
  //     const results = {
  //       timestamp: new Date().toISOString(),
  //       themeReset: await testThemeResetBehavior(chartRendererRef)
  //     };
      
  //     setTestResults(results);
  //   } catch (error) {
  //     console.error('Theme reset test failed:', error);
  //     setTestResults({ error: error.message });
  //   } finally {
  //     setIsRunning(false);
  //     setCurrentTest('');
  //   }
  // };

  const runResponsiveDesignTest = async () => {
    setIsRunning(true);
    setCurrentTest('Responsive Design');
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        responsiveDesign: testResponsiveDesign()
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Responsive design test failed:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🎯 User Experience Test Suite
        </h2>
        <p className="text-muted-foreground">
          Test complete user flow and ensure intuitive theme selector experience
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={runFullUXTest}
          disabled={isRunning}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning && currentTest === 'Comprehensive UX Test' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running...
            </>
          ) : (
            <>
              🎯 Run Full UX Test
            </>
          )}
        </button>
        
        <button
          onClick={() => runUserFlowTest('basicThemeSelection')}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          🔄 Test Basic Flow
        </button>
        
        <button
          onClick={() => runUserFlowTest('exportWithThemes')}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          💾 Test Export Flow
        </button>
        
        <button
          onClick={runThemeIntuitivenessTest}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          🎨 Test Intuitiveness
        </button>
        
        <button
          onClick={runResponsiveDesignTest}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          📱 Test Responsive
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
                UX Test Results
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
                <div className="text-sm text-muted-foreground">Test Type</div>
                <div className="font-medium">{currentTest || 'Comprehensive'}</div>
              </div>
            </div>

            {testResults.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="text-destructive font-medium">Test Error:</div>
                <div className="text-destructive/80 text-sm">{testResults.error}</div>
              </div>
            )}
          </div>

          {/* User Flow Results */}
          {testResults.userFlows && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                User Flow Testing
              </h4>
              
              <div className="space-y-4">
                {Object.entries(testResults.userFlows).map(([key, flow]) => (
                  <div key={key} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-foreground">{flow.scenario}</h5>
                      <div className={`text-lg font-bold ${getStatusColor(flow.overall.score)}`}>
                        {getStatusIcon(flow.overall.score)} {flow.overall.score}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {flow.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            step.completed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {step.completed ? '✓' : '✗'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{step.action}</div>
                            <div className="text-muted-foreground">{step.expected}</div>
                          </div>
                          <div className="text-muted-foreground">{step.time}ms</div>
                        </div>
                      ))}
                    </div>
                    
                    {flow.overall.issues.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-yellow-800 font-medium">Issues:</div>
                        <ul className="text-yellow-700 text-sm mt-1">
                          {flow.overall.issues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theme Intuitiveness Results */}
          {testResults.themeIntuitiveness && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Theme Selection Intuitiveness
              </h4>
              
              <div className="space-y-4">
                {Object.entries(testResults.themeIntuitiveness).map(([key, test]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.criteria.length} criteria tested
                      </div>
                    </div>
                    <div className={getStatusColor(test.score)}>
                      {getStatusIcon(test.score)} {test.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Functionality Results */}
          {testResults.exportFunctionality && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Export Functionality
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <div className="font-medium">{testResults.exportFunctionality.summary.successRate}%</div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Average Export Time</div>
                  <div className="font-medium">{testResults.exportFunctionality.summary.averageExportTime}ms</div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Themes</div>
                  <div className="font-medium">{testResults.exportFunctionality.summary.totalThemes}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(testResults.exportFunctionality.exports).map(([theme, exportData]) => (
                  <div key={theme} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div className="font-medium capitalize">{theme.replace('-', ' ')}</div>
                    <div className="flex gap-4 text-sm">
                      <span className={exportData.pngExport.success ? 'text-green-600' : 'text-red-600'}>
                        PNG: {exportData.pngExport.success ? '✅' : '❌'} {exportData.pngExport.time}ms
                      </span>
                      <span className={exportData.jpegExport.success ? 'text-green-600' : 'text-red-600'}>
                        JPEG: {exportData.jpegExport.success ? '✅' : '❌'} {exportData.jpegExport.time}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theme Reset Results */}
          {testResults.themeReset && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Theme Reset Behavior
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <div className="font-medium">{testResults.themeReset.summary.successRate}%</div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Average Reset Time</div>
                  <div className="font-medium">{testResults.themeReset.summary.averageResetTime}ms</div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Scenarios</div>
                  <div className="font-medium">{testResults.themeReset.summary.totalScenarios}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {testResults.themeReset.resets.map((reset, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/10 rounded-lg">
                    <div className="text-sm">{reset.scenario}</div>
                    <div className={`text-sm ${reset.success ? 'text-green-600' : 'text-red-600'}`}>
                      {reset.success ? '✅' : '❌'} {reset.time}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsive Design Results */}
          {testResults.responsiveDesign && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Responsive Design
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Average Score</div>
                  <div className="font-medium">{testResults.responsiveDesign.summary.averageScore}%</div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">All Responsive</div>
                  <div className="font-medium">{testResults.responsiveDesign.summary.allResponsive ? '✅' : '❌'}</div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Issues Found</div>
                  <div className="font-medium">{testResults.responsiveDesign.summary.issues}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(testResults.responsiveDesign.breakpoints).map(([name, breakpoint]) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <div className="font-medium">{breakpoint.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {breakpoint.dimensions.width} × {breakpoint.dimensions.height}
                      </div>
                    </div>
                    <div className={getStatusColor(breakpoint.overall.score)}>
                      {getStatusIcon(breakpoint.overall.score)} {breakpoint.overall.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* UX Requirements */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          User Experience Requirements
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Intuitive Theme Selection</div>
              <div className="text-muted-foreground">Theme selection should feel natural and discoverable</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Clear Visual Feedback</div>
              <div className="text-muted-foreground">Users should see immediate feedback on theme changes</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Smooth User Flow</div>
              <div className="text-muted-foreground">Complete user journey should be seamless</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Responsive Design</div>
              <div className="text-muted-foreground">Theme selector should work on all screen sizes</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Export Integration</div>
              <div className="text-muted-foreground">Export should reflect selected theme correctly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UXTestSuite; 