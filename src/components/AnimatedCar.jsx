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
          /* 👇 CHANGE THIS VALUE TO MOVE THE CAR UP OR DOWN */
          bottom: 0px; 
          /* 👆 If the car is floating, make this smaller (e.g. -10px). 
             If the car is sinking into the road, make this bigger (e.g. 15px). */
          
          left: -300px; /* Start from left */
          width: 240px;
          animation: driveAcross 5s linear infinite;
        }

        /* 🔥 Styling for YOUR custom image */
        .car-image {
          width: 100%;
          height: auto;
          display: block;
          /* Soft shadow underneath the car */
          filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.3));
        }

        /* Drive from Left to Right */
        @keyframes driveAcross {
          0% { left: -300px; }
          100% { left: 100%; }
        }

        @keyframes roadMove {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100px); opacity: 0.2; }
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
            bottom: 0px; /* Keep this aligned with the main value */
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

        {/* 🚗 YOUR CUSTOM CAR IMAGE */}
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
