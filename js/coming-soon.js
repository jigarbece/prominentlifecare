// Floating water particles
const container = document.getElementById('particles');
for (let i = 0; i < 22; i++) {
  const p = document.createElement('div');
  p.className = 'p';
  const size = Math.random() * 3 + 1.5;
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random() * 100}%;
    bottom:${Math.random() * -20}%;
    animation-duration:${8 + Math.random() * 14}s;
    animation-delay:${Math.random() * 10}s;
    opacity:0;
  `;
  container.appendChild(p);
}

// Countdown to 10 May 2026
const launch = new Date('2026-05-10T00:00:00');
const pad = n => String(n).padStart(2, '0');
const els = {
  d: document.getElementById('cd-days'),
  h: document.getElementById('cd-hours'),
  m: document.getElementById('cd-mins'),
  s: document.getElementById('cd-secs'),
};
const prev = { d: '', h: '', m: '', s: '' };

function updateFlip(el, key, val) {
  if (val !== prev[key]) {
    el.classList.remove('flipping');
    void el.offsetWidth;
    el.classList.add('flipping');
    el.textContent = val;
    prev[key] = val;
  }
}

function tick() {
  const diff = launch - Date.now();
  if (diff <= 0) {
    Object.values(els).forEach(e => (e.textContent = '00'));
    return;
  }
  updateFlip(els.d, 'd', pad(Math.floor(diff / 86400000)));
  updateFlip(els.h, 'h', pad(Math.floor(diff / 3600000) % 24));
  updateFlip(els.m, 'm', pad(Math.floor(diff / 60000) % 60));
  updateFlip(els.s, 's', pad(Math.floor(diff / 1000) % 60));
}
tick();
setInterval(tick, 1000);
