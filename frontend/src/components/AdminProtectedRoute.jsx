import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const adminId = localStorage.getItem("adminId");

  // 🚫 Not logged in → go to user login
  if (!adminId) {
    return <Navigate to="/admin/login" />;
  }

  // ✅ Logged in → allow access
  return children;
}