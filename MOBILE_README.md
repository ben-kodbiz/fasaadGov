# 📱 Mobile View Implementation Guide

## Overview

This directory contains the mobile-first responsive implementation for the US Atrocities Treemap visualization project. The implementation transforms the desktop-first design into a **scroll-driven, touch-optimized storytelling experience**.

---

## 📁 File Structure

```
fasaadGov/
├── css/
│   └── mobile.css              # Mobile-first base styles
├── js/
│   ├── mobile-controller.js    # Scroll controller & D3 renderer
│   ├── mobile-card-slider.js   # Swipeable card component
│   └── dual-mode-charts.js     # Desktop/mobile chart switcher
├── mobile-demo.html            # Scroll storytelling demo
├── mobile-cards-demo.html      # Card slider demo
└── MOBILE_README.md            # This file
```

---

## 🚀 Quick Start

### 1. Include Mobile Styles

Add to your HTML `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="css/mobile.css">
```

### 2. Include Mobile JavaScript

Add before closing `</body>` tag:

```html
<script src="js/mobile-controller.js"></script>
<script src="js/mobile-card-slider.js"></script>
<script src="js/dual-mode-charts.js"></script>
```

### 3. Use Mobile Components

#### Scroll-Driven Story Steps

```html
<section class="story-step" id="step-1">
  <h1>Section Title</h1>
  <p>Content here</p>
  <div class="chart-wrapper" id="chart-1"></div>
</section>

<section class="story-step" id="step-2">
  <!-- Next section -->
</section>
```

#### Swipeable Cards

```html
<div class="card-slider-container" id="myCards"></div>

<script>
  const slider = new MobileCardSlider('#myCards', {
    cardMinWidth: 85,
    gap: 16,
    showDots: true
  });
</script>
```

#### Responsive Charts

```javascript
// Using D3ChartFactory
const svg = D3ChartFactory.createBarChart(
  '#chart-container',
  [
    { label: 'A', value: 30 },
    { label: 'B', value: 50 },
    { label: 'C', value: 70 }
  ],
  { width: 400, height: 300 }
);
```

---

## 📊 Component Documentation

### MobileScrollController

Manages scroll-driven storytelling with IntersectionObserver.

**Options:**
- `threshold` (0.6): Visibility threshold for triggering
- `rootMargin`: Margin around root
- `onStepChange(stepId, stepElement)`: Callback when step changes

**Usage:**
```javascript
const controller = new MobileScrollController({
  threshold: 0.5,
  onStepChange: (stepId) => {
    console.log('Now viewing:', stepId);
  }
});
```

---

### MobileCardSlider

Touch-friendly horizontal swipe cards with snap scrolling.

**Options:**
- `cardMinWidth` (85): Minimum card width (%)
- `cardMaxWidth` (85): Maximum card width (%)
- `gap` (16): Gap between cards (px)
- `showDots` (true): Show navigation dots
- `autoPlay` (false): Auto-advance cards
- `autoPlayInterval` (5000): Auto-play interval (ms)
- `onCardChange(index, card)`: Callback on card change

**Usage:**
```javascript
const slider = new MobileCardSlider('#container', {
  cardMinWidth: 85,
  gap: 20,
  showDots: true,
  onCardChange: (index, card) => {
    console.log('Card:', index);
  }
});

// Methods
slider.goToCard(2);    // Go to card at index 2
slider.nextCard();     // Next card
slider.prevCard();     // Previous card
slider.getCurrentIndex(); // Get current index
```

---

### MobileD3Renderer

Responsive D3 renderer with automatic viewBox scaling.

**Options:**
- `mobileHeight` (window.innerHeight * 0.5): Chart height on mobile
- `desktopHeight` (window.innerHeight * 0.7): Chart height on desktop
- `mobileMaxDataPoints` (7): Max data points to show on mobile

**Usage:**
```javascript
const renderer = new MobileD3Renderer('#chart', {
  mobileHeight: 250,
  mobileMaxDataPoints: 5
});

renderer.setData(myData);
renderer.render((svg, data, width, height, isMobile) => {
  // Your D3 rendering code
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    // ... attributes
});
```

---

### D3ChartFactory

Pre-built responsive chart types.

**Available Charts:**

1. **createBarChart(container, data, options)**
   - Mobile-optimized bar chart
   - Auto-rotated labels
   - Responsive sizing

2. **createDonutChart(container, data, options)**
   - Donut/pie chart
   - Auto-sized segments
   - Built-in legend

3. **createLineChart(container, data, options)**
   - Smooth line chart
   - Touch-friendly points
   - Responsive axes

**Example:**
```javascript
const svg = D3ChartFactory.createBarChart(
  '#chart',
  [
    { label: 'Vietnam', value: 3000000 },
    { label: 'Iraq', value: 655000 },
    { label: 'Afghanistan', value: 176000 }
  ],
  {
    width: 400,
    height: 300,
    color: '#1976d2'
  }
);
```

---

### DualModeAdapter

Enables existing visualizations to switch between mobile/desktop modes.

**Options:**
- `breakpoint` (768): Width threshold for mobile
- `mobileConfig`: Configuration for mobile mode
- `desktopConfig`: Configuration for desktop mode
- `onModeChange(mode, config)`: Callback on mode switch

**Usage:**
```javascript
const adapter = new DualModeAdapter(myVisualization, {
  mobileConfig: {
    maxDataPoints: 5,
    simplifyLabels: true
  },
  desktopConfig: {
    maxDataPoints: 50,
    simplifyLabels: false
  }
});
```

---

## 🎨 CSS Classes

### Layout
- `.container` - Flexbox column layout
- `.story-step` - Full-screen scroll section
- `.card-slider-container` - Card slider wrapper
- `.card-slider` - Horizontal scroll container
- `.card` - Individual card

