import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const CATEGORIES = ['Todo', 'Reforestacion', 'HuellaCarbono', 'Biodiversidad'];
const CAT_LABELS  = { Todo: 'Todo', Reforestacion: 'Reforestación', HuellaCarbono: 'Huella de Carbono', Biodiversidad: 'Biodiversidad' };

export default function Aprende() {
  const [courses, setCourses] = useState([]);
  const [active, setActive]   = useState('Todo');
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState('');

  const load = (cat) => {
    setLoading(true);
    api.courses(cat === 'Todo' ? '' : cat)
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(active); }, [active]);

  const enroll = async (course) => {
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg text-gray-900">Aprende y Crece</h1>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Buscar cursos de silvicultura..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              active === cat
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        Cursos Destacados
      </div>

      {loading ? (
        <div className="text-center text-gray-400 text-sm py-8">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative">
                <img
                  src={course.imageUrl || 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400'}
                  alt={course.title}
                  className="w-full h-36 object-cover"
                />
                <span className="absolute top-2 left-2 bg-forest text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {course.level}
                </span>
              </div>
              <div className="p-3">
                <div className="text-[10px] text-forest font-semibold mb-0.5">{CAT_LABELS[course.category]}</div>
                <div className="font-semibold text-gray-900 text-sm">{course.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{course.description}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="text-yellow-400">★</span>
                    <span>{course.rating} ({course.reviewCount} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${course.price === 0 ? 'text-forest' : 'text-gray-900'}`}>
                      {course.price === 0 ? 'Gratis' : `${course.price.toFixed(2)}€`}
                    </span>
                    <button
                      onClick={() => enroll(course)}
                      className="bg-forest text-white text-xs px-3 py-1.5 rounded-lg"
                    >
                      {course.price === 0 ? 'Inscribirse' : 'Comprar'}
                    </button>
                  </div>
                </div>
              </div>
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
