import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode]         = useState('register'); // register | login
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') await register(email, password, name);
      else                     await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream flex flex-col items-center px-6 py-8">
      {/* Logo */}
      <div className="text-forest font-bold text-xl mb-4">🌿 ReWild Project</div>

      {/* Hero image */}
      <div className="w-full rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600"
          alt="brote"
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
        Reforesta el mundo<br />desde tu bolsillo
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Únete a miles de personas plantando árboles reales cada día con solo un toque.
      </p>

      <form onSubmit={submit} className="w-full space-y-3">
        {mode === 'register' && (
          <div>
            <label className="text-xs font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              required
            />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700">Contraseña</label>
          <div className="relative mt-1">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            >
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest text-white rounded-xl py-3 font-semibold text-sm disabled:opacity-60 mt-2"
        >
          {loading ? 'Cargando...' : 'Empezar'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
        className="mt-4 text-forest text-sm underline"
      >
        {mode === 'register' ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
      </button>

      <div className="mt-6 w-full">
        <p className="text-center text-xs text-gray-400 mb-3">O CONTINÚA CON</p>
        <div className="flex justify-center gap-4">
          {['Google', 'Apple'].map(p => (
            <button
              key={p}
              onClick={() => alert(`${p} OAuth — stub (configura OAuth credentials)`)}
              className="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
