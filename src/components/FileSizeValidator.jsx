import React, { useState } from 'react';
import {
  runComprehensiveFileSizeValidation,
  logFileSizeValidationResults,
  analyzeThemeFileSizes,
  analyzeBundleSize,
  calculateSizeImpact,
  formatBytes
} from '../utils/file-size-validator';

const FileSizeValidator = () => {
  const [validationResults, setValidationResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runFullValidation = async () => {
    setIsRunning(true);
    
    try {
      const results = await runComprehensiveFileSizeValidation();
      logFileSizeValidationResults(results);
      setValidationResults(results);
    } catch (error) {
      console.error('File size validation failed:', error);
      setValidationResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const runThemeFileAnalysis = () => {
    const results = {
      timestamp: new Date().toISOString(),
      themeFiles: analyzeThemeFileSizes()
    };
    setValidationResults(results);
  };

  const runBundleAnalysis = () => {
    const results = {
      timestamp: new Date().toISOString(),
      bundleAnalysis: analyzeBundleSize(),
      sizeImpact: calculateSizeImpact()
    };
    setValidationResults(results);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          📦 File Size Validator
        </h2>
        <p className="text-muted-foreground">
          Measure theme selector impact on application bundle size
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={runFullValidation}
          disabled={isRunning}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running...
            </>
          ) : (
            <>
              📦 Run Full Validation
            </>
          )}
        </button>
        
        <button
          onClick={runThemeFileAnalysis}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          📁 Analyze Theme Files
        </button>
        
        <button
          onClick={runBundleAnalysis}
          disabled={isRunning}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          📦 Analyze Bundle Size
        </button>
      </div>

      {/* Validation Results */}
      {validationResults && (
        <div className="space-y-4">
          {/* Overall Results */}
          {validationResults.summary && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  File Size Validation Results
                </h3>
                <div className={`text-2xl font-bold ${getStatusColor(validationResults.summary.overallScore)}`}>
                  {getStatusIcon(validationResults.summary.overallScore)} {validationResults.summary.overallScore}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">{validationResults.summary.status}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Requirements Met</div>
                  <div className="font-medium">{validationResults.summary.requirementsMet}/{validationResults.summary.totalRequirements}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Recommendations</div>
                  <div className="font-medium">{validationResults.summary.recommendationsCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Timestamp</div>
                  <div className="font-medium">{new Date(validationResults.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              {validationResults.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="text-destructive font-medium">Validation Error:</div>
                  <div className="text-destructive/80 text-sm">{validationResults.error}</div>
                </div>
              )}
            </div>
          )}

          {/* Theme File Analysis */}
          {validationResults.themeFiles && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Theme File Size Analysis
              </h4>
              
              <div className="space-y-4">
                {Object.entries(validationResults.themeFiles).map(([filename, file]) => (
                  <div key={filename} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-foreground">{filename}</h5>
                      <div className="text-sm text-muted-foreground">
                        {file.estimatedSize}KB ({file.gzippedSize}KB gzipped)
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      {file.description}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Raw Size</div>
                        <div className="font-medium">{formatBytes(file.estimatedSize * 1024)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Gzipped Size</div>
                        <div className="font-medium">{formatBytes(file.gzippedSize * 1024)}</div>
                      </div>
                    </div>
                    
                    {file.functions && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Functions</div>
                        <div className="flex flex-wrap gap-1">
                          {file.functions.map((func, index) => (
                            <span key={index} className="px-2 py-1 bg-muted/20 rounded text-xs">
                              {func}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {file.features && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Features</div>
                        <div className="flex flex-wrap gap-1">
                          {file.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-muted/20 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bundle Size Analysis */}
          {validationResults.bundleAnalysis && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Bundle Size Analysis
              </h4>
              
              <div className="space-y-4">
                {Object.entries(validationResults.bundleAnalysis).map(([key, bundle]) => (
                  <div key={key} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-foreground">{bundle.description}</h5>
                      <div className="text-sm text-muted-foreground">
                        {bundle.estimatedSize}KB ({bundle.gzippedSize}KB gzipped)
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Raw Size</div>
                        <div className="font-medium">{formatBytes(bundle.estimatedSize * 1024)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Gzipped Size</div>
                        <div className="font-medium">{formatBytes(bundle.gzippedSize * 1024)}</div>
                      </div>
                    </div>
                    
                    {bundle.components && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Components</div>
                        <div className="flex flex-wrap gap-1">
                          {bundle.components.map((component, index) => (
                            <span key={index} className="px-2 py-1 bg-muted/20 rounded text-xs">
                              {component}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {bundle.additionalComponents && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Additional Components</div>
                        <div className="flex flex-wrap gap-1">
                          {bundle.additionalComponents.map((component, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {component}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Impact Analysis */}
          {validationResults.sizeImpact && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Size Impact Analysis
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Theme Size</div>
                  <div className="text-2xl font-bold">{validationResults.sizeImpact.totalThemeSize.formatted.raw}</div>
                  <div className="text-xs text-muted-foreground">
                    {validationResults.sizeImpact.totalThemeSize.formatted.gzipped} gzipped
                  </div>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Per Theme</div>
                  <div className="text-2xl font-bold">{validationResults.sizeImpact.perTheme.formatted.raw}</div>
                  <div className="text-xs text-muted-foreground">
                    {validationResults.sizeImpact.perTheme.formatted.gzipped} gzipped
                  </div>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Bundle Increase</div>
                  <div className="text-2xl font-bold">{validationResults.sizeImpact.bundleIncrease.raw.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">
                    {validationResults.sizeImpact.bundleIncrease.gzipped.toFixed(2)}% gzipped
                  </div>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Requirements</div>
                  <div className="text-2xl font-bold">
                    {Object.values(validationResults.sizeImpact.requirements).filter(Boolean).length}/{Object.keys(validationResults.sizeImpact.requirements).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Met</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(validationResults.sizeImpact.requirements).map(([requirement, met]) => (
                  <div key={requirement} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{requirement.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm text-muted-foreground">
                        {requirement === 'meetsPerThemeRequirement' && '≤10KB per theme'}
                        {requirement === 'meetsTotalRequirement' && '≤30KB total'}
                        {requirement === 'meetsGzippedRequirement' && '≤10KB gzipped total'}
                      </div>
                    </div>
                    <div className={met ? 'text-green-600' : 'text-red-600'}>
                      {met ? '✅' : '❌'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load Time Impact */}
          {validationResults.loadTimeImpact && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Load Time Impact
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Base Load Time</div>
                  <div className="text-2xl font-bold">{validationResults.loadTimeImpact.baseLoadTime.estimatedTime}s</div>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">With Theme Selector</div>
                  <div className="text-2xl font-bold">{validationResults.loadTimeImpact.withThemeSelector.estimatedTime}s</div>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Time Increase</div>
                  <div className="text-2xl font-bold">{validationResults.loadTimeImpact.impact.timeIncrease}s</div>
                  <div className="text-xs text-muted-foreground">
                    {validationResults.loadTimeImpact.impact.percentageIncrease.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${
                validationResults.loadTimeImpact.impact.acceptable 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${
                  validationResults.loadTimeImpact.impact.acceptable ? 'text-green-800' : 'text-red-800'
                }`}>
                  Load Time Impact: {validationResults.loadTimeImpact.impact.acceptable ? 'Acceptable' : 'Unacceptable'}
                </div>
                <div className={`text-sm ${
                  validationResults.loadTimeImpact.impact.acceptable ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validationResults.loadTimeImpact.impact.acceptable 
                    ? 'Load time increase is within acceptable limits (<5%)'
                    : 'Load time increase exceeds acceptable limits'
                  }
                </div>
              </div>
            </div>
          )}

          {/* Performance Impact */}
          {validationResults.performanceImpact && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Performance Impact
              </h4>
              
              <div className="space-y-4">
                {Object.entries(validationResults.performanceImpact).map(([key, impact]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium">{impact.description}</div>
                      <div className="text-sm text-muted-foreground">{impact.reason}</div>
                    </div>
                    <div className="text-green-600 font-medium">{impact.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimization Recommendations */}
          {validationResults.recommendations && validationResults.recommendations.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Optimization Recommendations
              </h4>
              
              <div className="space-y-4">
                {validationResults.recommendations.map((rec, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`text-lg ${getPriorityColor(rec.priority)}`}>
                        {getPriorityIcon(rec.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-sm text-muted-foreground">{rec.description}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority} priority
                      </div>
                    </div>
                    
                    <div className="ml-8">
                      <div className="text-sm text-muted-foreground mb-2">Suggestions:</div>
                      <ul className="space-y-1">
                        {rec.suggestions.map((suggestion, suggestionIndex) => (
                          <li key={suggestionIndex} className="text-sm flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Size Requirements */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          File Size Requirements
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Per Theme: ≤10KB</div>
              <div className="text-muted-foreground">Each theme should add no more than 10KB to the bundle</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Total Theme Selector: ≤30KB</div>
              <div className="text-muted-foreground">Total theme selector should add no more than 30KB</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Gzipped: ≤10KB</div>
              <div className="text-muted-foreground">Gzipped theme selector should be ≤10KB</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-1">✅</div>
            <div>
              <div className="font-medium">Load Time Impact: ≤5%</div>
              <div className="text-muted-foreground">Theme selector should not increase load time by more than 5%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSizeValidator; 