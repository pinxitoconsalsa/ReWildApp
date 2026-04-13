import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

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

  useEffect(() => {
    api.mapImpact()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) { setResults(null); return; }
    const r = await api.searchProjects(query);
    setResults(r);
  };

  const projects = results ?? data?.projects ?? [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400">🌿 ReWild Impact</div>
          <div className="text-[10px] text-gray-400">Restauración Global en Vivo</div>
        </div>
        <div className="flex gap-2">
          <span>🔔</span>
          <span>👤</span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={search} className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar regiones o proyectos..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults(null); }} className="text-gray-400 text-xs">✕</button>
        )}
      </form>

      {/* Map placeholder */}
      <div className="bg-gray-200 rounded-2xl h-40 flex items-center justify-center text-gray-400 text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-60" />
        <span className="relative z-10 text-center">
          🗺️<br /><span className="text-xs">Mapa interactivo<br />(integra Mapbox/Google Maps aquí)</span>
        </span>
        {/* Project dots */}
        {projects.slice(0, 3).map((p, i) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            style={{ left: `${20 + i * 30}%`, top: `${30 + (i % 2) * 30}%` }}
            className="absolute w-3 h-3 bg-forest rounded-full border-2 border-white shadow z-20"
          />
        ))}
      </div>

      {/* Selected project popup */}
      {selected && (
        <div className="bg-white rounded-2xl p-3 shadow-sm relative">
          <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-gray-400 text-sm">✕</button>
          <div className="font-semibold text-gray-900 text-sm mb-1">{selected.name}</div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>🌳 {fmtNum(selected.treesPlanted)} Árboles</span>
            <span>👥 {selected.jobsCreated} empleos locales</span>
          </div>
          {selected.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selected.description}</p>
          )}
        </div>
      )}

      {/* Global stats */}
      {!loading && data && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm text-gray-800">Resumen de Impacto Global</div>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              ESTADÍSTICAS EN VIVO
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-black text-gray-900">{fmtNum(data.stats.totalTrees)}</div>
              <div className="text-[10px] text-gray-400 uppercase">Árboles<br />Plantados</div>
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{data.stats.totalSites}</div>
              <div className="text-[10px] text-gray-400 uppercase">Sitios<br />Activos</div>
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{data.stats.totalCommunities}</div>
              <div className="text-[10px] text-gray-400 uppercase">Comunidades</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Empoderando a las comunidades locales en todo el mundo a través de la reforestación
            basada en la ciencia y la preservación de corredores de vida silvestre.
          </p>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 bg-forest text-white text-xs py-2.5 rounded-xl font-semibold">
              📄 Informe Completo
            </button>
            <button className="flex-1 border border-gray-200 text-gray-600 text-xs py-2.5 rounded-xl font-semibold">
              🤝 Apoyar
            </button>
          </div>
        </div>
      )}

      {/* Projects list */}
      <div>
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          {results ? `Resultados para "${query}"` : 'Proyectos Activos'}
        </div>
        <div className="space-y-2">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="w-full bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm text-left"
            >
              <div className="w-10 h-10 bg-forest/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🌳
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-gray-900 truncate">{p.name}</div>
                <div className="text-[10px] text-gray-400">{p.region}, {p.country}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-forest">{fmtNum(p.treesPlanted)}</div>
                <div className="text-[10px] text-gray-400">árboles</div>
              </div>
            </button>
          ))}
          {projects.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">Sin resultados</div>
          )}
        </div>
      </div>
    </div>
  );
}
