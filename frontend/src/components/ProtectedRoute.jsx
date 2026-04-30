import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // 🚫 Not logged in → go to user login
  if (!token) {
    return <Navigate to="/auth" />;
  }

  // ✅ Logged in → allow access
  return children;
}