// Theme Manager Utility
// Handles theme application, switching, and management

// Theme definitions (inline for now to avoid import issues)
const CORPORATE_THEME = {
  id: "corporate",
  name: "Corporate",
  description: "Professional blues and greys with clean typography",
  variables: {
    "--chart-1": "hsl(220, 70%, 50%)",
    "--chart-2": "hsl(220, 60%, 40%)",
    "--chart-3": "hsl(220, 50%, 30%)",
    "--chart-4": "hsl(200, 60%, 45%)",
    "--chart-5": "hsl(200, 50%, 35%)",
    "--font-sans": "Inter, system-ui, sans-serif",
    "--radius": "0.25rem",
    "--shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "--shadow": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "--shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "--background": "hsl(0 0% 100%)",
    "--foreground": "hsl(222.2 84% 4.9%)",
    "--card": "hsl(0 0% 100%)",
    "--card-foreground": "hsl(222.2 84% 4.9%)",
    "--border": "hsl(214.3 31.8% 91.4%)",
    "--primary": "hsl(220, 70%, 50%)",
    "--primary-foreground": "hsl(210 40% 98%)"
  }
};

const PASTEL_FUN_THEME = {
  id: "pastel-fun",
  name: "Pastel Fun",
  description: "Soft, playful colors with rounded corners and gentle shadows",
  variables: {
    "--chart-1": "hsl(350, 70%, 75%)",
    "--chart-2": "hsl(280, 70%, 75%)",
    "--chart-3": "hsl(60, 70%, 75%)",
    "--chart-4": "hsl(150, 70%, 75%)",
    "--chart-5": "hsl(200, 70%, 75%)",
    "--font-sans": "Comic Sans MS, cursive, system-ui, sans-serif",
    "--radius": "1rem",
    "--shadow-sm": "0 2px 4px 0 rgb(0 0 0 / 0.1)",
    "--shadow": "0 4px 8px 0 rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "--shadow-md": "0 8px 16px 0 rgb(0 0 0 / 0.15), 0 4px 8px -4px rgb(0 0 0 / 0.1)",
    "--background": "hsl(60, 30%, 98%)",
    "--foreground": "hsl(280, 20%, 20%)",
    "--card": "hsl(60, 30%, 98%)",
    "--card-foreground": "hsl(280, 20%, 20%)",
    "--border": "hsl(350, 30%, 85%)",
    "--primary": "hsl(350, 70%, 75%)",
    "--primary-foreground": "hsl(280, 20%, 20%)"
  }
};

const HIGH_CONTRAST_THEME = {
  id: "high-contrast",
  name: "High Contrast",
  description: "Bold colors with sharp edges and strong shadows",
  variables: {
    "--chart-1": "hsl(0, 100%, 50%)",
    "--chart-2": "hsl(45, 100%, 50%)",
    "--chart-3": "hsl(280, 100%, 50%)",
    "--chart-4": "hsl(120, 100%, 50%)",
    "--chart-5": "hsl(0, 0%, 0%)",
    "--font-sans": "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    "--radius": "0rem",
    "--shadow-sm": "0 2px 4px 0 rgb(0 0 0 / 0.5)",
    "--shadow": "0 4px 8px 0 rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.5)",
    "--shadow-md": "0 8px 16px 0 rgb(0 0 0 / 0.7), 0 4px 8px -4px rgb(0 0 0 / 0.6)",
    "--background": "hsl(0, 0%, 100%)",
    "--foreground": "hsl(0, 0%, 0%)",
    "--card": "hsl(0, 0%, 100%)",
    "--card-foreground": "hsl(0, 0%, 0%)",
    "--border": "hsl(0, 0%, 0%)",
    "--primary": "hsl(0, 100%, 50%)",
    "--primary-foreground": "hsl(0, 0%, 100%)"
  }
};

// Available themes
const AVAILABLE_THEMES = [
  CORPORATE_THEME,
  PASTEL_FUN_THEME,
  HIGH_CONTRAST_THEME
];

// Default theme (original Graph Gleam styling)
const DEFAULT_THEME = {
  id: 'default',
  name: 'Default',
  description: 'Original Graph Gleam styling'
};

// Current theme state
let currentThemeId = 'default';

// Cache for theme variables to avoid repeated lookups
const themeCache = new Map();

