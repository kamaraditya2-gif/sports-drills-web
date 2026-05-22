/**
 * SPORTS DRILLS WEB - Main JavaScript
 * Navigation, UI utilities, mobile menu, shared components
 */

(function() {
  'use strict';

  // ============================================
  // MOBILE MENU
  // ============================================
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', nav.classList.contains('active'));
      document.body.classList.toggle('menu-open', nav.classList.contains('active'));
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // ============================================
  // ACTIVE NAV LINK
  // ============================================
  function setActiveNav() {
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ============================================
  // HERO PARTICLES
  // ============================================
  function initParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    const count = 20;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (6 + Math.random() * 6) + 's';
      const size = 4 + Math.random() * 6;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)'];
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(p);
    }
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ============================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ============================================
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  window.showToast = function(message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠'
    };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ============================================
  // NEWSLETTER FORM
  // ============================================
  function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        localStorage.setItem('sportsDrillsNewsletter', input.value);
        showToast('Berhasil berlangganan newsletter!', 'success');
        input.value = '';
      }
    });
  }

  // ============================================
  // SEARCH FUNCTIONALITY
  // ============================================
  window.performSearch = function(query) {
    if (!query || query.length < 2) {
      showToast('Masukkan minimal 2 karakter untuk mencari', 'warning');
      return;
    }
    const q = encodeURIComponent(query.toLowerCase().trim());
    window.location.href = `drills.html?search=${q}`;
  };

  function initSearch() {
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const input = searchForm.querySelector('input');
        if (input) performSearch(input.value);
      });
    }
  }

  // ============================================
  // RENDER HELPERS
  // ============================================
  window.getSportBadgeClass = function(sport) {
    const map = {
      basket: 'badge-basket',
      futsal: 'badge-futsal',
      padel: 'badge-padel',
      voli: 'badge-voli',
      atletik: 'badge-atletik',
      gosip: 'badge-gosip',
      transfer: 'badge-transfer'
    };
    return map[sport] || 'badge-basket';
  };

  window.getDifficultyBadgeClass = function(diff) {
    return `badge-difficulty-${diff}`;
  };

  window.formatNumber = function(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  window.sportNames = {
    basket: 'Basket',
    futsal: 'Futsal',
    padel: 'Padel',
    voli: 'Voli',
    atletik: 'Atletik'
  };

  // ============================================
  // SHARE FUNCTIONALITY
  // ============================================
  window.shareContent = async function(title, text, url) {
    const shareData = { title, text, url: url || window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      showToast('Link disalin ke clipboard!', 'success');
    }
  };

  // ============================================
  // ADSENSE LAZY LOAD
  // ============================================
  function initAdSlots() {
    const adSlots = document.querySelectorAll('.ad-slot[data-ad-slot]');
    if (!adSlots.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slot = entry.target;
          if (typeof adsbygoogle !== 'undefined') {
            (adsbygoogle = window.adsbygoogle || []).push({});
          }
          observer.unobserve(slot);
        }
      });
    }, { rootMargin: '200px' });

    adSlots.forEach(slot => observer.observe(slot));
  }

  // ============================================
  // CURRENT YEAR IN FOOTER
  // ============================================
  function initFooterYear() {
    document.querySelectorAll('.current-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  // ============================================
  // POWERED BY DEEPSEEK
  // ============================================
  function initPoweredBy() {
    const footerBottom = document.querySelector('.footer-bottom');
    if (!footerBottom) return;
    const span = document.createElement('span');
    span.style.marginLeft = 'auto';
    span.style.fontSize = '0.75rem';
    span.style.color = 'var(--text-muted)';
    span.innerText = 'Tingkatkan Performamu dengan Drill Profesional — powered by DeepSeek';
    footerBottom.appendChild(span);
  }

  // ============================================
  // INIT
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    setActiveNav();
    initHeaderScroll();
    initParticles();
    initSmoothScroll();
    initScrollAnimations();
    initNewsletter();
    initSearch();
    initAdSlots();
    initFooterYear();
    initPoweredBy();
  });
})();
