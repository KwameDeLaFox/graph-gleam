import React, { useState } from 'react';
import {
  runComprehensiveIntegrationTest,
  logIntegrationTestResults,
  testAcceptanceCriteria,
  testEdgeCases
} from '../utils/integration-test';

const IntegrationTestSuite = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const runFullIntegrationTest = async () => {
    setIsRunning(true);
    setCurrentTest('Comprehensive Integration Test');
    
    try {
      const results = await runComprehensiveIntegrationTest();
      logIntegrationTestResults(results);
      setTestResults(results);
    } catch (error) {
      console.error('Integration test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runAcceptanceCriteriaTest = async () => {
    setIsRunning(true);
    setCurrentTest('Acceptance Criteria Test');
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        acceptanceCriteria: testAcceptanceCriteria()
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Acceptance criteria test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runEdgeCaseTest = async () => {
    setIsRunning(true);
    setCurrentTest('Edge Case Test');
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        edgeCases: testEdgeCases()
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Edge case test failed:', error);
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

  const getProductionReadyStatus = (results) => {
    if (!results || !results.summary) return false;
    return results.summary.readyForProduction || false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🚀 Integration Test Suite
        </h2>
        <p className="text-muted-foreground">
          Comprehensive testing of theme selector feature integration
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={runFullIntegrationTest}
          disabled={isRunning}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning && currentTest === 'Comprehensive Integration Test' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running...
            </>
          ) : (
            <>
              🚀 Run Full Integration Test
            </>
          )}
        </button>
        
        <button
          onClick={runAcceptanceCriteriaTest}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          📋 Test Acceptance Criteria
        </button>
        
        <button
          onClick={runEdgeCaseTest}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          🔍 Test Edge Cases
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
          {testResults.summary && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Integration Test Results
                </h3>
                <div className={`text-2xl font-bold ${getStatusColor(testResults.summary.overallScore)}`}>
                  {getStatusIcon(testResults.summary.overallScore)} {testResults.summary.overallScore}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">{testResults.summary.status}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Production Ready</div>
                  <div className={`font-medium ${getProductionReadyStatus(testResults) ? 'text-green-600' : 'text-red-600'}`}>
                    {getProductionReadyStatus(testResults) ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">All Tests Passed</div>
                  <div className={`font-medium ${testResults.summary.allTestsPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.summary.allTestsPassed ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Timestamp</div>
                  <div className="font-medium">{new Date(testResults.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              {testResults.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="text-destructive font-medium">Test Error:</div>
                  <div className="text-destructive/80 text-sm">{testResults.error}</div>
                </div>
              )}

              {/* Production Ready Banner */}
              {getProductionReadyStatus(testResults) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-green-600 text-2xl">🎉</div>
                    <div>
                      <div className="font-medium text-green-800">Feature Ready for Production!</div>
                      <div className="text-sm text-green-700">
                        All acceptance criteria met and edge cases handled. The theme selector is ready for deployment.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acceptance Criteria Results */}
          {testResults.acceptanceCriteria && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Acceptance Criteria Results
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                  <div className="text-2xl font-bold">{testResults.acceptanceCriteria.summary.overallScore}%</div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Functional</div>
                  <div className="text-2xl font-bold">{testResults.acceptanceCriteria.summary.functionalScore}%</div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Performance</div>
                  <div className="text-2xl font-bold">{testResults.acceptanceCriteria.summary.performanceScore}%</div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">User Experience</div>
                  <div className="text-2xl font-bold">{testResults.acceptanceCriteria.summary.userExperienceScore}%</div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Functional Requirements */}
                <div>
                  <h5 className="font-medium text-foreground mb-3">Functional Requirements</h5>
                  <div className="space-y-2">
                    {Object.entries(testResults.acceptanceCriteria.functional).map(([test, result]) => (
                      <div key={test} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                        <div className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.passed ? '✅' : '❌'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Requirements */}
                <div>
                  <h5 className="font-medium text-foreground mb-3">Performance Requirements</h5>
                  <div className="space-y-2">
                    {Object.entries(testResults.acceptanceCriteria.performance).map(([test, result]) => (
                      <div key={test} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                        <div className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.passed ? '✅' : '❌'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Experience Requirements */}
                <div>
                  <h5 className="font-medium text-foreground mb-3">User Experience Requirements</h5>
                  <div className="space-y-2">
                    {Object.entries(testResults.acceptanceCriteria.userExperience).map(([test, result]) => (
                      <div key={test} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                        <div className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.passed ? '✅' : '❌'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Requirements */}
                <div>
                  <h5 className="font-medium text-foreground mb-3">Technical Requirements</h5>
                  <div className="space-y-2">
                    {Object.entries(testResults.acceptanceCriteria.technical).map(([test, result]) => (
                      <div key={test} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-sm text-muted-foreground">{result.details}</div>
                        </div>
                        <div className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.passed ? '✅' : '❌'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edge Case Results */}
          {testResults.edgeCases && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Edge Case Results
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Edge Case Score</div>
                  <div className="text-2xl font-bold">{testResults.edgeCases.summary.edgeCaseScore}%</div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-2xl font-bold">{testResults.edgeCases.summary.status}</div>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(testResults.edgeCases.edgeCases).map(([test, result]) => (
                  <div key={test} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm text-muted-foreground">{result.details}</div>
                    </div>
                    <div className={result.passed ? 'text-green-600' : 'text-red-600'}>
                      {result.passed ? '✅' : '❌'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Integration Test Information
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Acceptance Criteria Testing</div>
              <div className="text-muted-foreground">Tests all functional, performance, user experience, and technical requirements</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Edge Case Testing</div>
              <div className="text-muted-foreground">Tests rapid switching, large datasets, network issues, memory pressure, and concurrent operations</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Production Readiness</div>
              <div className="text-muted-foreground">Determines if the feature is ready for production deployment</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Comprehensive Coverage</div>
              <div className="text-muted-foreground">Tests all aspects of the theme selector feature integration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestSuite; 