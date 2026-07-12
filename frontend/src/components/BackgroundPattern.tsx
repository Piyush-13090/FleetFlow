import React, { useEffect, useRef } from 'react';

export const BackgroundPattern: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class representing logistics nodes (fleets, hubs)
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Slow movement to avoid distraction
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.radius = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.4 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = `rgba(37, 99, 235, ${this.alpha})`; // Primary blue with varying alpha
        c.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => new Particle());

    const drawConnections = (c: CanvasRenderingContext2D) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          // Faint connections when nodes are near
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08;
            c.beginPath();
            c.moveTo(p1.x, p1.y);
            c.lineTo(p2.x, p2.y);
            c.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            c.lineWidth = 0.75;
            c.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint dot grid representing a simplified world map layout
      ctx.fillStyle = 'rgba(37, 99, 235, 0.015)';
      const dotSpacing = 30;
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          // Add a subtle wave pattern to dot grid to make it feel abstract and map-like
          const isMapArea = (Math.sin(x * 0.003) * Math.cos(y * 0.003) > -0.2);
          if (isMapArea) {
            ctx.beginPath();
            ctx.arc(x, y, 0.75, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      drawConnections(ctx);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #2563EB 1px, transparent 1px),
            linear-gradient(to bottom, #2563EB 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Abstract Road Lines (Faint curved logistics pathways) */}
      <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M-100,200 Q200,50 600,400 T1400,200 T2000,500" 
          fill="none" 
          stroke="#2563EB" 
          strokeWidth="2.5" 
          strokeDasharray="8 8" 
        />
        <path 
          d="M-50,600 Q400,300 800,800 T1800,400" 
          fill="none" 
          stroke="#2563EB" 
          strokeWidth="1.5" 
          strokeDasharray="12 6" 
        />
        <path 
          d="M300,-100 Q600,400 1200,200 T2200,800" 
          fill="none" 
          stroke="#2563EB" 
          strokeWidth="2" 
        />
      </svg>

      {/* Canvas for interactive floating logistics dots */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
