import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import AssessmentPage from "./pages/AssessmentPage";
import { EducationPage, AnalysisPage, StrategyPage } from "./pages/PlaceholderPages";
import { Toaster } from "./components/ui/sonner";

// Redirect authenticated users away from auth page
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/assessment" 
        element={
          <ProtectedRoute>
            <AssessmentPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/education" 
        element={
          <ProtectedRoute>
            <EducationPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analysis" 
        element={
          <ProtectedRoute>
            <AnalysisPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/strategy" 
        element={
          <ProtectedRoute>
            <StrategyPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
