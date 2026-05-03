import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';
import SimulationPage from './pages/SimulationPage';
import DashboardPage from './pages/DashboardPage';
import Auth from './pages/Auth';

import HospitalLogin from './pages/HospitalAuth';
import HospitalDashboard from './pages/HospitalDashboard';

import RoleSelection from './pages/RoleSelection'; // ✅ NEW

import ProtectedRoute from './components/ProtectedRoute';
import HospitalProtectedRoute from './components/HospitalProtectedRoute';
import AdminAuth from './pages/AdminAuth';
import { ThemeProvider } from './context/ThemeContext';
import { SimulationProvider } from './context/SimulationContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
export default function App() {
  return (
    <ThemeProvider>
      <SimulationProvider>
        <Router>

          <Navbar />

          <Routes>

            {/* 🌐 ENTRY POINT */}
            <Route path="/" element={<RoleSelection />} />

            {/* 🔐 USER AUTH */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/Forgot-password" element={<ForgotPassword/>}/>
            {/* 🔒 USER ROUTES */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <SimulationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 🏥 HOSPITAL ROUTES */}
            <Route path="/hospital/login" element={<HospitalLogin />} />

            <Route
              path="/hospital/dashboard"
              element={
                <HospitalProtectedRoute>
                  <HospitalDashboard />
                </HospitalProtectedRoute>
              }
            />
            {/* ADMIN ROUTES */}
            <Route path='/admin/login' element={<AdminAuth/>}/>
              <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard/>
                </AdminProtectedRoute>
              }
              />
          </Routes>

        </Router>
      </SimulationProvider>
    </ThemeProvider>
  );
}