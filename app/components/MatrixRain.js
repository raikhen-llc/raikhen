"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix rain configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to track y position of each column
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start above screen at random heights
    }

    // Characters to display (just 0 and 1)
    const chars = "01";

    // Animation
    const draw = () => {
      // Semi-transparent black to create fade trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Green text
      ctx.fillStyle = "#00ff00";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Calculate x position
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Vary the opacity based on position for depth effect
        const opacity = 0.1 + Math.random() * 0.2;
        ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;

        // Draw the character
        ctx.fillText(char, x, y);

        // Occasionally draw a brighter "head" character
        if (Math.random() > 0.975) {
          ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
          ctx.fillText(char, x, y);
        }

        // Reset drop to top when it goes off screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };

    // Run animation
    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
