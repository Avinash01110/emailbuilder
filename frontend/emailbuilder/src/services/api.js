// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const emailService = {
  // Fetch email layout
  getEmailLayout: async () => {
    try {
      const response = await api.get('/getEmailLayout');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch email layout');
    }
  },

  getEmailId: async (id) => {
    try {
      const response = await api.get(`/email/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch email template');
    }
  },

  updateEmailId: async (id, data) => {
    try {
      const response = await api.put(`/email/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update email template');
    }
  },

  // Upload image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/uploadImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  },

  // Save email configuration
  saveEmailConfig: async (config) => {
    try {
      const response = await api.post('/uploadEmailConfig', config);
      return response.data;
    } catch (error) {
      throw new Error('Failed to save email configuration');
    }
  },

  // Download rendered template
  downloadTemplate: async (id) => {
    try {
      const response = await api.get(`/renderAndDownloadTemplate/${id}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `email-template-${id}.html`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      throw new Error('Failed to download template');
    }
  },
};

export default emailService;