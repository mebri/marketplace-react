import React, { useState } from "react";

export default React.memo(function AnimatedCar({ speed = 6 }) {
  const [imageFailed, setImageFailed] = useState(false);

  // This uses Vite's BASE_URL so it works no matter where you deploy it
  const carImagePath = `${import.meta.env.BASE_URL}mycar.png`.replace('//', '/');

  return (
    <div className="car-animation-container" aria-hidden="true">
      <style>{`
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 65px;
          overflow: hidden;
          background: transparent;
          margin-top: -10px;
          margin-bottom: 10px;
          pointer-events: none;
        }

        /* 60 FPS GPU Acceleration */
        .car-wrapper {
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 170px;
          will-change: transform;
          transform: translate3d(-200px, 0, 0);
          animation: driveAcrossGPU ${speed}s linear infinite;
        }

        .car-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.45));
        }

        @keyframes driveAcrossGPU {
          0% {
            transform: translate3d(-200px, 0, 0);
          }
          100% {
            transform: translate3d(calc(100vw + 200px), 0, 0);
          }
        }

        @keyframes spinWheels {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spin-wheel {
          transform-origin: center;
          animation: spinWheels 0.65s linear infinite;
        }

        @media (max-width: 640px) {
          .car-animation-container {
            height: 50px;
          }
          .car-wrapper {
            width: 130px;
          }
        }
      `}</style>

      {/* Road line */}
      <div 
        style={{
          position: "absolute",
          bottom: "3px",
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.4), transparent)"
        }} 
      />

      {/* Moving Car */}
      <div className="car-wrapper">
        {!imageFailed ? (
          <img
            src={carImagePath}
            alt="Toyota SUV"
            loading="eager"
            decoding="async"
            className="car-img"
            onError={() => setImageFailed(true)}
          />
        ) : (
          /* Automatic Toyota SUV SVG fallback */
          <svg viewBox="0 0 280 100" className="car-img" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="140" cy="92" rx="120" ry="6" fill="rgba(0,0,0,0.4)" />
            <path
              d="M20 70 L30 50 C38 42 55 35 75 35 L165 35 C185 35 210 42 225 50 L255 58 C265 62 270 70 268 76 L262 82 C260 84 256 84 250 84 L216 84 C214 74 205 66 194 66 C183 66 174 74 172 84 L108 84 C106 74 97 66 86 66 C75 66 66 74 64 84 L25 84 C22 84 20 80 20 76 Z"
              fill="url(#toyotaGradient)"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <path d="M78 32 L172 32" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M75 38 L115 38 L115 54 L62 54 C66 48 70 42 75 38 Z" fill="#0f172a" stroke="#475569" />
            <path d="M120 38 L160 38 C175 38 190 42 198 52 L198 54 L120 54 Z" fill="#0f172a" stroke="#475569" />
            <path d="M245 60 L260 63 L255 68 L240 66 Z" fill="#38bdf8" />
            <circle cx="258" cy="64" r="3" fill="#ffffff" />
            <path d="M21 62 L32 60 L30 68 L22 70 Z" fill="#ef4444" />
            
            <g className="spin-wheel" style={{ transformOrigin: "86px 84px" }}>
              <circle cx="86" cy="84" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="86" cy="84" r="9" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
              <line x1="86" y1="75" x2="86" y2="93" stroke="#e2e8f0" strokeWidth="1.5" />
              <line x1="77" y1="84" x2="95" y2="84" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <g className="spin-wheel" style={{ transformOrigin: "194px 84px" }}>
              <circle cx="194" cy="84" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="194" cy="84" r="9" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
              <line x1="194" y1="75" x2="194" y2="93" stroke="#e2e8f0" strokeWidth="1.5" />
              <line x1="185" y1="84" x2="203" y2="84" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>

            <defs>
              <linearGradient id="toyotaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
});
