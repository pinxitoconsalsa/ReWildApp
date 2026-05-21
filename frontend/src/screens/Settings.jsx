import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  useEffect(() => {
    setNotifications(JSON.parse(localStorage.getItem('notifications') ?? 'true'));
    setPrivateProfile(JSON.parse(localStorage.getItem('privateProfile') ?? 'false'));
  }, []);

  const toggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', newValue);
  };

  const togglePrivacy = () => {
    const newValue = !privateProfile;
    setPrivateProfile(newValue);
    localStorage.setItem('privateProfile', newValue);
  };

  const clearCache = () => {
    localStorage.clear();
    alert('Caché limpiado');
  };

  return (
    <div className="p-4 space-y-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-gray-900">Ajustes</h1>

      {/* Preferences */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Preferencias</div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Notificaciones</div>
              <div className="text-xs text-gray-500">Alertas de nuevos proyectos y logros</div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                notifications ? 'bg-forest' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Perfil Privado</div>
              <div className="text-xs text-gray-500">Ocultar logros y estadísticas</div>
            </div>
            <button
              onClick={togglePrivacy}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                privateProfile ? 'bg-forest' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  privateProfile ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Storage */}
        <div className="p-4 border-b border-gray-50">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Almacenamiento</div>
          <button
            onClick={clearCache}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            🗑️ Limpiar caché
          </button>
        </div>

        {/* About */}
        <div className="p-4 border-b border-gray-50">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Información</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Versión</span>
              <span className="text-gray-900 font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado</span>
              <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-semibold">
                Activo
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
            <button className="block text-xs text-gray-500 w-full text-left">
              📜 Política de Privacidad (próximamente)
            </button>
            <button className="block text-xs text-gray-500 w-full text-left">
              ⚖️ Términos de Servicio (próximamente)
            </button>
            <button className="block text-xs text-gray-500 w-full text-left">
              💬 Contacto / Soporte (próximamente)
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full bg-red-50 text-red-500 font-semibold text-sm py-2.5 rounded-xl hover:bg-red-100 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
