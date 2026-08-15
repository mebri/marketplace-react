import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      setEmail("");
      setPassword("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="post-ad-page">
      <h1>Create Account</h1>

      <form className="post-form" onSubmit={register}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;