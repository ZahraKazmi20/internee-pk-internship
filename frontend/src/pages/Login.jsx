import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/intern");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2>Intern Tracker Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 14 }}>
        First time setting up? <Link to="/setup-admin">Create the admin account</Link>
      </p>
    </div>
  );
}
