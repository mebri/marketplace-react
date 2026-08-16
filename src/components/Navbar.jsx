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
        <a href="#/" className="nav-logo">
          የኛ ገበያ
        </a>

        {/* MAIN MENU */}
        <div className="nav-links">

          <a href="#/">
            Home
          </a>

          <a href="#/cars">
            Cars
          </a>

          <a href="#/houses">
            Houses
          </a>

          <a href="#/rentals">
            Rentals
          </a>

          <a href="#/spare-parts">
            Spare Parts
          </a>

          <a href="#/building-materials">
            Building Materials
          </a>

          <a href="#/search?category=Electronics">
            Electronics
          </a>

          <a href="#/search?category=ምንአለሽ%20ተራ">
            ምንአለሽ ተራ
          </a>

        </div>

        {/* USER AREA */}
        <div className="nav-user">

          {!user ? (
            <>
              <a
                href="#/login"
                className="login-btn"
              >
                Login
              </a>

              <a
                href="#/register"
                className="register-btn"
              >
                Register
              </a>
            </>
          ) : (
            <>
              <a
                href="#/dashboard"
                className="dashboard-btn"
              >
                Dashboard
              </a>

              <a
                href="#/my-ads"
                className="myads-btn"
              >
                My Ads
              </a>

              <a
                href="#/post-ad"
                className="post-btn"
              >
                + Post Ad
              </a>

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