import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';

export default function Certificados() {
  const [certs, setCerts] = useState([]);
  const [trees, setTrees] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('certs'); // certs | trees | logros
  const [toast, setToast] = useState('');

  const ACHIEVEMENT_BG = {
    primer_arbol: 'bg-green-100',
    brote: 'bg-emerald-100',
    aventurero: 'bg-orange-100',
    guardian: 'bg-blue-100',
    cinco_arboles: 'bg-teal-100',
    primer_evento: 'bg-purple-100',
  };

  useEffect(() => {
    Promise.allSettled([api.myCerts(), api.myTrees(), api.achievements()])
      .then(([certsR, treesR, achR]) => {
        if (certsR.status === 'fulfilled') setCerts(certsR.value);
        if (treesR.status === 'fulfilled') setTrees(treesR.value);
        if (achR.status === 'fulfilled') setAchievements(achR.value);
      })
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
    <div className="p-4 space-y-5 pb-28">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Mis Certificados</h1>
        <p className="text-xs text-slate-400 mt-0.5">Árboles, logros y NFTs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          ['certs', 'Certificados'],
          ['trees', 'Árboles'],
          ['logros', 'Logros'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              tab === val
                ? 'border-forest text-forest'
                : 'border-transparent text-slate-500 hover:text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-sm text-slate-500">Cargando...</p>
          </CardContent>
        </Card>
      ) : tab === 'certs' ? (
        <div className="space-y-3">
          {certs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-sm text-slate-500">
                  No tienes certificados. Mintea NFTs de tus árboles.
                </p>
              </CardContent>
            </Card>
          ) : (
            certs.map(cert => (
              <Card key={cert.id} className="overflow-hidden">
                <img
                  src={
                    cert.tree?.photoUrl ||
                    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400'
                  }
                  alt={cert.tree?.name}
                  className="w-full h-32 object-cover"
                />
                <CardContent className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {cert.tree?.name}
                      </h4>
                      <p className="text-xs text-slate-500 italic">
                        {cert.tree?.scientificName}
                      </p>
                    </div>
                    <Badge variant="success" className="text-[10px] flex-shrink-0">
                      ✓ Blockchain
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500 mb-0.5">Ubicación</p>
                      <p className="font-mono text-slate-900">
                        {cert.lat.toFixed(2)}°, {cert.lng.toFixed(2)}°
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">CO₂/Año</p>
                      <p className="font-semibold text-forest">
                        {cert.co2PerYear} t
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => alert(`TX: ${cert.txHash}`)}
                      className="flex-1"
                    >
                      Compartir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(`Blockchain: ${cert.txHash}`)}
                    >
                      Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : tab === 'logros' ? (
        <div className="space-y-2">
          {achievements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-sm text-slate-500">Sin logros aún</p>
              </CardContent>
            </Card>
          ) : (
            achievements.map(a => (
              <Card
                key={a.id}
                className={a.unlocked ? '' : 'opacity-60'}
              >
                <CardContent className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${
                      ACHIEVEMENT_BG[a.id] || 'bg-slate-100'
                    } flex items-center justify-center text-xl flex-shrink-0`}
                  >
                    {a.unlocked ? a.emoji : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {a.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {a.description}
                    </p>
                    {a.unlocked && a.unlockedAt && (
                      <Badge variant="success" className="text-[10px] mt-1">
                        {new Date(a.unlockedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Badge>
                    )}
                    {!a.unlocked && (
                      <Badge variant="default" className="text-[10px] mt-1">
                        Bloqueado
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {trees.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-sm text-slate-500">Sin árboles aún</p>
              </CardContent>
            </Card>
          ) : (
            trees.map(tree => (
              <Card key={tree.id}>
                <CardContent className="flex items-center gap-3">
                  <img
                    src={
                      tree.photoUrl ||
                      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200'
                    }
                    alt={tree.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">
                      {tree.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 italic">
                      {tree.scientificName}
                    </p>
                    <Badge
                      variant={
                        tree.status === 'SALUDABLE' ? 'success' : 'warning'
                      }
                      className="text-[10px] mt-1"
                    >
                      {tree.status}
                    </Badge>
                  </div>
                  {mintedTreeIds.has(tree.id) ? (
                    <Badge variant="success" className="text-[10px]">
                      NFT ✓
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => mint(tree.id)}
                    >
                      Mintear
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-forest text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
