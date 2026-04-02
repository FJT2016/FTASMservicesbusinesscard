import { useState, useEffect } from "react";
import "@/App.css";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import CardGallery from "@/pages/CardGallery";
import CardDetail from "@/pages/CardDetail";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in (from sessionStorage)
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('adminAuth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <HashRouter>
        <Routes>
          <Route path="/" element={<CardGallery />} />
          <Route path="/card/:cardId" element={<CardDetail />} />
          <Route 
            path="/admin/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/admin/dashboard" /> : 
              <AdminLogin onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              isAuthenticated ? 
              <AdminDashboard onLogout={handleLogout} /> : 
              <Navigate to="/admin/login" />
            } 
          />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;