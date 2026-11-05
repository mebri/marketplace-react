import React from "react";

export default function AnimatedCar() {
  return (
    <>
      <style>{`
        /* Container allows the car to move without making the page scroll horizontally */
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 100px; /* Adjust this height if your car image is very tall */
          overflow: hidden;
          background: transparent;
          margin-top: 10px;
          margin-bottom: 10px;
          pointer-events: none; /* Prevents the car from blocking clicks */
        }

        .car-wrapper {
          position: absolute;
          bottom: 0;
          left: 100%; /* Start from the right */
          width: 180px; /* 👈 CHANGE THIS to make your car bigger or smaller */
          animation: driveAcross 6s linear infinite;
        }

        .car-image {
          width: 100%;
          height: auto;
          display: block;
          /* Flip the car horizontally so it faces left. 
             If your image is already facing left, remove this line. */
          transform: scaleX(-1);
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3)); /* Optional shadow */
        }

        /* Drive from Right to Left */
        @keyframes driveAcross {
          0% { 
            left: 100%; 
          }
          100% { 
            left: -200px; /* Adjust based on car width to go completely off-screen */
          }
        }

        /* Mobile adjustments */
        @media (max-width: 600px) {
          .car-animation-container {
            height: 70px;
          }
          .car-wrapper {
            width: 120px; /* Smaller car on mobile */
          }
          @keyframes driveAcross {
            0% { left: 100%; }
            100% { left: -150px; }
          }
        }
      `}</style>

      <div className="car-animation-container">
        {/* 🚙 Your SUV Image */}
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
