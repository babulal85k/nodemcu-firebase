import  { useState } from "react";
import PropTypes from 'prop-types';
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "auto", textAlign: "center" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", margin: "10px auto", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", margin: "10px auto", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>Login</button>
      </form>
    </div>
  );
};
Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
