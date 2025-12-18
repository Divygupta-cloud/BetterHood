import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import RoleSelection from './pages/RoleSelection';
import UserDashboard from './pages/UserDashboard';
import CreateReport from './pages/CreateReport';
import ReportDetails from './pages/ReportDetails';
import MyReports from './pages/MyReports';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ReportsManagement from './pages/ReportsManagement';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Role Selection Route */}
            <Route
              path="/role-selection"
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-report"
              element={
                <ProtectedRoute>
                  <CreateReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/:reportId"
              element={
                <ProtectedRoute>
                  <ReportDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Authority Routes */}
            <Route 
              path="/authority-dashboard"
              element={
                <ProtectedRoute>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/reports-management"
              element={
                <ProtectedRoute>
                  <ReportsManagement />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
