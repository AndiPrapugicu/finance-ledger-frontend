import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Reports from "./pages/Reports";
import { Budget } from "./pages/Budget";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";
import ImportUploader from "./components/ImportUploader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { AlertNotification } from './components/ui/AlertNotification';

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/accounts" element={
          <ProtectedRoute>
            <Accounts />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/import" element={
          <ProtectedRoute>
            <ImportUploader />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
