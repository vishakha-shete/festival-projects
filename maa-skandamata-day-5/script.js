const canvas = document.getElementById("revealCanvas");
const ctx = canvas.getContext("2d");
const experience = document.getElementById("experience");
const intro = document.getElementById("intro");
const replayButton = document.getElementById("replayButton");

let width = 0;
let height = 0;
let dpr = 1;
let animationFrame = null;
let progress = 0;
let lastTime = 0;
let finished = false;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resizeCanvas() {
  const rect = experience.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  paintVeil();
  if (!finished && !reducedMotion) {
    progress = 0;
    lastTime = 0;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(animateLine);
  }
}

function paintVeil() {
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff0b8";
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * .5, height * .46, 8,
    width * .5, height * .46, Math.max(width, height) * .72
  );
  glow.addColorStop(0, "rgba(255,248,218,.97)");
  glow.addColorStop(.72, "rgba(255,240,184,.985)");
  glow.addColorStop(1, "rgba(255,240,184,1)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(177,123,25,.24)";
  for (let i = 0; i < 85; i++) {
    ctx.beginPath();
    ctx.arc((i * 97.31) % width, (i * 61.73) % height, (i % 3) * .3 + .45, 0, Math.PI * 2);
    ctx.fill();
  }
}

function eraseSegment(x1, y1, x2, y2) {
  // Erase a broad path through the veil, exposing the supplied image underneath.
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = Math.max(32, Math.min(54, width * .045));
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.stroke();
  ctx.restore();

  // A narrow golden filament runs along the reveal edge.
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,190,43,.98)";
  ctx.shadowColor = "rgba(255,174,18,.95)";
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.restore();
}

function animateLine(timestamp) {
  if (finished) return;
  if (!lastTime) lastTime = timestamp;
  const delta = Math.min(timestamp - lastTime, 40);
  lastTime = timestamp;

  // The line automatically sweeps left-to-right, then steps upward,
  // zig-zagging from the bottom of the screen to the top.
  const rowHeight = Math.max(5, Math.min(9, height / 95));
  const distancePerRow = width;
  const totalRows = Math.ceil(height / rowHeight);
  const totalDistance = totalRows * distancePerRow;

  // Complete the entire reveal in exactly 20 seconds.
  const duration = 20000;
  progress += delta;
  const currentDistance = Math.min((progress / duration) * totalDistance, totalDistance);
  const speed = totalDistance / (duration / 1000);
  const row = Math.floor(currentDistance / distancePerRow);
  const inRow = currentDistance - row * distancePerRow;
  const y = height - row * rowHeight;
  const forward = row % 2 === 0;
  const x = forward ? inRow : width - inRow;
  const previousDistance = Math.max(0, currentDistance - speed * delta / 1000);

  if (currentDistance > 0) {
    const previousRow = Math.floor(previousDistance / distancePerRow);
    const previousInRow = previousDistance - previousRow * distancePerRow;
    const previousY = height - previousRow * rowHeight;
    const previousX = previousRow % 2 === 0
      ? previousInRow
      : width - previousInRow;
    eraseSegment(previousX, previousY, x, y);
  }

  // Make the title gently disappear once the line begins its journey.
  if (progress > width * .16) intro.classList.add("is-gone");

  if (currentDistance >= totalDistance) {
    finished = true;
    // Remove the veil completely at the end so the full original image remains.
    ctx.clearRect(0, 0, width, height);
    return;
  }
  animationFrame = requestAnimationFrame(animateLine);
}

function startAnimation() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  progress = 0;
  lastTime = 0;
  finished = false;
  intro.classList.remove("is-gone");
  paintVeil();

  if (reducedMotion) {
    ctx.clearRect(0, 0, width, height);
    intro.classList.add("is-gone");
    finished = true;
    return;
  }
  animationFrame = requestAnimationFrame(animateLine);
}

replayButton.addEventListener("click", startAnimation);
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
startAnimation();
