import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const STORIES = [
  { label: 'Tu Impacto', icon: '🌳' },
  { label: 'Noticias',   icon: '📰' },
  { label: 'Proyectos',  icon: '🗺️' },
  { label: 'Vivero',     icon: '🌱' },
];

export default function Comunidad() {
  const [feed, setFeed] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadFeed = () => {
    api.feed()
      .then(setFeed)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFeed(); }, []);

  const like = async (id) => {
    try {
      const { likes } = await api.likePost(id);
      setFeed(prev => prev.map(p => p.id === id ? { ...p, likes } : p));
    } catch (err) { console.error(err); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.createPost({ content, category: 'GENERAL' });
      setContent('');
      loadFeed();
    } catch (err) { alert(err.message); }
    finally { setPosting(false); }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg text-gray-900">Comunidad ReWild</h1>
        <span className="text-lg">🔔</span>
      </div>

      {/* Stories row */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {STORIES.map(s => (
          <button key={s.label} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-forest/10 border-2 border-forest flex items-center justify-center text-2xl">
              {s.icon}
            </div>
            <span className="text-[10px] text-gray-600">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Compose */}
      <form onSubmit={submit} className="bg-white rounded-2xl p-3 shadow-sm flex gap-2 items-center">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Comparte el progreso de tu árbol..."
          className="flex-1 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={posting}
          className="bg-forest text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          {posting ? '...' : 'Publicar'}
        </button>
      </form>

      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Novedades de la comunidad
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {feed.map(post => (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{post.timeAgo}</span>
                </div>
                {post.title && <div className="font-semibold text-gray-900 text-sm mb-0.5">{post.title}</div>}
                <div className="text-xs text-gray-600">{post.content}</div>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => like(post.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400"
                  >
                    ♥ {post.likes}
                  </button>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    💬 {post.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
