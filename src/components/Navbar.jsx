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

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setMenuOpen(false);

      navigate("/");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // =========================
  // CLOSE MENU
  // =========================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /*
   * Works on:
   *
   * localhost
   * GitHub Pages
   *
   * Example:
   * /marketplace-react/logo.png
   */

  const logoPath =
    `${import.meta.env.BASE_URL}logo.png`;

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
          type="button"
          className="navbar-menu-button"
          onClick={() =>
            setMenuOpen(
              (current) => !current
            )
          }
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
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

          {/* HOME */}

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>


          {/* CARS */}

          <Link
            to="/cars"
            onClick={closeMenu}
          >
            🚗 Cars
          </Link>


          {/* ELECTRONICS */}

          <Link
            to="/search?category=Electronics"
            onClick={closeMenu}
          >
            📱 Electronics
          </Link>


          {/* FURNITURE */}

          <Link
            to="/search?category=Furniture"
            onClick={closeMenu}
          >
            🛋️ Furniture
          </Link>


          {/* HOME */}

          <Link
            to="/search?category=Home"
            onClick={closeMenu}
          >
            🏠 Home
          </Link>


          {/* LABOR & SERVICES */}

          <Link
            to="/search?category=Labor%20%26%20Services"
            onClick={closeMenu}
          >
            🛠️ Labor & Services
          </Link>


          {/* ምንአለሽ ተራ */}

          <Link
            to="/search?category=ምንአለሽ%20ተራ"
            onClick={closeMenu}
            className="amharic-nav-link"
          >
            🏪 ምንአለሽ ተራ
          </Link>

        </nav>


        {/* =========================
            RIGHT SIDE ACTIONS
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

              {/* DASHBOARD */}

              <Link
                to="/dashboard"
                className="navbar-dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </Link>


              {/* MY ADS */}

              <Link
                to="/my-ads"
                className="navbar-my-ads"
                onClick={closeMenu}
              >
                My Ads
              </Link>


              {/* POST AD */}

              <Link
                to="/post-ad"
                className="navbar-post-ad"
                onClick={closeMenu}
              >
                + Post Ad
              </Link>


              {/* LOGOUT */}

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </>
          ) : (
            <>

              {/* LOGIN */}

              <Link
                to="/login"
                className="navbar-login"
                onClick={closeMenu}
              >
                Login
              </Link>


              {/* REGISTER */}

              <Link
                to="/register"
                className="navbar-register"
                onClick={closeMenu}
              >
                Register
              </Link>


              {/* POST AD */}

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