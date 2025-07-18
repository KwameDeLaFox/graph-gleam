import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChartTypeSelector from './components/ChartTypeSelector';
import ChartRenderer from './components/ChartRenderer';
import ErrorBoundary from './components/ErrorBoundary';
import { loadSampleData, getAllSamples } from './utils/sample-data-loader';
import { testEdgeCases } from './utils/test-edge-cases';
import { testBrowserCompatibility } from './utils/browser-testing';
import { setupAccessibility } from './utils/accessibility-helpers';

function App() {
  const [data, setData] = useState(null);
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compatibilityScore, setCompatibilityScore] = useState(null);

  React.useEffect(() => {
    // Initialize accessibility features
    setupAccessibility();
    
    // Test browser compatibility
    const score = testBrowserCompatibility();
    setCompatibilityScore(score);
    
    // Test edge cases
    testEdgeCases();
  }, []);

  const handleFileUpload = async (fileData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setData(fileData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async (sampleKey = 'SALES_CSV') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sampleData = await loadSampleData(sampleKey);
      setData(sampleData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChartTypeChange = (chartType) => {
    setSelectedChartType(chartType);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-sans">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  Graph Gleam
                </h1>
                <p className="text-muted-foreground mt-1">
                  AI-powered CSV/Excel to Chart.js visualization tool
                </p>
              </div>
              
              {/* Browser Compatibility Badge */}
              {compatibilityScore && (
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    compatibilityScore.score >= 90 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : compatibilityScore.score >= 70
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {compatibilityScore.score}% Compatible
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* File Upload Section */}
            <section className="bg-card rounded-lg border border-border shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Upload Your Data
                  </h2>
                  <p className="text-muted-foreground">
                    Upload CSV or Excel files to create beautiful visualizations
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {getAllSamples().map(sample => (
                    <button
                      key={sample.key}
                      onClick={() => handleLoadSample(sample.key)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      title={sample.description}
                    >
                      {isLoading ? 'Loading...' : sample.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
              </div>
            </section>

            {/* Error Display */}
            {error && (
              <section className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 text-destructive mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-destructive">Error</h3>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Chart Type Selector */}
            {data && (
              <section className="bg-card rounded-lg border border-border shadow-sm p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Choose Chart Type
                </h2>
                <ChartTypeSelector
                  selectedType={selectedChartType}
                  onTypeChange={handleChartTypeChange}
                  data={data}
                />
              </section>
            )}

            {/* Chart Renderer */}
            {data && selectedChartType && (
              <section className="bg-card rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Visualization
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {data.length} data points
                  </div>
                </div>
                <ChartRenderer
                  data={data}
                  chartType={selectedChartType}
                  isLoading={isLoading}
                />
              </section>
            )}

            {/* Empty State */}
            {!data && !isLoading && (
              <section className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No data uploaded yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a CSV or Excel file to get started with your visualization
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {getAllSamples().map(sample => (
                      <button
                        key={sample.key}
                        onClick={() => handleLoadSample(sample.key)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                        title={sample.description}
                      >
                        Try {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-muted-foreground text-sm">
              <p>Graph Gleam - Transform your data into beautiful visualizations</p>
              <p className="mt-1">Built with React, Vite, Chart.js, and Tailwind CSS</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
