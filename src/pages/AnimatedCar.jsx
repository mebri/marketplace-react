import React from "react";

export default function AnimatedCar() {
  return (
    <>
      <style>{`
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 90px; /* Smaller height since there's no sky/road */
          overflow: hidden;
          
          /* ✅ Sky and road removed - now transparent */
          background: transparent; 
          
          /* ✅ Moved UP to fit in the blue corner */
          margin-top: -40px; 
          margin-bottom: 10px;
          
          /* Prevents the car from blocking clicks on buttons */
          pointer-events: none; 
        }

        .car-wrapper {
          position: absolute;
          bottom: 0px; /* Sits at the bottom of the 90px container */
          left: -300px; /* Start from left */
          width: 200px; /* Size of the car */
          animation: driveAcross 5s linear infinite;
        }

        /* 🔥 Styling for YOUR custom image */
        .car-image {
          width: 100%;
          height: auto;
          display: block;
          /* Soft shadow underneath the car */
          filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.4));
        }

        /* Drive from Left to Right */
        @keyframes driveAcross {
          0% { left: -300px; }
          100% { left: 100%; }
        }

        @media (max-width: 600px) {
          .car-animation-container {
            height: 70px; /* Smaller on mobile */
            margin-top: -20px; 
          }
          .car-wrapper {
            width: 150px;
            bottom: 0px;
          }
        }
      `}</style>

      <div className="car-animation-container">
        {/* 🚗 YOUR CUSTOM CAR IMAGE */}
        <div className="car-wrapper">
          {/* 👇 CHANGE THE NAME IF YOUR FILE IS NAMED "my car.png" (with a space) */}
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
