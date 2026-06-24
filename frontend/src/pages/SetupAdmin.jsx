import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

export default function SetupAdmin() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", { ...form, role: "admin" });
      login(data.token, data.user);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create admin account");
    }
  };

  return (
    <div className="auth-box">
      <h2>Create Admin Account</h2>
      <p style={{ fontSize: 13, color: "#6b7280" }}>
        Only works once — for the very first admin of this system.
      </p>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}
        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
        <button className="btn" style={{ width: "100%" }}>Create Admin</button>
      </form>
    </div>
  );
}
