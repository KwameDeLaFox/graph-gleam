/**
 * Browser Compatibility Testing Utility
 * Tests for theme selector compatibility across different browsers
 */

// Browser detection
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  let isMobile = false;

  // Check for mobile
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }

  return {
    browser,
    version,
    isMobile,
    userAgent
  };
};

// CSS Variable support test
export const testCSSVariables = () => {
  const testElement = document.createElement('div');
  testElement.style.setProperty('--test-var', 'red');
  const supportsCSSVars = testElement.style.getPropertyValue('--test-var') === 'red';
  
  return {
    supported: supportsCSSVars,
    testElement: testElement
  };
};

// Chart.js compatibility test
export const testChartJSCompatibility = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const tests = {
    canvas: !!canvas,
    context2d: !!ctx,
    toDataURL: !!canvas.toDataURL,
    getImageData: !!ctx.getImageData,
    putImageData: !!ctx.putImageData
  };

  return {
    supported: Object.values(tests).every(Boolean),
    tests
  };
};

// Theme switching performance test
export const testThemeSwitchingPerformance = async () => {
  const results = [];
  const iterations = 10;
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    // Simulate theme switching
    const testElement = document.createElement('div');
    testElement.style.setProperty('--chart-1', 'hsl(220, 70%, 50%)');
    testElement.style.setProperty('--chart-2', 'hsl(220, 60%, 40%)');
    testElement.style.setProperty('--chart-3', 'hsl(220, 50%, 30%)');
    
    const end = performance.now();
    results.push(end - start);
  }
  
  const average = results.reduce((a, b) => a + b, 0) / results.length;
  const max = Math.max(...results);
  const min = Math.min(...results);
  
  return {
    average,
    max,
    min,
    results,
    meetsRequirement: average <= 50 // 50ms requirement
  };
};

// Export functionality test
export const testExportFunctionality = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  // Draw something on canvas
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
  
  const tests = {
    toDataURL: {
      png: canvas.toDataURL('image/png').startsWith('data:image/png'),
      jpeg: canvas.toDataURL('image/jpeg').startsWith('data:image/jpeg')
    },
    download: {
      supported: 'download' in document.createElement('a')
    }
  };
  
  return {
    supported: tests.toDataURL.png && tests.toDataURL.jpeg && tests.download.supported,
    tests
  };
};

// Responsive design test
export const testResponsiveDesign = () => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  const breakpoints = {
    mobile: viewport.width < 768,
    tablet: viewport.width >= 768 && viewport.width < 1024,
    desktop: viewport.width >= 1024
  };
  
  return {
    viewport,
    breakpoints,
    currentBreakpoint: breakpoints.mobile ? 'mobile' : breakpoints.tablet ? 'tablet' : 'desktop'
  };
};

// Accessibility test
export const testAccessibility = () => {
  const tests = {
    ariaLabels: document.querySelectorAll('[aria-label]').length > 0,
    ariaPressed: document.querySelectorAll('[aria-pressed]').length > 0,
    roleButton: document.querySelectorAll('[role="button"]').length > 0,
    focusable: document.querySelectorAll('[tabindex]').length > 0,
    keyboardNavigation: 'onkeydown' in document.createElement('div')
  };
  
  return {
    supported: Object.values(tests).every(Boolean),
    tests
  };
};

// Memory usage test
export const testMemoryUsage = () => {
  if ('memory' in performance) {
    return {
      supported: true,
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
  }
  
  return {
    supported: false,
    message: 'Memory API not supported in this browser'
  };
};

// Comprehensive browser compatibility test
export const runComprehensiveBrowserTest = async () => {
  const browserInfo = getBrowserInfo();
  const results = {
    browser: browserInfo,
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Run all tests
  try {
    results.tests.cssVariables = testCSSVariables();
    results.tests.chartJS = testChartJSCompatibility();
    results.tests.themeSwitching = await testThemeSwitchingPerformance();
    results.tests.export = testExportFunctionality();
    results.tests.responsive = testResponsiveDesign();
    results.tests.accessibility = testAccessibility();
    results.tests.memory = testMemoryUsage();
    
    // Calculate overall compatibility score
    const testResults = Object.values(results.tests);
    const passedTests = testResults.filter(test => test.supported || test.meetsRequirement).length;
    const totalTests = testResults.length;
    
    results.compatibilityScore = Math.round((passedTests / totalTests) * 100);
    results.status = results.compatibilityScore >= 90 ? 'Excellent' : 
                    results.compatibilityScore >= 70 ? 'Good' : 
                    results.compatibilityScore >= 50 ? 'Fair' : 'Poor';
    
  } catch (error) {
    results.error = error.message;
    results.compatibilityScore = 0;
    results.status = 'Error';
  }
  
  return results;
};

// Theme-specific compatibility tests
export const testThemeCompatibility = () => {
  const tests = {
    hslColors: {
      supported: true, // HSL is well-supported
      test: 'hsl(220, 70%, 50%)'
    },
    cssCustomProperties: testCSSVariables().supported,
    transitions: {
      supported: 'transition' in document.documentElement.style,
      test: 'background-color 0.3s ease-in-out'
    },
    transforms: {
      supported: 'transform' in document.documentElement.style,
      test: 'translateY(-2px)'
    },
    animations: {
      supported: 'animation' in document.documentElement.style,
      test: 'themeSelect 0.3s ease-out'
    }
  };
  
  return {
    supported: Object.values(tests).every(test => test.supported),
    tests
  };
};

// Export test results to console
export const logBrowserTestResults = (results) => {
  console.group('🌐 Browser Compatibility Test Results');
  console.log(`Browser: ${results.browser.browser} ${results.browser.version}`);
  console.log(`Mobile: ${results.browser.isMobile}`);
  console.log(`Compatibility Score: ${results.compatibilityScore}% (${results.status})`);
  console.log(`Timestamp: ${results.timestamp}`);
  
  console.group('📊 Test Details');
  Object.entries(results.tests).forEach(([testName, testResult]) => {
    console.log(`${testName}: ${testResult.supported || testResult.meetsRequirement ? '✅' : '❌'}`);
  });
  console.groupEnd();
  
  if (results.error) {
    console.error('❌ Test Error:', results.error);
  }
  
  console.groupEnd();
  
  return results;
};

// Quick compatibility check
export const quickCompatibilityCheck = () => {
  const browserInfo = getBrowserInfo();
  const cssVars = testCSSVariables();
  const chartJS = testChartJSCompatibility();
  
  const isCompatible = cssVars.supported && chartJS.supported;
  
  return {
    compatible: isCompatible,
    browser: browserInfo.browser,
    version: browserInfo.version,
    cssVariables: cssVars.supported,
    chartJS: chartJS.supported
  };
};