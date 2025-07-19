import React, { useCallback } from 'react';

const ThemeThumbnail = ({ 
  theme, 
  isSelected = false, 
  onSelect
}) => {

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(theme.id);
    }
  }, [onSelect, theme.id]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape') {
      // Close any open previews or modals
      e.preventDefault();
      e.target.blur();
    }
  }, [handleClick]);

  return (
    <button
      className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left w-full ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${theme.name} theme. ${theme.description}`}
      aria-pressed={isSelected}
      aria-describedby={`theme-description-${theme.id}`}
    >


      {/* Theme Name */}
      <h3 className="font-semibold text-foreground mb-2">
        {theme.name}
      </h3>

      {/* Theme Description */}
      <p className="text-sm text-muted-foreground mb-3">
        {theme.description}
      </p>

      {/* Color Palette Preview */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-4 h-4 rounded border border-border"
            style={{ 
              backgroundColor: theme.id === 'default' 
                ? ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 205, 86, 0.8)', 'rgba(75, 192, 192, 0.8)'][i - 1]
                : theme.variables[`--chart-${i}`]
            }}
            title={`Chart Color ${i}`}
          />
        ))}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2">
          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export default ThemeThumbnail; 