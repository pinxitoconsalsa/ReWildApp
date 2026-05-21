import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'explorador';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Icono */}
      <div className="text-6xl mb-6">🌱</div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        ¡Bienvenido/a,<br />{firstName}!
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-10 max-w-xs">
        Ya formas parte de la comunidad ReWild. Planta tu primer árbol, únete a eventos
        y ayuda a restaurar el planeta.
      </p>

      {/* Pasos de orientación */}
      <div className="w-full space-y-3 mb-10 text-left">
        {[
          { icon: '🌳', title: 'Planta tu primer árbol', desc: 'Registra un árbol real desde Acciones' },
          { icon: '🗺️', title: 'Explora proyectos', desc: 'Únete a iniciativas globales de reforestación' },
          { icon: '📚', title: 'Aprende', desc: 'Descubre cursos sobre medio ambiente' },
        ].map(step => (
          <div key={step.title} className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
            <span className="text-2xl">{step.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{step.title}</p>
              <p className="text-xs text-gray-400">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/app/dashboard')}
        className="w-full bg-forest text-white rounded-xl py-3 font-semibold text-sm"
      >
        Empezar mi aventura 🚀
      </button>
    </div>
  );
}
