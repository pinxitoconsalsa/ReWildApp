import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [ready, setReady]           = useState(false); // token válido recibido

  useEffect(() => {
    // Supabase detecta el hash de recuperación en la URL y dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) throw sbError;
      await supabase.auth.signOut();
      navigate('/', { state: { message: 'Contraseña actualizada. Inicia sesión.' } });
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="text-forest font-bold text-xl mb-8">🌿 ReWild Project</div>

      {!ready ? (
        <div className="text-center space-y-3">
          <p className="text-slate-500 text-sm">Verificando enlace…</p>
          <p className="text-xs text-slate-400">
            Si llegaste aquí por error,{' '}
            <button onClick={() => navigate('/')} className="text-forest underline">
              vuelve al inicio
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Nueva contraseña
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Elige una contraseña segura para tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700">Nueva contraseña</label>
              <div className="relative mt-1">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="text-xs font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                required
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-white rounded-xl py-3 font-semibold text-sm disabled:opacity-60 mt-2"
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
