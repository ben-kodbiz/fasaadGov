# 📱 Mobile Testing Checklist

## Branch: `mobile_view`

---

## ✅ PHASE 1: Mobile-First Layout Foundation

### Files to Check
- [ ] `/css/mobile.css` exists
- [ ] `/js/mobile-controller.js` exists
- [ ] `index.html` has viewport meta with `maximum-scale=1.0, user-scalable=no`
- [ ] `index.html` includes `css/mobile.css`
- [ ] `index.html` includes `js/mobile-controller.js`
- [ ] `arabs_complicit/index.html` has mobile updates
- [ ] `companies_complicit/index.html` has mobile updates
- [ ] `upload.html` has mobile updates

### Visual Tests
- [ ] No horizontal scroll on mobile (< 768px)
- [ ] Text is readable without zoom (minimum 16px body)
- [ ] Touch targets are ≥ 44px (buttons, links, inputs)
- [ ] Theme toggle works on mobile
- [ ] Dismissable disclaimers work on mobile

---

## ✅ PHASE 2: Vertical Scroll Storytelling

### Demo File
- [ ] `/mobile-demo.html` exists and loads
- [ ] Story steps are full viewport height (100vh)
- [ ] Scroll navigation dots appear on mobile
- [ ] Swipe hint animation visible

### Functional Tests
- [ ] IntersectionObserver triggers on scroll
- [ ] Step change events fire correctly
- [ ] Navigation dots update on scroll
- [ ] Click on dot scrolls to correct section
- [ ] Custom events (`stepChange`) fire properly

### Content Tests
- [ ] Step 1: Introduction displays correctly
- [ ] Step 2: Middle East content loads
- [ ] Step 3: Latin America content loads
- [ ] Step 4: Domestic content loads
- [ ] Step 5: Corporate content loads
- [ ] Step 6: Take Action links work

---

## ✅ PHASE 3: Swipeable Data Cards

### Files to Check
- [ ] `/js/mobile-card-slider.js` exists
- [ ] `/mobile-cards-demo.html` exists

### Demo Tests
- [ ] Cards display in horizontal row
- [ ] Swipe left/right works on touch devices
- [ ] Snap-to-center works on scroll end
- [ ] Navigation dots appear below cards
- [ ] Dots update on card change
- [ ] Click on dot changes card

### Card Content Tests (mobile-cards-demo.html)
- [ ] Vietnam War card displays (3M+ casualties)
- [ ] Native American Genocide card (12M+)
- [ ] Iraq War card (655k-1M+)
- [ ] Korean War card (2.5M+)
- [ ] Afghanistan War card (176k+)
- [ ] Yemen Intervention card (377k+)
- [ ] Latin American Interventions card (50+)
- [ ] Libya Bombing card (30k-100k+)

### Touch Tests
- [ ] Touch start stops auto-play (if enabled)
- [ ] Touch end triggers swipe detection
- [ ] Swipe threshold (50px) feels natural
- [ ] Momentum scrolling works (`-webkit-overflow-scrolling: touch`)

---

## ✅ PHASE 4: Responsive D3

### viewBox Tests
- [ ] All SVGs have `viewBox` attribute
- [ ] All SVGs have `preserveAspectRatio="xMidYMid meet"`
- [ ] SVGs scale to 100% width
- [ ] SVGs maintain aspect ratio on resize

### Dynamic Sizing Tests
- [ ] Charts resize on window resize
- [ ] Mobile height = 50vh (configurable)
- [ ] Desktop height = 70vh (configurable)
- [ ] Resize listener debounced (100ms)
- [ ] Re-render triggers on mobile↔desktop switch

### Chart Factory Tests
- [ ] `D3ChartFactory.createBarChart()` renders
- [ ] `D3ChartFactory.createDonutChart()` renders
- [ ] `D3ChartFactory.createLineChart()` renders
- [ ] All charts have responsive axes
- [ ] Labels rotate on bar charts (-45deg)
- [ ] Colors use CSS variables (theme support)

---

## ✅ PHASE 5: Simplify Visualizations

### Dual Mode Tests
- [ ] `DualModeAdapter` initializes correctly
- [ ] Mode switch fires at 768px breakpoint
- [ ] `mobileConfig` applies on mobile
- [ ] `desktopConfig` applies on desktop
- [ ] `onModeChange` callback fires

### Data Simplification Tests
- [ ] Arrays limited to `mobileMaxDataPoints` (default: 7)
- [ ] Labels truncate on mobile (15 char limit)
- [ ] Complex charts simplify to basic versions

### Chart Replacement Tests
- [ ] Treemap → Bar chart on mobile
- [ ] Network graph → List view on mobile
- [ ] Sunburst → Pie chart on mobile
- [ ] `MobileChartRenderers` functions work

---

## ✅ PHASE 6: Performance Optimization

### Lazy Loading Tests
- [ ] `lazyLoadSections()` function exists
- [ ] Sections with `data-loadUrl` lazy load
- [ ] Skeleton animation shows during load
- [ ] `dataLoaded` event fires on completion
- [ ] Observer unobserves after load

### Debounce Tests
- [ ] Scroll events debounced (100ms default)
- [ ] Resize events debounced (100ms default)
- [ ] No multiple rapid firings

