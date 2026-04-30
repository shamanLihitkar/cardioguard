import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-container">
      <div className="role-content">
        <header className="role-header">
          <h1>Welcome to <span>CardioGuard</span></h1>
          <p>Please select your login type to continue</p>
        </header>

        <div className="role-grid">
          {/* User Card */}
          <div className="role-card" onClick={() => navigate("/auth")}>
            <div className="role-icon">👤</div>
            <h3>Patient Portal</h3>
            <p>Access your health records and monitor your heart data.</p>
            <button className="role-btn">User Login</button>
          </div>

          {/* Hospital Card */}
          <div className="role-card" onClick={() => navigate("/hospital/login")}>
            <div className="role-icon">🏥</div>
            <h3>Hospital Portal</h3>
            <p>Manage patient data and clinical cardiovascular reports.</p>
            <button className="role-btn">Hospital Login</button>
          </div>

          {/* Admin Card */}
          <div className="role-card" onClick={() => navigate("/admin/login")}>
            <div className="role-icon">⚙️</div>
            <h3>Admin Portal</h3>
            <p>System configuration, user management, and platform analytics.</p>
            <button className="role-btn">Admin Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}