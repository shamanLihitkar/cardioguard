import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { Activity, Moon, Sun, Settings, LayoutDashboard, Menu, User, Database, ShieldAlert } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar-container">
      
      <div className="retro-heading navbar-brand">
        <Activity size={24} color="var(--primary)" /> 
        CardioGuard
      </div>
      
      <div className="nav-controls">
        <Link to="/" className={`btn nav-btn btn-primary ${location.pathname === '/' ? 'active' : ''}`}>
          <Settings size={18} /> <span className="hide-on-mobile">Simulation</span>
        </Link>
        
        <Link to="/dashboard" className={`btn nav-btn btn-primary ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> <span className="hide-on-mobile">Dashboard</span>
        </Link>
        
        <button onClick={toggleTheme} className="btn nav-btn desktop-only">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="dropdown-container" ref={dropdownRef}>
          <button className={`btn nav-btn ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={18} />
          </button>
          
          <div className={`dropdown-menu ${menuOpen ? 'open' : ''}`}>
            <div className="dropdown-item mobile-only" onClick={toggleTheme}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />} Toggle Light/Dark
            </div>
            <div className="dropdown-divider mobile-only" />
            
            <div className="dropdown-item"><User size={16} /> User Profiles</div>
            <div className="dropdown-item"><Database size={16} /> Export Data Logs</div>
            <div className="dropdown-divider" />
            <div className="dropdown-item text-danger"><ShieldAlert size={16} /> Hospital Integration</div>
          </div>
        </div>

      </div>
    </nav>
  );
}