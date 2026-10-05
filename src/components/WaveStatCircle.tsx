import React, { useEffect, useRef } from 'react';
import { ByTheNumbersStat } from '../types';

interface WaveStatCircleProps {
  stat: ByTheNumbersStat;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WaveStatCircle({ stat, className = '', size = 'md' }: WaveStatCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const fill = Math.min(Math.max(stat.fillPercentage ?? 70, 10), 95);
  const color = stat.color || '#7c3aed';

  const sizeClasses = {
    sm: 'w-36 h-36 sm:w-40 sm:h-40',
    md: 'w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56',
    lg: 'w-52 h-52 sm:w-60 sm:h-60 lg:w-64 lg:h-64',
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    let phaseBack = Math.PI / 2;
    let animationRunning = true;

    const render = () => {
      if (!canvas || !ctx || !animationRunning) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const radius = width / 2;
      const borderWidth = 2.5;

      // Clip strictly inside the circle border
      ctx.beginPath();
      ctx.arc(radius, radius, radius - borderWidth / 2, 0, Math.PI * 2);
      ctx.clip();

      // Background fill of circle
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);

      // Liquid level calculation
      const targetFillY = height - (fill / 100) * height;
      const waveHeight = Math.max(6, width * 0.045);
      const waveFrequency = 1.2;

      // 1. Render Back Wave (Depth layer with subtle transparency)
      ctx.save();
      ctx.fillStyle = color + '66'; // 40% opacity
      ctx.beginPath();
      ctx.moveTo(0, targetFillY);
      for (let x = 0; x <= width; x += 2) {
        const y = targetFillY + Math.sin((x / width) * Math.PI * 2 * waveFrequency + phaseBack) * (waveHeight * 0.85);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Render Front Wave (Vibrant gradient liquid fill)
      ctx.save();
      const grad = ctx.createLinearGradient(0, targetFillY - waveHeight, 0, height);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + 'ee');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, targetFillY);
      for (let x = 0; x <= width; x += 2) {
        const y = targetFillY + Math.sin((x / width) * Math.PI * 2 * waveFrequency + phase) * waveHeight;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Subtle crest highlight along the top wave curve
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const y = targetFillY + Math.sin((x / width) * Math.PI * 2 * waveFrequency + phase) * waveHeight;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // Increment wave motion phases
      phase += 0.038;
      phaseBack -= 0.025;

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      animationRunning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [fill, color]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Outer Glow & Border Circle */}
      <div
        ref={containerRef}
        className={`relative rounded-full aspect-square overflow-hidden flex flex-col items-center justify-center transition-transform duration-500 hover:scale-105 select-none ${sizeClasses}`}
        style={{
          border: `2.5px solid ${color}`,
          boxShadow: `0 0 28px ${color}33, inset 0 0 16px ${color}22`,
          backgroundColor: '#0a0a0c'
        }}
      >
        {/* HTML5 Canvas Wave Renderer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Text Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-3 sm:p-4 pointer-events-none">
          <span className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            {stat.value}
          </span>
          <span className="font-sans font-medium text-xs sm:text-sm text-white/95 mt-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {stat.label}
          </span>
          {stat.sublabel && (
            <span className="font-mono text-[9px] sm:text-[10px] text-white/75 uppercase tracking-widest mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] font-semibold">
              {stat.sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
