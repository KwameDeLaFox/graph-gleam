// Browser Compatibility Testing Utility
// Tests functionality across different browsers and provides compatibility reports

/**
 * Browser feature detection and compatibility testing
 */
export const browserCompatibilityTest = () => {
  console.log('🌐 Starting browser compatibility testing...');
  
  const results = {
    browser: detectBrowser(),
    features: {},
    warnings: [],
    errors: [],
    score: 0,
    totalTests: 0
  };

  // Test 1: Basic JavaScript features
  testFeature(results, 'ES6 Support', () => {
    try {
      // Test arrow functions, const/let, template literals
      const test = (x) => `Result: ${x}`;
      const result = test(42);
      return result === 'Result: 42';
    } catch (e) {
      return false;
    }
  });

  // Test 2: File API support
  testFeature(results, 'File API', () => {
    return typeof File !== 'undefined' && 
           typeof FileReader !== 'undefined' && 
           typeof Blob !== 'undefined';
  });

  // Test 3: Canvas support (required for Chart.js)
  testFeature(results, 'Canvas API', () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch (e) {
      return false;
    }
  });

  // Test 4: Fetch API support
  testFeature(results, 'Fetch API', () => {
    return typeof fetch !== 'undefined';
  });

  // Test 5: Promise support
  testFeature(results, 'Promises', () => {
    return typeof Promise !== 'undefined';
  });

  // Test 6: Array methods (Chart.js dependencies)
  testFeature(results, 'Modern Array Methods', () => {
    return typeof Array.prototype.find !== 'undefined' && 
           typeof Array.prototype.includes !== 'undefined' &&
           typeof Array.prototype.from !== 'undefined';
  });

  // Test 7: CSS Grid support (layout)
  testFeature(results, 'CSS Grid', () => {
    try {
      const element = document.createElement('div');
      element.style.display = 'grid';
      return element.style.display === 'grid';
    } catch (e) {
      return false;
    }
  });

  // Test 8: CSS Flexbox support
  testFeature(results, 'CSS Flexbox', () => {
    try {
      const element = document.createElement('div');
      element.style.display = 'flex';
      return element.style.display === 'flex';
    } catch (e) {
      return false;
    }
  });

  // Test 9: Web Workers (for performance optimization)
  testFeature(results, 'Web Workers', () => {
    return typeof Worker !== 'undefined';
  });

  // Test 10: Local Storage
  testFeature(results, 'Local Storage', () => {
    try {
      return typeof localStorage !== 'undefined' && localStorage !== null;
    } catch (e) {
      return false;
    }
  });

  // Test 11: Touch events (mobile compatibility)
  testFeature(results, 'Touch Events', () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  // Test 12: Clipboard API
  testFeature(results, 'Clipboard API', () => {
    return typeof navigator.clipboard !== 'undefined';
  });

  // Calculate compatibility score
  results.score = Math.round((Object.values(results.features).filter(Boolean).length / results.totalTests) * 100);

  // Generate warnings and recommendations
  generateCompatibilityWarnings(results);

  console.log(`✅ Browser compatibility test complete: ${results.score}% compatible`);
  return results;
};

/**
 * Detect current browser and version
 */
const detectBrowser = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('MSIE') || ua.includes('Trident')) {
    browser = 'Internet Explorer';
    const match = ua.match(/(?:MSIE |rv:)(\d+)/);
    version = match ? match[1] : 'Unknown';
  }

  return {
    name: browser,
    version: version,
    userAgent: ua,
    isMobile: /Mobile|Android|iPhone|iPad/i.test(ua),
    isTablet: /iPad|Tablet/i.test(ua)
  };
};

/**
 * Test individual browser feature
 */
const testFeature = (results, featureName, testFn) => {
  results.totalTests++;
  try {
    const supported = testFn();
    results.features[featureName] = supported;
    
    if (supported) {
      console.log(`  ✅ ${featureName}: Supported`);
    } else {
      console.log(`  ❌ ${featureName}: Not supported`);
    }
  } catch (error) {
    results.features[featureName] = false;
    results.errors.push(`${featureName}: ${error.message}`);
    console.log(`  ❌ ${featureName}: Error - ${error.message}`);
  }
};

/**
 * Generate compatibility warnings and recommendations
 */
const generateCompatibilityWarnings = (results) => {
  const { browser, features } = results;

  // Critical feature warnings
  if (!features['File API']) {
    results.warnings.push({
      severity: 'critical',
      message: 'File API not supported - file uploads will not work',
      recommendation: 'Please use a modern browser (Chrome 13+, Firefox 7+, Safari 6+, Edge 12+)'
    });
  }

  if (!features['Canvas API']) {
    results.warnings.push({
      severity: 'critical',
      message: 'Canvas API not supported - charts cannot be rendered',
      recommendation: 'Please use a browser that supports HTML5 Canvas'
    });
  }

  if (!features['Fetch API']) {
    results.warnings.push({
      severity: 'medium',
      message: 'Fetch API not supported - may affect sample data loading',
      recommendation: 'Consider using a polyfill or upgrading your browser'
    });
  }

  // Browser-specific warnings
  if (browser.name === 'Internet Explorer') {
    results.warnings.push({
      severity: 'critical',
      message: 'Internet Explorer is not supported',
      recommendation: 'Please use a modern browser like Chrome, Firefox, Safari, or Edge'
    });
  }

  if (browser.name === 'Safari' && parseInt(browser.version) < 12) {
    results.warnings.push({
      severity: 'medium',
      message: 'Older Safari version detected',
      recommendation: 'Please update to Safari 12+ for best compatibility'
    });
  }

  if (browser.name === 'Firefox' && parseInt(browser.version) < 60) {
    results.warnings.push({
      severity: 'medium',
      message: 'Older Firefox version detected',
      recommendation: 'Please update to Firefox 60+ for best compatibility'
    });
  }

  if (browser.name === 'Chrome' && parseInt(browser.version) < 60) {
    results.warnings.push({
      severity: 'medium',
      message: 'Older Chrome version detected',
      recommendation: 'Please update to Chrome 60+ for best compatibility'
    });
  }

  // Performance warnings
  if (!features['Web Workers']) {
    results.warnings.push({
      severity: 'low',
      message: 'Web Workers not supported - large file processing may be slower',
      recommendation: 'Performance may be impacted with very large datasets'
    });
  }

  // Mobile-specific checks
  if (browser.isMobile) {
    if (!features['Touch Events']) {
      results.warnings.push({
        severity: 'medium',
        message: 'Touch events not properly supported on mobile device',
        recommendation: 'Some interactions may not work as expected'
      });
    }
  }
};

