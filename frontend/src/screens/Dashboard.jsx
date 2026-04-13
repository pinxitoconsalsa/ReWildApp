import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.progress(), api.myTrees()])
      .then(([p, t]) => { setProgress(p); setTrees(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando...</div>;

  const { rank, nextRank, xp, xpToNext, progressPct, metrics } = progress;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-forest font-bold text-lg">🌿 ReWild</span>
        <div className="flex gap-2 items-center">
          <span className="text-lg">🔔</span>
          <button onClick={logout} className="text-xs text-gray-400 underline">Salir</button>
        </div>
      </div>

      {/* Rank card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Estado Actual</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">{rank}</div>
            {nextRank && (
              <div className="text-xs text-gray-500 mt-0.5">Te faltan {xpToNext} XP para {nextRank}</div>
            )}
          </div>
          <div className="text-forest font-bold text-lg">{progressPct}%</div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <button
          onClick={() => navigate('/app/certificados')}
          className="mt-2 text-xs text-forest underline"
        >
          Ver logros →
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard icon="🌳" value={metrics.trees} label="Árboles" />
        <MetricCard icon="💨" value={`${metrics.co2Kg}kg`} label="CO₂" highlight />
        <MetricCard icon="📅" value={metrics.events} label="Eventos" />
      </div>

      {/* My Trees */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">Mis Árboles</span>
          <button onClick={() => navigate('/app/certificados')} className="text-xs text-forest">Ver todos</button>
        </div>
        {trees.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-sm text-gray-400">
            Aún no tienes árboles. ¡Planta el primero!
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {trees.map(tree => (
              <div key={tree.id} className="min-w-[140px] bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                <div className="relative">
                  <img
                    src={tree.photoUrl || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300'}
                    alt={tree.name}
                    className="w-full h-24 object-cover"
                  />
                  <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    {tree.status}
                  </span>
                </div>
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-800 truncate">{tree.name}</div>
                  <div className="text-[10px] text-gray-400">📍 {tree.locationName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map teaser */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3 flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">Mapa de Reforestación</span>
        </div>
        <div className="bg-gray-200 h-28 flex items-center justify-center">
          <button
            onClick={() => navigate('/app/mapa')}
            className="bg-forest text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2"
          >
            🗺️ Abrir Mapa
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, value, label, highlight }) {
  return (
    <div className={`rounded-2xl p-3 text-center shadow-sm ${highlight ? 'bg-forest text-white' : 'bg-white'}`}>
      <div className="text-xl">{icon}</div>
      <div className={`text-base font-bold ${highlight ? 'text-white' : 'text-gray-800'}`}>{value}</div>
      <div className={`text-[10px] ${highlight ? 'text-green-200' : 'text-gray-400'}`}>{label}</div>
    </div>
  );
}
