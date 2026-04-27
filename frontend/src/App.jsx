import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import SimulationPage from './pages/SimulationPage';
import DashboardPage from './pages/DashboardPage';
import Auth from './pages/Auth';

import ProtectedRoute from './components/ProtectedRoute';

import { ThemeProvider } from './context/ThemeContext';
import { SimulationProvider } from './context/SimulationContext';

export default function App() {
  return (
    <ThemeProvider>
      <SimulationProvider>
        <Router>
          <Navbar />

          <Routes>
            {/* 🔐 Auth Page */}
            <Route path="/auth" element={<Auth />} />

            {/* 🔒 Protected Routes */}
            <Route
              path="/"
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
          </Routes>
        </Router>
      </SimulationProvider>
    </ThemeProvider>
  );
}