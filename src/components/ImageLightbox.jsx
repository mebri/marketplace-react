import { useEffect, useState, useRef } from "react";

function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const touchStartRef = useRef(null);
  const pinchStartDistRef = useRef(null);
  const pinchStartScaleRef = useRef(1);
  const dragStartRef = useRef(null);

  // Reset zoom whenever the image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [index]);

  // Lock body scroll + keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [images.length]);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () =>
    setScale((s) => {
      const n = Math.max(s - 0.5, 1);
      if (n === 1) setPosition({ x: 0, y: 0 });
      return n;
    });
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const getDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchStartDistRef.current = getDistance(e.touches[0], e.touches[1]);
      pinchStartScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.min(
        Math.max(
          pinchStartScaleRef.current * (dist / pinchStartDistRef.current),
          1
        ),
        4
      );
      setScale(newScale);
    } else if (e.touches.length === 1 && dragStartRef.current && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e) => {
    pinchStartDistRef.current = null;
    dragStartRef.current = null;

    // Swipe to change image only when not zoomed
    if (touchStartRef.current && scale === 1 && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) && dt < 600) {
        if (dx < 0) next();
        else prev();
      }
    }
    touchStartRef.current = null;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="lightbox-backdrop" onClick={handleBackdropClick}>
      <div className="lightbox-topbar">
        <span className="lightbox-counter">
          {index + 1} / {images.length}
        </span>
        <div className="lightbox-controls">
          <button onClick={zoomOut} disabled={scale <= 1} aria-label="Zoom out">
            −
          </button>
          <span className="lightbox-zoom-label">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= 4} aria-label="Zoom in">
            +
          </button>
          <button onClick={resetZoom} aria-label="Reset zoom">
            ⟲
          </button>
          <button onClick={onClose} className="lightbox-close" aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      <div
        className="lightbox-image-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[index]}
          alt={`Image ${index + 1}`}
          className="lightbox-image"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${
              position.y / scale
            }px)`,
            cursor: scale > 1 ? "grab" : "zoom-in",
            transition: pinchStartDistRef.current ? "none" : "transform 0.2s ease",
          }}
          onClick={() => (scale === 1 ? zoomIn() : resetZoom())}
          draggable={false}
        />
      </div>

      {images.length > 1 && scale === 1 && (
        <>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={prev}
            aria-label="Previous"
          >
            ❮
          </button>
          <button
            className="lightbox-nav lightbox-next"
            onClick={next}
            aria-label="Next"
          >
            ❯
          </button>
        </>
      )}

      <div className="lightbox-hint">
        {scale === 1
          ? "Tap image to zoom • Swipe to change • Tap outside to close"
          : "Drag to pan • Tap image to reset"}
      </div>
    </div>
  );
}

export default ImageLightbox;
