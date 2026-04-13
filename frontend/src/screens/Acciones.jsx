import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const CATEGORIES = ['Todo', 'Reforestacion', 'Limpieza'];

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function Acciones() {
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState('Todo');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = (cat) => {
    setLoading(true);
    api.events(cat === 'Todo' ? '' : cat)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(active); }, [active]);

  const join = async (event) => {
    try {
      await api.joinEvent(event.id);
      setToast(`¡Inscrito en "${event.title}"!`);
      load(active);
    } catch (err) {
      setToast(err.message);
    }
    setTimeout(() => setToast(''), 3000);
  };

  const featured = events.find(e => e.isFeatured);
  const rest      = events.filter(e => !e.isFeatured);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg text-gray-900">Próximas Acciones</h1>
        <span className="text-lg">🔔</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input type="text" placeholder="Buscar eventos..." className="flex-1 text-sm outline-none bg-transparent" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              active === cat ? 'bg-forest text-white border-forest' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8">Cargando...</div>
      ) : (
        <>
          {/* Featured event */}
          {featured && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative">
                <img
                  src={featured.imageUrl || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500'}
                  alt={featured.title}
                  className="w-full h-44 object-cover"
                />
                <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  ☆ DESTACADO
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-gray-900 text-sm">{featured.title}</div>
                  <span className="text-forest font-bold text-xs whitespace-nowrap">
                    {featured.price === 0 ? 'GRATIS' : `${featured.price}€`}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  <div>📅 {fmtDate(featured.date)} · 09:00 AM</div>
                  <div>📍 {featured.location}</div>
                  <div>👥 {featured.availableSpots} plazas disponibles</div>
                </div>
                <button
                  onClick={() => join(featured)}
                  disabled={featured.status === 'COMPLETO'}
                  className="mt-3 w-full bg-forest text-white text-sm py-2.5 rounded-xl font-semibold disabled:opacity-50"
                >
                  {featured.status === 'COMPLETO' ? 'Completo' : 'Unirse al Evento'}
                </button>
              </div>
            </div>
          )}

          {/* Upcoming events list */}
          {rest.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Próximos Días</div>
              <div className="space-y-2">
                {rest.map(event => (
                  <div key={event.id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm items-center">
                    <img
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200'}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-gray-900 truncate">{event.title}</div>
                      <div className="text-[10px] text-gray-500">{fmtDate(event.date)} · {event.location}</div>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        event.status === 'COMPLETO'
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {event.status === 'COMPLETO' ? 'COMPLETO' : `${event.availableSpots} PLAZAS`}
                      </span>
                    </div>
                    <button
                      onClick={() => event.status !== 'COMPLETO' && join(event)}
                      disabled={event.status === 'COMPLETO'}
                      className="text-forest text-xs font-semibold disabled:text-gray-400"
                    >
                      {event.status === 'COMPLETO' ? 'Cerrado' : 'Ver más'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-forest text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
