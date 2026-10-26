import React, { useEffect, useRef } from 'react';
import { SKINS } from '../game/skins';

interface HeroSnakePreviewProps {
  skinId: string;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const HeroSnakePreview: React.FC<HeroSnakePreviewProps> = ({
  skinId,
  width = 240,
  height = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      time += 0.04;
      const skin = SKINS[skinId as keyof typeof SKINS] || SKINS.emerald;

      const numSegments = 14;
      const waveAmplitude = 18;
      const waveFreq = 0.5;
      const segmentSpacing = 11;
      const startX = width * 0.78;
      const centerY = height * 0.5;

      // Draw segments from tail to head
      for (let i = numSegments - 1; i >= 0; i--) {
        const x = startX - i * segmentSpacing;
        const y = centerY + Math.sin(time * 2 + i * waveFreq) * waveAmplitude;
        const radius = Math.max(4.5, 10 - i * 0.35);

        if (i === 0) {
          // Head
          ctx.save();
          ctx.shadowColor = skin.glowColor;
          ctx.shadowBlur = 12;

          const grad = ctx.createRadialGradient(x - 2, y - 2, 2, x, y, radius);
          grad.addColorStop(0, skin.primaryColor);
          grad.addColorStop(1, skin.secondaryColor);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius * 1.15, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;

          // Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + 3, y - 3, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = skin.eyeColor || '#070b14';
          ctx.beginPath();
          ctx.arc(x + 4.5, y - 3, 1.6, 0, Math.PI * 2);
          ctx.fill();

          // Tongue flick
          if (Math.sin(time * 3) > 0.3) {
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x + radius * 1.15, y);
            ctx.lineTo(x + radius * 1.15 + 8, y);
            ctx.lineTo(x + radius * 1.15 + 11, y - 2.5);
            ctx.moveTo(x + radius * 1.15 + 8, y);
            ctx.lineTo(x + radius * 1.15 + 11, y + 2.5);
            ctx.stroke();
          }

          ctx.restore();
        } else {
          // Body segment
          ctx.save();
          if (skin.pattern === 'prism') {
            const hue = (i * 25 + time * 60) % 360;
            ctx.fillStyle = `hsl(${hue}, 85%, 55%)`;
          } else {
            ctx.fillStyle = i % 2 === 0 ? skin.primaryColor : skin.secondaryColor;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [skinId, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl pointer-events-none drop-shadow-md"
    />
  );
};
