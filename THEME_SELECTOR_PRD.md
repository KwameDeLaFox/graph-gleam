# Theme Selector Feature PRD
## Graph Gleam - Visual Theme Customization

### Version: 1.0
### Date: December 2024
### Status: Ready for Development

---

## 1. Executive Summary

The Theme Selector feature will add visual customization capabilities to Graph Gleam, allowing users to apply pre-made themes to their charts for better brand alignment and aesthetic consistency. The feature mimics the Tweakcn experience with a grid of thumbnail previews that instantly apply themes through CSS variable swapping.

### 1.1 Goals
- Provide users with 3 pre-made themes for chart customization
- Enable instant theme switching with visual feedback
- Maintain export functionality with themed charts
- Enhance user experience without performance degradation

### 1.2 Success Metrics
- Theme switching completes in ≤300ms
- Chart rendering performance impact ≤50ms for 1,000 rows
- File size impact ≤10KB extra JS/CSS per theme
- User engagement with theme selection

---

## 2. Feature Overview

### 2.1 User Story
As a Graph Gleam user, I want to select from different visual themes for my charts so that they better match my brand or presentation aesthetics without manual color tweaking.

### 2.2 User Flow
```
File Upload → Chart Type Selection → Chart Preview → [NEW] Theme Selection → Export
```

### 2.3 Key Features
- **3 Pre-made Themes**: Corporate, Pastel Fun, High Contrast
- **Thumbnail Previews**: 96×60px chart previews for each theme
- **Instant Application**: Live theme switching with smooth transitions
- **Export Integration**: PNG exports reflect selected theme
- **Session-Based**: Themes reset to default on navigation

---

## 3. Detailed Requirements

### 3.1 Functional Requirements

#### F-1: Theme Definition System
- **Description**: Create 3 hard-coded theme JSON files
- **Content**: Colors, font stack, border radius, shadow strength, background
- **Format**: CSS variable overrides compatible with existing system
- **Location**: `src/themes/` directory

#### F-2: Theme Selector Component
- **Description**: Grid-based theme selection interface
- **Layout**: 3 thumbnail cards in a horizontal row
- **Size**: 96×60px preview charts per theme
- **Interaction**: Click to apply, hover for larger preview
- **Positioning**: Below chart preview section

#### F-3: Thumbnail Generation
- **Description**: Render mini chart previews for each theme
- **Dataset**: Use same sample dataset for all thumbnails
- **Chart Type**: Simple bar chart with 3-4 data points
- **Real-time**: Thumbnails reflect actual theme colors/fonts

#### F-4: Theme Application
- **Description**: Apply themes to chart container and exported elements
- **Scope**: Chart colors, fonts, shadows, borders, backgrounds
- **Method**: CSS variable swapping with smooth transitions
- **Performance**: ≤300ms theme switch completion

#### F-5: Export Integration
- **Description**: Ensure exported PNGs match selected theme
- **Format**: PNG only (SVG export excluded)
- **Theme Persistence**: Export reflects currently selected theme
- **Filename**: Include theme identifier in export filename

#### F-6: Session Management
- **Description**: Theme selection resets to default on navigation
- **Scope**: Current chart creation session only
- **Reset Trigger**: User navigates away from chart creation flow
- **Default Theme**: Original Graph Gleam styling

### 3.2 Non-Functional Requirements

#### NF-1: Performance
- **Theme Switch**: ≤300ms completion time
- **Chart Rendering**: ≤50ms additional time for 1,000 rows
- **File Size**: ≤10KB additional JS/CSS per theme
- **Memory**: No memory leaks from theme switching

#### NF-2: User Experience
- **Visual Feedback**: Smooth transitions between themes
- **Hover States**: Larger preview on thumbnail hover
- **Loading States**: Brief loading indicator during theme switch
- **Accessibility**: Keyboard navigation and screen reader support

#### NF-3: Browser Compatibility
- **Modern Browsers**: Full feature support
- **CSS Variables**: Fallback for older browsers
- **Mobile**: Touch-optimized theme selection
- **High DPI**: Crisp thumbnails on retina displays

---

## 4. Technical Specification

### 4.1 Theme Structure

#### Theme JSON Format
```json
{
  "id": "corporate",
  "name": "Corporate",
  "description": "Professional blues and greys with clean typography",
  "variables": {
    "--chart-1": "hsl(220, 70%, 50%)",
    "--chart-2": "hsl(220, 60%, 40%)",
    "--chart-3": "hsl(220, 50%, 30%)",
    "--chart-4": "hsl(200, 60%, 45%)",
    "--chart-5": "hsl(200, 50%, 35%)",
    "--font-sans": "Inter, system-ui, sans-serif",
    "--radius": "0.25rem",
    "--shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "--shadow": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "--background": "hsl(0 0% 100%)",
    "--foreground": "hsl(222.2 84% 4.9%)"
  }
}
```

#### Three Theme Definitions
1. **Corporate**: Professional blues/greys, clean fonts, subtle shadows
2. **Pastel Fun**: Soft colors, rounded corners, playful shadows
3. **High Contrast**: Bold colors, sharp edges, strong shadows

### 4.2 Component Architecture

#### ThemeSelector Component
```jsx
<ThemeSelector
  themes={availableThemes}
  selectedTheme={currentTheme}
  onThemeSelect={handleThemeChange}
  sampleData={sampleDataset}
  className="mt-6"
/>
```

#### Theme Application System
```javascript
// Theme switching function
const applyTheme = (themeId) => {
  const theme = themes.find(t => t.id === themeId);
  const root = document.documentElement;
  
  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};
```

### 4.3 Integration Points

