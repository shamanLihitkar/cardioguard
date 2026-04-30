import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminAuth.css"; // Import the CSS file below

export default function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/admin/login",
        { email, password }
      );
      
      localStorage.setItem("adminId", res.data.adminId);
      navigate("/admin/dashboard");
    } catch (err) {
      console.log(err.message);
      
      alert("Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Admin <span>Login</span></h2>
          <p>Secure access for CardioGuard administrators</p>
        </div>

        <div className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="admin@cardioguard.com" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button className="login-btn" onClick={handleLogin}>
            Sign In
          </button>
        </div>
        
        <button className="back-link" onClick={() => navigate("/")}>
          ← Back to Role Selection
        </button>
      </div>
    </div>
  );
}