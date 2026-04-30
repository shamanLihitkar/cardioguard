import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

export default function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 👨‍👩‍👧‍👦 Family Members State
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const hospitalId = localStorage.getItem("hospitalId");

    if (hospitalId) {
      navigate("/hospital/dashboard");
      return;
    }
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  // Handle Family Member Changes
  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: "", email: "" }]);
  };

  const removeFamilyMember = (index) => {
    const updated = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updated);
  };

  const handleFamilyChange = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isLogin
        ? "http://localhost:5000/auth/login"
        : "http://localhost:5000/auth/register";

      // Include familyMembers in payload if registering
      const payload = isLogin 
        ? { email, password } 
        : { name, email, password, familyMembers };
      console.log(familyMembers);
      
      const res = await axios.post(url, payload);

      localStorage.removeItem("hospitalId");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      navigate("/home");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p>{isLogin ? "Sign in to access your dashboard" : "Join our platform today"}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* 👨‍👩‍👧‍👦 FAMILY SECTION (Registration Only) */}
          {!isLogin && (
            <div className="family-section">
              <div className="family-header">
                <label>Family Members (Optional)</label>
                <button type="button" className="btn-add-small" onClick={addFamilyMember}>
                  + Add
                </button>
              </div>
              
              {familyMembers.map((member, index) => (
                <div key={index} className="family-member-row">
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    required
                    onChange={(e) => handleFamilyChange(index, "name", e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={member.email}
                    required
                    onChange={(e) => handleFamilyChange(index, "email", e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn-remove"
                    onClick={() => removeFamilyMember(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <button className="btn-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
          </button>
          <div className="divider"><span>or</span></div>
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Return to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}