#### ChartRenderer Integration
- Add `themeId` prop to ChartRenderer
- Modify chart options based on current theme
- Ensure export reflects theme colors

#### App.jsx Flow Update
```jsx
// New flow: File Upload → Chart Type → Chart Preview → Theme Selector → Export
{data && selectedChartType && (
  <>
    <ChartRenderer data={data} chartType={selectedChartType} />
    <ThemeSelector onThemeSelect={setSelectedTheme} />
    <ExportButtons themeId={selectedTheme} />
  </>
)}
```

---

## 5. User Interface Design

### 5.1 Theme Selector Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Choose Theme                                               │
│  Select a visual style for your chart:                     │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ [Corporate] │ │ [Pastel Fun]│ │[High Contrast]│         │
│  │   96×60px   │ │   96×60px   │ │   96×60px   │          │
│  │   preview   │ │   preview   │ │   preview   │          │
│  │             │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                             │
│  Export Options:                                            │
│  [📥 PNG Export] [📷 JPEG Export] [📋 Copy Embed]          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Hover States
- **Thumbnail Hover**: Scale to 120% with shadow
- **Preview Popup**: Larger chart preview (200×125px)
- **Selection State**: Blue border and checkmark
- **Active Theme**: Highlighted background

### 5.3 Responsive Design
- **Desktop**: 3-column grid layout
- **Tablet**: 2-column grid with stacked third
- **Mobile**: Single column stack
- **Thumbnail Size**: Responsive scaling

---

## 6. Implementation Plan

### 6.1 Phase 1: Core Infrastructure
1. Create theme JSON files
2. Implement theme application system
3. Create ThemeSelector component
4. Add theme switching functionality

### 6.2 Phase 2: Integration
1. Integrate with ChartRenderer
2. Update App.jsx flow
3. Move export buttons below theme selector
4. Add theme persistence to exports

### 6.3 Phase 3: Polish
1. Add smooth transitions
2. Implement hover previews
3. Optimize performance
4. Add accessibility features

### 6.4 Phase 4: Testing
1. Performance testing
2. Cross-browser compatibility
3. Mobile responsiveness
4. Export functionality validation

---

## 7. Acceptance Criteria

### 7.1 Functional Acceptance
- [ ] 3 themes available for selection
- [ ] Theme switching works in ≤300ms
- [ ] Thumbnails show actual theme previews
- [ ] Export PNGs match selected theme
- [ ] Theme resets to default on navigation
- [ ] Export buttons positioned below theme selector

### 7.2 Performance Acceptance
- [ ] Chart rendering impact ≤50ms for 1,000 rows
- [ ] File size increase ≤10KB per theme
- [ ] No memory leaks from theme switching
- [ ] Smooth 60fps transitions

### 7.3 User Experience Acceptance
- [ ] Intuitive theme selection interface
- [ ] Clear visual feedback on theme changes
- [ ] Hover previews work correctly
- [ ] Keyboard navigation supported
- [ ] Mobile-friendly interaction

### 7.4 Technical Acceptance
- [ ] CSS variables properly applied
- [ ] Theme switching doesn't break existing functionality
- [ ] Export functionality preserved
- [ ] No console errors during theme switching
- [ ] Graceful fallback for unsupported browsers

---

## 8. Risk Assessment

### 8.1 Technical Risks
- **CSS Variable Compatibility**: Mitigation - Fallback for older browsers
- **Performance Impact**: Mitigation - Optimized theme switching
- **Memory Leaks**: Mitigation - Proper cleanup of theme listeners

### 8.2 User Experience Risks
- **Theme Confusion**: Mitigation - Clear theme names and previews
- **Performance Perception**: Mitigation - Loading indicators
- **Accessibility Issues**: Mitigation - ARIA labels and keyboard support

### 8.3 Implementation Risks
- **Integration Complexity**: Mitigation - Phased implementation
- **Export Issues**: Mitigation - Thorough testing of export functionality
- **Browser Compatibility**: Mitigation - Progressive enhancement approach

---

## 9. Success Metrics

### 9.1 Quantitative Metrics
- Theme selection usage rate
- Average time spent on theme selection
- Export completion rate with themes
- Performance benchmarks met

### 9.2 Qualitative Metrics
- User feedback on theme variety
- Ease of use ratings
- Visual appeal satisfaction
- Brand alignment effectiveness

---

## 10. Future Enhancements

### 10.1 Potential Additions
- Custom theme creation
- Theme sharing between users
- Dark mode variants
- Industry-specific theme packs

### 10.2 Technical Improvements
- Theme preview caching
- Advanced color palette generation
- Theme analytics and insights
- A/B testing framework

---

## 11. Appendix

### 11.1 Sample Dataset for Thumbnails
```javascript
const sampleData = [
  { Category: 'Q1', Sales: 1200, Revenue: 800 },
  { Category: 'Q2', Sales: 1500, Revenue: 950 },
  { Category: 'Q3', Sales: 1800, Revenue: 1100 },
  { Category: 'Q4', Sales: 2100, Revenue: 1300 }
];
```

### 11.2 Theme Color Palettes
- **Corporate**: Blues, greys, professional tones
- **Pastel Fun**: Soft pinks, purples, yellows, greens
- **High Contrast**: Bold reds, oranges, purples, blacks

### 11.3 File Structure
```
src/
├── themes/
│   ├── corporate.json
│   ├── pastel-fun.json
│   └── high-contrast.json
├── components/
│   ├── ThemeSelector.jsx
│   └── ThemeThumbnail.jsx
└── utils/
    └── theme-manager.js
```

---

*This PRD serves as the complete specification for the Theme Selector feature implementation in Graph Gleam.* 