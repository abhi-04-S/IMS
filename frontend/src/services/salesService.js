import api from './api';

const salesService = {
  create: async (data) => {
    const response = await api.post('/sales', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/sales');
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/sales/summary');
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/sales/daterange?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
};

export default salesService;