import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HospitalAuth.css";

export default function HospitalAuth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const hospitalId = localStorage.getItem("hospitalId");

    if (token) {
      navigate("/home");
      return;
    }
    if (hospitalId) {
      navigate("/hospital/dashboard");
    }
  }, [navigate]);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(4),
          longitude: pos.coords.longitude.toFixed(4),
        }));
      },
      () => alert("Location permission denied. Please enable it to register.")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin) {
        if (!form.name || !form.email || !form.password || !form.latitude || !form.longitude) {
          alert("Please fill all fields and provide location");
          setLoading(false);
          return;
        }
      }

      const url = isLogin
        ? "http://localhost:5000/api/hospitals/login"
        : "http://localhost:5000/api/hospitals/register";

      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const res = await axios.post(url, payload);

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.setItem("hospitalId", res.data.hospitalId);

      navigate("/hospital/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="medical-icon">🏥</div>
          <h1>{isLogin ? "Hospital Login" : "Hospital Registration"}</h1>
          <p>{isLogin ? "Access your clinical dashboard" : "Register your facility to the network"}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Hospital Name</label>
              <input
                type="text"
                placeholder="City General Hospital"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div className="input-group">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@hospital.org"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          {!isLogin && (
            <div className="location-section">
              <button type="button" className="btn-location" onClick={getLocation}>
                📍 Get GPS Coordinates
              </button>
              {form.latitude && (
                <div className="location-badge">
                  <span>Lat: {form.latitude}</span>
                  <span>Lng: {form.longitude}</span>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verifying..." : isLogin ? "Sign In" : "Complete Registration"}
          </button>
        </form>

        <div className="auth-footer">
          <button className="btn-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "New facility? Register here" : "Already have access? Login"}
          </button>
          
          <div className="divider"><span>or</span></div>

          <button className="btn-secondary" onClick={() => navigate("/")}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}