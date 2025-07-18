// Accessibility and UX Enhancement Utilities
// Provides comprehensive accessibility features and user experience improvements

/**
 * Initialize accessibility features on app startup
 */
export const initializeAccessibility = () => {
  console.log('♿ Initializing accessibility features...');
  
  // Add skip links for keyboard navigation
  addSkipLinks();
  
  // Setup keyboard navigation helpers
  setupKeyboardNavigation();
  
  // Add focus management
  setupFocusManagement();
  
  // Setup screen reader announcements
  setupScreenReaderSupport();
  
  // Add reduced motion preferences
  setupReducedMotionSupport();
  
  // Setup high contrast mode detection
  setupHighContrastSupport();
  
  console.log('✅ Accessibility features initialized');
};

/**
 * Add skip navigation links for keyboard users
 */
const addSkipLinks = () => {
  const skipNav = document.createElement('a');
  skipNav.href = '#main-content';
  skipNav.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md';
  skipNav.textContent = 'Skip to main content';
  skipNav.setAttribute('aria-label', 'Skip navigation to main content');
  
  document.body.insertBefore(skipNav, document.body.firstChild);
  
  // Add main content ID if it doesn't exist
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main-content';
  }
};

/**
 * Setup enhanced keyboard navigation
 */
const setupKeyboardNavigation = () => {
  // Enhanced Tab navigation
  document.addEventListener('keydown', (e) => {
    // Escape key to close modals/dropdowns
    if (e.key === 'Escape') {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
      
      // Clear any error states
      const event = new CustomEvent('escapePressed');
      document.dispatchEvent(event);
    }
    
    // Arrow key navigation for chart type selector
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const chartButtons = document.querySelectorAll('[role="button"][aria-pressed]');
      const currentIndex = Array.from(chartButtons).findIndex(btn => btn === document.activeElement);
      
      if (currentIndex !== -1) {
        e.preventDefault();
        const nextIndex = e.key === 'ArrowRight' 
          ? Math.min(currentIndex + 1, chartButtons.length - 1)
          : Math.max(currentIndex - 1, 0);
        
        chartButtons[nextIndex]?.focus();
      }
    }
  });
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+U or Cmd+U to focus file upload
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.focus();
        fileInput.click();
      }
    }
    
    // Ctrl+E or Cmd+E to export chart
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
      const exportButton = document.querySelector('button[data-export="png"]');
      if (exportButton && !exportButton.disabled) {
        e.preventDefault();
        exportButton.click();
      }
    }
  });
};

/**
 * Setup focus management and visual indicators
 */
const setupFocusManagement = () => {
  // Add custom focus styles
  const focusStyle = document.createElement('style');
  focusStyle.textContent = `
    .focus-visible {
      outline: 2px solid #3B82F6 !important;
      outline-offset: 2px !important;
      border-radius: 4px;
    }
    
    .focus-visible:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
    }
    
    /* Hide focus for mouse users, show for keyboard users */
    .js-focus-visible :focus:not(.focus-visible) {
      outline: none;
    }
  `;
  document.head.appendChild(focusStyle);
  
  // Track focus method (mouse vs keyboard)
  let isMouseUser = false;
  
  document.addEventListener('mousedown', () => {
    isMouseUser = true;
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isMouseUser = false;
    }
  });
  
  // Apply focus-visible class
  document.addEventListener('focus', (e) => {
    if (!isMouseUser) {
      e.target.classList.add('focus-visible');
    }
  }, true);
  
  document.addEventListener('blur', (e) => {
    e.target.classList.remove('focus-visible');
  }, true);
};

/**
 * Setup screen reader support and live regions
 */
const setupScreenReaderSupport = () => {
  // Create live region for announcements
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = 'live-region';
  document.body.appendChild(liveRegion);
  
  // Create assertive live region for important updates
  const assertiveLiveRegion = document.createElement('div');
  assertiveLiveRegion.setAttribute('aria-live', 'assertive');
  assertiveLiveRegion.setAttribute('aria-atomic', 'true');
  assertiveLiveRegion.className = 'sr-only';
  assertiveLiveRegion.id = 'assertive-live-region';
  document.body.appendChild(assertiveLiveRegion);
};

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {boolean} assertive - Whether to use assertive live region
 */
export const announceToScreenReader = (message, assertive = false) => {
  const regionId = assertive ? 'assertive-live-region' : 'live-region';
  const liveRegion = document.getElementById(regionId);
  
  if (liveRegion) {
    // Clear first, then set message to ensure it's announced
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }
};

/**
 * Setup reduced motion preferences support
 */
const setupReducedMotionSupport = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const updateMotionPreference = (mediaQuery) => {
    if (mediaQuery.matches) {
      document.documentElement.classList.add('reduced-motion');
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0.1s');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }
  };
  
  // Initial check
  updateMotionPreference(prefersReducedMotion);
  
  // Listen for changes
  prefersReducedMotion.addEventListener('change', updateMotionPreference);
};

