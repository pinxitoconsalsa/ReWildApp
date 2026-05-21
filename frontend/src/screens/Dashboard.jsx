import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { Input, Textarea } from '../components/Input';
import { Badge } from '../components/Badge';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { showCourseModal, setShowCourseModal } = useModal();
  const [progress, setProgress] = useState(null);
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    Reforestacion: false,
    LimpiezaBasura: false,
    Biodiversidad: false,
    HuellaCarbono: false,
    ConservacionAgua: false,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([api.progress(), api.myTrees()])
      .then(([p, t]) => { setProgress(p); setTrees(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCourseModal = async () => {
    try {
      const saved = await api.getCoursePreferences();
      if (saved?.categories && saved.categories.length > 0) {
        const newPrefs = { ...preferences };
        saved.categories.forEach(cat => {
          newPrefs[cat] = true;
        });
        setPreferences(newPrefs);
      }
    } catch (e) {
      console.error('Error loading preferences:', e);
    }
    setShowCourseModal(true);
  };

  const handleSavePreferences = async () => {
    const selected = Object.keys(preferences).filter(k => preferences[k]);
    if (selected.length === 0) {
      setToast('Por favor selecciona al menos un área de interés');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setSavingPrefs(true);
    try {
      await api.saveCoursePreferences(selected);
      setToast('✓ Preferencias guardadas correctamente');
      setTimeout(() => setToast(''), 3000);
      setShowCourseModal(false);
    } catch (e) {
      setToast('Error: ' + e.message);
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 p-6">
        <p className="text-slate-500 text-center">No se pudo cargar tu perfil.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { rank, nextRank, xp, xpToNext, progressPct, metrics } = progress;
  const categoryLabels = {
    Reforestacion: '🌳 Reforestación',
    LimpiezaBasura: '🗑️ Limpieza de Basura',
    Biodiversidad: '🦋 Biodiversidad',
    HuellaCarbono: '💨 Huella de Carbono',
    ConservacionAgua: '💧 Conservación de Agua',
  };

  return (
    <div className="p-4 space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ReWild</h1>
          <p className="text-xs text-slate-400 mt-0.5">Restauración global en vivo</p>
        </div>
        <button
          onClick={logout}
          className="text-slate-400 hover:text-slate-600 transition-colors p-2"
          aria-label="Salir"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 3l-4 4m4-4l4 4m-4-4v12" />
          </svg>
        </button>
      </div>

      {/* Progress Section */}
      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Tu Progreso
            </p>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{rank}</h2>
                {nextRank && (
                  <p className="text-xs text-slate-400 mt-1">
                    {xpToNext} XP para {nextRank}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-forest">{progressPct}%</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-forest to-forest/80 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/certificados')}
              className="w-full justify-start"
            >
              Ver todos los logros
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Árboles" value={metrics.trees} icon="🌳" />
        <StatCard
          label="CO₂ Reducido"
          value={`${metrics.co2Kg}kg`}
          icon="🌍"
          highlighted
        />
        <StatCard label="Eventos" value={metrics.events} icon="📌" />
      </div>

      {/* Learning Preferences CTA */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Áreas de Interés</h3>
              <p className="text-xs text-slate-500">
                Personaliza tu experiencia de aprendizaje
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={openCourseModal}
            >
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Trees Section */}
      {trees.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Mis Árboles</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/certificados')}
            >
              Ver todos
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {trees.map(tree => (
              <Card key={tree.id} className="min-w-[140px] flex-shrink-0 overflow-hidden">
                <img
                  src={tree.photoUrl || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300'}
                  alt={tree.name}
                  className="w-full h-24 object-cover"
                />
                <CardContent className="space-y-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">{tree.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{tree.locationName}</span>
                    <Badge variant="success" className="text-[10px]">
                      {tree.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Map CTA */}
      <Card className="bg-gradient-to-br from-forest via-forest to-forest/80 text-white border-0 overflow-hidden">
        <CardContent className="space-y-4 py-6">
          <div>
            <h3 className="font-bold text-xl mb-2">Explora Proyectos</h3>
            <p className="text-sm text-green-100 leading-relaxed">
              Descubre y únete a iniciativas de reforestación global
            </p>
          </div>
          <button
            onClick={() => navigate('/app/mapa')}
            className="w-full bg-white text-forest hover:bg-slate-100 font-bold py-3 px-4 rounded-lg transition-colors text-base flex items-center justify-center gap-2"
          >
            <span>Abrir Mapa</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </CardContent>
      </Card>

      {/* Preferences Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-w-md mx-auto flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Áreas de Interés</h2>
              <p className="text-sm text-slate-500 mt-1">
                Selecciona tus temas de aprendizaje preferidos
              </p>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
              {Object.keys(preferences).map(category => (
                <label
                  key={category}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-forest/5 hover:border-forest/30 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={preferences[category]}
                    onChange={e =>
                      setPreferences(p => ({ ...p, [category]: e.target.checked }))
                    }
                    className="w-5 h-5 rounded accent-forest cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-900 flex-1">
                    {categoryLabels[category]}
                  </span>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCourseModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="flex-1"
              >
                {savingPrefs ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" opacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="60" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-forest text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
