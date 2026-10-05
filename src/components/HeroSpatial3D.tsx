import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export default function HeroSpatial3D({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isVisible = true;
    let animationId: number;

    // IntersectionObserver to pause when hero is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // 3D Icosahedron Vertices
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const rawVertices: Point3D[] = [
      { x: -1, y: phi, z: 0 },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi },
      { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
    ];

    // Normalize vertices to unit sphere
    const vertices = rawVertices.map(v => {
      const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return { x: v.x / len, y: v.y / len, z: v.z / len };
    });

    // Edges connecting vertices
    const edges: [number, number][] = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [1, 9], [1, 8], [1, 7],
      [2, 11], [2, 10], [2, 6], [2, 3], [2, 4],
      [3, 4], [3, 9], [3, 8], [3, 6],
      [4, 5], [4, 9], [4, 11],
      [5, 11], [5, 9],
      [6, 7], [6, 8], [6, 10],
      [7, 8], [7, 10],
      [8, 9],
      [10, 11]
    ];

    let rotX = 0.2;
    let rotY = 0.3;
    let targetRotX = 0.2;
    let targetRotY = 0.3;
    let autoSpin = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = x * 0.8;
      targetRotX = -y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) {
        animationId = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Smooth damping rotation
      autoSpin += 0.005;
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const currentRotX = rotX + Math.sin(autoSpin * 0.7) * 0.15;
      const currentRotY = rotY + autoSpin;

      const scale = Math.min(width, height) * 0.38;
      const cx = width / 2;
      const cy = height / 2;

      // Project 3D vertices to 2D
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      const projected: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        // Rotate around Y axis
        const x1 = v.x * cosY + v.z * sinY;
        const y1 = v.y;
        const z1 = -v.x * sinY + v.z * cosY;

        // Rotate around X axis
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Perspective projection
        const fov = 3.2;
        const pz = z2 + fov;
        const px = cx + (x2 / pz) * scale * 2.2;
        const py = cy + (y2 / pz) * scale * 2.2;

        projected.push({ x: px, y: py, z: z2 });
      }

      // Draw Edges with depth-based opacity and luxury chrome color
      for (const [i, j] of edges) {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgZ = (p1.z + p2.z) / 2;
        // Depth mapping: -1 to +1 -> opacity 0.15 to 0.65
        const depthAlpha = Math.max(0.1, Math.min(0.65, (avgZ + 1) / 2 * 0.55 + 0.1));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(0, 122, 147, ${depthAlpha.toFixed(2)})`;
        ctx.lineWidth = avgZ > 0 ? 1.4 : 0.9;
        ctx.stroke();
      }

      // Draw glowing Vertex Nodes
      for (const p of projected) {
        const nodeAlpha = Math.max(0.2, (p.z + 1) / 2 * 0.7 + 0.2);
        const nodeRadius = Math.max(1.8, (p.z + 1) * 2.2 + 1.2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${nodeAlpha.toFixed(2)})`;
        ctx.fill();

        if (p.z > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeRadius + 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 122, 147, 0.2)`;
          ctx.fill();
        }
      }

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-75 sm:opacity-85 mix-blend-multiply"
      />
    </div>
  );
}
