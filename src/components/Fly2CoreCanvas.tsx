import React, { useEffect, useRef } from 'react';
import { TelemetryData } from '../types';

interface Fly2CoreCanvasProps {
  status: TelemetryData['status'];
  audioLevel?: number;
  interactive?: boolean;
  className?: string;
}

export const Fly2CoreCanvas: React.FC<Fly2CoreCanvasProps> = ({
  status,
  audioLevel = 0,
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse rotation angles
  const targetRotX = useRef(0.2);
  const targetRotY = useRef(0.5);
  const rotX = useRef(0.2);
  const rotY = useRef(0.5);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Generate static particle and filament data
    const particleCount = 180;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 400,
      radius: Math.random() * 2.5 + 0.8,
      color: Math.random() > 0.4 ? 'cyan' : 'gold',
      speed: Math.random() * 0.02 + 0.005,
      orbitRadius: Math.random() * 180 + 40,
      angle: Math.random() * Math.PI * 2,
    }));

    // Neural filament strands
    const strandCount = 28;
    const strands = Array.from({ length: strandCount }, (_, i) => {
      const baseAngle = (i / strandCount) * Math.PI * 2;
      return {
        angle: baseAngle,
        length: 120 + Math.random() * 100,
        curveFactor: (Math.random() - 0.5) * 1.5,
        color: i % 3 === 0 ? 'rgba(255, 180, 50, ' : 'rgba(0, 240, 255, ',
        speed: 0.01 + Math.random() * 0.015,
        nodes: Array.from({ length: 6 }, (_, j) => j / 5),
      };
    });

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const { clientWidth, clientHeight } = containerRef.current;
      canvas.width = clientWidth * window.devicePixelRatio;
      canvas.height = clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    const render = () => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth mouse rotation
      rotX.current += (targetRotX.current - rotX.current) * 0.05;
      rotY.current += (targetRotY.current - rotY.current) * 0.05;

      const cosX = Math.cos(rotX.current);
      const sinX = Math.sin(rotX.current);
      const cosY = Math.cos(rotY.current);
      const sinY = Math.sin(rotY.current);

      time += status === 'thinking' ? 0.04 : status === 'speaking' ? 0.03 : 0.015;

      // Pulse multiplier based on state and audioLevel
      let pulse = Math.sin(time * 3) * 0.15 + 1;
      if (status === 'thinking') pulse += Math.sin(time * 10) * 0.25;
      if (status === 'speaking') pulse += audioLevel * 0.5;

      // 1. Draw outer ambient cosmic backdrop glow
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        Math.min(width, height) * 0.6
      );
      bgGrad.addColorStop(0, 'rgba(255, 170, 40, 0.25)');
      bgGrad.addColorStop(0.3, 'rgba(0, 200, 255, 0.15)');
      bgGrad.addColorStop(0.7, 'rgba(10, 25, 50, 0.08)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Helper for 3D projection
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const fov = 350;
        const scale = fov / (fov + z2);
        return {
          px: centerX + x1 * scale,
          py: centerY + y2 * scale,
          scale,
          z2,
        };
      };

      // 2. Render Holographic Orbital HUD Rings
      const ringRadii = [90, 140, 190];
      ringRadii.forEach((r, idx) => {
        const ringPulseR = r * pulse;
        const ringSegments = 60;
        const speedMult = idx % 2 === 0 ? 0.5 : -0.7;
        const ringRot = time * speedMult;

        ctx.beginPath();
        for (let i = 0; i <= ringSegments; i++) {
          const a = (i / ringSegments) * Math.PI * 2 + ringRot;
          const rx = Math.cos(a) * ringPulseR;
          const ry = Math.sin(a) * ringPulseR;
          const rz = Math.sin(a * 2) * 15;

          const p = project(rx, ry, rz);
          if (i === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.strokeStyle = idx === 1 ? 'rgba(255, 180, 50, 0.4)' : 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = idx === 0 ? 2 : 1;
        ctx.setLineDash(idx === 2 ? [6, 6] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 3. Render Neural Filaments (Swirling energy strands)
      strands.forEach((strand) => {
        const curAngle = strand.angle + time * strand.speed;
        const endR = strand.length * pulse;

        ctx.beginPath();
        let prevP = project(0, 0, 0);
        ctx.moveTo(prevP.px, prevP.py);

        const steps = 12;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const r = endR * t;
          const wave = Math.sin(t * Math.PI * 3 + time * 4) * 20 * strand.curveFactor;
          const a = curAngle + t * strand.curveFactor;

          const fx = Math.cos(a) * r + Math.sin(curAngle) * wave;
          const fy = Math.sin(a) * r + Math.cos(curAngle) * wave;
          const fz = Math.sin(t * Math.PI * 2 + time * 2) * 40;

          const p = project(fx, fy, fz);
          ctx.lineTo(p.px, p.py);
        }

        const alpha = Math.min(1, 0.2 + (status === 'thinking' ? 0.6 : 0.3));
        ctx.strokeStyle = `${strand.color}${alpha})`;
        ctx.lineWidth = status === 'thinking' ? 2.2 : 1.4;
        ctx.stroke();

        // Render glowing nodes along filaments
        strand.nodes.forEach((nodeT) => {
          const nodeDist = endR * nodeT;
          const nodeA = curAngle + nodeT * strand.curveFactor;
          const nx = Math.cos(nodeA) * nodeDist;
          const ny = Math.sin(nodeA) * nodeDist;
          const nz = Math.sin(nodeT * Math.PI * 2 + time * 2) * 40;

          const np = project(nx, ny, nz);
          ctx.beginPath();
          ctx.arc(np.px, np.py, 2 * np.scale, 0, Math.PI * 2);
          ctx.fillStyle = strand.color + '0.9)';
          ctx.fill();
        });
      });

      // 4. Render Orbiting Particles
      particles.forEach((pt) => {
        pt.angle += pt.speed * (status === 'thinking' ? 2.5 : 1);
        const px = Math.cos(pt.angle) * pt.orbitRadius;
        const py = Math.sin(pt.angle) * pt.orbitRadius * 0.7;
        const pz = Math.sin(pt.angle * 1.5) * (pt.orbitRadius * 0.5);

        const proj = project(px, py, pz);
        if (proj.z2 < -300) return; // clip behind camera

        ctx.beginPath();
        ctx.arc(proj.px, proj.py, pt.radius * proj.scale * (status === 'speaking' ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = pt.color === 'gold' ? 'rgba(255, 200, 80, 0.85)' : 'rgba(0, 240, 255, 0.85)';
        ctx.fill();

        // Particle subtle trail/glow
        if (status === 'thinking' || status === 'speaking') {
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, pt.radius * proj.scale * 3, 0, Math.PI * 2);
          ctx.fillStyle = pt.color === 'gold' ? 'rgba(255, 200, 80, 0.15)' : 'rgba(0, 240, 255, 0.15)';
          ctx.fill();
        }
      });

      // 5. Render Central Luminous Golden Core Orb (fly2.0 Nexus Core)
      const coreR = 38 * pulse;
      const coreP = project(0, 0, 0);

      // Core Outer Radiant Glow
      const coreGlow = ctx.createRadialGradient(
        coreP.px,
        coreP.py,
        coreR * 0.2,
        coreP.px,
        coreP.py,
        coreR * 2.8
      );
      coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreGlow.addColorStop(0.2, 'rgba(255, 210, 80, 0.9)');
      coreGlow.addColorStop(0.5, 'rgba(255, 120, 20, 0.7)');
      coreGlow.addColorStop(0.8, 'rgba(0, 220, 255, 0.4)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(coreP.px, coreP.py, coreR * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      // Core Solid Sphere
      ctx.beginPath();
      ctx.arc(coreP.px, coreP.py, coreR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffdf6d';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = status === 'thinking' ? 35 : 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Core Energy Eye
      ctx.beginPath();
      ctx.arc(coreP.px, coreP.py, coreR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, [status, audioLevel]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive) return;
    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      targetRotY.current += dx * 0.008;
      targetRotX.current += dy * 0.008;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY.current = nx * 0.8;
      targetRotX.current = -ny * 0.8;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden select-none ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
