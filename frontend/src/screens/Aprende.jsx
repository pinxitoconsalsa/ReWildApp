import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';

const CATEGORIES = ['Todo', 'Reforestacion', 'HuellaCarbono', 'Biodiversidad'];
const CAT_LABELS = {
  Todo: 'Todo',
  Reforestacion: 'Reforestación',
  HuellaCarbono: 'Huella de Carbono',
  Biodiversidad: 'Biodiversidad',
};

export default function Aprende() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState('Todo');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = cat => {
    setLoading(true);
    api
      .courses(cat === 'Todo' ? '' : cat)
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(active);
  }, [active]);

  const enroll = async course => {
    try {
      await api.enrollCourse(course.id);
      setToast(`¡Inscrito en "${course.title}"!`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="p-4 space-y-5 pb-28">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Aprende y Crece</h1>
        <p className="text-xs text-slate-400 mt-0.5">Cursos de silvicultura y sostenibilidad</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar cursos..."
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
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              active === cat
                ? 'bg-forest text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Courses List */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-sm text-slate-500">Cargando cursos...</p>
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-sm text-slate-500">No hay cursos disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <img
                src={
                  course.imageUrl ||
                  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400'
                }
                alt={course.title}
                className="w-full h-32 object-cover"
              />
              <CardContent className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="forest">{CAT_LABELS[course.category]}</Badge>
                      <Badge variant="default">{course.level}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>★</span>
                    <span>
                      {course.rating} ({course.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-sm ${
                        course.price === 0
                          ? 'text-forest'
                          : 'text-slate-900'
                      }`}
                    >
                      {course.price === 0 ? 'Gratis' : `${course.price.toFixed(2)}€`}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => enroll(course)}
                    >
                      {course.price === 0 ? 'Inscribirse' : 'Comprar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-forest text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
