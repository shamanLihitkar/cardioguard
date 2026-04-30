import { Navigate } from "react-router-dom";

export default function HospitalProtectedRoute({ children }) {
  const hospitalId = localStorage.getItem("hospitalId");

  if (!hospitalId) {
    return <Navigate to="/hospital/login" />;
  }

  return children;
}