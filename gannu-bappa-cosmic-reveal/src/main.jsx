import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const BAPPA = "/gannu-bappa.jpg";

function App() {
  const canvasRef = useRef(null);
  const bappaRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bappa = bappaRef.current;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let start = performance.now();

    const stars = [];
    const orbitDots = [];
    const travelDots = [];
    const petals = [];
    const fireworks = [];

    const TAU = Math.PI * 2;

    function rand(a, b) {
      return a + Math.random() * (b - a);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene();
    }

    function buildScene() {
      stars.length = 0;
      orbitDots.length = 0;
      travelDots.length = 0;
      petals.length = 0;

      for (let i = 0; i < 260; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: rand(0.35, 1.5),
          phase: rand(0, TAU),
          speed: rand(0.5, 2.2)
        });
      }

      const earthX = W * 0.18;
      const earthY = H * 0.78;
      const earthR = Math.min(W, H) * 0.13;

      for (let i = 0; i < 420; i++) {
        const a = Math.random() * TAU;
        const rr = Math.sqrt(Math.random()) * earthR;
        orbitDots.push({
          x: earthX + Math.cos(a) * rr,
          y: earthY + Math.sin(a) * rr,
          sx: earthX + Math.cos(a) * rr,
          sy: earthY + Math.sin(a) * rr,
          a,
          r: rand(0.7, 2.2),
          phase: rand(0, TAU),
          speed: rand(0.6, 1.8)
        });
      }

      for (let i = 0; i < 240; i++) {
        travelDots.push({
          t: Math.random(),
          offset: rand(-1, 1),
          phase: rand(0, TAU),
          speed: rand(0.7, 1.3),
          size: rand(0.8, 2.4)
        });
      }

      for (let i = 0; i < 170; i++) {
        petals.push({
          x: W / 2 + rand(-W * 0.28, W * 0.28),
          y: H * 0.22 + rand(-30, H * 0.55),
          vx: rand(-0.8, 0.8),
          vy: rand(0.4, 1.8),
          rot: rand(0, TAU),
          spin: rand(-0.04, 0.04),
          size: rand(4, 10),
          phase: rand(0, TAU)
        });
      }

      fireworks.length = 0;
    }

    function firework(x, y, colorPhase = Math.random()) {
      const sparks = [];
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * TAU + rand(-0.03, 0.03);
        const speed = rand(1.2, 4.4);
        sparks.push({
          x, y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 1,
          size: rand(1, 2.5),
          hue: colorPhase
        });
      }
      fireworks.push({ sparks });
    }

    function progress(a, b, t) {
      return Math.max(0, Math.min(1, (t - a) / (b - a)));
    }

    function ease(t) {
      return t * t * (3 - 2 * t);
    }

    function drawStars(time) {
      for (const s of stars) {
        const alpha = 0.18 + (Math.sin(time * 0.001 * s.speed + s.phase) + 1) * 0.22;
        ctx.fillStyle = `rgba(255,224,170,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      }
    }

    function drawEarth(time, p) {
      const x = W * 0.18;
      const y = H * 0.78;
      const r = Math.min(W, H) * 0.13;

      ctx.save();
      ctx.globalAlpha = 1 - p * 0.85;

      const glow = ctx.createRadialGradient(x, y, r * 0.25, x, y, r * 1.5);
      glow.addColorStop(0, "rgba(75,145,255,.18)");
      glow.addColorStop(1, "rgba(75,145,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.55, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = "rgba(92,172,255,.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.stroke();

      for (const d of orbitDots) {
        const drift = Math.sin(time * 0.001 * d.speed + d.phase) * 2;
        const xx = d.x + drift;
        const yy = d.y + Math.cos(time * 0.0012 + d.phase) * 2;
        ctx.fillStyle = `rgba(255,194,82,${0.35 + Math.sin(time * .003 + d.phase) ** 2 * .6})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255,184,62,.9)";
        ctx.beginPath();
        ctx.arc(xx, yy, d.r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    function drawMoon(time, p) {
      const x = W * 0.78;
      const y = H * 0.25;
      const r = Math.min(W, H) * 0.065;
      const alpha = Math.sin(p * Math.PI);

      ctx.save();
      ctx.globalAlpha = alpha;

      const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.3);
      glow.addColorStop(0, "rgba(255,239,190,.25)");
      glow.addColorStop(1, "rgba(255,239,190,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.3, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "rgba(255,239,194,.9)";
      ctx.shadowBlur = 25;
      ctx.shadowColor = "rgba(255,221,142,.7)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();

      for (let i = 0; i < 35; i++) {
        const a = i * 2.4;
        const rr = r * Math.sqrt((i + 3) / 38) * 0.85;
        ctx.fillStyle = "rgba(155,123,78,.16)";
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, rand(1, 3), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    function drawTravel(time, p) {
      if (p < 0.1 || p > 0.86) return;

      const sx = W * 0.18;
      const sy = H * 0.78;
      const ex = W * 0.78;
      const ey = H * 0.25;

      for (const d of travelDots) {
        const t = (d.t + p * d.speed * 1.7) % 1;
        const curve = Math.sin(t * Math.PI) * H * 0.24;
        const x = sx + (ex - sx) * t;
        const y = sy + (ey - sy) * t - curve + d.offset * 18;

        const tw = 0.45 + 0.55 * Math.sin(time * 0.004 + d.phase) ** 2;
        ctx.fillStyle = `rgba(255,190,68,${tw})`;
        ctx.shadowBlur = 9;
        ctx.shadowColor = "rgba(255,175,40,.95)";
        ctx.beginPath();
        ctx.arc(x, y, d.size, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function drawPetals(time, p) {
      const amount = ease(p);
      ctx.save();
      ctx.globalAlpha = amount;

      for (const petal of petals) {
        petal.x += petal.vx + Math.sin(time * 0.001 + petal.phase) * 0.25;
        petal.y += petal.vy;
        petal.rot += petal.spin;

        if (petal.y > H + 20) {
          petal.y = H * 0.18;
          petal.x = W / 2 + rand(-W * 0.28, W * 0.28);
        }

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rot);
        ctx.fillStyle = "rgba(244,79,100,.88)";
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size * 0.48, petal.size, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    function drawFireworks(time, p) {
      if (p > 0.72 && fireworks.length < 7 && Math.random() < 0.018) {
        firework(
          rand(W * 0.08, W * 0.92),
          rand(H * 0.1, H * 0.5),
          Math.random()
        );
      }

      ctx.save();
      for (const f of fireworks) {
        for (const s of f.sparks) {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.985;
          s.vy = s.vy * 0.985 + 0.018;
          s.life -= 0.012;

          if (s.life <= 0) continue;

          const hue = s.hue > 0.66
            ? `rgba(255,93,96,${s.life})`
            : s.hue > 0.33
              ? `rgba(255,211,93,${s.life})`
              : `rgba(255,171,56,${s.life})`;

          ctx.fillStyle = hue;
          ctx.shadowBlur = 10;
          ctx.shadowColor = hue;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    function render(now) {
      ctx.clearRect(0, 0, W, H);

      // 0–4.5s: earth dots.
      // 3–7.5s: dots travel to moon.
      // 6.5–10.5s: moon fades and Bappa arrives.
      // 9.5s onward: flowers + fireworks.
      const cycle = ((now - start) % 15000) / 15000;

      const earthP = progress(0, 0.48, cycle);
      const moonP = progress(0.16, 0.55, cycle);
      const travelP = progress(0.16, 0.62, cycle);
      const arrivalP = progress(0.43, 0.76, cycle);
      const celebrationP = progress(0.62, 1, cycle);

      drawStars(now);
      drawEarth(now, earthP);
      drawMoon(now, moonP);
      drawTravel(now, travelP);

      const imageAlpha = ease(arrivalP);
      bappa.style.opacity = String(imageAlpha);
      bappa.style.transform = `translate(-50%, -50%) scale(${0.82 + imageAlpha * 0.18})`;

      drawPetals(now, celebrationP);
      drawFireworks(now, celebrationP);

      raf = requestAnimationFrame(render);
    }

    resize();
    start = performance.now();
    raf = requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="scene">
      <img ref={bappaRef} className="bappa" src={BAPPA} alt="Gannu Bappa" />
      <canvas ref={canvasRef} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
