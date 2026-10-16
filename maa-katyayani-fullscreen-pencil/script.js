const image = document.getElementById("reference");
const canvas = document.getElementById("sketch");
const ctx = canvas.getContext("2d");

const screen = document.getElementById("screen");
const pencil = document.getElementById("pencil");
const intro = document.getElementById("intro");

const statusEl = document.getElementById("status");
const percentEl = document.getElementById("percent");
const bar = document.getElementById("bar");

const blessing = document.getElementById("blessing");
const replay = document.getElementById("replay");

const DURATION = 20000;

let W = 0;
let H = 0;
let dpr = 1;
let progress = 0;
let start = 0;
let raf = 0;
let strokes = [];
let ready = false;


// Calculate the image dimensions without cropping it.
function box() {
  if (!image.naturalWidth) {
    return {
      x: 0,
      y: 0,
      w: W,
      h: H
    };
  }

  const scale = Math.min(
    W / image.naturalWidth,
    H / image.naturalHeight
  );

  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;

  return {
    x: (W - w) / 2,
    y: (H - h) / 2,
    w,
    h
  };
}


// Resize the canvas to fit the screen.
function resize() {
  const rect = screen.getBoundingClientRect();

  W = rect.width;
  H = rect.height;

  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (ready) {
    makeStrokes();
  }

  render(progress);
}


// Create predictable random values.
function randomizer(seed) {
  let s = seed >>> 0;

  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}


// Generate pencil-like strokes from the reference image.
function makeStrokes() {
  const b = box();
  const off = document.createElement("canvas");

  const scale = Math.min(1, 1100 / b.w);

  const sw = Math.max(200, Math.round(b.w * scale));
  const sh = Math.max(120, Math.round(b.h * scale));

  off.width = sw;
  off.height = sh;

  const oc = off.getContext("2d", {
    willReadFrequently: true
  });

  oc.drawImage(image, 0, 0, sw, sh);

  const data = oc.getImageData(0, 0, sw, sh).data;
  const luminance = new Float32Array(sw * sh);

  for (let i = 0; i < luminance.length; i++) {
    luminance[i] =
      0.299 * data[i * 4] +
      0.587 * data[i * 4 + 1] +
      0.114 * data[i * 4 + 2];
  }

  const random = randomizer(20261016);
  const list = [];

  const palette = [
    "#211f1b",
    "#59422e",
    "#94673b",
    "#c6a15a",
    "#315b3b",
    "#5b8759",
    "#8a4b78",
    "#b64740",
    "#d7c59c"
  ];

  // Detect image edges to create sketch-like contour strokes.
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const i = y * sw + x;

      const gx =
        -luminance[i - sw - 1] +
        luminance[i - sw + 1] -
        2 * luminance[i - 1] +
        2 * luminance[i + 1] -
        luminance[i + sw - 1] +
        luminance[i + sw + 1];

      const gy =
        -luminance[i - sw - 1] -
        2 * luminance[i - sw] -
        luminance[i - sw + 1] +
        luminance[i + sw - 1] +
        2 * luminance[i + sw] +
        luminance[i + sw + 1];

      const magnitude = Math.hypot(gx, gy);

      if (magnitude > 48 && random() > 0.53) {
        const xx = b.x + (x / sw) * b.w;
        const yy = b.y + (y / sh) * b.h;

        const angle = Math.atan2(gy, gx) + Math.PI / 2;
        const length = 1.5 + random() * 5;

        list.push({
          x: xx,
          y: yy,
          x2: xx + Math.cos(angle) * length,
          y2: yy + Math.sin(angle) * length,
          color: palette[
            Math.floor(random() * palette.length)
          ],
          alpha: 0.22 + random() * 0.52,
          lineWidth: 0.35 + random() * 0.8,
          order: 1 - y / sh + random() * 0.004
        });
      }
    }
  }

  // Add light coloured-pencil shading.
  for (let i = 0; i < 4800; i++) {
    const x = b.x + random() * b.w;
    const y = b.y + random() * b.h;

    list.push({
      x,
      y,
      x2: x + 1 + random() * 6,
      y2: y + (random() - 0.5) * 2,
      color: palette[
        Math.floor(random() * palette.length)
      ],
      alpha: 0.045 + random() * 0.17,
      lineWidth: 0.25 + random() * 0.55,
      order: 1 - (y - b.y) / b.h + random() * 0.02
    });
  }

  // Sort strokes so the drawing reveals from bottom to top.
  list.sort((a, b) => a.order - b.order);

  strokes = list;
}


