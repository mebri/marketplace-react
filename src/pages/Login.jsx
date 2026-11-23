import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail, // 👈 Added this
} from "firebase/auth";

import { auth } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 👈 Added state for reset password
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/profile");

    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "auth/invalid-credential") {
        setError("Email or password is incorrect.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account was found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else {
        setError(error.message || "Login failed.");
      }

    } finally {
      setLoading(false);
    }
  };

  // 👈 Added this function to handle password reset
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setResetMessage("Please enter your email address first.");
      return;
    }

    setResetLoading(true);
    setResetMessage("");

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetMessage("✅ If an account exists, a reset link was sent to your email.");
    } catch (error) {
      console.error("Reset error:", error);
      if (error.code === "auth/invalid-email") {
        setResetMessage("❌ Please enter a valid email address.");
      } else {
        setResetMessage("❌ Failed to send reset link. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="account-page">

      <div className="account-card">

        <div className="account-logo">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="የኛ ገበያ"
          />
        </div>

        <h1>
          Welcome Back
        </h1>

        <p className="account-subtitle">
          Login to your የኛ ገበያ account.
        </p>

        {error && (
          <div className="account-error">
            {error}
          </div>
        )}

        <form
          className="account-form"
          onSubmit={handleLogin}
        >

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />

          {/* 👈 Added the Forgot Password Button here */}
          <div style={{ textAlign: "right", marginTop: "-5px", marginBottom: "10px" }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              style={{
                background: "none",
                border: "none",
                color: "#1976d2",
                fontWeight: "700",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
                padding: 0
              }}
            >
              {resetLoading ? "Sending..." : "Forgot Password?"}
            </button>
          </div>

          {/* 👈 Shows the success or error message */}
          {resetMessage && (
            <p style={{ 
              color: resetMessage.includes("✅") ? "#16a34a" : "#dc2626", 
              fontSize: "14px", 
              textAlign: "center",
              marginBottom: "15px",
              fontWeight: "600"
            }}>
              {resetMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <div className="account-footer">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create Account
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Login;
