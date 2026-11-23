import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      setError("Invalid or missing reset link. Please request a new one.");
      setLoading(false);
      return;
    }

    const verifyCode = async () => {
      try {
        const auth = getAuth();
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
      } catch (err) {
        setError("This link is invalid or has expired. Please request a new one.");
      } finally {
        setLoading(false);
      }
    };
    verifyCode();
  }, [oobCode, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("✅ Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      if (err.code === "auth/expired-action-code") {
        setError("This link has expired. Please request a new one.");
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Verifying link...</div>;

  if (error && !email) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>⚠️ Link Problem</h1>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/login")} style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "460px", margin: "50px auto", padding: "25px", background: "white", borderRadius: "18px", boxShadow: "0 10px 35px rgba(0,0,0,0.1)" }}>
      <h1 style={{ textAlign: "center" }}>🔐 Reset Password</h1>
      <p style={{ textAlign: "center", color: "#64748b" }}>
        Enter a new password for <strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          style={{ padding: "13px", borderRadius: "10px", border: "1.5px solid #d1d5db", fontSize: "16px" }}
        />
        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ padding: "13px", borderRadius: "10px", border: "1.5px solid #d1d5db", fontSize: "16px" }}
        />
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        {message && <p style={{ color: "green", fontSize: "14px" }}>{message}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{ marginTop: "15px", padding: "14px", background: "#1976d2", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
