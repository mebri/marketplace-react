import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // NOTIFICATIONS LISTENER
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "notifications"),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
    return () => unsub();
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

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="የኛ ገበያ"
            className="navbar-logo"
          />
        </Link>

        {/* MOBILE QUICK ACTIONS */}
        <div className="mobile-quick-actions">

          {/* If logged in: My Ads + Bell + Chat + Hamburger */}
          {user ? (
            <>
              <Link
                to="/my-ads"
                className="mobile-my-ads-btn"
                onClick={closeMenu}
              >
                📢
              </Link>

              <Link to="/notifications" className="icon-btn" onClick={closeMenu}>
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link to="/chats" className="icon-btn" onClick={closeMenu}>
                💬
              </Link>

              <button
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open menu"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </>
          ) : (
            /* If not logged in: Login + Register + Hamburger */
            <>
              <Link to="/login" className="guest-login-btn" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="guest-register-btn" onClick={closeMenu}>
                Register
              </Link>
              <button
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open menu"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </>
          )}
        </div>

        {/* DESKTOP MAIN NAVIGATION */}
        <div className="navbar-nav">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/cars" onClick={closeMenu}>Cars</Link>
          <Link to="/houses" onClick={closeMenu}>Houses</Link>
          <Link to="/rentals" onClick={closeMenu}>Rentals</Link>
          <Link to="/spare-parts" onClick={closeMenu}>Spare Parts</Link>
          <Link to="/building-materials" onClick={closeMenu}>Building Materials</Link>
          <Link to="/search?category=Electronics" onClick={closeMenu}>Electronics</Link>
          <Link to="/search?category=ምንአለሽ%20ተራ" onClick={closeMenu}>ምንአለሽ ተራ</Link>
        </div>

        {/* DESKTOP USER AREA */}
        <div className="navbar-actions desktop-user">
          {!user ? (
            <>
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </>
          ) : (
            <>
              <Link to="/notifications" className="dashboard-btn notification-bell">
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/chats" className="myads-btn">💬 Chats</Link>
              <Link to="/dashboard" className="dashboard-btn">Dashboard</Link>
              <Link to="/my-ads" className="myads-btn">My Ads</Link>
              <Link to="/post-ad" className="post-btn">+ Post Ad</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          )}
        </div>

      </div>

      {/* MOBILE SECOND ROW - DASHBOARD + POST AD */}
      {user && (
        <div className="mobile-second-row">
          <Link to="/dashboard" className="mobile-row-btn mobile-dashboard-btn">
            📊 Dashboard
          </Link>
          <Link to="/post-ad" className="mobile-row-btn mobile-postad-btn">
            + Post Ad
          </Link>
        </div>
      )}

      {/* MOBILE HAMBURGER MENU */}
      {menuOpen && (
        <div className="mobile-menu-dropdown">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/cars" onClick={closeMenu}>Cars</Link>
          <Link to="/houses" onClick={closeMenu}>Houses</Link>
          <Link to="/rentals" onClick={closeMenu}>Rentals</Link>
          <Link to="/spare-parts" onClick={closeMenu}>Spare Parts</Link>
          <Link to="/building-materials" onClick={closeMenu}>Building Materials</Link>
          <Link to="/search?category=Electronics" onClick={closeMenu}>Electronics</Link>
          <Link to="/search?category=ምንአለሽ%20ተራ" onClick={closeMenu}>ምንአለሽ ተራ</Link>

          {user && (
            <div className="mobile-menu-footer">
              <button onClick={handleLogout} className="mobile-menu-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
