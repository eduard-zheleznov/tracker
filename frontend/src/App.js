import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import AssessmentPage from "./pages/AssessmentPage";
import AnalysisPage from "./pages/AnalysisPage";
import StrategyPage from "./pages/StrategyPage";
import EducationPage from "./pages/EducationPage";
import ProfilePage from "./pages/ProfilePage";
import FAQPage from "./pages/FAQPage";
import RemindersPage from "./pages/RemindersPage";
import DictionaryPage from "./pages/DictionaryPage";
import FeedbackPage from "./pages/FeedbackPage";
import { PsychologistPage, TariffPage, AuthorPage } from "./pages/ContentPages";
import AdminPage from "./pages/AdminPage";
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
      {/* Menu pages */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faq" 
        element={
          <ProtectedRoute>
            <FAQPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reminders" 
        element={
          <ProtectedRoute>
            <RemindersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dictionary" 
        element={
          <ProtectedRoute>
            <DictionaryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/feedback" 
        element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/psychologist" 
        element={
          <ProtectedRoute>
            <PsychologistPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tariff" 
        element={
          <ProtectedRoute>
            <TariffPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/author" 
        element={
          <ProtectedRoute>
            <AuthorPage />
          </ProtectedRoute>
        } 
      />
      {/* Admin */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPage />
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
