import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token.trim()}`;
  return config;
});

export const register = (data) =>
    api.post('/auth/register', data, { responseType: 'text' });

export const login = (data) =>
    api.post('/auth/login', data, { responseType: 'text' });

export const logout = () =>
    api.post('/auth/logout', {}, { responseType: 'text' });

export const getProfile = () => api.get('/auth/profile');
export const changePassword = (data) => api.post('/auth/changepassword', data);

export const getContacts = (page = 0, size = 6) =>
    api.get(`/contact/getcontacts?page=${page}&size=${size}`);

export const searchContacts = (name, page = 0, size = 6) =>
    api.get(`/contact/search?name=${encodeURIComponent(name.trim())}&page=${page}&size=${size}`);

export const getContactById = (id) => api.get(`/contact/${id}`);
export const createContact = (data) => api.post('/contact/addcontact', data);
export const updateContact = (id, data) => api.put(`/contact/update/${id}`, data);
export const deleteContact = (id) => api.delete(`/contact/delete/${id}`);

export default api;