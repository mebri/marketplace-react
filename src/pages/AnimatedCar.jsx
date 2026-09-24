import React from "react";

export default function AnimatedCar() {
  return (
    <>
      <style>{`
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 140px;
          overflow: hidden;
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
          left: 100%; /* Start from the right */
          width: 240px;
          animation: driveAcross 5s linear infinite;
        }

        .car-svg {
          width: 100%;
          height: auto;
          /* Flip the car horizontally so it faces left */
          transform: scaleX(-1);
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.25));
        }

        .wheel-spoke {
          transform-origin: center;
          animation: spinWheel 0.8s linear infinite;
        }

        /* Drive from Right to Left */
        @keyframes driveAcross {
          0% { left: 100%; }
          100% { left: -300px; }
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
            height: 100px;
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

        {/* 🚙 Red Toyota SUV */}
        <div className="car-wrapper">
          <svg className="car-svg" viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg">
            {/* Car Shadow */}
            <ellipse cx="160" cy="102" rx="140" ry="8" fill="rgba(0,0,0,0.15)" />

            {/* Main SUV Body - Toyota Red */}
            <path d="M 20 85 L 20 55 Q 25 40 50 35 L 90 30 Q 130 20 180 20 L 260 25 Q 295 30 305 50 L 305 85 L 280 85 A 24 24 0 0 0 230 85 L 90 85 A 24 24 0 0 0 40 85 Z" fill="#d32f2f" />
            
            {/* Roof Rails (Silver) */}
            <path d="M 80 25 L 240 25" stroke="#b0bec5" strokeWidth="4" strokeLinecap="round" />
            <path d="M 85 25 L 85 20" stroke="#b0bec5" strokeWidth="3" />
            <path d="M 235 25 L 235 20" stroke="#b0bec5" strokeWidth="3" />

            {/* Windows - Dark Tint */}
            <path d="M 60 38 L 130 25 Q 180 20 230 25 L 260 38 Q 200 35 130 40 Z" fill="#263238" />
            <path d="M 130 25 L 130 40" stroke="#d32f2f" strokeWidth="3" />
            <path d="M 200 23 L 200 37" stroke="#d32f2f" strokeWidth="3" />

            {/* Black Plastic Lower Cladding (SUV Trim) */}
            <path d="M 20 70 L 305 70 L 305 85 L 280 85 A 24 24 0 0 0 230 85 L 90 85 A 24 24 0 0 0 40 85 Z" fill="#212121" />

            {/* Toyota-style Front Grille */}
            <path d="M 290 55 L 305 55 L 305 68 L 285 68 Z" fill="#111" />
            <path d="M 292 58 L 302 58" stroke="#424242" strokeWidth="2" />
            <path d="M 292 62 L 302 62" stroke="#424242" strokeWidth="2" />

            {/* Sharp LED Headlight */}
            <path d="M 285 48 L 305 52 L 305 58 L 285 55 Z" fill="#fff" />
            <path d="M 285 48 L 305 52" stroke="#00e5ff" strokeWidth="2" />

            {/* Red LED Taillight */}
            <path d="M 20 55 L 35 55 L 35 65 L 20 65 Z" fill="#b71c1c" />
            <path d="M 20 60 L 35 60" stroke="#ff5252" strokeWidth="2" />

            {/* Side Mirror */}
            <path d="M 115 40 L 105 34 L 120 36 Z" fill="#212121" />

            {/* 🛞 Front Wheel - Chunky SUV Tire */}
            <g transform="translate(65, 85)">
              <circle cx="0" cy="0" r="22" fill="#111" />
              <g className="wheel-spoke">
                <circle cx="0" cy="0" r="15" fill="#424242" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#b0bec5" strokeWidth="4" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#b0bec5" strokeWidth="4" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#b0bec5" strokeWidth="4" />
                <line x1="-10" y1="10" x2="10" y2="-10" stroke="#b0bec5" strokeWidth="4" />
                <circle cx="0" cy="0" r="5" fill="#d32f2f" />
              </g>
              <circle cx="0" cy="0" r="22" fill="none" stroke="#333" strokeWidth="3" />
            </g>

            {/* 🛞 Rear Wheel - Chunky SUV Tire */}
            <g transform="translate(255, 85)">
              <circle cx="0" cy="0" r="22" fill="#111" />
              <g className="wheel-spoke">
                <circle cx="0" cy="0" r="15" fill="#424242" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#b0bec5" strokeWidth="4" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#b0bec5" strokeWidth="4" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#b0bec5" strokeWidth="4" />
                <line x1="-10" y1="10" x2="10" y2="-10" stroke="#b0bec5" strokeWidth="4" />
                <circle cx="0" cy="0" r="5" fill="#d32f2f" />
              </g>
              <circle cx="0" cy="0" r="22" fill="none" stroke="#333" strokeWidth="3" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
