import api from './api';

const recipeService = {
  getRecipes: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await api.get(`/recipes?${queryParams.toString()}`);
    return response.data;
  },
  
  getRecipe: async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },
  
  createRecipe: async (formData) => {
    const response = await api.post('/recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  updateRecipe: async (id, formData) => {
    const response = await api.put(`/recipes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  getUserRecipes: async () => {
    const response = await api.get('/users/recipes');
    return response.data;
  },
  
  getUserFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },
  
  addComment: async (recipeId, content) => {
    const response = await api.post(`/recipes/${recipeId}/comments`, { content });
    return response.data;
  },
  
  getComments: async (recipeId) => {
    const response = await api.get(`/recipes/${recipeId}/comments`);
    return response.data;
  },
  
  rateRecipe: async (recipeId, rating) => {
    const response = await api.post(`/recipes/${recipeId}/ratings`, { rating });
    return response.data;
  },
  
  toggleFavorite: async (recipeId) => {
    const response = await api.post(`/recipes/${recipeId}/favorite`);
    return response.data;
  }
};

export default recipeService;
