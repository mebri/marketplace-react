import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Dashboard() {
  const [totalAds, setTotalAds] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setUserEmail(user.email);

      const q = query(
        collection(db, "ads"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      setTotalAds(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">

      <h1>Dashboard</h1>

      <h3>Welcome</h3>

      <p>{userEmail}</p>

      <div className="stats">

        <div className="stat-card">
          <h2>{totalAds}</h2>
          <p>My Ads</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Favorites</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Views</p>
        </div>

      </div>

      <div className="dashboard-buttons">

        <Link to="/post-ad">
          <button>➕ Post Advertisement</button>
        </Link>

        <Link to="/my-ads">
          <button>📋 My Advertisements</button>
        </Link>

        <Link to="/cars">
          <button>🚗 Browse Cars</button>
        </Link>

        <button onClick={logout}>
          🚪 Logout
        </button>

      </div>

    </div>
  );
}

export default Dashboard;