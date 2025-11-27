import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/authContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Transacoes } from './pages/Transacoes';
import { Categorias } from './pages/Categorias';
import { Contas } from './pages/Contas';
import { Objetivos } from './pages/Objetivos';
import { Orcamentos } from './pages/Orcamentos';
import { Colaboracao } from './pages/Colaboracao';
import { Simulacoes } from './pages/Simulacoes';
import { Configuracoes } from './pages/Configuracoes';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transacoes" element={<Transacoes />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="contas" element={<Contas />} />
        <Route path="objetivos" element={<Objetivos />} />
        <Route path="orcamentos" element={<Orcamentos />} />
        <Route path="colaboracao" element={<Colaboracao />} />
        <Route path="simulacoes" element={<Simulacoes />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;