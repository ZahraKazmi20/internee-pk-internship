import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./api/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import SetupAdmin from "./pages/SetupAdmin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import InternDashboard from "./pages/InternDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/intern"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup-admin" element={<SetupAdmin />} />
        <Route
          path="/admin"
          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/intern"
          element={<ProtectedRoute role="intern"><InternDashboard /></ProtectedRoute>}
        />
      </Routes>
    </AuthProvider>
  );
}
