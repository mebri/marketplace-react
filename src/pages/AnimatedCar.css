import React from "react";

export default function AnimatedCar() {
  return (
    <>
      <style>{`
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 40px; /* Very short height */
          overflow: visible; /* Allows the car to show even if it's taller than the container */
          background: transparent;
          margin-top: -20px; /* Pulls the car up into the blue hero */
          margin-bottom: -20px; /* Pulls the search bar up so there's no gap */
          pointer-events: none;
        }

        .car-wrapper {
          position: absolute;
          bottom: 0px;
          left: -300px; /* Start from left */
          width: 200px; /* Size of the car */
          animation: driveAcross 5s linear infinite;
        }

        .car-image {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.4));
        }

        @keyframes driveAcross {
          0% { left: -300px; }
          100% { left: 100%; }
        }

        @media (max-width: 600px) {
          .car-animation-container {
            height: 30px;
            margin-top: -15px;
            margin-bottom: -15px;
          }
          .car-wrapper {
            width: 150px;
          }
        }
      `}</style>

      <div className="car-animation-container">
        <div className="car-wrapper">
          <img 
            src="/mycar.png" 
            alt="Toyota SUV" 
            className="car-image" 
          />
        </div>
      </div>
    </>
  );
}
