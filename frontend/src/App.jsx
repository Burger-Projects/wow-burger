import React from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Routing from "./page/routing";
import Pages from "./page/pages";
import LoginPage from "./components/login/login";
import RegisterPage from "./components/login/register";
import AdminDashboard from "./components/admin/AdminDashboard";
import MenuPage from "./components/webPages/MenuPage/MenuPage";
import QrStandeePoster from "./components/common/QrStandeePoster";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/qr-code" element={<QrStandeePoster />} />
          <Route element={<Routing />}>
            <Route path="/" element={<Pages />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
