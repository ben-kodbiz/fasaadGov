/**
 * Mobile Card Slider Component
 * 
 * Touch-friendly horizontal swipe cards for displaying data
 * on mobile devices with snap scrolling and momentum
 */

(function() {
  'use strict';
  
  class MobileCardSlider {
    constructor(containerSelector, options = {}) {
      this.container = document.querySelector(containerSelector);
      this.options = {
        cardMinWidth: 85,
        cardMaxWidth: 85,
        gap: 16,
        showDots: true,
        autoPlay: false,
        autoPlayInterval: 5000,
        onCardChange: null,
        ...options
      };
      
      this.cards = [];
      this.currentIndex = 0;
      this.autoPlayTimer = null;
      this.touchStartX = 0;
      this.touchEndX = 0;
      
      if (!this.container) {
        console.error('CardSlider: Container not found', containerSelector);
        return;
      }
      
      this.init();
    }
    
    init() {
      // Setup container
      this.container.classList.add('card-slider-container');
      
      // Find or create slider
      this.slider = this.container.querySelector('.card-slider') || this.createSlider();
      
      // Get cards
      this.cards = Array.from(this.slider.querySelectorAll('.card'));
      
      if (this.cards.length === 0) {
        console.warn('CardSlider: No cards found');
        return;
      }
      
      // Setup slider
      this.setupSliderStyles();
      this.setupCards();
      
      // Setup navigation dots if enabled
      if (this.options.showDots && this.cards.length > 1) {
        this.createNavigationDots();
      }
      
      // Setup touch events
      this.setupTouchEvents();
      
      // Setup auto-play if enabled
      if (this.options.autoPlay && this.cards.length > 1) {
        this.startAutoPlay();
      }
      
      // Setup resize listener
      this.setupResizeListener();
      
      console.log(`CardSlider initialized with ${this.cards.length} cards`);
    }
    
    createSlider() {
      const slider = document.createElement('div');
      slider.className = 'card-slider';
      this.container.appendChild(slider);
      return slider;
    }
    
    setupSliderStyles() {
      this.slider.style.cssText = `
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        gap: ${this.options.gap}px;
        padding: 16px 0;
        scroll-behavior: smooth;
      `;
    }
    
    setupCards() {
      const cardStyle = `
        min-width: ${this.options.cardMinWidth}%;
        max-width: ${this.options.cardMaxWidth}%;
        scroll-snap-align: center;
        flex-shrink: 0;
      `;
      
      this.cards.forEach((card, index) => {
        card.style.cssText = cardStyle;
        card.dataset.cardIndex = index;
        
        // Add click handler for cards
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (this.options.onCardClick) {
            this.options.onCardClick(index, card);
          }
        });
      });
      
      // Mark first card as active
      if (this.cards.length > 0) {
        this.cards[0].classList.add('card-active');
      }
    }
    
    createNavigationDots() {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'card-slider-dots';
      this.dotsContainer.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
      `;
      
      this.dots = [];
      
      this.cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `card-slider-dot${index === 0 ? ' active' : ''}`;
        dot.dataset.dotIndex = index;
        dot.setAttribute('aria-label', `Go to card ${index + 1}`);
        dot.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid var(--primary-color, #1976d2);
          background: ${index === 0 ? 'var(--primary-color, #1976d2)' : 'var(--surface-variant, #f5f5f5)'};
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          min-width: 10px;
          min-height: 10px;
        `;
        
        dot.addEventListener('click', () => {
          this.goToCard(index);
          this.resetAutoPlay();
        });
        
        this.dots.push(dot);
        this.dotsContainer.appendChild(dot);
      });
      
      this.container.appendChild(this.dotsContainer);
    }
    
    updateDots() {
      if (!this.dots) return;
      
      this.dots.forEach((dot, index) => {
        const isActive = index === this.currentIndex;
        dot.classList.toggle('active', isActive);
        dot.style.background = isActive 
          ? 'var(--primary-color, #1976d2)' 
          : 'var(--surface-variant, #f5f5f5)';
      });
    }
    
    setupTouchEvents() {
      this.slider.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.stopAutoPlay();
      }, { passive: true });
      
      this.slider.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
        
        if (this.options.autoPlay) {
          this.startAutoPlay();
        }
      }, { passive: true });
      
      this.slider.addEventListener('scroll', () => {
        const scrollLeft = this.slider.scrollLeft;
        const cardWidth = this.cards[0]?.offsetWidth || 0;
        const gap = this.options.gap;
        const newIndex = Math.round(scrollLeft / (cardWidth + gap));
        
        if (newIndex !== this.currentIndex && newIndex >= 0 && newIndex < this.cards.length) {
          this.currentIndex = newIndex;
          this.updateCards();
          this.updateDots();
          
          if (this.options.onCardChange) {
            this.options.onCardChange(newIndex, this.cards[newIndex]);
          }
        }
      }, { passive: true });
    }
    
    handleSwipe() {
      const threshold = 50;
      const diff = this.touchStartX - this.touchEndX;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe left - next card
          this.nextCard();
        } else {
          // Swipe right - previous card
          this.prevCard();
        }
      }
    }
    
    updateCards() {
      this.cards.forEach((card, index) => {
        card.classList.toggle('card-active', index === this.currentIndex);
      });
    }
    
    goToCard(index) {
      if (index < 0 || index >= this.cards.length) return;
      
      const cardWidth = this.cards[index].offsetWidth;
      const gap = this.options.gap;
      const scrollLeft = index * (cardWidth + gap);
      
      this.slider.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
      
      this.currentIndex = index;
      this.updateCards();
      this.updateDots();
      
      if (this.options.onCardChange) {
        this.options.onCardChange(index, this.cards[index]);
      }
    }
    
    nextCard() {
      const nextIndex = Math.min(this.currentIndex + 1, this.cards.length - 1);
      this.goToCard(nextIndex);
    }
    
    prevCard() {
      const prevIndex = Math.max(this.currentIndex - 1, 0);
      this.goToCard(prevIndex);
    }
    
    startAutoPlay() {
      if (!this.options.autoPlay || this.cards.length <= 1) return;
      
      this.autoPlayTimer = setInterval(() => {
        const nextIndex = (this.currentIndex + 1) % this.cards.length;
        this.goToCard(nextIndex);
      }, this.options.autoPlayInterval);
    }
    
    stopAutoPlay() {
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = null;
      }
    }
    
    resetAutoPlay() {
      this.stopAutoPlay();
      if (this.options.autoPlay) {
        this.startAutoPlay();
      }
    }
    
    setupResizeListener() {
      let resizeTimeout;
      
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Re-center current card after resize
          this.goToCard(this.currentIndex);
        }, 100);
      });
    }
    
    // Public method to get current card data
    getCurrentCard() {
      return this.cards[this.currentIndex];
    }
    
    // Public method to get current index
    getCurrentIndex() {
      return this.currentIndex;
    }
    
    // Destroy slider and cleanup
    destroy() {
      this.stopAutoPlay();
      this.slider = null;
      this.cards = [];
      this.dots = [];
    }
  }
  
  // ============================================
  // Card Data Renderer Helper
  // ============================================
  
  function createCardHTML(data) {
    return `
      <div class="card">
        ${data.title ? `<h3 class="card-title">${data.title}</h3>` : ''}
        ${data.stat ? `<div class="card-stat">${data.stat}</div>` : ''}
        ${data.description ? `<p class="card-description">${data.description}</p>` : ''}
        ${data.chart ? `<div class="card-chart" id="card-chart-${data.id || 0}"></div>` : ''}
        ${data.link ? `<a href="${data.link}" class="card-link">Learn More →</a>` : ''}
      </div>
    `;
  }
  
  function renderCardsFromData(containerSelector, cardsData, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) return null;
    
    // Clear container
    container.innerHTML = '';
    
    // Create slider
    const slider = document.createElement('div');
    slider.className = 'card-slider';
    
    // Create cards
    cardsData.forEach((data, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        ${data.title ? `<h3 class="card-title">${data.title}</h3>` : ''}
        ${data.stat ? `<div class="card-stat">${data.stat}</div>` : ''}
        ${data.description ? `<p class="card-description">${data.description}</p>` : ''}
        ${data.chart ? `<div class="card-chart" id="card-chart-${index}"></div>` : ''}
        ${data.link ? `<a href="${data.link}" class="card-link">Learn More →</a>` : ''}
      `;
      slider.appendChild(card);
    });
    
    container.appendChild(slider);
    
    // Initialize slider
    const sliderInstance = new MobileCardSlider(containerSelector, options);
    
    // Render charts if provided
    if (options.renderChart) {
      cardsData.forEach((data, index) => {
        if (data.chart) {
          const chartContainer = document.getElementById(`card-chart-${index}`);
          if (chartContainer) {
            options.renderChart(chartContainer, data, index);
          }
        }
      });
    }
    
    return sliderInstance;
  }
  
  // Export to global scope
  window.MobileCardSlider = MobileCardSlider;
  window.createCardHTML = createCardHTML;
  window.renderCardsFromData = renderCardsFromData;
  
})();
