import React from "react";

export default function ScrollingText({ 
  text = "Welcome to Yegna Gebeya! • Find the best cars and properties here • ", 
  speed = 20 
}) {
  return (
    <div className="marquee-container">
      <style>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          background: #0f172a; /* Dark background (change to match your site) */
          color: #38bdf8;      /* Blue text color (change to match your site) */
          padding: 10px 0;
          border-top: 1px solid #1e293b;
          border-bottom: 1px solid #1e293b;
          font-weight: 600;
          font-size: 14px;
          position: relative;
          display: flex;
        }

        .marquee-content {
          display: inline-block;
          padding-left: 100%; /* Starts off-screen to the right */
          animation: scrollLeft ${speed}s linear infinite;
          will-change: transform;
        }

        /* Pause animation on hover */
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
      
      {/* The text that flows right to left */}
      <div className="marquee-content">
        {text} &nbsp;&nbsp;&nbsp; {text} &nbsp;&nbsp;&nbsp; {text}
      </div>
    </div>
  );
}
