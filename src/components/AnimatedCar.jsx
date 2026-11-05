import React from "react";

export default function AnimatedCar() {
  return (
    <>
      <style>{`
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 80px; /* Adjusted to touch the search bar */
          overflow: hidden;
          background: transparent;
          margin-top: 0px;
          margin-bottom: 0px;
          pointer-events: none;
        }

        .car-wrapper {
          position: absolute;
          bottom: 0;
          left: -200px; /* ✅ Starts off-screen on the LEFT */
          width: 180px; /* Adjust this to make the car bigger/smaller */
          animation: driveLeftToRight 6s linear infinite;
        }

        .car-image {
          width: 100%;
          height: auto;
          display: block;
          /* If your image is facing left, uncomment the line below to flip it right */
          /* transform: scaleX(-1); */
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
        }

        /* ✅ Drive from Left to Right */
        @keyframes driveLeftToRight {
          0% { 
            left: -200px; 
          }
          100% { 
            left: 100%; 
          }
        }

        @media (max-width: 600px) {
          .car-animation-container {
            height: 60px;
          }
          .car-wrapper {
            width: 120px;
          }
          @keyframes driveLeftToRight {
            0% { left: -150px; }
            100% { left: 100%; }
          }
        }
      `}</style>

      <div className="car-animation-container">
        <div className="car-wrapper">
          <img 
            src={`${import.meta.env.BASE_URL}suv.png`} 
            alt="SUV" 
            className="car-image"
          />
        </div>
      </div>
    </>
  );
}