/**
 * Apply a theme to a specific container element (scoped, not global)
 * @param {string} themeId - The ID of the theme to apply
 * @param {HTMLElement} container - The container element to apply theme to
 * @returns {boolean} - Success status
 */
export const applyThemeToContainer = (themeId, container) => {
  try {
    if (!container) {
      console.warn('No container provided for theme application');
      return false;
    }

    // Find the theme
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    
    if (!theme) {
      console.warn(`Theme with ID "${themeId}" not found`);
      return false;
    }

    // Apply all CSS variables from the theme to the container (scoped)
    const variables = Object.entries(theme.variables);
    variables.forEach(([property, value]) => {
      container.style.setProperty(property, value);
    });

    // Cache the theme for future lookups
    themeCache.set(themeId, theme);
    
    console.log(`Theme "${theme.name}" applied to container successfully`);
    
    return true;
  } catch (error) {
    console.error('Error applying theme to container:', error);
    return false;
  }
};

/**
 * Apply a theme globally (for backward compatibility, but deprecated)
 * @param {string} themeId - The ID of the theme to apply
 * @returns {boolean} - Success status
 */
export const applyTheme = (themeId) => {
  try {
    // Check cache first for performance
    if (currentThemeId === themeId) {
      return true; // Already applied
    }

    // Find the theme
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    
    if (!theme) {
      console.warn(`Theme with ID "${themeId}" not found`);
      return false;
    }

    // Add transition class to body for smooth theme switching
    document.body.classList.add('theme-transitioning');
    
    // Get document root element
    const root = document.documentElement;
    
    // Apply all CSS variables from the theme (batch operation for performance)
    const variables = Object.entries(theme.variables);
    variables.forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Cache the theme for future lookups
    themeCache.set(themeId, theme);

    // Update current theme state
    currentThemeId = themeId;
    
    console.log(`Theme "${theme.name}" applied globally successfully`);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
    
    return true;
  } catch (error) {
    console.error('Error applying theme:', error);
    document.body.classList.remove('theme-transitioning');
    return false;
  }
};

/**
 * Get all available themes
 * @returns {Array} - Array of theme objects
 */
export const getAvailableThemes = () => {
  return [
    DEFAULT_THEME,
    ...AVAILABLE_THEMES
  ];
};

/**
 * Get the currently applied theme ID
 * @returns {string} - Current theme ID
 */
export const getCurrentTheme = () => {
  return currentThemeId;
};

/**
 * Reset to the default theme (original styling)
 * @param {HTMLElement} container - Optional container to reset (if scoped)
 * @returns {boolean} - Success status
 */
export const resetToDefault = (container = null) => {
  try {
    if (container) {
      // Reset scoped theme
      const theme = AVAILABLE_THEMES.find(t => t.id === currentThemeId);
      if (theme) {
        Object.keys(theme.variables).forEach(property => {
          container.style.removeProperty(property);
        });
      }
    } else {
      // Reset global theme
      const root = document.documentElement;
      const theme = AVAILABLE_THEMES.find(t => t.id === currentThemeId);
      if (theme) {
        Object.keys(theme.variables).forEach(property => {
          root.style.removeProperty(property);
        });
      }
    }

    // Reset current theme state
    currentThemeId = 'default';
    
    console.log('Theme reset to default');
    return true;
  } catch (error) {
    console.error('Error resetting theme:', error);
    return false;
  }
};

/**
 * Get a theme by its ID
 * @param {string} themeId - The theme ID to look up
 * @returns {Object|null} - Theme object or null if not found
 */
export const getThemeById = (themeId) => {
  if (themeId === 'default') {
    return DEFAULT_THEME;
  }
  
  // Check cache first
  if (themeCache.has(themeId)) {
    return themeCache.get(themeId);
  }
  
  // Find in available themes
  const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
  
  // Cache if found
  if (theme) {
    themeCache.set(themeId, theme);
  }
  
  return theme || null;
};

/**
 * Check if a theme exists
 * @param {string} themeId - The theme ID to check
 * @returns {boolean} - Whether the theme exists
 */
export const themeExists = (themeId) => {
  return themeId === 'default' || AVAILABLE_THEMES.some(t => t.id === themeId);
};

/**
 * Test function for development
 */
export const testThemeManager = () => {
  console.log('Available themes:', getAvailableThemes());
  console.log('Current theme:', getCurrentTheme());
  console.log('Corporate theme exists:', themeExists('corporate'));
  console.log('Invalid theme exists:', themeExists('invalid'));
}; 