/**
 * Setup high contrast mode support
 */
const setupHighContrastSupport = () => {
  const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
  
  const updateContrastPreference = (mediaQuery) => {
    if (mediaQuery.matches) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };
  
  // Initial check
  updateContrastPreference(highContrastQuery);
  
  // Listen for changes
  if (highContrastQuery.addEventListener) {
    highContrastQuery.addEventListener('change', updateContrastPreference);
  }
};

/**
 * Add enhanced form accessibility
 */
export const enhanceFormAccessibility = (formElement) => {
  if (!formElement) return;
  
  const inputs = formElement.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // Add required indicator for screen readers
    if (input.hasAttribute('required')) {
      input.setAttribute('aria-required', 'true');
      
      // Add visual required indicator
      const label = formElement.querySelector(`label[for="${input.id}"]`);
      if (label && !label.querySelector('.required-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'required-indicator text-red-500 ml-1';
        indicator.textContent = '*';
        indicator.setAttribute('aria-hidden', 'true');
        label.appendChild(indicator);
      }
    }
    
    // Enhanced error handling
    input.addEventListener('invalid', (e) => {
      const errorId = `${input.id}-error`;
      let errorElement = document.getElementById(errorId);
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message text-red-600 text-sm mt-1';
        errorElement.setAttribute('role', 'alert');
        input.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = input.validationMessage;
      input.setAttribute('aria-describedby', errorId);
      input.setAttribute('aria-invalid', 'true');
      
      // Announce error to screen reader
      announceToScreenReader(`Error: ${input.validationMessage}`, true);
    });
    
    input.addEventListener('input', () => {
      if (input.validity.valid) {
        input.removeAttribute('aria-invalid');
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
          errorElement.remove();
          input.removeAttribute('aria-describedby');
        }
      }
    });
  });
};

/**
 * Add chart accessibility enhancements
 */
export const enhanceChartAccessibility = (chartContainer, chartData, chartType) => {
  if (!chartContainer || !chartData) return;
  
  // Add chart description
  const description = generateChartDescription(chartData, chartType);
  
  let descElement = chartContainer.querySelector('.chart-description');
  if (!descElement) {
    descElement = document.createElement('div');
    descElement.className = 'chart-description sr-only';
    descElement.setAttribute('aria-live', 'polite');
    chartContainer.appendChild(descElement);
  }
  
  descElement.textContent = description;
  
  // Add chart data table for screen readers
  const table = generateDataTable(chartData, chartType);
  let tableContainer = chartContainer.querySelector('.chart-data-table');
  
  if (!tableContainer) {
    tableContainer = document.createElement('div');
    tableContainer.className = 'chart-data-table sr-only';
    chartContainer.appendChild(tableContainer);
  }
  
  tableContainer.innerHTML = table;
  
  // Add keyboard navigation for chart interaction
  const canvas = chartContainer.querySelector('canvas');
  if (canvas) {
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', description);
    canvas.setAttribute('tabindex', '0');
    
    canvas.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Toggle data table visibility
        const table = chartContainer.querySelector('.chart-data-table');
        if (table) {
          table.classList.toggle('sr-only');
          const isVisible = !table.classList.contains('sr-only');
          announceToScreenReader(
            isVisible ? 'Chart data table shown' : 'Chart data table hidden'
          );
        }
      }
    });
  }
};

/**
 * Generate accessible chart description
 */
