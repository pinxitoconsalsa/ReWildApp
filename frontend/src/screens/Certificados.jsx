import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Certificados() {
  const [certs, setCerts] = useState([]);
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('certs'); // certs | trees
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([api.myCerts(), api.myTrees()])
      .then(([c, t]) => { setCerts(c); setTrees(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const mint = async (treeId) => {
    try {
      const cert = await api.mintNFT(treeId);
      setCerts(prev => [cert, ...prev]);
      setToast('¡NFT minteado en blockchain!');
    } catch (err) {
      setToast(err.message);
    }
    setTimeout(() => setToast(''), 3000);
  };

  const mintedTreeIds = new Set(certs.map(c => c.treeId));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg text-gray-900">ReWild Certificates</h1>
      </div>

      {/* Tab row */}
      <div className="flex gap-2 border-b border-gray-200">
        {[['certs', 'Todos los Certificados'], ['trees', 'Mis Árboles']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
              tab === val ? 'border-forest text-forest' : 'border-transparent text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8">Cargando...</div>
      ) : tab === 'certs' ? (
        <div className="space-y-4">
          {certs.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400">
              No tienes certificados aún. Mintea el NFT de un árbol.
            </div>
          )}
          {certs.map(cert => (
            <div key={cert.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative">
                <img
                  src={cert.tree?.photoUrl || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400'}
                  alt={cert.tree?.name}
                  className="w-full h-44 object-cover"
                />
                <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  ✓ VERIFICADO EN BLOCKCHAIN
                </span>
              </div>
              <div className="p-3">
                <div className="font-bold text-gray-900">{cert.tree?.scientificName} {cert.tree?.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">{cert.tokenId}</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">Coordenadas</div>
                    <div className="text-xs font-mono">{cert.lat.toFixed(4)}° N, {cert.lng.toFixed(4)}°</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">Compensación CO₂</div>
                    <div className="text-xs font-semibold">{cert.co2PerYear} Toneladas / Año</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => alert(`TX Hash: ${cert.txHash}`)}
                    className="flex-1 border border-forest text-forest text-xs py-2 rounded-xl font-medium"
                  >
                    &lt; Compartir
                  </button>
                  <button
                    onClick={() => alert(`Ver en blockchain: ${cert.txHash}`)}
                    className="border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-xl"
                  >
                    ℹ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {trees.map(tree => (
            <div key={tree.id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm items-center">
              <img
                src={tree.photoUrl || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200'}
                alt={tree.name}
                className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{tree.name}</div>
                <div className="text-[10px] text-gray-500 italic">{tree.scientificName}</div>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                  tree.status === 'SALUDABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {tree.status}
                </span>
              </div>
              {mintedTreeIds.has(tree.id) ? (
                <span className="text-[10px] text-green-600 font-semibold">NFT ✓</span>
              ) : (
                <button
                  onClick={() => mint(tree.id)}
                  className="bg-forest text-white text-[10px] px-2 py-1.5 rounded-lg"
                >
                  Mintear
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-forest text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
