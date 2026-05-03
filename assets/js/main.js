/**
 * Khidmat Healthcare Portfolio - Main JavaScript
 * Handles navigation, animations, and page routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavigation();
  initRipple();
  initReveal();
  initStats();
  initHeroParticles();
  initFAQ();
  
  // Initial footer placement
  const homePb = document.querySelector('#page-home .pb');
  const footer = document.getElementById('footer');
  if (homePb && footer) homePb.appendChild(footer);
});

/* ---------------------------------------------------------
   CUSTOM CURSOR
--------------------------------------------------------- */
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!cursor || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Smooth ring follow - only if hover is supported
  if (window.matchMedia('(hover: hover)').matches) {
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();
  }

  // Hover states
  document.querySelectorAll('a, button, .svc-card, .nav-brand').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const isNav = el.closest('.nav') || el.closest('.mob-menu') || el.classList.contains('nav-brand');
      
      if (isNav) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        ring.style.opacity = '0'; // Hide the "moving circle" in the navbar/mobile menu
      } else {
        cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
        cursor.style.opacity = '0.2';
        ring.style.transform = 'translate(-50%, -50%) scale(1.4)';
        ring.style.borderColor = 'var(--forest)';
      }
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.opacity = '1';
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.opacity = '0.5';
      ring.style.borderColor = 'var(--gold)';
    });
  });
}

/* ---------------------------------------------------------
   NAVIGATION & ROUTING
--------------------------------------------------------- */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const ham = document.querySelector('.nav-ham');
  const mob = document.querySelector('.mob-menu');
  const overlay = document.querySelector('.page-transition-overlay');

  // Sticky header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  // Mobile menu
  if (ham && mob) {
    ham.addEventListener('click', () => {
      mob.classList.toggle('open');
      const spans = ham.querySelectorAll('span');
      if (mob.classList.contains('open')) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close on click
    mob.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mob.classList.remove('open');
        const spans = ham.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // Global Routing Function
  function navigateTo(id, pushState = true) {
    const target = document.getElementById('page-' + id);
    if (!target) return;

    if (pushState) history.pushState({ page: id }, '', '#' + id);

    if (overlay) overlay.classList.add('active');

    setTimeout(() => {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const footer = document.getElementById('footer');
      const pb = target.querySelector('.pb');
      if (footer && pb) pb.appendChild(footer);

      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('onclick')?.includes(id));
      });

      if (overlay) overlay.classList.remove('active');
      setTimeout(initReveal, 50);
    }, 300);
  }

  window.go = function(id) { navigateTo(id, true); };

  // Browser back / forward
  window.addEventListener('popstate', e => {
    const id = e.state?.page || 'home';
    navigateTo(id, false);
  });

  // Set initial history state
  history.replaceState({ page: 'home' }, '', '#home');
}

/* ---------------------------------------------------------
   INTERACTIVE ELEMENTS
--------------------------------------------------------- */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('v');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

function initStats() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.started) {
        entry.target.dataset.started = 'true';
        animateValue(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.count-up').forEach(el => observer.observe(el));

  function animateValue(el) {
    const target = parseInt(el.dataset.target);
    if (isNaN(target)) return;
    let start = 0;
    const duration = 2000;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const current = Math.floor(progress * target);
      
      if (target >= 1000) {
        el.textContent = (current / 1000).toFixed(progress < 1 ? 1 : 0) + 'K+';
      } else {
        el.textContent = current;
      }
      
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = (target >= 1000 ? (target/1000)+'K+' : target);
    };
    requestAnimationFrame(step);
  }
}

function initHeroParticles() {
  const container = document.querySelector('.hero-right-deco');
  if (!container) return;

  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.setProperty('--dur2', (4 + Math.random() * 6) + 's');
    p.style.opacity = (0.1 + Math.random() * 0.2).toString();
    container.appendChild(p);
  }
}

function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    }
  });
}
// Prevent cursor on touch devices
if (window.matchMedia('(hover:none)').matches) {
  const cursor = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (cursor) cursor.remove();
  if (ring) ring.remove();
}