const generateChartDescription = (data, chartType) => {
  if (!data || data.length === 0) return 'Empty chart';
  
  const dataPoints = data.length;
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  const numericColumns = columns.filter(col => 
    data.some(row => typeof row[col] === 'number' || !isNaN(Number(row[col])))
  );
  
  let description = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart with ${dataPoints} data points. `;
  
  if (numericColumns.length > 0) {
    description += `Shows data for ${numericColumns.join(', ')}. `;
    
    // Add summary statistics
    const firstNumericCol = numericColumns[0];
    const values = data.map(row => Number(row[firstNumericCol])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      description += `${firstNumericCol} ranges from ${min.toLocaleString()} to ${max.toLocaleString()}, with an average of ${avg.toFixed(1)}.`;
    }
  }
  
  return description;
};

/**
 * Generate accessible data table for chart data
 */
const generateDataTable = (data, chartType) => {
  if (!data || data.length === 0) return '<p>No data available</p>';
  
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  let html = '<table class="accessible-data-table border-collapse border border-gray-300">';
  html += '<caption class="text-left font-semibold mb-2">Chart Data Table</caption>';
  
  // Headers
  html += '<thead><tr>';
  columns.forEach(col => {
    html += `<th class="border border-gray-300 px-2 py-1 bg-gray-100">${col}</th>`;
  });
  html += '</tr></thead>';
  
  // Data rows (limit to first 10 for accessibility)
  html += '<tbody>';
  const displayData = data.slice(0, 10);
  displayData.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      const value = row[col];
      const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
      html += `<td class="border border-gray-300 px-2 py-1">${displayValue || ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  
  if (data.length > 10) {
    html += `<tfoot><tr><td colspan="${columns.length}" class="border border-gray-300 px-2 py-1 text-center text-sm text-gray-600">... and ${data.length - 10} more rows</td></tr></tfoot>`;
  }
  
  html += '</table>';
  return html;
};

/**
 * Add UX enhancements for better user experience
 */
export const addUXEnhancements = () => {
  // Add loading states for better feedback
  addLoadingStateEnhancements();
  
  // Add success feedback
  addSuccessFeedback();
  
  // Add helpful tooltips
  addTooltipEnhancements();
  
  // Add keyboard shortcuts help
  addKeyboardShortcutsHelp();
  
  console.log('✨ UX enhancements applied');
};

/**
 * Enhanced loading states with better feedback
 */
const addLoadingStateEnhancements = () => {
  // Add CSS for improved loading animations
  const loadingStyles = document.createElement('style');
  loadingStyles.textContent = `
    .loading-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .loading-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    .success-checkmark {
      animation: checkmark 0.6s ease-in-out;
    }
    
    @keyframes checkmark {
      0% { transform: scale(0) rotate(45deg); }
      50% { transform: scale(1.2) rotate(45deg); }
      100% { transform: scale(1) rotate(45deg); }
    }
  `;
  document.head.appendChild(loadingStyles);
};

/**
 * Add success feedback animations and messages
 */
const addSuccessFeedback = () => {
  // Listen for successful operations
  document.addEventListener('operationSuccess', (e) => {
    const { message, element } = e.detail;
    
    // Add success animation to element
    if (element) {
      element.classList.add('success-checkmark');
      setTimeout(() => {
        element.classList.remove('success-checkmark');
      }, 600);
    }
    
    // Announce success to screen reader
    announceToScreenReader(message);
  });
};

/**
 * Add enhanced tooltip functionality
 */
const addTooltipEnhancements = () => {
  // Add tooltips for buttons and interactive elements
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(element => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 pointer-events-none transition-opacity duration-200';
    tooltip.textContent = element.getAttribute('data-tooltip');
    
    element.appendChild(tooltip);
    
    element.addEventListener('mouseenter', () => {
      tooltip.classList.remove('opacity-0');
    });
    
    element.addEventListener('mouseleave', () => {
      tooltip.classList.add('opacity-0');
    });
    
    element.addEventListener('focus', () => {
      tooltip.classList.remove('opacity-0');
    });
    
    element.addEventListener('blur', () => {
      tooltip.classList.add('opacity-0');
    });
  });
};

/**
 * Add keyboard shortcuts help
 */
const addKeyboardShortcutsHelp = () => {
  // Add help button for keyboard shortcuts
  const helpButton = document.createElement('button');
  helpButton.className = 'fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40';
  helpButton.innerHTML = '?';
  helpButton.setAttribute('aria-label', 'Show keyboard shortcuts help');
  helpButton.setAttribute('data-tooltip', 'Keyboard shortcuts (Ctrl+?)');
  
  helpButton.addEventListener('click', showKeyboardShortcutsModal);
  document.body.appendChild(helpButton);
  
  // Keyboard shortcut to show help
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '?') {
      e.preventDefault();
      showKeyboardShortcutsModal();
    }
  });
};

/**
 * Show keyboard shortcuts modal
 */
const showKeyboardShortcutsModal = () => {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'shortcuts-title');
  modal.setAttribute('aria-modal', 'true');
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md mx-4 max-h-96 overflow-y-auto">
      <h2 id="shortcuts-title" class="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>Upload file:</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded">Ctrl+U</kbd>
        </div>
        <div class="flex justify-between">
          <span>Export chart:</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded">Ctrl+E</kbd>
        </div>
        <div class="flex justify-between">
          <span>Navigate charts:</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded">Arrow Keys</kbd>
        </div>
        <div class="flex justify-between">
          <span>Close/Escape:</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded">Esc</kbd>
        </div>
        <div class="flex justify-between">
          <span>Skip to content:</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded">Tab</kbd>
        </div>
        <div class="flex justify-between">
          <span>Show this help:</span>
          <kbd class="px-2 py-1 bg-gray-100 rounded">Ctrl+?</kbd>
        </div>
      </div>
      <button id="close-shortcuts" class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Close
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus management
  const closeButton = modal.querySelector('#close-shortcuts');
  closeButton.focus();
  
  const closeModal = () => {
    document.body.removeChild(modal);
    document.querySelector('[aria-label="Show keyboard shortcuts help"]')?.focus();
  };
  
  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}; 