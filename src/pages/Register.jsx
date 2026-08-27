import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // Save display name in Firebase Authentication
      await updateProfile(user, {
        displayName: name.trim(),
      });

      // Create user profile in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          photoURL: "",
          createdAt: new Date(),
        }
      );

      alert(
        "Account created successfully! 🎉"
      );

      navigate("/profile");

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "This email is already registered."
        );
      } else if (
        error.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else if (
        error.code ===
        "auth/weak-password"
      ) {
        setError(
          "Password is too weak. Use at least 6 characters."
        );
      } else {
        setError(
          error.message ||
            "Registration failed."
        );
      }
    } finally {
      setLoading(false);
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
          Create Account
        </h1>

        <p className="account-subtitle">
          Join የኛ ገበያ and start buying and selling.
        </p>

        {error && (
          <div className="account-error">
            {error}
          </div>
        )}

        <form
          className="account-form"
          onSubmit={handleRegister}
        >

          <label>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

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
            Phone Number
          </label>

          <input
            type="tel"
            placeholder="+251..."
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            required
          />

          <label>
            City
          </label>

          <input
            type="text"
            placeholder="Addis Ababa"
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <div className="account-footer">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Register;