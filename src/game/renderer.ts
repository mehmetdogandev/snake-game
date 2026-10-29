import { GameState, FoodItem, Particle } from './types';
import { SKINS } from './skins';

interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private ambientMotes: AmbientMote[] = [];
  private pulsePhase = 0;
  private tonguePhase = 0;
  private animTime = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.initMotes();
  }

  private initMotes() {
    this.ambientMotes = [];
    for (let i = 0; i < 18; i++) {
      this.ambientMotes.push({
        x: Math.random() * 600,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.15,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.4,
        baseAlpha: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  public resize(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ): { cellSize: number; offsetX: number; offsetY: number } {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    return { cellSize: 0, offsetX: 0, offsetY: 0 };
  }

  public emitFoodBurst(x: number, y: number, color: string, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 4.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color,
        alpha: 1,
        maxLife: 26 + Math.random() * 16,
        life: 0,
      });
    }
  }

  public emitCrashBurst(x: number, y: number) {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4.5,
        color: Math.random() > 0.5 ? '#ef4444' : '#fb923c',
        alpha: 1,
        maxLife: 35 + Math.random() * 25,
        life: 0,
      });
    }
  }

  public emitConfetti(width: number, height: number, count = 60) {
    const colors = ['#10b981', '#06b6d4', '#eab308', '#a855f7', '#f43f5e', '#38bdf8'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: height * 0.35 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 7,
        vy: -3 - Math.random() * 5,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        maxLife: 60 + Math.random() * 30,
        life: 0,
      });
    }
  }

  public render(
    state: GameState,
    canvasWidth: number,
    canvasHeight: number,
    skinId: string,
    reducedMotion = false,
    theme: 'light' | 'dark' = 'dark'
  ) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const skin = SKINS[skinId as keyof typeof SKINS] || SKINS.emerald;

    const padding = 10;
    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;

    const cellSize = Math.floor(
      Math.min(availableWidth / state.gridWidth, availableHeight / state.gridHeight)
    );

    const boardWidth = cellSize * state.gridWidth;
    const boardHeight = cellSize * state.gridHeight;
    const offsetX = Math.floor((canvasWidth - boardWidth) / 2);
    const offsetY = Math.floor((canvasHeight - boardHeight) / 2);

    if (!reducedMotion) {
      this.pulsePhase += 0.05;
      this.tonguePhase += 0.09;
      this.animTime += 0.025;
    }

    const isLight = theme === 'light';

    // 1. Draw Arena Radial Vignette Background
    ctx.save();
    const bgGrad = ctx.createRadialGradient(
      offsetX + boardWidth / 2,
      offsetY + boardHeight / 2,
      boardWidth * 0.15,
      offsetX + boardWidth / 2,
      offsetY + boardHeight / 2,
      boardWidth * 0.72
    );

    if (isLight) {
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(0.65, '#eef2f6');
      bgGrad.addColorStop(1, '#e2e8f0');
    } else {
      bgGrad.addColorStop(0, '#0a1020');
      bgGrad.addColorStop(0.65, '#070b16');
      bgGrad.addColorStop(1, '#04070e');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);

    // 2. Draw Subtle Holographic Grid
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.032)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= state.gridWidth; x++) {
      const px = offsetX + x * cellSize;
      ctx.moveTo(px, offsetY);
      ctx.lineTo(px, offsetY + boardHeight);
    }
    for (let y = 0; y <= state.gridHeight; y++) {
      const py = offsetY + y * cellSize;
      ctx.moveTo(offsetX, py);
      ctx.lineTo(offsetX + boardWidth, py);
    }
    ctx.stroke();

    // Subtle intersection dots
    ctx.fillStyle = isLight ? 'rgba(5, 150, 105, 0.3)' : 'rgba(16, 185, 129, 0.15)';
    for (let x = 2; x < state.gridWidth; x += 3) {
      for (let y = 2; y < state.gridHeight; y += 3) {
        ctx.fillRect(offsetX + x * cellSize - 1, offsetY + y * cellSize - 1, 2, 2);
      }
    }

    // 3. Draw Ambient Floating Motes
    if (!reducedMotion) {
      this.drawMotes(ctx, offsetX, offsetY, boardWidth, boardHeight, isLight);
    }

    // 4. Draw Obstacles
    for (const obs of state.obstacles) {
      this.drawObstacle(obs.x, obs.y, offsetX, offsetY, cellSize, isLight);
    }

    // 5. Draw Foods
    for (const food of state.food) {
      this.drawFood(food, offsetX, offsetY, cellSize);
    }

    // 6. Draw Continuous Fluid Snake
    this.drawSnake(state, offsetX, offsetY, cellSize, skin);

    // 7. Update and Draw Particles
    this.drawParticles(ctx);

    // 8. Draw Arena Perimeter Walls with Corner Brackets
    this.drawPerimeter(ctx, offsetX, offsetY, boardWidth, boardHeight, state.mode, isLight);

    ctx.restore();
  }

  private drawMotes(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    bw: number,
    bh: number,
    isLight = false
  ) {
    ctx.save();
    for (const mote of this.ambientMotes) {
      mote.x += mote.vx;
      mote.y += mote.vy;
      mote.phase += 0.03;

      // Wrap motes within board
      if (mote.x < 0) mote.x = bw;
      if (mote.x > bw) mote.x = 0;
      if (mote.y < 0) mote.y = bh;
      if (mote.y > bh) mote.y = 0;

      const currentAlpha = mote.baseAlpha * (0.6 + Math.sin(mote.phase) * 0.4);
      const color = isLight
        ? `rgba(5, 150, 105, ${(currentAlpha * 0.85).toFixed(2)})`
        : `rgba(16, 185, 129, ${currentAlpha.toFixed(2)})`;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(offsetX + mote.x, offsetY + mote.y, mote.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawObstacle(
    oxCell: number,
    oyCell: number,
    offsetX: number,
    offsetY: number,
    cellSize: number,
    isLight = false
  ) {
    const ctx = this.ctx;
    const ox = offsetX + oxCell * cellSize;
    const oy = offsetY + oyCell * cellSize;
    const cornerRadius = cellSize * 0.22;

    ctx.save();
    // Core surface
    ctx.fillStyle = isLight ? '#334155' : '#161f30';
    ctx.strokeStyle = isLight ? '#dc2626' : '#ef4444';
    ctx.lineWidth = 1.8;

    ctx.shadowColor = isLight ? 'rgba(220, 38, 38, 0.25)' : 'rgba(239, 68, 68, 0.35)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.roundRect(ox + 2, oy + 2, cellSize - 4, cellSize - 4, cornerRadius);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Diagonal hazard stripes
    ctx.clip();
    ctx.strokeStyle = isLight ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.3)';
    ctx.lineWidth = 2.5;
    for (let i = -cellSize; i < cellSize * 2; i += 7) {
      ctx.beginPath();
      ctx.moveTo(ox + i, oy);
      ctx.lineTo(ox + i + cellSize, oy + cellSize);
      ctx.stroke();
    }

    // Inner bevel highlight
    ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + 3.5, oy + 3.5, cellSize - 7, cellSize - 7);

    ctx.restore();
  }

  private drawFood(food: FoodItem, offsetX: number, offsetY: number, cellSize: number) {
    const ctx = this.ctx;
    const cx = offsetX + food.position.x * cellSize + cellSize / 2;
    // Gentle floating bounce
    const bounce = Math.sin(this.pulsePhase * 2.2) * (cellSize * 0.05);
    const cy = offsetY + food.position.y * cellSize + cellSize / 2 + bounce;

    const baseRadius = cellSize * 0.38;
    const pulse = Math.sin(this.pulsePhase * 2.8) * (cellSize * 0.04);
    const radius = baseRadius + pulse;

    ctx.save();

    if (food.type === 'NORMAL') {
      // Emerald apple energy orb
      // Outer light halo
      ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // Radiant body gradient
      const grad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      grad.addColorStop(0, '#a7f3d0');
      grad.addColorStop(0.35, '#34d399');
      grad.addColorStop(0.75, '#10b981');
      grad.addColorStop(1, '#047857');

      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 14;
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Glossy crescent reflection
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(cx - radius * 0.32, cy - radius * 0.32, radius * 0.28, radius * 0.14, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Stem & curved leaf
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 0.8);
      ctx.quadraticCurveTo(cx - 2, cy - radius * 1.25, cx + 4, cy - radius * 1.35);
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy - radius * 1.2, radius * 0.32, radius * 0.16, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (food.type === 'GOLDEN') {
      // Golden Apple with rotating corona and star orbit
      const rot = this.animTime * 1.8;

      // Rotating sparkle rays
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.lineWidth = 1.5;
      const rayLen = radius * 1.65;
      for (let a = 0; a < 4; a++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(-rayLen, 0);
        ctx.lineTo(rayLen, 0);
        ctx.stroke();
      }
      ctx.restore();

      // Glowing body gradient
      const grad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius * 1.15
      );
      grad.addColorStop(0, '#fef9c3');
      grad.addColorStop(0.3, '#fde047');
      grad.addColorStop(0.7, '#eab308');
      grad.addColorStop(1, '#854d0e');

      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20;
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Specular shine
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(cx - radius * 0.35, cy - radius * 0.35, radius * 0.32, radius * 0.16, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Small crown icon on top
      ctx.fillStyle = '#ffffff';
      const cw = radius * 0.45;
      ctx.beginPath();
      ctx.moveTo(cx - cw, cy - radius * 0.9);
      ctx.lineTo(cx - cw, cy - radius * 1.3);
      ctx.lineTo(cx - cw * 0.5, cy - radius * 1.05);
      ctx.lineTo(cx, cy - radius * 1.35);
      ctx.lineTo(cx + cw * 0.5, cy - radius * 1.05);
      ctx.lineTo(cx + cw, cy - radius * 1.3);
      ctx.lineTo(cx + cw, cy - radius * 0.9);
      ctx.closePath();
      ctx.fill();
    } else if (food.type === 'BONUS_2X') {
      // Violet 2X Powerup Orb
      const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, '#f3e8ff');
      grad.addColorStop(0.4, '#c084fc');
      grad.addColorStop(0.85, '#9333ea');
      grad.addColorStop(1, '#581c87');

      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 16;
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(cellSize * 0.44)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2X', cx, cy + 1);
    } else if (food.type === 'SLOW') {
      // Cyan Hourglass / Slow-Motion Orb
      const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.85, '#0284c7');
      grad.addColorStop(1, '#075985');

      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 16;
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Clock arms
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - radius * 0.38);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * 0.28, cy);
      ctx.stroke();
    } else if (food.type === 'SHIELD') {
      // Indigo Shield Orb
      const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, '#dbeafe');
      grad.addColorStop(0.4, '#60a5fa');
      grad.addColorStop(0.85, '#2563eb');
      grad.addColorStop(1, '#1e3a8a');

      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 18;
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      const sw = radius * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx - sw, cy - sw);
      ctx.lineTo(cx + sw, cy - sw);
      ctx.lineTo(cx + sw, cy);
      ctx.quadraticCurveTo(cx + sw, cy + sw, cx, cy + sw * 1.35);
      ctx.quadraticCurveTo(cx - sw, cy + sw, cx - sw, cy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private drawSnake(
    state: GameState,
    offsetX: number,
    offsetY: number,
    cellSize: number,
    skin: typeof SKINS.emerald
  ) {
    const ctx = this.ctx;
    const snake = state.snake;
    if (snake.length === 0) return;

    ctx.save();

    // 1. Draw Continuous Body Connectors & Segments
    for (let i = snake.length - 1; i >= 1; i--) {
      const seg = snake[i];
      const prevSeg = snake[i - 1];

      const cx = offsetX + seg.x * cellSize + cellSize / 2;
      const cy = offsetY + seg.y * cellSize + cellSize / 2;

      const px = offsetX + prevSeg.x * cellSize + cellSize / 2;
      const py = offsetY + prevSeg.y * cellSize + cellSize / 2;

      // Check for wrap-around separation (don't draw connector across entire screen)
      const distSq = (cx - px) * (cx - px) + (cy - py) * (cy - py);
      const isWrapped = distSq > cellSize * cellSize * 4;

      const taper = Math.max(0.62, 1 - (i / snake.length) * 0.38);
      const radius = (cellSize / 2 - 1.5) * taper;
      const prevRadius = (cellSize / 2 - 1.5) * Math.max(0.62, 1 - ((i - 1) / snake.length) * 0.38);

      // Determine segment color
      let segColor = skin.primaryColor;
      let secColor = skin.secondaryColor;

      if (skin.pattern === 'prism') {
        const hue = (i * 22 + this.animTime * 140) % 360;
        segColor = `hsl(${hue}, 88%, 56%)`;
        secColor = `hsl(${hue}, 88%, 38%)`;
      } else if (skin.pattern === 'pixel') {
        segColor = i % 2 === 0 ? skin.primaryColor : skin.secondaryColor;
        secColor = skin.secondaryColor;
      }

      // Draw connecting capsule bridge between consecutive segments
      if (!isWrapped) {
        ctx.strokeStyle = segColor;
        ctx.lineWidth = radius * 1.85;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // Draw segment body orb with radial highlight
      if (skin.pattern === 'pixel') {
        ctx.fillStyle = segColor;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx - radius, cy - radius, radius * 2, radius * 2);
      } else {
        const segGrad = ctx.createRadialGradient(
          cx - radius * 0.25,
          cy - radius * 0.25,
          radius * 0.1,
          cx,
          cy,
          radius
        );
        segGrad.addColorStop(0, segColor);
        segGrad.addColorStop(0.7, segColor);
        segGrad.addColorStop(1, secColor);

        ctx.fillStyle = segGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Spine highlight line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Skin-specific ornamentation
        if (skin.pattern === 'circuit' && i % 2 === 0) {
          ctx.strokeStyle = '#cffafe';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(cx - radius * 0.35, cy - radius * 0.35, radius * 0.7, radius * 0.7);
        } else if (skin.pattern === 'rings' && i % 2 === 0) {
          ctx.strokeStyle = 'rgba(243, 232, 255, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
          ctx.stroke();
        } else if (skin.pattern === 'galaxy' && i % 3 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx + radius * 0.25, cy - radius * 0.25, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw Snake Head
    const head = snake[0];
    const headX = offsetX + head.x * cellSize + cellSize / 2;
    const headY = offsetY + head.y * cellSize + cellSize / 2;
    const headRadius = cellSize / 2 - 0.5;

    // Glowing head aura
    ctx.shadowColor = skin.glowColor;
    ctx.shadowBlur = 18;

    const headGrad = ctx.createRadialGradient(
      headX - headRadius * 0.25,
      headY - headRadius * 0.25,
      headRadius * 0.1,
      headX,
      headY,
      headRadius * 1.15
    );
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.25, skin.primaryColor);
    headGrad.addColorStop(1, skin.secondaryColor);

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius * 1.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Invulnerability gold glow
    if (state.invulnerableTime > 0) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius * 1.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Tongue Flick Animation
    const tongueLength = cellSize * 0.55;
    const isTongueFlicking = Math.sin(this.tonguePhase) > 0.35 && !state.isGameOver;
    if (isTongueFlicking) {
      let tx = headX;
      let ty = headY;
      let endX = headX;
      let endY = headY;

      if (state.direction === 'RIGHT') {
        tx += headRadius;
        endX = tx + tongueLength;
      } else if (state.direction === 'LEFT') {
        tx -= headRadius;
        endX = tx - tongueLength;
      } else if (state.direction === 'UP') {
        ty -= headRadius;
        endY = ty - tongueLength;
      } else if (state.direction === 'DOWN') {
        ty += headRadius;
        endY = ty + tongueLength;
      }

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(endX, endY);

      // Fork tips
      if (state.direction === 'RIGHT' || state.direction === 'LEFT') {
        const sign = state.direction === 'RIGHT' ? 1 : -1;
        ctx.lineTo(endX + sign * 3.5, endY - 3.5);
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX + sign * 3.5, endY + 3.5);
      } else {
        const sign = state.direction === 'DOWN' ? 1 : -1;
        ctx.lineTo(endX - 3.5, endY + sign * 3.5);
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX + 3.5, endY + sign * 3.5);
      }
      ctx.stroke();
    }

    // Expressive Eyes with motion pupils
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    let eyeSpreadX = 0;
    let eyeSpreadY = 0;

    const eyeForward = headRadius * 0.42;
    const eyeSpread = headRadius * 0.44;

    switch (state.direction) {
      case 'RIGHT':
        eyeOffsetX = eyeForward;
        eyeSpreadY = eyeSpread;
        break;
      case 'LEFT':
        eyeOffsetX = -eyeForward;
        eyeSpreadY = eyeSpread;
        break;
      case 'UP':
        eyeOffsetY = -eyeForward;
        eyeSpreadX = eyeSpread;
        break;
      case 'DOWN':
        eyeOffsetY = eyeForward;
        eyeSpreadX = eyeSpread;
        break;
    }

    const eyeRadius = cellSize * 0.16;
    const pupilRadius = cellSize * 0.09;

    const leftEye = [headX + eyeOffsetX - eyeSpreadX, headY + eyeOffsetY - eyeSpreadY];
    const rightEye = [headX + eyeOffsetX + eyeSpreadX, headY + eyeOffsetY + eyeSpreadY];

    [leftEye, rightEye].forEach(([ex, ey]) => {
      // Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, ey, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pupil oriented towards direction of travel
      ctx.fillStyle = skin.eyeColor || '#070b14';
      ctx.beginPath();
      const px = ex + (state.direction === 'RIGHT' ? 2 : state.direction === 'LEFT' ? -2 : 0);
      const py = ey + (state.direction === 'DOWN' ? 2 : state.direction === 'UP' ? -2 : 0);
      ctx.arc(px, py, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pupil highlight glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(px - 1, py - 1, pupilRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });

    // Shield Dome Effect
    if (state.hasShield) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(headX, headY, headRadius * 1.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Orbiting shield spark
      const sparkAngle = this.animTime * 3.5;
      const sx = headX + Math.cos(sparkAngle) * headRadius * 1.6;
      const sy = headY + Math.sin(sparkAngle) * headRadius * 1.6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  private drawPerimeter(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    bw: number,
    bh: number,
    mode: GameState['mode'],
    isLight = false
  ) {
    ctx.save();
    const isZen = mode === 'ZEN';
    const wallColor = isLight
      ? isZen
        ? 'rgba(2, 132, 199, 0.85)'
        : 'rgba(5, 150, 105, 0.85)'
      : isZen
      ? 'rgba(56, 189, 248, 0.5)'
      : 'rgba(16, 185, 129, 0.65)';
    const glowColor = isZen ? (isLight ? '#0284c7' : '#38bdf8') : (isLight ? '#059669' : '#10b981');

    ctx.strokeStyle = wallColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isLight ? 4 : 10;
    ctx.strokeRect(ox, oy, bw, bh);

    ctx.shadowBlur = 0;

    // Corner brackets
    const bracketLen = 14;
    ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.lineWidth = 3;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(ox, oy + bracketLen);
    ctx.lineTo(ox, oy);
    ctx.lineTo(ox + bracketLen, oy);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(ox + bw - bracketLen, oy);
    ctx.lineTo(ox + bw, oy);
    ctx.lineTo(ox + bw, oy + bracketLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(ox, oy + bh - bracketLen);
    ctx.lineTo(ox, oy + bh);
    ctx.lineTo(ox + bracketLen, oy + bh);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(ox + bw - bracketLen, oy + bh);
    ctx.lineTo(ox + bw, oy + bh);
    ctx.lineTo(ox + bw, oy + bh - bracketLen);
    ctx.stroke();

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
