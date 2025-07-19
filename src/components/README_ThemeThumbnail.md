# ThemeThumbnail Component

A theme preview thumbnail component that displays live theme previews with hover effects and accessibility features.

## 🎨 Features

- **Live Theme Preview**: Shows actual theme colors and appearance
- **Hover Effects**: Interactive hover states with theme information
- **Accessibility Support**: Full keyboard navigation and screen reader support
- **Responsive Design**: Scales appropriately on different screen sizes
- **Selection State**: Clear visual indication of selected theme
- **Performance Optimized**: Efficient rendering with memoization

## 📦 Installation

The ThemeThumbnail component is included with Graph Gleam and requires no additional installation.

### Dependencies

```json
{
  "react": "^18.0.0"
}
```

## 🚀 Basic Usage

```jsx
import React, { useState } from 'react';
import ThemeThumbnail from './components/ThemeThumbnail';

function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState('corporate');

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
  };

  return (
    <div className="theme-grid">
      <ThemeThumbnail
        themeId="corporate"
        isSelected={selectedTheme === 'corporate'}
        onClick={() => handleThemeSelect('corporate')}
      />
      <ThemeThumbnail
        themeId="pastel-fun"
        isSelected={selectedTheme === 'pastel-fun'}
        onClick={() => handleThemeSelect('pastel-fun')}
      />
      <ThemeThumbnail
        themeId="high-contrast"
        isSelected={selectedTheme === 'high-contrast'}
        onClick={() => handleThemeSelect('high-contrast')}
      />
    </div>
  );
}
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `themeId` | `string` | Required | Theme identifier ('corporate', 'pastel-fun', 'high-contrast') |
| `isSelected` | `boolean` | `false` | Whether this theme is currently selected |
| `onClick` | `function` | Required | Callback when theme is clicked |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable theme selection |
| `showLabel` | `boolean` | `true` | Show theme label |
| `compact` | `boolean` | `false` | Compact layout for small screens |
| `ariaLabel` | `string` | Auto-generated | Custom ARIA label |

## 🎨 Theme Previews

### Corporate Theme Preview
- **Colors**: Professional blues and grays
- **Preview Elements**: Bar chart with corporate color scheme
- **Use Case**: Business presentations, formal reports

### Pastel Fun Theme Preview
- **Colors**: Soft pastels and bright accents
- **Preview Elements**: Colorful chart with playful colors
- **Use Case**: Creative projects, casual presentations

### High Contrast Theme Preview
- **Colors**: High contrast black, white, and bright colors
- **Preview Elements**: Bold chart with high contrast colors
- **Use Case**: Accessibility, bright environments

## 🔧 Advanced Usage

### Custom Theme Thumbnail

```jsx
<ThemeThumbnail
  themeId="corporate"
  isSelected={selectedTheme === 'corporate'}
  onClick={() => handleThemeSelect('corporate')}
  className="custom-thumbnail"
  showLabel={false}
  compact={true}
/>
```

### Keyboard Navigation

```jsx
const handleKeyDown = (event, themeId) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleThemeSelect(themeId);
  }
};

<ThemeThumbnail
  themeId="corporate"
  isSelected={selectedTheme === 'corporate'}
  onClick={() => handleThemeSelect('corporate')}
  onKeyDown={(event) => handleKeyDown(event, 'corporate')}
  tabIndex={0}
/>
```

### Custom Styling

```jsx
<ThemeThumbnail
  themeId="corporate"
  isSelected={selectedTheme === 'corporate'}
  onClick={() => handleThemeSelect('corporate')}
  className="custom-theme-thumbnail"
/>
```

```css
.custom-theme-thumbnail {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.custom-theme-thumbnail:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}
```

## ♿ Accessibility

The ThemeThumbnail component is fully accessible and includes:

### Keyboard Navigation
- **Tab**: Focus on theme thumbnail
- **Enter/Space**: Select theme
- **Arrow Keys**: Navigate between thumbnails (when in grid)

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for each theme
- **Role**: `button` role for proper semantics
- **State**: `aria-pressed` for selection state
- **Announcements**: Theme selection is announced

### Visual Accessibility
- **Focus Indicators**: Clear focus rings
- **Color Contrast**: WCAG AA compliant
- **Selection State**: Clear visual indication

## 🎯 Performance

### Rendering Performance
- **Memoization**: Component is memoized for performance
- **Efficient Updates**: Only re-renders when props change
- **Lightweight**: Minimal DOM footprint

### Memory Usage
- **Stable**: No memory leaks
- **Efficient**: Minimal memory footprint
- **Optimized**: Efficient color calculations

## 🔍 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 60+ | ✅ Full Support |
| Firefox | 60+ | ✅ Full Support |
| Safari | 12+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |
| IE | Any | ❌ Not Supported |

## 🐛 Troubleshooting

### Theme Preview Not Showing
```jsx
// Check if themeId is correct
console.log('Theme ID:', themeId);

// Verify theme colors are available
import { getThemeColors } from '../utils/theme-manager';
const colors = getThemeColors(themeId);
console.log('Theme colors:', colors);
```

### Click Not Working
```jsx
// Ensure onClick is properly bound
<ThemeThumbnail
  themeId="corporate"
  onClick={() => console.log('Theme clicked')} // Test with console.log
  isSelected={false}
