import api from '../api/axios';

export const adminApi = {
  // Dashboard
  getStats: () => api.get('/admin/dashboard/stats'),

  // Products
  listProducts: (params) => api.get('/products', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/products/${id}`, data);
    }
    return api.put(`/products/${id}`, data);
  },
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Orders
  listOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),

  // Brands
  listBrands: (params) => api.get('/admin/brands', { params }),
  createBrand: (data) => api.post('/admin/brands', data),
  updateBrand: (id, data) => api.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/admin/brands/${id}`),

  // Categories
  listCategories: (params) => api.get('/admin/categories', { params }),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/admin/categories/${id}`, data);
    }
    return api.put(`/admin/categories/${id}`, data);
  },
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Users
  listUsers: (params) => api.get('/admin/users', { params }),
  listRoles: () => api.get('/admin/users/roles'),
  updateUserRole: (id, role_id) => api.patch(`/admin/users/${id}/role`, { role_id }),
  updateUserStatus: (id, is_active) => api.patch(`/admin/users/${id}/status`, { is_active }),

  // Messages
  listMessages: (params) => api.get('/admin/messages', { params }),
  getMessage: (id) => api.get(`/admin/messages/${id}`),
  markMessageRead: (id) => api.patch(`/admin/messages/${id}/read`),
};
