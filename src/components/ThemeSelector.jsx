import React, { useState, useEffect } from 'react';
import ThemeThumbnail from './ThemeThumbnail';
import { getAvailableThemes, getCurrentTheme } from '../utils/theme-manager';

const ThemeSelector = ({ 
  onThemeSelect, 
  selectedThemeId = null,
  className = '',
  disabled = false 
}) => {
  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(selectedThemeId || getCurrentTheme());
  const [isLoading, setIsLoading] = useState(false);

  // Load available themes
  useEffect(() => {
    const availableThemes = getAvailableThemes();
    setThemes(availableThemes);
  }, []);

  // Update current theme when prop changes
  useEffect(() => {
    if (selectedThemeId) {
      setCurrentTheme(selectedThemeId);
    }
  }, [selectedThemeId]);

  const handleThemeSelect = async (themeId) => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      
      // Update current theme state
      setCurrentTheme(themeId);
      
      // Announce theme change to screen readers
      const selectedTheme = themes.find(t => t.id === themeId);
      if (selectedTheme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Theme changed to ${selectedTheme.name}. ${selectedTheme.description}`;
        document.body.appendChild(announcement);
        
        // Remove announcement after it's been read
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }
      
      // Notify parent component (theme application is handled by ChartRenderer)
      if (onThemeSelect) {
        onThemeSelect(themeId);
      }
    } catch (error) {
      console.error('Error selecting theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (themes.length === 0) {
    return (
      <div className={`p-6 bg-muted/50 rounded-lg border border-border ${className}`}>
        <div className="text-center text-muted-foreground">
          <p>Loading themes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} role="region" aria-labelledby="theme-selector-heading">
      {/* Header */}
      <div className="text-center">
        <h3 id="theme-selector-heading" className="text-lg font-semibold text-foreground mb-1">
          Choose Theme
        </h3>
        <p className="text-sm text-muted-foreground">
          Select a visual style for your chart
        </p>
      </div>

      {/* Theme Grid */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="radiogroup"
        aria-labelledby="theme-selector-heading"
        aria-describedby="theme-instructions"
      >
        {themes.map((theme) => (
          <ThemeThumbnail
            key={theme.id}
            theme={theme}
            isSelected={currentTheme === theme.id}
            onSelect={handleThemeSelect}
            disabled={disabled || isLoading}
          />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Applying theme...
          </div>
        </div>
      )}

      {/* Selected Theme Info */}
      {currentTheme && currentTheme !== 'default' && (
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-foreground">
              Active: {themes.find(t => t.id === currentTheme)?.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {themes.find(t => t.id === currentTheme)?.description}
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p id="theme-instructions" className="text-xs text-muted-foreground">
          💡 Hover over themes to see larger previews. Use Tab to navigate and Enter or Space to select.
        </p>
      </div>
    </div>
  );
};

export default ThemeSelector; 