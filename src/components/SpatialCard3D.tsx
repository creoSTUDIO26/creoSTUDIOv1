import React, { useRef, useState, useCallback } from 'react';

interface SpatialCard3DProps {
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Max tilt in degrees (default: 8)
  glareOpacity?: number; // Max opacity of specular glare (default: 0.15)
  scaleOnHover?: number; // Scale factor on hover (default: 1.02)
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function SpatialCard3D({
  children,
  className = '',
  maxTilt = 7,
  glareOpacity = 0.18,
  scaleOnHover = 1.02,
  onClick,
  style = {}
}: SpatialCard3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, ${scaleOnHover})`
    );

    // Dynamic light glare position
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setGlareStyle({
      opacity: glareOpacity,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 65%)`
    });
  }, [maxTilt, glareOpacity, scaleOnHover]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transform-gpu will-change-transform ${className}`}
      style={{
        ...style,
        transform: transform || undefined,
        transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}

      {/* Dynamic Specular Glare Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-inherit overflow-hidden"
        style={{
          ...glareStyle,
          mixBlendMode: 'overlay'
        }}
        aria-hidden="true"
      />
    </div>
  );
}
