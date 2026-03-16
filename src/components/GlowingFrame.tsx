'use client';

import { useEffect, useRef } from 'react';

export default function GlowingFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shard1Ref = useRef<HTMLDivElement>(null);
  const shard2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const shard1 = shard1Ref.current;
    const shard2 = shard2Ref.current;

    if (!container || !shard1 || !shard2) return;

    let animationId: number;
    let progress = 0;
    const speed = 0.0003;

    const getPositionAndAngle = (p: number, width: number, height: number) => {
      const perimeter = 2 * (width + height);
      const distance = p * perimeter;

      // Top edge: moving right
      if (distance < width) {
        return { x: distance, y: 0, angle: 0, side: 'top' as const };
      }
      // Right edge: moving down
      if (distance < width + height) {
        return { x: width, y: distance - width, angle: 90, side: 'right' as const };
      }
      // Bottom edge: moving left
      if (distance < 2 * width + height) {
        return { x: width - (distance - width - height), y: height, angle: 180, side: 'bottom' as const };
      }
      // Left edge: moving up
      return { x: 0, y: height - (distance - 2 * width - height), angle: 270, side: 'left' as const };
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const p1 = progress;
      const p2 = (progress + 0.5) % 1; // Exactly opposite

      const pos1 = getPositionAndAngle(p1, width, height);
      const pos2 = getPositionAndAngle(p2, width, height);

      // Shard 1
      shard1.style.left = `${pos1.x}px`;
      shard1.style.top = `${pos1.y}px`;
      shard1.style.transform = `translate(-50%, -50%) rotate(${pos1.angle}deg)`;

      // Shard 2
      shard2.style.left = `${pos2.x}px`;
      shard2.style.top = `${pos2.y}px`;
      shard2.style.transform = `translate(-50%, -50%) rotate(${pos2.angle}deg)`;

      progress = (progress + speed) % 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  const shardStyle: React.CSSProperties = {
    position: 'absolute',
    width: '200px',
    height: '6px',
    pointerEvents: 'none',
    background: `linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 10%,
      rgba(255, 255, 255, 0.3) 35%,
      rgba(255, 255, 255, 0.9) 50%,
      rgba(255, 255, 255, 0.3) 65%,
      rgba(255, 255, 255, 0.03) 90%,
      transparent 100%
    )`,
    borderRadius: '2px',
    mixBlendMode: 'screen',
  };

  const shardGlowStyle: React.CSSProperties = {
    position: 'absolute',
    width: '240px',
    height: '60px',
    pointerEvents: 'none',
    background: `radial-gradient(
      ellipse 50% 50% at center,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.06) 40%,
      transparent 70%
    )`,
    borderRadius: '50%',
    mixBlendMode: 'screen',
  };

  return (
    <div className="frame-container" ref={containerRef}>
      {/* Subtle frame border */}
      <div className="frame-border" />

      {/* Shard 1 - sharp light streak */}
      <div ref={shard1Ref} style={{ position: 'absolute', pointerEvents: 'none' }}>
        {/* Core shard - thin sharp line */}
        <div style={shardStyle} />
        {/* Soft glow halo around the shard */}
        <div
          style={{
            ...shardGlowStyle,
            top: '-27px',
            left: '-20px',
          }}
        />
        {/* Tight bloom on the core */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '16px',
            left: '40px',
            top: '-5px',
            pointerEvents: 'none',
            background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.15) 30%,
              rgba(255, 255, 255, 0.35) 50%,
              rgba(255, 255, 255, 0.15) 70%,
              transparent 100%
            )`,
            filter: 'blur(4px)',
            borderRadius: '50%',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Shard 2 - matching opposite shard */}
      <div ref={shard2Ref} style={{ position: 'absolute', pointerEvents: 'none' }}>
        <div style={{ ...shardStyle, opacity: 0.8 }} />
        <div
          style={{
            ...shardGlowStyle,
            top: '-27px',
            left: '-20px',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '16px',
            left: '40px',
            top: '-5px',
            pointerEvents: 'none',
            background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.12) 30%,
              rgba(255, 255, 255, 0.28) 50%,
              rgba(255, 255, 255, 0.12) 70%,
              transparent 100%
            )`,
            filter: 'blur(4px)',
            borderRadius: '50%',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Vignette for depth */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: `
            inset 0 0 150px rgba(0, 0, 0, 0.5),
            inset 0 0 60px rgba(0, 0, 0, 0.3)
          `,
        }}
      />
    </div>
  );
}
