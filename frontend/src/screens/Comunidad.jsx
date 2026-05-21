import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';

const STORIES = [
  { label: 'Tu Impacto', icon: '🌳' },
  { label: 'Noticias', icon: '📰' },
  { label: 'Proyectos', icon: '🗺️' },
  { label: 'Vivero', icon: '🌱' },
];

export default function Comunidad() {
  const [feed, setFeed] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadFeed = () => {
    api
      .feed()
      .then(setFeed)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const like = async id => {
    try {
      const { likes } = await api.likePost(id);
      setFeed(prev => prev.map(p => (p.id === id ? { ...p, likes } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const submit = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.createPost({ content, category: 'GENERAL' });
      setContent('');
      loadFeed();
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-4 space-y-5 pb-28">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Comunidad ReWild</h1>
        <p className="text-xs text-slate-400 mt-0.5">Conecta y comparte tu impacto</p>
      </div>

      {/* Stories */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {STORIES.map(s => (
          <button
            key={s.label}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full bg-forest/10 border-2 border-forest/30 flex items-center justify-center text-2xl group-hover:border-forest group-hover:bg-forest/20 transition-all">
              {s.icon}
            </div>
            <span className="text-[11px] font-semibold text-slate-600">
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* Compose Post */}
      <Card>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <Input
              placeholder="Comparte el progreso de tu árbol..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <Button
              type="submit"
              disabled={posting}
              className="w-full"
              variant="primary"
            >
              {posting ? (
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
                  Publicando...
                </>
              ) : (
                'Publicar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feed */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-sm text-slate-500">Cargando comunidad...</p>
          </CardContent>
        </Card>
      ) : feed.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-sm text-slate-500">Sin publicaciones aún. ¡Sé el primero!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feed.map(post => (
            <Card key={post.id} className="overflow-hidden">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-full h-40 object-cover"
                />
              )}
              <CardContent className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant="forest" className="text-[10px]">
                    {post.category}
                  </Badge>
                  <span className="text-xs text-slate-400">{post.timeAgo}</span>
                </div>

                {post.title && (
                  <h4 className="font-semibold text-slate-900">{post.title}</h4>
                )}

                <p className="text-sm text-slate-600">{post.content}</p>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => like(post.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <span>♥</span>
                    <span>{post.likes}</span>
                  </button>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span>💬</span>
                    <span>{post.comments}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
