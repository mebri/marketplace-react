// FILE: src/pages/AnimatedCar.jsx
import React, { useState } from "react";

export default React.memo(function AnimatedCar() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <>
      <style>{`
        .car-animation-container {
          position: relative;
          width: 100%;
          height: 76px;
          overflow: hidden;
          background: transparent;
          margin-top: -36px;
          margin-bottom: -6px;
          pointer-events: none;
          z-index: 10;
        }

        .car-wrapper {
          position: absolute;
          bottom: 0px;
          left: -260px;
          width: 200px;
          animation: driveAcross 5s linear infinite;
        }

        .car-image {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.35));
        }

        @keyframes driveAcross {
          0% { left: -260px; }
          100% { left: 100%; }
        }

        @media (max-width: 600px) {
          .car-animation-container {
            height: 62px;
            margin-top: -28px;
            margin-bottom: -4px;
          }
          .car-wrapper {
            width: 150px;
            bottom: 0px;
          }
        }
      `}</style>

      <div className="car-animation-container" aria-hidden="true">
        <div className="car-wrapper">
          {!imageFailed ? (
            <img
              src="/mycar.png"
              alt="Sports Car"
              className="car-image"
              onError={() => setImageFailed(true)}
            />
          ) : null}
        </div>
      </div>
    </>
  );
});