### Animation Tests
- [ ] Only `opacity` and `transform` used for animations
- [ ] `prefers-reduced-motion` media query respected
- [ ] Skeleton loading animation smooth
- [ ] Swipe hint bounce animation works
- [ ] No janky animations on scroll

---

## 📊 Device Testing

### iOS Devices
- [ ] iPhone 12/13/14 (Safari)
- [ ] iPhone SE (small screen)
- [ ] iPad (tablet view)
- [ ] iOS Chrome (WebKit)

### Android Devices
- [ ] Pixel/High-end Android (Chrome)
- [ ] Mid-range Android (Chrome)
- [ ] Low-end Android (Chrome Go)
- [ ] Android Tablet

### Desktop Browsers (Responsive Mode)
- [ ] Chrome DevTools mobile emulation
- [ ] Firefox Responsive Design Mode
- [ ] Safari Responsive Design Mode
- [ ] Edge DevTools

### Specific Device Tests

#### iPhone SE (375x667)
- [ ] All content fits without horizontal scroll
- [ ] Text readable at 375px width
- [ ] Cards swipe smoothly
- [ ] Charts render at correct height

#### iPhone 12/13 Pro (390x844)
- [ ] Safe area insets respected (notch)
- [ ] Bottom swipe gesture doesn't conflict
- [ ] All interactive elements accessible

#### iPad (768x1024)
- [ ] Tablet breakpoint works (≥ 768px)
- [ ] Desktop layout applies
- [ ] Cards show multiple at once

#### Android Low-End (360x640)
- [ ] Performance acceptable
- [ ] Scroll smooth (≥ 60fps)
- [ ] No memory issues

---

## ⚡ Performance Metrics

### Lighthouse Tests (Mobile)

Run: Chrome DevTools → Lighthouse → Mobile

- [ ] Performance score ≥ 90
- [ ] First Contentful Paint < 3s
- [ ] Speed Index < 4s
- [ ] Largest Contentful Paint < 3s
- [ ] Time to Interactive < 5s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1

### Manual Performance Tests

- [ ] Scroll frame rate ≥ 60fps (DevTools Performance)
- [ ] Card swipe feels instant (< 100ms)
- [ ] Chart render time < 500ms
- [ ] No layout shift on image/chart load
- [ ] No memory leaks (DevTools Memory)

### Network Tests (3G/4G throttling)

- [ ] Page loads on 3G (< 10s)
- [ ] Charts lazy load correctly
- [ ] No unnecessary network requests
- [ ] Gzip/brotli compression enabled

---

## ♿ Accessibility Tests

### Screen Reader (VoiceOver/TalkBack)
- [ ] Skip link works
- [ ] Story steps announced
- [ ] Card content read
- [ ] Chart descriptions available
- [ ] Navigation dots labeled
- [ ] Theme toggle labeled

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus visible on all elements
- [ ] Enter/Space activate buttons
- [ ] Arrow keys navigate cards (if implemented)

### Visual Accessibility
- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Text size ≥ 16px body, ≥ 14px secondary
- [ ] Focus indicators visible
- [ ] No content relies on color alone

### Motion Sensitivity
- [ ] `prefers-reduced-motion` respected
- [ ] Animations can be disabled
- [ ] No flashing content (> 3 flashes/sec)

---

## 🐛 Bug Testing

### Known Issues to Verify

- [ ] No console errors on load
- [ ] No console errors on scroll
- [ ] No console errors on resize
- [ ] No console errors on card swipe
- [ ] Theme persists after refresh
- [ ] Scroll position persists (if applicable)

### Edge Cases

- [ ] Works with no JavaScript (graceful degradation)
- [ ] Works with slow network
- [ ] Works offline (if PWA)
- [ ] Handles very long card content
- [ ] Handles very short card content
- [ ] Handles empty data arrays
- [ ] Handles single card (no swipe needed)

---

## 📝 Test Results Template

### Test Date: ___________
### Tester: ___________
### Device/Browser: ___________

| Phase | Status | Notes |
|-------|--------|-------|
| PHASE 1 | ☐ Pass ☐ Fail | |
| PHASE 2 | ☐ Pass ☐ Fail | |
| PHASE 3 | ☐ Pass ☐ Fail | |
| PHASE 4 | ☐ Pass ☐ Fail | |
| PHASE 5 | ☐ Pass ☐ Fail | |
| PHASE 6 | ☐ Pass ☐ Fail | |
| Accessibility | ☐ Pass ☐ Fail | |
| Performance | ☐ Pass ☐ Fail | |

### Critical Issues Found:

1. 
2. 
3. 

### Minor Issues Found:

1. 
2. 
3. 

### Overall Status:
- [ ] Ready to merge
- [ ] Ready with minor fixes
- [ ] Needs work before merge

---

## 🚀 Pre-Merge Checklist

Before merging to `main`:

- [ ] All PHASE 1-6 tests pass
- [ ] Performance metrics met
- [ ] Accessibility tests pass
- [ ] Tested on ≥ 3 different devices
- [ ] No critical bugs
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Demo files working
- [ ] Branch up to date with `main`

---

**Testing Status:** IN PROGRESS  
**Last Updated:** March 2026  
**Branch:** `mobile_view`
