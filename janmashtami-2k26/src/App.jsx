import React, { useEffect, useRef, useState } from 'react';

const TAU = Math.PI * 2;

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = '/krishna.png';

    let particles = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    let startedAt = performance.now();
    let resizeObserver;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (image.complete && image.naturalWidth) buildParticles();
    };

    const buildParticles = () => {
      const maxW = Math.min(width * 0.82, 720);
      const maxH = Math.min(height * 0.78, 1080);
      const scale = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
      const drawW = image.naturalWidth * scale;
      const drawH = image.naturalHeight * scale;
      const ox = (width - drawW) / 2;
      const oy = Math.max(42, (height - drawH) / 2 - 18);

      const off = document.createElement('canvas');
      const octx = off.getContext('2d', { willReadFrequently: true });
      off.width = image.naturalWidth;
      off.height = image.naturalHeight;
      octx.clearRect(0, 0, off.width, off.height);
      octx.drawImage(image, 0, 0);
      const data = octx.getImageData(0, 0, off.width, off.height).data;

      const step = width < 600 ? 6 : 5;
      const next = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const i = (y * off.width + x) * 4;
          const alpha = data[i + 3];
          if (alpha < 35) continue;

          const r = data[i], g = data[i + 1], b = data[i + 2];
          const tx = ox + x * scale;
          const ty = oy + y * scale;
          const angle = Math.random() * TAU;
          const radius = Math.max(width, height) * (0.18 + Math.random() * 0.55);

          next.push({
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius,
            tx, ty,
            r, g, b, a: alpha / 255,
            size: Math.max(0.7, scale * (1.0 + Math.random() * 1.15)),
            delay: Math.random() * 1300,
            twinkle: Math.random() * TAU,
          });
        }
      }

      particles = next;
      startedAt = performance.now();
      setReady(true);
      setComplete(false);
    };

    const drawAmbient = (t) => {
      ctx.clearRect(0, 0, width, height);
      const g = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        0,
        width / 2,
        height * 0.45,
        Math.max(width, height) * 0.6
      );
      g.addColorStop(0, 'rgba(35, 63, 150, 0.22)');
      g.addColorStop(0.45, 'rgba(8, 18, 55, 0.16)');
      g.addColorStop(1, 'rgba(2, 4, 15, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 90; i++) {
        const x = (i * 137.37) % width;
        const y = (i * 79.21) % height;
        const tw = 0.4 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.0015 + i));
        ctx.fillStyle = `rgba(255, 244, 198, ${0.12 * tw})`;
        ctx.beginPath();
        ctx.arc(x, y, tw, 0, TAU);
        ctx.fill();
      }
    };

    const animate = (now) => {
      const elapsed = now - startedAt;
      drawAmbient(now);
      let allSettled = true;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        const local = Math.max(0, elapsed - p.delay);
        const progress = Math.min(1, local / 2600);
        const eased = 1 - Math.pow(1 - progress, 3);
        const wobble = (1 - eased) * 7 * Math.sin(now * 0.002 + p.twinkle);
        const targetX = p.tx + wobble;
        const targetY = p.ty + (1 - eased) * 7 * Math.cos(now * 0.0022 + p.twinkle);

        p.x += (targetX - p.x) * 0.075;
        p.y += (targetY - p.y) * 0.075;

        if (Math.abs(targetX - p.x) > 0.7 || Math.abs(targetY - p.y) > 0.7) {
          allSettled = false;
        }

        const pulse = 0.72 + 0.28 * Math.sin(now * 0.004 + p.twinkle);
        const sparkle = progress > 0.92 && Math.random() > 0.995;
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a * pulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (sparkle ? 2.5 : 1), 0, TAU);
        ctx.fill();
      }

      ctx.restore();

      if (elapsed > 4300 && allSettled) setComplete(true);
      raf = requestAnimationFrame(animate);
    };

    image.onload = resize;
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(document.body);
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [started]);

  const startExperience = async () => {
    setStarted(true);
    setMusicOn(true);

    requestAnimationFrame(async () => {
      if (!audioRef.current) return;
      audioRef.current.volume = 0.35;
      try {
        await audioRef.current.play();
      } catch (error) {
        console.warn('Audio could not start:', error);
      }
    });
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setMusicOn(true);
      } catch (error) {
        console.warn('Audio could not start:', error);
      }
    } else {
      audio.pause();
      setMusicOn(false);
    }
  };

  const replay = () => window.location.reload();

  return (
    <main className="festival">
      <audio ref={audioRef} src="/krishna_flute.mp3" loop preload="auto" />

      <div className="moon" aria-hidden="true" />
      <div className="peacock-glow" aria-hidden="true" />
      <canvas ref={canvasRef} className="particle-canvas" />

      {!started && (
        <div className="welcome-screen">
          <div className="welcome-feather"><img src="/peacock-feather.svg" alt="Peacock feather" /></div>
          <p className="welcome-small">A divine moment awaits</p>
          <h1>॥ जय श्री कृष्ण ॥</h1>
          <p>Listen to the flute and watch the divine form appear.</p>
          <button className="enter-button" onClick={startExperience}>
            Enter the Divine Experience ✨
          </button>
        </div>
      )}

      {started && (
        <button className="music-button" onClick={toggleMusic} aria-label="Toggle background music">
          {musicOn ? '🔊' : '🔇'}
        </button>
      )}

      <div className={`intro ${ready ? 'intro-ready' : ''} ${complete ? 'intro-complete' : ''}`}>
        <p className="eyebrow">A little divine moment • 2026</p>
        <h1>॥ जय श्री कृष्ण ॥</h1>
        <p className="subtitle">May your heart always find its way to peace.</p>

        {complete && (
          <>
            <div className="divider"><span><img src="/peacock-feather.svg" alt="Peacock feather" /></span></div>
            <h2>Happy Janmashtami <strong>2K26</strong></h2>
            <button onClick={replay}>Experience again ✨</button>
          </>
        )}
      </div>

      {started && <div className="bottom-note">Move slowly. Let the divine story appear.</div>}
    </main>
  );
}

export default App;
