const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function headers() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('No se puede conectar al servidor. ¿Está el backend corriendo en :3001?');
  }

  const text = await res.text();
  if (!text) throw new Error('El servidor no respondió. Revisa que el backend esté activo.');

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Respuesta inesperada del servidor (status ${res.status})`);
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // auth
  login: async (email, password) => {
    const data = await req('POST', '/auth/login', { email, password });
    return data;
  },
  register: async (email, password, name, bio) => {
    const data = await req('POST', '/auth/register', { email, password, name, bio });
    return data;
  },
  refresh: (refreshToken) => req('POST', '/auth/refresh', { refreshToken }),

  // user
  progress: () => req('GET', '/user/progress'),
  updateProfile: (data) => req('PATCH', '/user/profile', data),

  // trees
  myTrees: () => req('GET', '/trees/user'),

  // learn
  courses: (category) => req('GET', `/learn/courses${category ? `?category=${category}` : ''}`),
  getCoursePreferences: () => req('GET', '/learn/preferences'),
  saveCoursePreferences: (categories) => req('POST', '/learn/preferences', { categories }),
  enrollCourse: (id) => req('POST', `/learn/courses/${id}/purchase`),

  // community
  feed: () => req('GET', '/community/feed'),
  createPost: (data) => req('POST', '/community/posts', data),
  likePost: (id) => req('POST', `/community/posts/${id}/like`),

  // events
  events: (category) => req('GET', `/events${category ? `?category=${category}` : ''}`),
  joinEvent: (id) => req('POST', `/events/${id}/join`),

  // nft
  myCerts: () => req('GET', '/nft/my'),
  mintNFT: (treeId) => req('POST', '/nft/mint', { treeId }),

  // carbon
  calculate: (transport, diet, hogar) =>
    req('POST', '/carbon/calculate', { transport, diet, hogar }),

  // achievements
  achievements: () => req('GET', '/achievements'),

  // map
  mapImpact: () => req('GET', '/map/impact'),
  searchProjects: (q) => req('GET', `/map/projects/search?q=${encodeURIComponent(q)}`),
  createProject: (data) => req('POST', '/map/projects', data),
  getMyMapJoins: () => req('GET', '/map/my-joins'),
  joinMapProject: (projectId) => req('POST', '/map/join', { projectId }),
  leaveMapProject: (projectId) => req('DELETE', `/map/join/${projectId}`),

  // user email
  updateEmail: (newEmail) => req('PATCH', '/user/email', { newEmail }),
};
