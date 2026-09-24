import React from "react";
import "./AnimatedCar.css";

export default function AnimatedCar() {
  return (
    <div className="car-animation-container">
      <div className="car-road">
        <div className="road-line line-1"></div>
        <div className="road-line line-2"></div>
        <div className="road-line line-3"></div>
      </div>
      
      <div className="car-wrapper">
        {/* SVG Car */}
        <svg className="car-svg" viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
          {/* Car Body */}
          <path d="M15,50 L15,40 C15,35 25,25 40,20 L70,20 C80,20 95,30 110,35 L170,35 C185,35 195,40 205,45 L225,45 C230,45 235,50 235,60 L235,65 C235,70 230,75 225,75 L210,75 C210,65 200,65 200,75 L60,75 C60,65 50,65 50,75 L25,75 C20,75 15,70 15,65 Z" fill="#2c3e50" />
          {/* Windows */}
          <path d="M45,25 L68,25 C75,25 85,32 95,36 L55,36 Z" fill="#a4d1f2" />
          <path d="M100,25 L115,25 L115,36 L100,36 Z" fill="#a4d1f2" />
          {/* Headlight */}
          <path d="M225,48 L235,48 L235,55 L225,55 Z" fill="#f1c40f" />
          {/* Taillight */}
          <path d="M15,45 L20,45 L20,52 L15,52 Z" fill="#e74c3c" />
          {/* Wheels */}
          <g transform="translate(65, 75)">
            <circle cx="0" cy="0" r="12" fill="#1a1a1a" />
            <circle cx="0" cy="0" r="7" fill="#bdc3c7" className="wheel-spoke" />
            <circle cx="0" cy="0" r="3" fill="#1a1a1a" />
          </g>
          <g transform="translate(195, 75)">
            <circle cx="0" cy="0" r="12" fill="#1a1a1a" />
            <circle cx="0" cy="0" r="7" fill="#bdc3c7" className="wheel-spoke" />
            <circle cx="0" cy="0" r="3" fill="#1a1a1a" />
          </g>
        </svg>
      </div>
    </div>
  );
}
