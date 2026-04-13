import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import Aprende from './screens/Aprende';
import Comunidad from './screens/Comunidad';
import Acciones from './screens/Acciones';
import Certificados from './screens/Certificados';
import Calculadora from './screens/Calculadora';
import Mapa from './screens/Mapa';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route
            path="/app"
            element={<PrivateRoute><Layout /></PrivateRoute>}
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="aprende"      element={<Aprende />} />
            <Route path="comunidad"    element={<Comunidad />} />
            <Route path="acciones"     element={<Acciones />} />
            <Route path="certificados" element={<Certificados />} />
            <Route path="calculadora"  element={<Calculadora />} />
            <Route path="mapa"         element={<Mapa />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
