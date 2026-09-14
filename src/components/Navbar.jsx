import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// NEW: Firebase imports for notifications
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // =========================
  // AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // NOTIFICATIONS LISTENER
  // =========================
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

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

          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/cars" onClick={closeMenu}>Cars</Link>
          <Link to="/houses" onClick={closeMenu}>Houses</Link>
          <Link to="/rentals" onClick={closeMenu}>Rentals</Link>
          <Link to="/spare-parts" onClick={closeMenu}>Spare Parts</Link>
          <Link to="/building-materials" onClick={closeMenu}>Building Materials</Link>
          <Link to="/search?category=Electronics" onClick={closeMenu}>Electronics</Link>
          <Link to="/search?category=ምንአለሽ%20ተራ" onClick={closeMenu}>ምንአለሽ ተራ</Link>

        </div>

        {/* USER AREA */}
        <div className="nav-user">

          {!user ? (
            <>
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </>
          ) : (
            <>
              {/* NOTIFICATION BELL */}
              <Link
                to="/notifications"
                className="dashboard-btn notification-bell"
                onClick={closeMenu}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link to="/dashboard" className="dashboard-btn">Dashboard</Link>
              <Link to="/my-ads" className="myads-btn">My Ads</Link>
              <Link to="/post-ad" className="post-btn">+ Post Ad</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;
