/* ================================================================
   Confetti Particle System
   ================================================================ */

const ConfettiEffect = (() => {
  let canvas, ctx;
  let particles = [];
  let animationId = null;
  let running = false;

  const PARTICLE_COUNT = 250;
  const COLORS = [
    '#f5a623', '#00ff88', '#e63946',
    '#ff69b4', '#87ceeb', '#ffd700',
    '#ff6b6b', '#48dbfb', '#feca57'
  ];
  const GRAVITY = 0.12;
  const DRAG = 0.98;
  const SPIN_SPEED = 0.08;

  function init() {
    canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    running = true;
    animate();
  }

  function destroy() {
    running = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    window.removeEventListener('resize', resize);
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    particles = [];
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * (canvas ? canvas.width : window.innerWidth),
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 8,
      vy: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * SPIN_SPEED,
      opacity: 1,
      decay: 0.002 + Math.random() * 0.003
    };
  }

  function animate() {
    if (!running) return;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let aliveCount = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.vy += GRAVITY;
      p.vx *= DRAG;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > canvas.height + 50) {
        continue;
      }

      aliveCount++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (aliveCount > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      running = false;
    }
  }

  return { init, destroy };
})();
