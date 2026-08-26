import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /*
   * This works both:
   * localhost
   * GitHub Pages /marketplace-react/
   */
  const logoPath = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >
          <img
            src={logoPath}
            alt="YEGNA GEBEYA"
            className="navbar-logo"
          />
        </Link>


        {/* =========================
            MOBILE MENU BUTTON
        ========================= */}

        <button
          className="navbar-menu-button"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Open menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>


        {/* =========================
            NAVIGATION
        ========================= */}

        <nav
          className={`navbar-nav ${
            menuOpen
              ? "navbar-nav-open"
              : ""
          }`}
        >

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/cars"
            onClick={closeMenu}
          >
            Cars
          </Link>

          <Link
            to="/houses"
            onClick={closeMenu}
          >
            Houses
          </Link>

          <Link
            to="/rentals"
            onClick={closeMenu}
          >
            Rentals
          </Link>

          <Link
            to="/spare-parts"
            onClick={closeMenu}
          >
            Spare Parts
          </Link>

          <Link
            to="/building-materials"
            onClick={closeMenu}
          >
            Building Materials
          </Link>

          <Link
            to="/search?category=Electronics"
            onClick={closeMenu}
          >
            Electronics
          </Link>

          <Link
            to="/search?category=ምንአለሽ%20ተራ"
            onClick={closeMenu}
            className="amharic-nav-link"
          >
            ምንአለሽ ተራ
          </Link>

        </nav>


        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div
          className={`navbar-actions ${
            menuOpen
              ? "navbar-actions-open"
              : ""
          }`}
        >

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="navbar-dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </Link>

              <Link
                to="/my-ads"
                className="navbar-my-ads"
                onClick={closeMenu}
              >
                My Ads
              </Link>

              <Link
                to="/post-ad"
                className="navbar-post-ad"
                onClick={closeMenu}
              >
                + Post Ad
              </Link>

              <button
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar-login"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register"
                onClick={closeMenu}
              >
                Register
              </Link>

              <Link
                to="/post-ad"
                className="navbar-post-ad"
                onClick={closeMenu}
              >
                + Post Ad
              </Link>
            </>
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;