const BASE_URL = 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');

// ── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  signup: async (userData) => {
    // Check if we are sending a file (FormData) or text (JSON)
    const isFormData = userData instanceof FormData;

    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? userData : JSON.stringify(userData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getMe: async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  forgotPassword: async (email) => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  resetPassword: async (token, email, newPassword) => {
    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, newPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Artwork API ───────────────────────────────────────────────
export const artworkAPI = {
  upload: async (formData) => {
    const res = await fetch(`${BASE_URL}/api/artworks/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/artworks?${query}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/api/artworks/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getMine: async () => {
    const res = await fetch(`${BASE_URL}/api/artworks/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  update: async (id, formData) => {
    const res = await fetch(`${BASE_URL}/api/artworks/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/api/artworks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Order API ─────────────────────────────────────────────────
export const orderAPI = {
  create: async (orderData) => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getMyOrders: async () => {
    const res = await fetch(`${BASE_URL}/api/orders/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getSellerOrders: async () => {
    const res = await fetch(`${BASE_URL}/api/orders/seller`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  updateStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Message API ───────────────────────────────────────────────
export const messageAPI = {
  getOrCreateConversation: async (sellerId) => {
    const res = await fetch(`${BASE_URL}/api/messages/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ sellerId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getConversations: async () => {
    const res = await fetch(`${BASE_URL}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getMessages: async (conversationId) => {
    const res = await fetch(`${BASE_URL}/api/messages/${conversationId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  send: async (conversationId, text) => {
    const res = await fetch(`${BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ conversationId, text }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Review API ────────────────────────────────────────────────
export const reviewAPI = {
  create: async (orderId, rating, comment) => {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ orderId, rating, comment }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getArtworkReviews: async (artworkId) => {
    const res = await fetch(`${BASE_URL}/api/reviews/artwork/${artworkId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getSellerReviews: async () => {
    const res = await fetch(`${BASE_URL}/api/reviews/seller`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getBuyerReviews: async () => {
    const res = await fetch(`${BASE_URL}/api/reviews/buyer`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  checkReviewed: async (orderId) => {
    const res = await fetch(`${BASE_URL}/api/reviews/check/${orderId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  reply: async (reviewId, reply) => {
    const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ reply }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/api/reviews/all`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Wishlist API ──────────────────────────────────────────────
export const wishlistAPI = {
  toggle: async (artworkId) => {
    const res = await fetch(`${BASE_URL}/api/auth/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ artworkId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  get: async () => {
    const res = await fetch(`${BASE_URL}/api/auth/wishlist`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Notification API ──────────────────────────────────────────
export const notificationAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getUnreadCount: async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  markRead: async (id) => {
    const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  markAllRead: async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  deleteAll: async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Admin API ─────────────────────────────────────────────────
export const adminAPI = {
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/admin/users?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getArtworks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/admin/artworks?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  deleteArtwork: async (id) => {
    const res = await fetch(`${BASE_URL}/api/admin/artworks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/admin/orders?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
  getRecent: async () => {
    const res = await fetch(`${BASE_URL}/api/admin/recent`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ── Default export ────────────────────────────────────────────
const apiCall = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};
// ── Custom Request API ────────────────────────────────────────
export const customRequestAPI = {

  getSellers: async () => {
    const res = await fetch(`${BASE_URL}/api/custom-requests/sellers`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  create: async (requestData) => {
    const res = await fetch(`${BASE_URL}/api/custom-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(requestData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  getSellerRequests: async () => {
    const res = await fetch(`${BASE_URL}/api/custom-requests/seller`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  getBuyerRequests: async () => {
    const res = await fetch(`${BASE_URL}/api/custom-requests/buyer`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },


  respond: async (id, status) => {
    const res = await fetch(`${BASE_URL}/api/custom-requests/${id}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/api/custom-requests/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};
export default apiCall;