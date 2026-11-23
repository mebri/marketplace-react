
import { useState, useEffect } from "react";

const images = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80"
];

function NavbarSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // Changes image every 3 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="navbar-slideshow">
      <img src={images[current]} alt="Slideshow" />
    </div>
  );
}

export default NavbarSlideshow;
