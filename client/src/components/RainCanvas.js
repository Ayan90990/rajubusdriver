import React, { useEffect, useRef } from 'react';

export default function RainCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Rain drops
    const NUM_DROPS = 220;
    const drops = Array.from({ length: NUM_DROPS }, () => ({
      x:      Math.random() * window.innerWidth,
      y:      Math.random() * window.innerHeight,
      len:    Math.random() * 18 + 8,
      speed:  Math.random() * 10 + 12,
      opacity: Math.random() * 0.25 + 0.07,
      width:  Math.random() * 0.6 + 0.3,
    }));

    let rafId;
    const ANGLE = 0.22; // slight slant (radians)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + Math.sin(ANGLE) * d.len, d.y + d.len);
        ctx.strokeStyle = `rgba(200,160,100,${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.stroke();

        // Move drop down
        d.y += d.speed;
        d.x += Math.sin(ANGLE) * d.speed * 0.18;

        // Reset when off screen
        if (d.y > canvas.height + 20) {
          d.y = -20;
          d.x = Math.random() * canvas.width;
        }
        if (d.x > canvas.width + 20) {
          d.x = -10;
        }
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="rain-canvas"
      aria-hidden="true"
    />
  );
}
