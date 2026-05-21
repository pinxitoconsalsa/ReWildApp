import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const location = useLocation();
  const successMessage = location.state?.message || '';

  const [mode, setMode]         = useState('login'); // login | register | reset
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [bio, setBio]           = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { setError('Introduce tu email'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (sbError) throw sbError;
      setResetSent(true);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el email');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, name, bio);
        navigate('/app/welcome');
      } else {
        await login(email, password);
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream flex flex-col items-center px-6 py-8">
      {/* Mensaje de éxito (ej: tras resetear contraseña) */}
      {successMessage && (
        <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-green-800 text-sm text-center">
          {successMessage}
        </div>
      )}

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

      {/* ── MODO: RECUPERAR CONTRASEÑA ── */}
      {mode === 'reset' && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Te enviaremos un enlace para crear una nueva contraseña.
          </p>

          {resetSent ? (
            <div className="w-full text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-medium text-sm">
                  ✓ Email enviado
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
                </p>
              </div>
              <button
                onClick={() => switchMode('login')}
                className="text-forest text-sm underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="w-full space-y-3">
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
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-forest text-white rounded-xl py-3 font-semibold text-sm disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-gray-500 text-xs mt-1"
              >
                ← Volver
              </button>
            </form>
          )}
        </>
      )}

      {/* ── MODOS: LOGIN / REGISTRO ── */}
      {mode !== 'reset' && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
            Reforesta el mundo<br />desde tu bolsillo
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Únete a miles de personas plantando árboles reales cada día con solo un toque.
          </p>

          <form onSubmit={submit} className="w-full space-y-3">
            {mode === 'register' && (
              <>
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
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    ¿Por qué quieres reforestar? <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Cuéntanos sobre ti y tu motivación..."
                    rows={2}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                  />
                </div>
              </>
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
              {loading ? 'Cargando...' : mode === 'register' ? 'Crear cuenta' : 'Entrar'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="w-full text-forest text-xs mt-1 underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>

          <button
            onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
            className="mt-4 text-forest text-sm underline"
          >
            {mode === 'register' ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
          </button>
        </>
      )}
    </div>
  );
}
