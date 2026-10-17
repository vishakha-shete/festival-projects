const stage = document.querySelector('#stage');
const sky = document.querySelector('#sky');
const ctx = sky.getContext('2d');
const artWrap = document.querySelector('#artWrap');
const divineArt = document.querySelector('#divineArt');
const progressBar = document.querySelector('#progressBar');
const percent = document.querySelector('#percent');
const status = document.querySelector('#status');
const revealCopy = document.querySelector('#revealCopy');
const replay = document.querySelector('#replay');
const flash = document.querySelector('#flash');

const DURATION = 9000;
const messages = [
  [0, 'AWAKENING THE COSMOS'],
  [0.2, 'SUMMONING DIVINE ENERGY'],
  [0.46, 'LIGHTNING THROUGH THE DARK'],
  [0.7, 'THE DIVINE FORM EMERGES'],
  [0.92, 'FEARLESS. POWERFUL. DIVINE.']
];
let width = 0;
let height = 0;
let dpr = 1;
let particles = [];
let startTime = 0;
let raf = 0;
let lastBlast = -1;

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  sky.width = Math.round(width * dpr);
  sky.height = Math.round(height * dpr);
  sky.style.width = `${width}px`;
  sky.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(115, Math.floor(width * height / 10500)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.6 + .3,
    speed: Math.random() * .32 + .08,
    drift: (Math.random() - .5) * .22,
    phase: Math.random() * Math.PI * 2,
    gold: Math.random() > .28
  }));
}

function drawSky(time = 0) {
  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    p.y -= p.speed;
    p.x += p.drift;
    if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
    if (p.x < -4) p.x = width + 4;
    if (p.x > width + 4) p.x = -4;
    const alpha = .25 + (Math.sin(time * .0012 + p.phase) + 1) * .27;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.gold ? `rgba(255,207,119,${alpha})` : `rgba(205,168,255,${alpha * .7})`;
    ctx.shadowBlur = p.r > 1.2 ? 8 : 0;
    ctx.shadowColor = p.gold ? '#ffc75e' : '#bca2ff';
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function triggerBlast() {
  if (lastBlast === 1) return;
  lastBlast = 1;
  flash.classList.remove('blast');
  void flash.offsetWidth;
  flash.classList.add('blast');
}

function animate(now) {
  const progress = Math.min((now - startTime) / DURATION, 1);
  drawSky(now);
  progressBar.style.width = `${Math.round(progress * 100)}%`;
  percent.textContent = `${Math.round(progress * 100)}%`;
  const current = [...messages].reverse().find(([at]) => progress >= at);
  if (current) status.textContent = current[1];

  if (progress >= .035) artWrap.classList.add('revealed');
  // Reveal the supplied artwork from the bottom upward for a dramatic, step-by-step effect.
  const revealProgress = Math.max(0, Math.min(1, (progress - 0.06) / 0.72));
  divineArt.style.setProperty('--wipe', `${(1 - revealProgress) * 100}%`);
  const shimmer = divineArt.querySelector('.image-shimmer');
  if (shimmer) shimmer.style.top = `${(1 - revealProgress) * 100}%`;
  if (progress >= .36 && lastBlast !== 1) triggerBlast();
  if (progress >= 1) {
    stage.classList.add('complete');
    revealCopy.textContent = 'JAI MAA KALARATRI · SHUBH NAVRATRI';
    cancelAnimationFrame(raf);
    return;
  }
  raf = requestAnimationFrame(animate);
}

function play() {
  cancelAnimationFrame(raf);
  stage.classList.remove('complete');
  artWrap.classList.remove('revealed');
  divineArt.style.setProperty('--wipe', '100%');
  progressBar.style.width = '0%';
  percent.textContent = '0%';
  status.textContent = messages[0][1];
  revealCopy.textContent = 'A DIVINE REVEAL, WRITTEN IN CODE';
  lastBlast = -1;
  startTime = performance.now();
  raf = requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas, { passive: true });
replay.addEventListener('click', play);
resizeCanvas();
play();
