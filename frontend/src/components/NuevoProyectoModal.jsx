import React, { useState } from 'react';
import { api } from '../lib/api';

const EMPTY = {
  name: '', region: '', country: '',
  lat: '', lng: '',
  treesPlanted: '', jobsCreated: '', communities: '', description: '',
};

export default function NuevoProyectoModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const project = await api.createProject(form);
      window.dispatchEvent(new CustomEvent('project-created', { detail: project }));
      onCreated(project);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-cream rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-cream px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-base">Nuevo Proyecto de Reforestación</h2>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-3">
          <Field label="Nombre del proyecto *" value={form.name} onChange={set('name')} placeholder="Ej: Amazonas Norte" required />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Región *" value={form.region} onChange={set('region')} placeholder="Ej: Amazonas" required />
            <Field label="País *" value={form.country} onChange={set('country')} placeholder="Ej: Brasil" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Latitud *" type="number" step="any" value={form.lat} onChange={set('lat')} placeholder="-3.4653" required />
            <Field label="Longitud *" type="number" step="any" value={form.lng} onChange={set('lng')} placeholder="-62.2159" required />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Árboles" type="number" value={form.treesPlanted} onChange={set('treesPlanted')} placeholder="0" />
            <Field label="Empleos" type="number" value={form.jobsCreated} onChange={set('jobsCreated')} placeholder="0" />
            <Field label="Comunidades" type="number" value={form.communities} onChange={set('communities')} placeholder="0" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Descripción</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Describe el proyecto..."
              className="mt-1 w-full bg-white rounded-xl px-3 py-2 text-sm outline-none border border-gray-200 focus:border-forest resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Creando...' : '🌱 Añadir al mapa'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        {...props}
        className="mt-1 w-full bg-white rounded-xl px-3 py-2 text-sm outline-none border border-gray-200 focus:border-forest"
      />
    </div>
  );
}
