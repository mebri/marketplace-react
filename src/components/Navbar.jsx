import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Navbar() {
  const [user, setUser] = useState(null);

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
      alert("Logged out successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LOGO */}

        <Link to="/" className="nav-logo">
          የኛ ገበያ
        </Link>

        {/* MAIN MENU */}

        <div className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/cars">Cars</Link>

          <Link to="/houses">Houses</Link>

          <Link to="/rentals">Rentals</Link>

          <Link to="/spare-parts">
            Spare Parts
          </Link>

          <Link to="/building-materials">
            Building Materials
          </Link>

          <Link to="/search?category=Electronics">
            Electronics
          </Link>

          <Link to="/search?category=ምንአለሽ%20ተራ">
            ምንአለሽ ተራ
          </Link>
        </div>

        {/* USER AREA */}

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