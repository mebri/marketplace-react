import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      alert("Logged out successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      <div className="nav-container">

        {/* LOGO */}

<Link
  to="/"
  className="nav-logo"
  onClick={closeMenu}
>
  <img
    src={`${import.meta.env.BASE_URL}logo.png`}
    alt="የኛ ገበያ"
    className="nav-logo-image"
  />
</Link>

        {/* HAMBURGER - MOBILE ONLY */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* MAIN NAVIGATION */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>

          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/cars" onClick={closeMenu}>
            Cars
          </Link>

          <Link to="/houses" onClick={closeMenu}>
            Houses
          </Link>

          <Link to="/rentals" onClick={closeMenu}>
            Rentals
          </Link>

          <Link to="/spare-parts" onClick={closeMenu}>
            Spare Parts
          </Link>

          <Link to="/building-materials" onClick={closeMenu}>
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
          >
            ምንአለሽ ተራ
          </Link>

        </div>

        {/* USER AREA
            IMPORTANT:
            This stays OUTSIDE the hamburger menu.
        */}
        <div className="nav-user">

          {!user ? (
            <>
              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-btn"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="dashboard-btn"
              >
                Dashboard
              </Link>

              <Link
                to="/my-ads"
                className="myads-btn"
              >
                My Ads
              </Link>

              <Link
                to="/post-ad"
                className="post-btn"
              >
                + Post Ad
              </Link>

              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;