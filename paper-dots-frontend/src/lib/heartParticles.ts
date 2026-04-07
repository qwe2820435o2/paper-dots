interface HeartParticle {
  x: number;        // 0..1 normalized
  y: number;
  vx: number;       // horizontal drift per tick
  vy: number;       // upward velocity (negative)
  size: number;     // base size in pixels at 1280px width
  rotation: number; // radians
  rotSpeed: number;
  alpha: number;
  age: number;
  maxAge: number;
  hue: number;      // 330-360 (pink-red range)
  wobblePhase: number;
}

const MAX_PARTICLES = 80;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Draw a heart shape centered at (0, 0) with the given size */
function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.35);
  // Left half
  ctx.bezierCurveTo(-s * 0.5, -s * 0.9, -s * 1.1, -s * 0.2, 0, s * 0.6);
  // Right half
  ctx.bezierCurveTo(s * 1.1, -s * 0.2, s * 0.5, -s * 0.9, 0, -s * 0.35);
  ctx.closePath();
}

export class HeartParticleSystem {
  particles: HeartParticle[] = [];

  spawn(faceX: number, faceY: number, count: number) {
    if (this.particles.length >= MAX_PARTICLES) return;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break;
      this.particles.push({
        x: faceX + rand(-0.12, 0.12),
        y: faceY + rand(-0.08, 0.08),
        vx: rand(-0.001, 0.001),
        vy: rand(-0.004, -0.002),
        size: rand(20, 45),
        rotation: rand(-0.3, 0.3),
        rotSpeed: rand(-0.03, 0.03),
        alpha: rand(0.6, 1.0),
        age: 0,
        maxAge: rand(80, 160),
        hue: rand(330, 360),
        wobblePhase: rand(0, Math.PI * 2),
      });
    }
  }

  tick() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age++;

      if (p.age >= p.maxAge) {
        this.particles.splice(i, 1);
        continue;
      }

      // Float upward
      p.y += p.vy;
      // Sinusoidal horizontal wobble
      p.x += p.vx + Math.sin(p.wobblePhase + p.age * 0.05) * 0.0008;
      // Rotate
      p.rotation += p.rotSpeed;
      // Fade out in the last 30% of life
      const life = p.age / p.maxAge;
      if (life > 0.7) {
        p.alpha = (1 - life) / 0.3 * 0.8;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    for (const p of this.particles) {
      const px = p.x * w;
      const py = p.y * h;
      const scale = w / 1280; // scale size relative to reference width

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      const s = p.size * scale;
      drawHeart(ctx, s);

      // Fill with pink/red gradient
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, 1)`;
      ctx.fill();

      // Subtle highlight
      ctx.globalAlpha = p.alpha * 0.3;
      drawHeart(ctx, s * 0.6);
      ctx.fillStyle = `hsla(${p.hue}, 60%, 85%, 1)`;
      ctx.fill();

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

/** Draw a few static hearts for filter thumbnail preview */
export function drawStaticHearts(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const hearts = [
    { x: 0.3, y: 0.25, size: 14, rot: -0.2, alpha: 0.8, hue: 345 },
    { x: 0.65, y: 0.15, size: 18, rot: 0.15, alpha: 0.9, hue: 350 },
    { x: 0.5, y: 0.35, size: 12, rot: 0.1, alpha: 0.7, hue: 338 },
    { x: 0.4, y: 0.5, size: 16, rot: -0.1, alpha: 0.6, hue: 355 },
    { x: 0.7, y: 0.4, size: 10, rot: 0.25, alpha: 0.75, hue: 340 },
    { x: 0.25, y: 0.55, size: 12, rot: -0.15, alpha: 0.5, hue: 348 },
  ];

  const scale = w / 1280;

  for (const ht of hearts) {
    ctx.save();
    ctx.translate(ht.x * w, ht.y * h);
    ctx.rotate(ht.rot);
    ctx.globalAlpha = ht.alpha;

    const s = ht.size * Math.max(scale, 0.6); // ensure visible at small sizes
    drawHeart(ctx, s);
    ctx.fillStyle = `hsla(${ht.hue}, 80%, 65%, 1)`;
    ctx.fill();

    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