### Utilities
- `.visually-hidden` - Screen reader only
- `.text-center` - Center text
- `.mobile-only` - Show only on mobile
- `.desktop-only` - Show only on desktop
- `.skeleton` - Loading skeleton animation

### Spacing
- `.mb-0` to `.mb-4` - Margin bottom
- `.mt-0` to `.mt-4` - Margin top

---

## 📱 Mobile Optimizations Applied

### 1. Viewport
- Fixed viewport meta tag
- Disabled user scaling
- Touch-friendly tap targets (44px minimum)

### 2. Layout
- Mobile-first CSS
- Flexbox-based layouts
- No horizontal scroll

### 3. Charts
- viewBox for responsive scaling
- Simplified data (max 5-7 points)
- Larger touch targets
- Reduced animations

### 4. Performance
- Lazy loading sections
- Debounced scroll (100ms)
- IntersectionObserver for triggers
- Skeleton loaders

### 5. Touch
- Swipe gestures
- Momentum scrolling
- Snap-to-center cards
- Haptic-ready events

---

## 🧪 Testing Checklist

### Functional Tests

- [ ] All sections scroll vertically without horizontal overflow
- [ ] Cards swipe smoothly with snap-to-center
- [ ] Charts render correctly on mobile (< 768px)
- [ ] Charts render correctly on desktop (≥ 768px)
- [ ] Theme toggle works on mobile
- [ ] Navigation dots update on scroll
- [ ] Touch targets are ≥ 44px

### Performance Tests

- [ ] First contentful paint < 3s on 3G
- [ ] Time to interactive < 5s on 3G
- [ ] Scroll frame rate ≥ 60fps
- [ ] No layout shift during scroll
- [ ] Images/charts lazy load correctly

### Device Tests

- [ ] iPhone Safari (iOS 14+)
- [ ] Android Chrome (low-end device)
- [ ] iPad Safari (tablet view)
- [ ] Android tablet Chrome
- [ ] Desktop Chrome/Firefox/Safari (responsive mode)

### Accessibility Tests

- [ ] Screen reader can navigate sections
- [ ] All interactive elements have labels
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion respected

---

## 📈 Performance Metrics

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 3s | Chrome DevTools |
| Time to Interactive | < 5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| First Input Delay | < 100ms | Chrome User Report |
| Scroll Frame Rate | ≥ 60fps | Chrome DevTools |

### Optimization Tips

1. **Reduce Data Size**
   - Split large JSON files by section
   - Lazy load data on demand
   - Compress with gzip/brotli

2. **Optimize Charts**
   - Use viewBox (mandatory)
   - Limit data points on mobile
   - Reduce DOM elements

3. **Efficient Scrolling**
   - Use CSS transforms
   - Avoid layout thrashing
   - Debounce scroll handlers

---

## 🔧 Customization

### Change Breakpoint

```javascript
// In mobile-controller.js
checkIsMobile() {
  return window.innerWidth < 1024; // Change from 768
}
```

### Customize Card Size

```javascript
new MobileCardSlider('#cards', {
  cardMinWidth: 90,  // 90% width
  cardMaxWidth: 90,
  gap: 20            // 20px gap
});
```

### Add Custom Chart Type

```javascript
D3ChartFactory.createCustomChart = function(container, data, options) {
  // Your chart implementation
  const svg = d3.select(container)
    .append('svg')
    .attr('viewBox', '0 0 400 300')
    // ...
};
```

---

## 🐛 Troubleshooting

### Charts Not Responsive

**Problem:** Charts don't resize on viewport change

**Solution:**
```javascript
// Ensure viewBox is set
svg.attr('viewBox', `0 0 ${width} ${height}`);
svg.attr('preserveAspectRatio', 'xMidYMid meet');
```

### Cards Not Swiping

**Problem:** Horizontal scroll not working

**Solution:**
```css
/* Check these CSS properties */
.card-slider {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
```

### Scroll Not Triggering

**Problem:** IntersectionObserver not firing

**Solution:**
```javascript
// Check threshold value
new MobileScrollController({
  threshold: 0.5  // Try lower value (0.1 - 0.5)
});
```

---

## 📚 Examples

### Full Page Implementation

See `mobile-demo.html` for complete scroll-driven storytelling example.

### Card Slider Implementation

See `mobile-cards-demo.html` for card slider with atrocity data.

---

## 🤝 Integration with Existing Code

### Step 1: Add Mobile CSS/JS

Add mobile.css and mobile-controller.js to existing HTML files.

### Step 2: Wrap Content in Story Steps

```html
<!-- Before -->
<div class="chart-container">...</div>

<!-- After -->
<section class="story-step" id="step-chart">
  <div class="chart-container">...</div>
</section>
```

### Step 3: Initialize Controller

```javascript
document.addEventListener('DOMContentLoaded', function() {
  new MobileScrollController({
    onStepChange: (stepId) => {
      // Update chart based on current step
    }
  });
});
```

---

## 📝 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Samsung Internet | 14+ | ✅ Full |

**Polyfills needed for older browsers:**
- IntersectionObserver polyfill
- CustomEvent polyfill
- Element.closest() polyfill

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review demo files
3. Check browser console for errors
4. Test on different devices

---

## ✅ Completion Checklist

- [x] PHASE 1: Mobile-First Layout Foundation
- [x] PHASE 2: Vertical Scroll Storytelling
- [x] PHASE 3: Swipeable Data Cards
- [x] PHASE 4: Responsive D3 (viewBox)
- [x] PHASE 5: Simplify Visualizations
- [x] PHASE 6: Performance Optimization
- [ ] PHASE 7: Mobile Testing (In Progress)

---

**Last Updated:** March 2026  
**Branch:** `mobile_view`  
**Status:** Ready for Testing
