import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AppCustomizationProvider } from './contexts/AppCustomizationContext';
import Layout from './components/Layout';
import PublicBonuses from './pages/PublicBonuses';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BonusDetail from './pages/BonusDetail';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import Chat from './pages/Chat';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBonuses from './pages/admin/AdminBonuses';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminRewards from './pages/admin/AdminRewards';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminChat from './pages/admin/AdminChat';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminApprovedProofs from './pages/admin/AdminApprovedProofs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCustomization from './pages/admin/AdminCustomization';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const { appConfig } = useData();

  console.log('🚀 App render:', { user, appConfig });

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      <Layout>
        <Routes>
          {/* Mostra PublicBonuses solo se NON loggato, altrimenti Dashboard */}
          <Route
            path="/"
            element={
              user ? (
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              ) : (
                <PublicBonuses />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* 🔥 AGGIUNTA ROUTE PROFILO */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bonus/:id"
            element={
              <ProtectedRoute>
                <BonusDetail />
              </ProtectedRoute>
            }
          />
          {/* 🔥 Show rewards only if both points system and rewards are enabled */}
          {appConfig.pointsSystemEnabled && appConfig.rewardsEnabled && (
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              }
            />
          )}
          {/* 🔥 Show chat only if chat is enabled */}
          {appConfig.chatEnabled && (
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
          )}
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bonuses"
            element={
              <ProtectedRoute adminOnly>
                <AdminBonuses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute adminOnly>
                <AdminApprovals />
              </ProtectedRoute>
            }
          />
          {/* 🔥 Show admin rewards only if enabled */}
          {appConfig.pointsSystemEnabled && appConfig.rewardsEnabled && (
            <Route
              path="/admin/rewards"
              element={
                <ProtectedRoute adminOnly>
                  <AdminRewards />
                </ProtectedRoute>
              }
            />
          )}
          <Route
            path="/admin/proofs"
            element={
              <ProtectedRoute adminOnly>
                <AdminApprovedProofs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute adminOnly>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customization"
            element={
              <ProtectedRoute adminOnly>
                <AdminCustomization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute adminOnly>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          {/* 🔥 Show admin chat only if enabled */}
          {appConfig.chatEnabled && (
            <Route
              path="/admin/chat"
              element={
                <ProtectedRoute adminOnly>
                  <AdminChat />
                </ProtectedRoute>
              }
            />
          )}
        </Routes>
      </Layout>
      {/* 🔥 FIX: TOASTER CON Z-INDEX BASSO PER NON COPRIRE MODALI */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 9998 // Sotto i modali (9999)
          }
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppCustomizationProvider>
            <AppContent />
          </AppCustomizationProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;