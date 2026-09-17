import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDocFromServer,
  deleteDoc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";

function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [chats, setChats] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setChecking(false);
        return;
      }
      setUser(currentUser);

      try {
        console.log("🔍 Checking admin for UID:", currentUser.uid);
        const userDoc = await getDocFromServer(
          doc(db, "users", currentUser.uid)
        );
        console.log("📄 isAdmin value:", userDoc.data()?.isAdmin);

        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
          await loadData();
        } else {
          console.warn("⛔ Access denied — isAdmin !== true");
        }
      } catch (err) {
        console.error("❌ Admin check error:", err);
      } finally {
        setChecking(false);
      }
    });
    return () => unsub();
  }, []);

  const loadData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersList = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const adsSnap = await getDocs(collection(db, "ads"));
      const adsList = adsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const chatsSnap = await getDocs(collection(db, "chats"));
      const chatsList = chatsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // LOAD REPORTS (no orderBy to avoid index requirement)
      const reportsSnap = await getDocs(collection(db, "reports"));
      const reportsList = reportsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const getTime = (obj) => {
        if (!obj) return 0;
        if (obj.toMillis) return obj.toMillis();
        if (obj.seconds) return obj.seconds * 1000;
        return new Date(obj).getTime() || 0;
      };

      usersList.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
      adsList.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
      chatsList.sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
      reportsList.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

      setUsers(usersList);
      setAds(adsList);
      setChats(chatsList);
      setReports(reportsList);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const dismissReport = async (reportId) => {
    if (!window.confirm("Dismiss this report?")) return;
    try {
      await deleteDoc(doc(db, "reports", reportId));
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error("Delete report error:", err);
      alert("Could not dismiss report: " + err.message);
    }
  };

  const deleteReportedAd = async (reportId, adId) => {
    if (!window.confirm("DELETE the reported ad permanently?")) return;
    try {
      await deleteDoc(doc(db, "ads", adId));
      await deleteDoc(doc(db, "reports", reportId));
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setAds((prev) => prev.filter((a) => a.id !== adId));
      alert("Ad deleted successfully.");
    } catch (err) {
      console.error("Delete ad error:", err);
      alert("Could not delete ad: " + err.message);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const recentSignups = users.filter((u) => {
    const t = u.createdAt?.toMillis?.() || u.createdAt?.seconds * 1000 || 0;
    return t > last24h;
  }).length;

  if (checking) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="dashboard-spinner"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <div className="admin-denied-icon">🔒</div>
          <h1>Please Log In</h1>
          <p>You need to be logged in to access the admin panel.</p>
          <Link to="/login" className="dashboard-primary-btn">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <div className="admin-denied-icon">⛔</div>
          <h1>Access Denied</h1>
          <p>You do not have permission to view this page.</p>
          <Link to="/" className="dashboard-primary-btn">← Back Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>🛡️ Admin Dashboard</h1>
          <p>Manage and monitor የኛ ገበያ</p>
        </div>

        {loadingData ? (
          <div className="admin-loading">
            <div className="dashboard-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">👥</div>
                <div>
                  <h2>{users.length}</h2>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">📢</div>
                <div>
                  <h2>{ads.length}</h2>
                  <p>Total Ads</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">💬</div>
                <div>
                  <h2>{chats.length}</h2>
                  <p>Total Chats</p>
                </div>
              </div>
              <div className="admin-stat-card highlight">
                <div className="admin-stat-icon">🚩</div>
                <div>
                  <h2>{reports.length}</h2>
                  <p>Reports</p>
                </div>
              </div>
            </div>

            <div className="admin-tabs">
              <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
                📊 Overview
              </button>
              <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
                👥 Users
              </button>
              <button className={activeTab === "ads" ? "active" : ""} onClick={() => setActiveTab("ads")}>
                📢 Ads
              </button>
              <button className={activeTab === "chats" ? "active" : ""} onClick={() => setActiveTab("chats")}>
                💬 Chats
              </button>
              <button className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}>
                🚩 Reports {reports.length > 0 && <span className="admin-tab-badge">{reports.length}</span>}
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="admin-grid-2">
                <div className="admin-panel">
                  <h2>🆕 Latest Users</h2>
                  {users.slice(0, 5).map((u) => (
                    <div className="admin-row" key={u.id}>
                      <div className="admin-avatar">
                        {u.imageUrl ? (
                          <img src={u.imageUrl} alt={u.name || "User"} />
                        ) : (
                          (u.name?.charAt(0) || "?").toUpperCase()
                        )}
                      </div>
                      <div className="admin-row-info">
                        <strong>{u.name || "Unnamed"}</strong>
                        <span>{u.email}</span>
                      </div>
                      <span className="admin-row-time">{formatDate(u.createdAt)}</span>
                    </div>
                  ))}
                  {users.length === 0 && <p className="admin-empty">No users yet.</p>}
                </div>

                <div className="admin-panel">
                  <h2>📢 Latest Ads</h2>
                  {ads.slice(0, 5).map((a) => (
                    <Link to={`/ad/${a.id}`} className="admin-row clickable" key={a.id}>
                      <div className="admin-thumb">
                        {a.image || (a.images && a.images[0]) ? (
                          <img src={a.image || a.images[0]} alt={a.title} />
                        ) : (
                          "📷"
                        )}
                      </div>
                      <div className="admin-row-info">
                        <strong>{a.title || "Untitled"}</strong>
                        <span>ETB {Number(a.price || 0).toLocaleString()}</span>
                      </div>
                      <span className="admin-row-time">{formatDate(a.createdAt)}</span>
                    </Link>
                  ))}
                  {ads.length === 0 && <p className="admin-empty">No ads yet.</p>}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="admin-panel">
                <h2>👥 All Users ({users.length})</h2>
                <div className="admin-table">
                  {users.map((u) => (
                    <div className="admin-row" key={u.id}>
                      <div className="admin-avatar">
                        {u.imageUrl ? (
                          <img src={u.imageUrl} alt={u.name || "User"} />
                        ) : (
                          (u.name?.charAt(0) || "?").toUpperCase()
                        )}
                      </div>
                      <div className="admin-row-info">
                        <strong>{u.name || "Unnamed"}</strong>
                        <span>{u.email}</span>
                        {u.city && <span className="admin-muted">📍 {u.city}</span>}
                      </div>
                      {u.isAdmin && <span className="admin-badge-admin">ADMIN</span>}
                      <span className="admin-row-time">{formatDate(u.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ads" && (
              <div className="admin-panel">
                <h2>📢 All Ads ({ads.length})</h2>
                <div className="admin-table">
                  {ads.map((a) => (
                    <Link to={`/ad/${a.id}`} className="admin-row clickable" key={a.id}>
                      <div className="admin-thumb">
                        {a.image || (a.images && a.images[0]) ? (
                          <img src={a.image || a.images[0]} alt={a.title} />
                        ) : (
                          "📷"
                        )}
                      </div>
                      <div className="admin-row-info">
                        <strong>{a.title || "Untitled"}</strong>
                        <span>{a.category} • ETB {Number(a.price || 0).toLocaleString()}</span>
                        {a.city && <span className="admin-muted">📍 {a.city}</span>}
                      </div>
                      <span className="admin-row-time">{formatDateTime(a.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "chats" && (
              <div className="admin-panel">
                <h2>💬 Recent Chats ({chats.length})</h2>
                {chats.slice(0, 30).map((c) => (
                  <Link to={`/chat/${c.id}`} className="admin-row clickable" key={c.id}>
                    <div className="admin-thumb">💬</div>
                    <div className="admin-row-info">
                      <strong>{c.adTitle || "General inquiry"}</strong>
                      <span>{c.buyerName} → {c.sellerName}</span>
                      {c.lastMessage && <span className="admin-muted">"{c.lastMessage}"</span>}
                    </div>
                    <span className="admin-row-time">{formatDateTime(c.updatedAt)}</span>
                  </Link>
                ))}
                {chats.length === 0 && <p className="admin-empty">No chats yet.</p>}
              </div>
            )}

            {activeTab === "reports" && (
              <div className="admin-panel">
                <h2>🚩 Reported Ads ({reports.length})</h2>
                {reports.length === 0 ? (
                  <p className="admin-empty">No reports yet. 🎉</p>
                ) : (
                  <div className="admin-table">
                    {reports.map((r) => (
                      <div className="report-row" key={r.id}>
                        <div className="report-icon">🚩</div>
                        <div className="report-info">
                          <Link to={`/ad/${r.adId}`} className="report-title">
                            {r.adTitle || "Untitled ad"}
                          </Link>
                          <span className="report-reason">
                            Reason: <strong>{r.reason}</strong>
                          </span>
                          <span className="admin-muted">
                            Reported by {r.reportedByEmail || "unknown"} • {formatDateTime(r.createdAt)}
                          </span>
                        </div>
                        <div className="report-actions">
                          <button
                            className="report-view-btn"
                            onClick={() => window.open(`#/ad/${r.adId}`, "_blank")}
                          >
                            View Ad
                          </button>
                          <button
                            className="report-dismiss-btn"
                            onClick={() => dismissReport(r.id)}
                          >
                            Dismiss
                          </button>
                          <button
                            className="report-delete-btn"
                            onClick={() => deleteReportedAd(r.id, r.adId)}
                          >
                            Delete Ad
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
