import React from "react";

export default function AnimatedCar() {
  return (
    <>
      <style>{`
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 130px;
          overflow: hidden;
          /* ☀️ Bright sky background */
          background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
          margin-top: 20px;
          margin-bottom: 20px;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        /* ☁️ Clouds */
        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50px;
          animation: floatCloud 8s linear infinite;
        }
        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
        }
        .cloud-1 {
          width: 50px; height: 18px;
          top: 15px; left: 10%;
          animation-delay: 0s;
        }
        .cloud-1::before { width: 25px; height: 25px; top: -12px; left: 8px; }
        .cloud-1::after { width: 18px; height: 18px; top: -8px; right: 8px; }
        
        .cloud-2 {
          width: 70px; height: 22px;
          top: 35px; left: 60%;
          animation-delay: 3s;
        }
        .cloud-2::before { width: 35px; height: 35px; top: -18px; left: 12px; }
        .cloud-2::after { width: 22px; height: 22px; top: -10px; right: 12px; }

        /* Road */
        .car-road {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 30px;
          background: #cfd8dc;
          border-top: 2px solid #90a4ae;
        }

        .road-line {
          position: absolute;
          bottom: 14px;
          width: 40px;
          height: 3px;
          background: #ffeb3b;
          border-radius: 2px;
          animation: roadMove 1.5s linear infinite;
        }

        .line-1 { left: 10%; animation-delay: 0s; }
        .line-2 { left: 50%; animation-delay: 0.5s; }
        .line-3 { left: 90%; animation-delay: 1s; }

        .car-wrapper {
          position: absolute;
          bottom: 15px;
          left: -300px;
          width: 240px; /* Made wider for the new car shape */
          animation: driveAcross 5s linear infinite;
        }

        .car-svg {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.25));
        }

        .wheel-spoke {
          transform-origin: center;
          animation: spinWheel 0.8s linear infinite;
        }

        @keyframes driveAcross {
          0% { left: -300px; }
          100% { left: 100%; }
        }

        @keyframes roadMove {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100px); opacity: 0.2; }
        }

        @keyframes spinWheel {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes floatCloud {
          0% { transform: translateX(0); }
          100% { transform: translateX(-150px); }
        }

        @media (max-width: 600px) {
          .car-animation-container {
            height: 90px;
          }
          .car-wrapper {
            width: 180px;
            bottom: 10px;
          }
          .car-road {
            height: 20px;
          }
          .road-line {
            bottom: 8px;
            width: 30px;
          }
          .cloud-1 { top: 5px; }
          .cloud-2 { top: 20px; }
        }
      `}</style>

      <div className="car-animation-container">
        {/* ☁️ Clouds */}
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>

        {/* 🛣️ Road */}
        <div className="car-road">
          <div className="road-line line-1"></div>
          <div className="road-line line-2"></div>
          <div className="road-line line-3"></div>
        </div>

        {/* 🚗 Modern Car */}
        <div className="car-wrapper">
          <svg className="car-svg" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
            {/* Car Shadow */}
            <ellipse cx="160" cy="92" rx="140" ry="8" fill="rgba(0,0,0,0.15)" />

            {/* Car Body - Sleek and Aerodynamic */}
            <path d="M 20 75 L 20 55 Q 25 40 70 40 L 130 25 Q 190 15 250 35 L 290 50 Q 305 55 305 65 L 305 80 L 275 80 A 22 22 0 0 0 235 80 L 85 80 A 22 22 0 0 0 45 80 Z" fill="#1a1a1a" />
            
            {/* Side Panel Accent / Door Line */}
            <path d="M 120 40 L 120 75" stroke="#333" strokeWidth="2" />
            <path d="M 220 35 L 220 75" stroke="#333" strokeWidth="2" />

            {/* Tinted Windows / Cabin */}
            <path d="M 75 42 L 135 28 Q 185 20 240 38 L 255 44 Q 185 40 125 45 Z" fill="#222" />
            <path d="M 140 28 L 140 42" stroke="#111" strokeWidth="2" /> {/* Window Divider */}

            {/* Modern LED Headlight (Cyan) */}
            <path d="M 295 58 L 305 63 L 305 68 L 295 65 Z" fill="#00e5ff" />
            <path d="M 290 62 L 295 65" stroke="#00e5ff" strokeWidth="3" />

            {/* Modern LED Taillight (Red) */}
            <path d="M 20 58 L 30 58 L 30 62 L 20 62 Z" fill="#ff0044" />

            {/* Side Mirror */}
            <path d="M 130 42 L 120 36 L 135 38 Z" fill="#1a1a1a" />

            {/* Aerodynamic Underbody Glow */}
            <path d="M 45 80 L 85 80 L 95 75 L 225 75 L 235 80 L 275 80 L 275 85 L 45 85 Z" fill="#00e5ff" opacity="0.3" />

            {/* 🛞 Front Wheel */}
            <g transform="translate(65, 80)">
              <circle cx="0" cy="0" r="20" fill="#111" />
              <g className="wheel-spoke">
                <circle cx="0" cy="0" r="14" fill="#222" />
                {/* Modern Spokes */}
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#888" strokeWidth="3" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#888" strokeWidth="3" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#888" strokeWidth="3" />
                <line x1="-10" y1="10" x2="10" y2="-10" stroke="#888" strokeWidth="3" />
                <circle cx="0" cy="0" r="5" fill="#00e5ff" />
              </g>
              <circle cx="0" cy="0" r="20" fill="none" stroke="#333" strokeWidth="2" />
            </g>

            {/* 🛞 Rear Wheel */}
            <g transform="translate(255, 80)">
              <circle cx="0" cy="0" r="20" fill="#111" />
              <g className="wheel-spoke">
                <circle cx="0" cy="0" r="14" fill="#222" />
                {/* Modern Spokes */}
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#888" strokeWidth="3" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#888" strokeWidth="3" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#888" strokeWidth="3" />
                <line x1="-10" y1="10" x2="10" y2="-10" stroke="#888" strokeWidth="3" />
                <circle cx="0" cy="0" r="5" fill="#00e5ff" />
              </g>
              <circle cx="0" cy="0" r="20" fill="none" stroke="#333" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
