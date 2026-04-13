const BASE = '/api';

function headers() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // auth
  login: (email, password) => req('POST', '/auth/login', { email, password }),
  register: (email, password, name) => req('POST', '/auth/register', { email, password, name }),
  socialLogin: (provider, providerId, email, name) =>
    req('POST', '/auth/social', { provider, providerId, email, name }),

  // user
  progress: () => req('GET', '/user/progress'),

  // trees
  myTrees: () => req('GET', '/trees/user'),

  // learn
  courses: (category) => req('GET', `/learn/courses${category ? `?category=${category}` : ''}`),
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

  // map
  mapImpact: () => req('GET', '/map/impact'),
  searchProjects: (q) => req('GET', `/map/projects/search?q=${encodeURIComponent(q)}`),
};
