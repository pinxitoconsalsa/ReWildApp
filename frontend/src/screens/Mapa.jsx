import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Modal, ModalFooter } from '../components/Modal';

// Fix Leaflet default icon URLs (known Vite/webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return n;
}

export default function Mapa() {
  const [data, setData]           = useState(null);
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState(null);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [joined, setJoined]       = useState(new Set());
  const [confirmJoin, setConfirmJoin] = useState(null);
  const [leavingProject, setLeavingProject] = useState(null);

  const loadData = () => {
    setLoading(true);
    api.mapImpact()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    api.getMyMapJoins()
      .then(projectIds => setJoined(new Set(projectIds)))
      .catch(console.error);
    const onNewProject = (e) => {
      setData((prev) => prev ? { ...prev, projects: [...prev.projects, e.detail] } : prev);
    };
    window.addEventListener('project-created', onNewProject);
    return () => window.removeEventListener('project-created', onNewProject);
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) { setResults(null); return; }
    const r = await api.searchProjects(query);
    setResults(r);
  };

  const handleConfirmJoin = async () => {
    const project = confirmJoin;
    try {
      setJoined(prev => new Set([...prev, project.id]));
      await api.joinMapProject(project.id);
      alert(`¡Solicitud enviada! Te uniste al proyecto "${project.name}". Pronto te contactarán con más detalles.`);
      setSelected(null);
      setConfirmJoin(null);
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.message || 'No se pudo enviar la solicitud'));
      setJoined(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.id);
        return newSet;
      });
    }
  };

  const handleLeaveProject = async () => {
    const project = leavingProject;
    try {
      await api.leaveMapProject(project.id);
      setJoined(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.id);
        return newSet;
      });
      alert(`Has dejado de seguir el proyecto "${project.name}".`);
      setSelected(null);
      setLeavingProject(null);
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.message || 'No se pudo dejar el proyecto'));
    }
  };

  const projects = results ?? data?.projects ?? [];

  // Default center: South America where most reforestation projects are
  const mapCenter = projects.length > 0
    ? [projects[0].lat, projects[0].lng]
    : [-5, -55];

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Proyectos Activos</h1>
        <p className="text-xs text-slate-400 mt-0.5">Restauración global en vivo</p>
      </div>

      {/* Search */}
      <form onSubmit={search} className="relative">
        <Input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar proyectos o regiones..."
          className="pl-10"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </form>

      {/* Interactive map */}
      <Card className="overflow-hidden" style={{ height: '260px' }}>
        <MapContainer
          center={mapCenter}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {projects.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={greenIcon}
              eventHandlers={{ click: () => setSelected(p) }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>{p.name}</strong><br />
                  {p.region}, {p.country}<br />
                  🌳 {fmtNum(p.treesPlanted)} árboles
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>

      {/* Selected project details */}
      {selected && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">{selected.name}</h3>
                <p className="text-xs text-slate-500">
                  {selected.region}, {selected.country}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {selected.description && (
              <p className="text-xs text-slate-600">{selected.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="font-bold text-slate-900">
                  {fmtNum(selected.treesPlanted)}
                </div>
                <div className="text-[10px] text-slate-500">Árboles</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="font-bold text-slate-900">{selected.jobsCreated}</div>
                <div className="text-[10px] text-slate-500">Empleos</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="font-bold text-slate-900">{selected.communities}</div>
                <div className="text-[10px] text-slate-500">Comunidades</div>
              </div>
            </div>

            {/* Join/Leave Button */}
            {joined.has(selected.id) ? (
              <Button
                variant="outline"
                onClick={() => setLeavingProject(selected)}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                Dejar de Seguir
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setConfirmJoin(selected)}
                className="w-full"
              >
                Solicitar Unirse al Proyecto
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Global Impact Summary */}
      {!loading && data && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Impacto Global</h3>
              <Badge variant="success">En Vivo</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg font-black text-slate-900">
                  {fmtNum(data.stats.totalTrees)}
                </div>
                <div className="text-[10px] text-slate-500 uppercase mt-1">Árboles</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg font-black text-slate-900">
                  {data.stats.totalSites}
                </div>
                <div className="text-[10px] text-slate-500 uppercase mt-1">Sitios</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg font-black text-slate-900">
                  {data.stats.totalCommunities}
                </div>
                <div className="text-[10px] text-slate-500 uppercase mt-1">Comunidades</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Empoderando a comunidades locales en todo el mundo a través de reforestación
              basada en ciencia y preservación de corredores ecológicos.
            </p>

            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1">
                Más Información
              </Button>
              <Button variant="secondary" className="flex-1">
                Contribuir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects list */}
      {projects.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide px-1">
            {results ? `Resultados (${projects.length})` : 'Todos los Proyectos'}
          </h3>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="w-full bg-white rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-shadow text-left"
            >
              <div className="text-xl flex-shrink-0">🌳</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900 truncate">
                  {p.name}
                </div>
                <div className="text-xs text-slate-500">
                  {p.region}, {p.country}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-forest">
                  {fmtNum(p.treesPlanted)}
                </div>
                <div className="text-[10px] text-slate-400">árboles</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-sm text-slate-500">
              {results ? 'No se encontraron proyectos' : 'Cargando proyectos...'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Join Confirmation Modal */}
      <Modal
        isOpen={!!confirmJoin}
        onClose={() => setConfirmJoin(null)}
        title="¿Unirse al Proyecto?"
        size="sm"
        footer={
          <Button
            variant="secondary"
            onClick={() => setConfirmJoin(null)}
            className="flex-1"
          >
            Cancelar
          </Button>
        }
      >
        <div className="space-y-4 mb-4">
          <p className="text-sm text-slate-600">
            ¿Estás seguro de que quieres unirte a{' '}
            <span className="font-semibold text-slate-900">{confirmJoin?.name}</span>?
          </p>
          <p className="text-xs text-slate-500">
            Pronto te contactarán con más detalles sobre el proyecto.
          </p>
        </div>
        <div className="flex gap-3 -mx-6 -mb-4 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button
            variant="secondary"
            onClick={() => setConfirmJoin(null)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmJoin}
            className="flex-1"
          >
            Sí, Unirse
          </Button>
        </div>
      </Modal>

      {/* Leave Confirmation Modal */}
      <Modal
        isOpen={!!leavingProject}
        onClose={() => setLeavingProject(null)}
        title="¿Dejar de Seguir?"
        size="sm"
      >
        <div className="space-y-4 mb-4">
          <p className="text-sm text-slate-600">
            ¿Quieres dejar de seguir{' '}
            <span className="font-semibold text-slate-900">{leavingProject?.name}</span>?
          </p>
          <p className="text-xs text-slate-500">
            Podrás volver a unirte en cualquier momento.
          </p>
        </div>
        <div className="flex gap-3 -mx-6 -mb-4 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button
            variant="secondary"
            onClick={() => setLeavingProject(null)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleLeaveProject}
            className="flex-1"
          >
            Sí, Dejar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