// Render the pencil drawing.
function render(value) {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#f8f0df";
  ctx.fillRect(0, 0, W, H);

  const b = box();

  // Draw a subtle paper texture.
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#987d54";
  ctx.lineWidth = 0.5;

  for (let y = 0; y < H; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + 1);
    ctx.stroke();
  }

  ctx.restore();

  // Display a faint guide image.
  if (ready) {
    ctx.save();

    ctx.globalAlpha = 0.04;
    ctx.filter = "grayscale(1) contrast(1.1)";

    ctx.drawImage(
      image,
      b.x,
      b.y,
      b.w,
      b.h
    );

    ctx.restore();
  }

  // Reveal pencil strokes progressively.
  const count = Math.floor(strokes.length * value);

  for (let i = 0; i < count; i++) {
    const stroke = strokes[i];

    ctx.save();
    ctx.globalAlpha = stroke.alpha;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(stroke.x, stroke.y);
    ctx.lineTo(stroke.x2, stroke.y2);
    ctx.stroke();

    ctx.restore();
  }

  // Reveal the original colours near the end.
  if (ready && value > 0.72) {
    ctx.save();

    ctx.globalAlpha = Math.min(
      0.97,
      ((value - 0.72) / 0.28) ** 1.15 * 0.97
    );

    ctx.filter = "saturate(1.12) contrast(1.06)";

    ctx.drawImage(
      image,
      b.x,
      b.y,
      b.w,
      b.h
    );

    ctx.restore();

    // Add a final pencil-texture overlay.
    ctx.save();

    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#382b20";
    ctx.lineWidth = 0.45;

    const random = randomizer(900);

    for (let i = 0; i < 700; i++) {
      const x = b.x + random() * b.w;
      const y = b.y + random() * b.h;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + 2 + random() * 4,
        y + (random() - 0.5)
      );
      ctx.stroke();
    }

    ctx.restore();
  }
}


// Animate the pencil from the bottom towards the top.
function tick(now) {
  progress = Math.min(
    1,
    (now - start) / DURATION
  );

  render(progress);

  const b = box();
  const rows = 32;
  const sweep = progress * rows;

  const row = Math.min(
    rows - 1,
    Math.floor(sweep)
  );

  const t = sweep - row;
  const x = row % 2 === 0 ? t : 1 - t;

  pencil.style.left =
    `${((b.x + x * b.w) / W) * 100}%`;

  pencil.style.top =
    `${((b.y + (1 - progress) * b.h) / H) * 100}%`;

  pencil.style.opacity = progress < 1 ? "1" : "0";

  intro.style.opacity = progress < 0.035 ? "1" : "0";
  blessing.style.opacity = progress > 0.92 ? "1" : "0";

  percentEl.textContent =
    `${Math.round(progress * 100)}%`;

  bar.style.width = `${progress * 100}%`;

  if (progress < 1) {
    statusEl.textContent =
      progress < 0.3
        ? "Drawing the feet and lion…"
        : progress < 0.58
          ? "Sketching the sari and arms…"
          : progress < 0.82
            ? "Defining the face and crown…"
            : "Adding the final colours…";
  } else {
    statusEl.textContent = "Maa Katyayani is revealed ✨";
  }

  if (progress < 1) {
    raf = requestAnimationFrame(tick);
  }
}


// Start or replay the animation.
function play() {
  cancelAnimationFrame(raf);

  progress = 0;
  start = performance.now();

  pencil.style.opacity = "1";
  blessing.style.opacity = "0";

  raf = requestAnimationFrame(tick);
}


// Load the reference image and initialise the canvas.
image.addEventListener("load", () => {
  ready = true;
  resize();
});

image.addEventListener("error", () => {
  statusEl.textContent = "Image could not be loaded";
});

replay.addEventListener("click", play);

window.addEventListener("resize", resize);

if (image.complete && image.naturalWidth) {
  ready = true;
}

resize();
play();