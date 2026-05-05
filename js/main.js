/* ==========================================================================
   PromQ Prime — main site interactions
   ========================================================================== */

(() => {
  'use strict';

  /* ---------- Floating water particles ---------- */
  const particles = document.getElementById('particles');
  if (particles) {
    const count = window.innerWidth < 720 ? 16 : 26;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'p';
      const size = Math.random() * 3 + 1.5;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * -20}%;
        animation-duration:${10 + Math.random() * 14}s;
        animation-delay:${Math.random() * 12}s;
      `;
      particles.appendChild(p);
    }
  }

  /* ---------- Sticky nav scrolled state ---------- */
  const nav = document.getElementById('siteNav');
  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Mobile drawer ---------- */
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');
  const closeDrawer = () => {
    toggle?.classList.remove('open');
    drawer?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  };
  toggle?.addEventListener('click', () => {
    const open = !drawer.classList.contains('open');
    toggle.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('drawer-open', open);
  });
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  // close drawer on resize to desktop
  window.addEventListener('resize', () => { if (window.innerWidth >= 960) closeDrawer(); });

  /* ---------- Smooth in-page scroll with sticky-nav offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navH + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Reveal-on-scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Active section highlight in nav ---------- */
  const sections = ['about', 'product', 'features', 'applications', 'specs', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('.nav-menu a');
  if ('IntersectionObserver' in window && sections.length) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { threshold: 0.35, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(s => sio.observe(s));
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  document.querySelectorAll('.gallery-item img, .app-card img').forEach(img => {
    img.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLightbox = () => {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
    if (lightboxImg) lightboxImg.src = '';
    document.body.style.overflow = '';
  };
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById('toTop');
  const onScrollTop = () => toTop?.classList.toggle('show', window.scrollY > 600);
  window.addEventListener('scroll', onScrollTop, { passive: true });
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  onScrollTop();

  /* ---------- Footer year ---------- */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Contact form — AJAX submit to FormSubmit backend ----------
     FormSubmit forwards the form data as an email to the address embedded
     in the form action (jigarbece@gmail.com). First submission triggers a
     one-time email-verification link that must be confirmed; after that,
     submissions arrive instantly and the user stays on the page.
     If JavaScript is disabled, the native form action still POSTs and the
     user is redirected to FormSubmit's confirmation page.
  */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmit');

  const showStatus = (msg, ok = true) => {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status show ' + (ok ? 'ok' : 'err');
  };

  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // Honeypot check — if filled, treat as spam and silently succeed
    if (form.querySelector('input[name="_honey"]')?.value) return;

    const original = submitBtn?.innerHTML;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';
    }

    const data = new FormData(form);
    // Use FormSubmit's AJAX endpoint so user stays on the page
    fetch('https://formsubmit.co/ajax/jigarbece@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    })
      .then(r => r.json())
      .then(res => {
        if (res.success === 'true' || res.success === true) {
          showStatus('Thanks! Your enquiry has been sent — we will respond within one business day.', true);
          form.reset();
        } else {
          throw new Error(res.message || 'Submission failed');
        }
      })
      .catch(() => {
        showStatus('Sorry — we could not send your enquiry right now. Please email prominentlifecare@gmail.com or call +91 90673 53670.', false);
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
        }
      });
  });

  /* ---------- Tilt/parallax on hero product (subtle, desktop only) ---------- */
  const stage = document.querySelector('.product-stage');
  if (stage && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const img = stage.querySelector('img');
    stage.addEventListener('mousemove', e => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      stage.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
      if (img) img.style.transform = `translate(${(x * 6).toFixed(1)}px, ${(y * 6).toFixed(1)}px)`;
    });
    stage.addEventListener('mouseleave', () => {
      stage.style.transform = '';
      if (img) img.style.transform = '';
    });
  }
})();
