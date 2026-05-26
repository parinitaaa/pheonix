import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('infinity_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('infinity_token');
            localStorage.removeItem('infinity_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const addAddress = (data) => api.post('/auth/address', data);
export const deleteAddress = (id) => api.delete(`/auth/address/${id}`);
export const getLeaderboard = () => api.get('/auth/leaderboard');

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const addReview = (id, data) => api.post(`/products/${id}/review`, data);
export const getCategories = () => api.get('/products/categories');

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/mine');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id, data) => api.put(`/orders/${id}/cancel`, data);
export const requestRefund = (id, data) => api.post(`/orders/${id}/refund`, data);

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const toggleWishlist = (productId) => api.post(`/wishlist/${productId}`);

// Auctions
export const getAuctions = (params) => api.get('/auctions', { params });
export const getAuction = (id) => api.get(`/auctions/${id}`);
export const placeBid = (id, data) => api.post(`/auctions/${id}/bid`, data);

// Coupons
export const validateCoupon = (data) => api.post('/coupons/validate', data);

// Admin
export const getAdminStats = () => api.get('/admin/analytics');
export const getAdminUsers = () => api.get('/admin/users');
export const updateAdminUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, data) => api.put(`/admin/orders/${id}`, data);
export const getAdminRefunds = () => api.get('/admin/refunds');
export const processRefund = (id, data) => api.put(`/admin/refunds/${id}`, data);
export const getAdminProducts = (params) => api.get('/products', { params });
export const createAdminAuction = (data) => api.post('/auctions', data);
export const getCoupons = () => api.get('/coupons');
export const createCoupon = (data) => api.post('/coupons', data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`);

export default api;
