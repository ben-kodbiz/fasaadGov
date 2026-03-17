# 📱 TodoMobile.md — Mobile Experience Refactor (D3.js Political Visualization Site)

## 🎯 Objective

Transform current desktop-first D3 site into a **mobile-first, high-performance, scroll-driven storytelling experience**.

---

# 🧱 PHASE 1 — Mobile-First Layout Foundation

## ✅ Task 1.1 — Set Mobile Viewport

* Add to `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

---

## ✅ Task 1.2 — Global CSS Reset for Mobile

* Create `mobile.css`
* Apply:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  overflow-x: hidden;
}
```

---

## ✅ Task 1.3 — Define Layout System (Mobile First)

* Use:

  * Flexbox (primary)
  * Avoid heavy grid for performance

```css
.container {
  display: flex;
  flex-direction: column;
  padding: 16px;
}
```

---

# 📜 PHASE 2 — Vertical Scroll Storytelling (CORE UX)

## 🎯 Goal:

Convert entire experience into **scroll-driven narrative (scrollytelling)**

---

## ✅ Task 2.1 — Section-Based Architecture

* Break page into sections:

```html
<section class="story-step" id="step-1"></section>
<section class="story-step" id="step-2"></section>
<section class="story-step" id="step-3"></section>
```

---

## ✅ Task 2.2 — Full-Screen Scroll Sections

```css
.story-step {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
```

---

## ✅ Task 2.3 — Scroll Trigger Engine

* Use `IntersectionObserver`

```js
const steps = document.querySelectorAll('.story-step');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      triggerD3Update(id);
    }
  });
}, { threshold: 0.6 });

steps.forEach(step => observer.observe(step));
```

---

## ✅ Task 2.4 — D3 Update Controller

```js
function triggerD3Update(stepId) {
  switch(stepId) {
    case 'step-1':
      renderIntro();
      break;
    case 'step-2':
      renderMap();
      break;
    case 'step-3':
      renderCasualties();
      break;
  }
}
```

---

# 🃏 PHASE 3 — Swipeable Data Cards (Replace Dense UI)

## 🎯 Goal:

Replace complex dashboards with **touch-friendly swipe cards**

---

## ✅ Task 3.1 — Card Container

```html
<div class="card-slider">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

---

## ✅ Task 3.2 — Horizontal Swipe

```css
.card-slider {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.card {
  min-width: 85%;
  margin-right: 16px;
  scroll-snap-align: center;
}
```

---

## ✅ Task 3.3 — Touch Optimization

* Add momentum scrolling:

```css
.card-slider {
  -webkit-overflow-scrolling: touch;
}
```

---

## ✅ Task 3.4 — Card Content Rules

Each card must contain:

* Title
* 1 key stat
* 1 short explanation
* Optional mini D3 chart

---

# 📊 PHASE 4 — Responsive D3 (CRITICAL FIX)

## ❌ Problem:

Fixed-width SVG breaks on mobile

---

## ✅ Task 4.1 — Use viewBox (MANDATORY)

```js
const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", "0 0 800 600")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");
```

---

## ✅ Task 4.2 — Dynamic Sizing

```js
const width = window.innerWidth;
const height = window.innerHeight * 0.6;
```

---

## ✅ Task 4.3 — Resize Listener

```js
window.addEventListener('resize', () => {
  d3.select("svg").remove();
  renderCurrentStep();
});
```

---

# 🔄 PHASE 5 — Simplify Visualizations (Mobile Mode)

## 🎯 Rule:

“Reduce cognitive load by 50%”

---

## ✅ Task 5.1 — Create Dual Mode System

```js
const isMobile = window.innerWidth < 768;
```

---

## ✅ Task 5.2 — Conditional Rendering

```js
if (isMobile) {
  renderSimpleBarChart();
} else {
  renderComplexMultiAxisChart();
}
```

---

## ✅ Task 5.3 — Mobile Chart Rules

* Max 5–7 data points
* No legends → use labels directly
* No multi-axis charts
* Use:

  * Bar charts
  * Single-line charts
  * Big numbers

---

## ✅ Task 5.4 — Replace Heavy Visuals

| Desktop Version  | Mobile Replacement       |
| ---------------- | ------------------------ |
| Force graph      | Static relationship list |
| Dense map        | Highlighted regions only |
| Multi-line chart | Single trend             |

---

# ⚡ PHASE 6 — Performance Optimization (MOBILE CRITICAL)

---

## ✅ Task 6.1 — Lazy Load Sections

```js
if (entry.isIntersecting) {
  loadDataForStep(stepId);
}
```

---

## ✅ Task 6.2 — Split Data Files

* Instead of:

```
data/all.json
```

* Use:

```
data/step1.json
data/step2.json
```

---

## ✅ Task 6.3 — Debounce Scroll

```js
let timeout;
window.addEventListener('scroll', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    handleScroll();
  }, 100);
});
```

---

## ✅ Task 6.4 — Reduce Animation Load

* Use:

  * `opacity`
  * `transform`
* Avoid:

  * heavy path recalculation

---

# 🧪 PHASE 7 — Mobile Testing Checklist

## ✅ Devices

* Test on:

  * Android low-end
  * iPhone Safari

---

## ✅ Metrics

* First Load < 3s
* Interaction delay < 100ms

---

## ✅ UX Validation

* Can user scroll naturally?
* Can user understand chart in < 3 seconds?
* Is text readable without zoom?

---

# 🚀 FINAL GOAL

Transform experience into:

> 📖 “Scroll-driven interactive documentary optimized for thumbs”

NOT:

> ❌ “Desktop dashboard squeezed into a phone”

---

# 🧠 OPTIONAL (ADVANCED)

* Add haptic feedback (mobile vibration API)
* Add swipe gestures to control timeline
* Add progressive loading skeletons

---

# ✅ DONE CRITERIA

* [ ] All sections scroll vertically
* [ ] All charts responsive via viewBox
* [ ] Swipe cards implemented
* [ ] Mobile simplified charts active
* [ ] No horizontal overflow
* [ ] Smooth 60fps scrolling

---