/>
```

### Accessibility Issues
```jsx
// Add custom ARIA label
<ThemeThumbnail
  themeId="corporate"
  ariaLabel="Select Corporate theme for professional appearance"
  onClick={handleThemeSelect}
  isSelected={false}
/>
```

## 📚 API Reference

### ThemeThumbnail Methods

```jsx
// Get theme preview data
const previewData = themeThumbnailRef.current.getPreviewData();

// Check if theme is supported
const isSupported = themeThumbnailRef.current.isThemeSupported('corporate');
```

### Theme Colors API

```jsx
import { getThemeColors } from '../utils/theme-manager';

// Get theme colors for custom preview
const colors = getThemeColors('corporate');
console.log('Corporate theme colors:', colors);
```

## 🎨 Customization

### Custom Preview Data

```jsx
// Custom preview data structure
const customPreviewData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [{
    label: 'Sales',
    data: [12, 19, 3, 5],
    backgroundColor: colors.chart1,
    borderColor: colors.chart2
  }]
};
```

### Custom Styling

```css
/* Custom theme thumbnail styles */
.theme-thumbnail {
  --thumbnail-size: 120px;
  --border-radius: 12px;
  --transition-duration: 0.3s;
}

.theme-thumbnail--selected {
  border: 3px solid var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.theme-thumbnail--hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

## 📝 Examples

### Complete Theme Grid

```jsx
import React, { useState } from 'react';
import ThemeThumbnail from './components/ThemeThumbnail';

function ThemeGrid() {
  const [selectedTheme, setSelectedTheme] = useState('corporate');

  const themes = [
    { id: 'corporate', name: 'Corporate', description: 'Professional blues and grays' },
    { id: 'pastel-fun', name: 'Pastel Fun', description: 'Soft pastels and bright accents' },
    { id: 'high-contrast', name: 'High Contrast', description: 'High contrast for accessibility' }
  ];

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
  };

  return (
    <div className="theme-grid" role="radiogroup" aria-label="Select chart theme">
      {themes.map((theme) => (
        <ThemeThumbnail
          key={theme.id}
          themeId={theme.id}
          isSelected={selectedTheme === theme.id}
          onClick={() => handleThemeSelect(theme.id)}
          ariaLabel={`Select ${theme.name} theme: ${theme.description}`}
          className="theme-thumbnail"
        />
      ))}
    </div>
  );
}
```

### Responsive Theme Grid

```jsx
import React, { useState, useEffect } from 'react';
import ThemeThumbnail from './components/ThemeThumbnail';

function ResponsiveThemeGrid() {
  const [selectedTheme, setSelectedTheme] = useState('corporate');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`theme-grid ${isMobile ? 'theme-grid--mobile' : ''}`}>
      <ThemeThumbnail
        themeId="corporate"
        isSelected={selectedTheme === 'corporate'}
        onClick={() => setSelectedTheme('corporate')}
        compact={isMobile}
        showLabel={!isMobile}
      />
      <ThemeThumbnail
        themeId="pastel-fun"
        isSelected={selectedTheme === 'pastel-fun'}
        onClick={() => setSelectedTheme('pastel-fun')}
        compact={isMobile}
        showLabel={!isMobile}
      />
      <ThemeThumbnail
        themeId="high-contrast"
        isSelected={selectedTheme === 'high-contrast'}
        onClick={() => setSelectedTheme('high-contrast')}
        compact={isMobile}
        showLabel={!isMobile}
      />
    </div>
  );
}
```

### Custom Theme Preview

```jsx
import React from 'react';
import ThemeThumbnail from './components/ThemeThumbnail';

function CustomThemePreview() {
  const handleThemeSelect = (themeId) => {
    console.log('Selected theme:', themeId);
    // Custom theme selection logic
  };

  return (
    <div className="custom-theme-preview">
      <h3>Choose Your Theme</h3>
      <div className="theme-thumbnails">
        <ThemeThumbnail
          themeId="corporate"
          isSelected={false}
          onClick={() => handleThemeSelect('corporate')}
          className="theme-thumbnail--corporate"
          ariaLabel="Professional corporate theme with blue and gray colors"
        />
        <ThemeThumbnail
          themeId="pastel-fun"
          isSelected={false}
          onClick={() => handleThemeSelect('pastel-fun')}
          className="theme-thumbnail--pastel"
          ariaLabel="Playful pastel theme with soft colors"
        />
        <ThemeThumbnail
          themeId="high-contrast"
          isSelected={false}
          onClick={() => handleThemeSelect('high-contrast')}
          className="theme-thumbnail--contrast"
          ariaLabel="High contrast theme for accessibility"
        />
      </div>
    </div>
  );
}
```

## 🔗 Related Components

- [ThemeSelector](./README_ThemeSelector.md) - Main theme selection component
- [ChartRenderer](./README_ChartRenderer.md) - Chart rendering with theme support
- [ThemeManager](../utils/theme-manager.js) - Theme management utilities

## 📄 License

This component is part of Graph Gleam and follows the same license terms.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅ 