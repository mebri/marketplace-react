import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">

      <div className="logo">
        የኛ ገበያ
      </div>

      {/* Mobile menu button */}
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <nav className={menuOpen ? "nav-open" : ""}>

        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        <Link to="/cars" onClick={closeMenu}>
          🚗 Cars
        </Link>

        <Link to="/houses" onClick={closeMenu}>
          🏠 Houses
        </Link>

        <Link to="/rentals" onClick={closeMenu}>
          🏢 Rentals
        </Link>

        <Link to="/spare-parts" onClick={closeMenu}>
          🔧 Spare Parts
        </Link>

        <Link to="/building-materials" onClick={closeMenu}>
          🧱 Building Materials
        </Link>

        <Link to="/used-materials" onClick={closeMenu}>
          🏪 ምንአለሽ ተራ
        </Link>

        <Link to="/post-ad" onClick={closeMenu}>
          📢 Post Ad
        </Link>

        <Link to="/my-ads" onClick={closeMenu}>
          📋 My Ads
        </Link>

        <Link to="/favorites" onClick={closeMenu}>
          ❤️ Favorites
        </Link>

        <Link to="/dashboard" onClick={closeMenu}>
          Dashboard
        </Link>

        <Link to="/contact" onClick={closeMenu}>
          Contact
        </Link>

        <Link to="/login" onClick={closeMenu}>
          Login
        </Link>

      </nav>

    </header>
  );
}

export default Navbar;