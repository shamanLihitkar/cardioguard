import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import {
  Activity,
  Moon,
  Sun,
  Settings,
  LayoutDashboard,
  Menu,
  User,
  Database,
  ShieldAlert,
} from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const hospitalId = localStorage.getItem("hospitalId");
  const adminId=localStorage.getItem("adminId");
  // ✅ ALWAYS run hooks first (fixes your error)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Hide navbar on login pages (AFTER hooks)
  if (
    location.pathname === "/auth" ||
    location.pathname === "/hospital/login"
  ) {
    return null;
  }

  // 🔓 Logout handler for both roles
  const handleLogout = () => {
    if (token) {
      // 👤 USER LOGOUT
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/auth");
    } else if (hospitalId) {
      // 🏥 HOSPITAL LOGOUT
      localStorage.removeItem("hospitalId");
      navigate("/hospital/login");
    }
    else if(adminId){
      localStorage.removeItem("adminId");
      navigate("/admin/login")
    }
  };

  return (
    <nav className="navbar-container">
      {/* 🧠 LOGO NAVIGATION BASED ON ROLE */}
      <div
        className="retro-heading navbar-brand"
        onClick={() => {
          if (token) navigate("/home");
          else if (hospitalId) navigate("/hospital/dashboard");
          else navigate("/");
        }}
        style={{ cursor: "pointer" }}
      >
        <Activity size={24} color="var(--primary)" />
        CardioGuard
      </div>

      <div className="nav-controls">

        {/* 👤 USER NAVIGATION */}
        {token && (
          <>
            <Link
              to="/home"
              className={`btn nav-btn btn-primary ${
                location.pathname === "/home" ? "active" : ""
              }`}
            >
              <Settings size={18} />
              <span className="hide-on-mobile">Simulation</span>
            </Link>

            <Link
              to="/dashboard"
              className={`btn nav-btn btn-primary ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="hide-on-mobile">Dashboard</span>
            </Link>
          </>
        )}

        {/* 🌗 Theme toggle */}
        <button onClick={toggleTheme} className="btn nav-btn desktop-only">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* 👤 USER DROPDOWN */}
        {token && (
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              className={`btn nav-btn ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={18} />
            </button>

            <div className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
              <div className="dropdown-item mobile-only" onClick={toggleTheme}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />} Toggle Theme
              </div>

              <div className="dropdown-divider mobile-only" />

              <div className="dropdown-item">
                <User size={16} /> User Profiles
              </div>

              <div className="dropdown-item">
                <Database size={16} /> Export Data Logs
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-item text-danger">
                <ShieldAlert size={16} /> Hospital Integration
              </div>

              <div
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          </div>
        )}

        {/* 🏥 HOSPITAL NAVBAR */}
        {!token && hospitalId && (
          <button className="btn nav-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
        {/* 🏥 ADMIN NAVBAR */}
        {!token && adminId && (
          <button className="btn nav-btn" onClick={handleLogout}>
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}