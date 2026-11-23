import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); 
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
      alert("Logged out successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="navbar-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="የኛ ገበያ"
            className="navbar-logo"
          />
        </Link>

        {/* MOBILE QUICK ACTIONS */}
        <div className="mobile-quick-actions">
          {authLoading ? (
            <div style={{ width: "80px" }}></div> 
          ) : user ? (
            <>
              <Link to="/my-ads" className="mobile-my-ads-btn">
                📢
              </Link>

              <Link to="/notifications" className="icon-btn">
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link to="/chats" className="icon-btn">
                💬
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="guest-login-btn">
                Login
              </Link>
              <Link to="/register" className="guest-register-btn">
                Register
              </Link>
            </>
          )}
        </div>

        {/* DESKTOP MAIN NAVIGATION */}
        <div className="navbar-nav">
          <Link to="/">Home</Link>
          <Link to="/cars">Cars</Link>
          <Link to="/houses">Houses</Link>
          <Link to="/rentals">Rentals</Link>
          <Link to="/spare-parts">Spare Parts</Link>
          <Link to="/building-materials">Building Materials</Link>
          <Link to="/search?category=Electronics">Electronics</Link>
          <Link to="/search?category=ምንአለሽ%20ተራ">ምንአለሽ ተራ</Link>
        </div>

        {/* DESKTOP USER AREA */}
        <div className="navbar-actions desktop-user">
          {authLoading ? (
            <div style={{ width: "150px" }}></div> 
          ) : !user ? (
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
      {user && !authLoading && (
        <div className="mobile-second-row">
          <Link to="/dashboard" className="mobile-row-btn mobile-dashboard-btn">
            📊 Dashboard
          </Link>
          <Link to="/post-ad" className="mobile-row-btn mobile-postad-btn">
            + Post Ad
          </Link>
        </div>
      )}

    </nav>
  );
}

export default Navbar;
