import apiClient from './apiClient';



export const RecursosService = {

  getRecursos: async (signal) => {
    const response = await apiClient.get('/posts', { signal });
    return response.data;

  },

  getRecursosById: async (id, signal) => {
    const response = await apiClient.get(`/posts/${id}`, { signal });
    return response.data;

  },

  createRecurso: async (data, signal) => {
    const response = await apiClient.post('/posts', data, { signal });
    return response.data;
  },

  updateRecurso: async (id, data, signal) => {
    const response = await apiClient.put(`/posts/${id}`, data, { signal });
    return response.data;
  },

  deleteRecurso: async (id, signal) => {
    const response = await apiClient.delete(`/posts/${id}`, { signal });
    return response.data;
  }

}