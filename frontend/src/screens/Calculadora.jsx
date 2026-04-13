import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

function Slider({ label, icon, leftLabel, rightLabel, value, onChange }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-sm text-gray-800">{label}</span>
        </div>
        <span className="text-sm text-forest font-medium">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-forest"
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export default function Calculadora() {
  const navigate = useNavigate();
  const [transport, setTransport] = useState(0.5);
  const [diet, setDiet]           = useState(0.5);
  const [hogar, setHogar]         = useState(0.3);
  const [result, setResult]       = useState(null);
  const [interacted, setInteracted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSlider = (setter) => (v) => {
    setter(v);
    setInteracted(true);
  };

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await api.calculate(transport, diet, hogar);
      setResult(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Auto-calculate on slider change (debounced via useEffect)
  useEffect(() => {
    if (!interacted) return;
    const t = setTimeout(calculate, 400);
    return () => clearTimeout(t);
  }, [transport, diet, hogar, interacted]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-400">←</button>
        <h1 className="font-bold text-lg text-gray-900">Calculadora CO₂</h1>
      </div>

      {/* Result display */}
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tu Huella Anual</div>
        <div className="text-5xl font-black text-gray-900">
          {result ? result.totalTonnes : '—'}
          <span className="text-2xl font-normal text-forest ml-1">toneladas</span>
        </div>
        {result && (
          <div className="mt-2 inline-flex items-center gap-1 bg-forest/10 text-forest text-xs px-3 py-1 rounded-full font-medium">
            🌳 Equivale a {result.treesNeeded} árboles por año
          </div>
        )}
      </div>

      {/* Sliders */}
      <Slider
        label="Transporte"
        icon="🚗"
        leftLabel="Cero"
        rightLabel="Viajero Frecuente"
        value={transport}
        onChange={handleSlider(setTransport)}
      />
      <Slider
        label="Dieta"
        icon="🍽️"
        leftLabel="Vegana"
        rightLabel="Alta en Carne"
        value={diet}
        onChange={handleSlider(setDiet)}
      />
      <Slider
        label="Hogar"
        icon="🏠"
        leftLabel="Eficiente"
        rightLabel="Gran Consumo"
        value={hogar}
        onChange={handleSlider(setHogar)}
      />

      {/* Tip */}
      {result && (
        <div className="bg-white rounded-2xl p-3 shadow-sm text-xs text-gray-600 text-center italic">
          "{result.tip}"
        </div>
      )}

      {/* CTA — only shows after slider interaction */}
      {interacted && (
        <button
          onClick={() => navigate('/app/acciones')}
          className="w-full bg-forest text-white text-sm py-3 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2"
        >
          🌿 Compensar Ahora
        </button>
      )}

      {!interacted && (
        <p className="text-center text-xs text-gray-400">Mueve un slider para calcular tu huella</p>
      )}
    </div>
  );
}
