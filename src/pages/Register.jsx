import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "../utils/uploadImage";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Please enter your name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name.trim() });

      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        imageUrl: imageUrl,
        createdAt: new Date(),
      });

      alert("Account created successfully! 🎉");
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Could not create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="account-card">
        <div className="account-logo">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="የኛ ገበያ" />
        </div>

        <h1>Create Account</h1>
        <p className="account-subtitle">Join የኛ ገበያ today</p>

        {error && <div className="account-error">{error}</div>}

        <form onSubmit={handleRegister} className="account-form">
          <div className="register-image-section">
            <label>Profile Photo (Optional)</label>
            <div className="register-image-row">
              <div className="register-image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="register-image-actions">
                <label htmlFor="profile-image-input" className="register-upload-btn">
                  {imageFile ? "Change Photo" : "📷 Choose Photo"}
                </label>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="register-remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <label>Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />

          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label>Phone (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 ..."
          />

          <label>City (Optional)</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Addis Ababa"
          />

          <label>Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />

          <label>Confirm Password *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="account-footer">
          <span>Already have an account?</span>
          <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
