import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input, Textarea } from '../components/Input';
import { Badge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';

const ACHIEVEMENT_ICON_BG = {
  primer_arbol: 'bg-green-100',
  brote: 'bg-emerald-100',
  aventurero: 'bg-orange-100',
  guardian: 'bg-blue-100',
  cinco_arboles: 'bg-teal-100',
  primer_evento: 'bg-purple-100',
};

export default function UserProfile() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  const categoryLabels = {
    Reforestacion: '🌳 Reforestación',
    LimpiezaBasura: '🗑️ Limpieza de Basura',
    Biodiversidad: '🦋 Biodiversidad',
    HuellaCarbono: '💨 Huella de Carbono',
    ConservacionAgua: '💧 Conservación de Agua',
  };

  useEffect(() => {
    Promise.allSettled([api.progress(), api.achievements(), api.getCoursePreferences()])
      .then(([progressResult, achResult, prefsResult]) => {
        if (progressResult.status === 'fulfilled') {
          const p = progressResult.value;
          setData(p);
          setForm({ name: p.name || '', bio: p.bio || '', avatarUrl: p.avatarUrl || '' });
        }
        if (achResult.status === 'fulfilled') {
          setAchievements(achResult.value);
        }
        if (prefsResult.status === 'fulfilled' && prefsResult.value?.categories) {
          setPreferences(prefsResult.value.categories);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pickImage = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        aspectRatio: 1,
      });
      if (image.base64String) {
        setForm(f => ({ ...f, avatarBase64: image.base64String }));
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  async function handleSave() {
    if (!form.name.trim()) {
      alert('Por favor ingresa un nombre');
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      if (form.name !== data.name) payload.name = form.name;
      if (form.bio !== data.bio) payload.bio = form.bio;
      if (form.avatarBase64) payload.avatarBase64 = form.avatarBase64;

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }

      const updated = await api.updateProfile(payload);
      setData(prev => ({ ...prev, ...updated }));
      setEditing(false);
      setForm(f => ({ ...f, avatarBase64: undefined }));
      alert('✓ Perfil actualizado correctamente');
    } catch (e) {
      console.error('Error saving profile:', e);
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeEmail() {
    setEmailError('');

    // Validaciones
    if (!newEmail || !newEmail.trim()) {
      setEmailError('Por favor ingresa un email');
      return;
    }

    if (newEmail === data?.email) {
      setEmailError('El nuevo email debe ser diferente al actual');
      return;
    }

    if (!newEmail.includes('@')) {
      setEmailError('Por favor ingresa un email válido');
      return;
    }

    setChangingEmail(true);
    try {
      const response = await api.updateEmail(newEmail);
      console.log('Email actualizado:', response);
      setData(prev => ({ ...prev, email: newEmail }));
      setShowEmailModal(false);
      setNewEmail('');
      alert('✓ Email actualizado correctamente');
    } catch (e) {
      console.error('Error cambiando email:', e);
      setEmailError(e.message || 'Error al cambiar email. Intenta de nuevo.');
    } finally {
      setChangingEmail(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando...</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">No se pudo cargar el perfil</div>
      </div>
    );
  }

  const { name, avatarUrl, bio, xp, progressPct, metrics } = data;
  const m2Restored = (metrics.trees || 0) * 4;
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const topThree = unlockedAchievements.slice(0, 3);

  return (
    <div className="p-4 space-y-5 pb-28">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-xs text-slate-400 mt-0.5">Tu progreso en ReWild</p>
      </div>

      {/* Profile Header Card */}
      <Card className="text-center">
        <CardContent className="space-y-4 pt-6 pb-6">
          <div className="relative inline-block">
            <img
              src={
                avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B4332&color=fff&size=128`
              }
              alt={name}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-forest/20 mx-auto"
            />
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="absolute bottom-0 right-0 bg-forest text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                aria-label="Editar perfil"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>

          {!editing ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {bio || 'Sin biografía aún. ¡Completa tu perfil!'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-lg">📧</span>
                  <p className="text-sm font-semibold text-forest">{data.email}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 text-left">
              <Input
                label="Nombre"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <Textarea
                label="Biografía"
                rows={3}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Cuéntanos sobre ti..."
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEmailModal(true)}
                className="w-full"
              >
                Cambiar Email
              </Button>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide block">
                  Foto de Perfil
                </label>
                <Button
                  onClick={pickImage}
                  className="w-full"
                  variant="secondary"
                >
                  Cambiar Foto
                </Button>
                {form.avatarBase64 && (
                  <p className="text-xs text-green-600 mt-2">✓ Nueva foto seleccionada</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="CO₂ Reducido"
          value={`-${metrics.co2Kg}kg`}
          icon="🌍"
          highlighted
        />
        <StatCard
          label="Semillas"
          value={xp.toLocaleString()}
          icon="🌱"
        />
      </div>

      {/* Learning Preferences */}
      {preferences.length > 0 && (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Áreas de Interés</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/dashboard')}
              >
                Editar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.map(pref => (
                <Badge key={pref} variant="forest">
                  {categoryLabels[pref] || pref}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Highlighted Achievements */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Logros Destacados</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/certificados')}
            >
              Ver todos
            </Button>
          </div>

          {topThree.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Planta tu primer árbol para desbloquear logros
            </p>
          ) : (
            <div className="space-y-2">
              {topThree.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                  <div
                    className={`w-10 h-10 rounded-full ${ACHIEVEMENT_ICON_BG[a.id] || 'bg-slate-200'} flex items-center justify-center text-lg flex-shrink-0`}
                  >
                    {a.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {a.label}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="success" className="text-[10px]">
                        Desbloqueado
                      </Badge>
                      {a.unlockedAt && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(a.unlockedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1B4332"
                    strokeWidth="2.5"
                    className="flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card className="bg-gradient-to-br from-forest via-forest to-forest/80 text-white border-0 overflow-hidden">
        <CardContent className="space-y-4 py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-100 mb-2">
              Tu Impacto Forestal
            </p>
            <p className="text-3xl font-black">
              {m2Restored}m²
            </p>
            <p className="text-sm text-green-100 mt-1">de bosque restaurado</p>
          </div>
          <button
            onClick={() => navigate('/app/mapa')}
            className="w-full bg-white text-forest hover:bg-slate-100 font-bold py-3 px-4 rounded-lg transition-colors text-base flex items-center justify-center gap-2"
          >
            <span>Explorar en el Mapa</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </CardContent>
      </Card>

      {/* Change Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setNewEmail('');
          setEmailError('');
        }}
        title="Cambiar Email"
        description="Ingresa tu nuevo email"
        size="sm"
      >
        <div className="space-y-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">Email Actual</p>
            <p className="text-sm font-semibold text-slate-900">{data.email}</p>
          </div>
          <Input
            label="Nuevo Email"
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="nuevo@email.com"
            error={emailError}
          />
        </div>
        <div className="flex gap-3 -mx-6 -mb-4 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button
            variant="secondary"
            onClick={() => {
              setShowEmailModal(false);
              setNewEmail('');
              setEmailError('');
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleChangeEmail}
            disabled={changingEmail}
            className="flex-1"
          >
            {changingEmail ? 'Cambiando...' : 'Cambiar Email'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