/**
 * Test Chart.js compatibility specifically
 */
export const testChartJSCompatibility = () => {
  console.log('📊 Testing Chart.js compatibility...');
  
  const tests = {
    canvas: false,
    webGL: false,
    devicePixelRatio: false,
    performance: false
  };

  // Test canvas 2D context
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    tests.canvas = !!ctx;
  } catch (e) {
    tests.canvas = false;
  }

  // Test WebGL support (for potential future use)
  try {
    const canvas = document.createElement('canvas');
    const webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    tests.webGL = !!webgl;
  } catch (e) {
    tests.webGL = false;
  }

  // Test device pixel ratio support (for high-DPI displays)
  tests.devicePixelRatio = typeof window.devicePixelRatio !== 'undefined';

  // Test performance API (for optimization)
  tests.performance = typeof performance !== 'undefined' && typeof performance.now === 'function';

  console.log('Chart.js compatibility results:', tests);
  return tests;
};

/**
 * Test file handling compatibility
 */
export const testFileHandlingCompatibility = () => {
  console.log('📁 Testing file handling compatibility...');
  
  const tests = {
    fileAPI: false,
    dragDrop: false,
    fileReader: false,
    arrayBuffer: false,
    blob: false
  };

  // File API
  tests.fileAPI = typeof File !== 'undefined' && typeof FileList !== 'undefined';

  // Drag and drop
  tests.dragDrop = 'ondragstart' in document.createElement('div') && 
                   'ondrop' in document.createElement('div');

  // FileReader
  tests.fileReader = typeof FileReader !== 'undefined';

  // ArrayBuffer support (for Excel files)
  tests.arrayBuffer = typeof ArrayBuffer !== 'undefined';

  // Blob support
  tests.blob = typeof Blob !== 'undefined';

  console.log('File handling compatibility results:', tests);
  return tests;
};

/**
 * Run comprehensive browser test suite
 */
export const runFullBrowserTestSuite = () => {
  console.log('🔍 Running full browser test suite...');
  
  const results = {
    timestamp: new Date().toISOString(),
    browserInfo: detectBrowser(),
    compatibility: browserCompatibilityTest(),
    chartJS: testChartJSCompatibility(),
    fileHandling: testFileHandlingCompatibility(),
    recommendations: []
  };

  // Generate overall recommendations
  const overallScore = results.compatibility.score;
  
  if (overallScore >= 90) {
    results.recommendations.push('✅ Excellent browser compatibility - all features supported');
  } else if (overallScore >= 75) {
    results.recommendations.push('⚠️ Good compatibility - minor features may be limited');
  } else if (overallScore >= 50) {
    results.recommendations.push('⚠️ Limited compatibility - some features may not work');
  } else {
    results.recommendations.push('❌ Poor compatibility - browser upgrade recommended');
  }

  // Check for critical failures
  if (!results.fileHandling.fileAPI) {
    results.recommendations.push('❌ Critical: File uploads will not work in this browser');
  }

  if (!results.chartJS.canvas) {
    results.recommendations.push('❌ Critical: Charts cannot be displayed in this browser');
  }

  console.log(`\n📋 Browser Test Summary:`);
  console.log(`Browser: ${results.browserInfo.name} ${results.browserInfo.version}`);
  console.log(`Compatibility Score: ${overallScore}%`);
  console.log(`Mobile Device: ${results.browserInfo.isMobile ? 'Yes' : 'No'}`);
  console.log(`Recommendations:`);
  results.recommendations.forEach(rec => console.log(`  ${rec}`));

  return results;
};

/**
 * Browser-specific optimizations and polyfills
 */
export const applyBrowserOptimizations = () => {
  const browser = detectBrowser();
  
  // Safari-specific optimizations
  if (browser.name === 'Safari') {
    // Add CSS for Safari-specific styling
    document.documentElement.style.setProperty('--webkit-appearance', 'none');
  }
  
  // Firefox-specific optimizations
  if (browser.name === 'Firefox') {
    // Firefox sometimes has issues with flexbox
    document.documentElement.classList.add('firefox');
  }
  
  // Mobile optimizations
  if (browser.isMobile) {
    // Add mobile-specific CSS class
    document.documentElement.classList.add('mobile');
    
    // Disable zoom on input focus (iOS)
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  }
}; 