import axios from "axios";

const API_URL = "https://readhub-study.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//Api token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const backendApi = {
  getCloudinarySignature: async () => {
    const response = await api.get("/api/cloudinary-signature/pdf");
    return response.data;
  },

  getCoverSignature: async () => {
    const response = await api.get("/api/cloudinary-signature/image");
    return response.data;
  },

  saveBook: async (bookData) => {
    const response = await api.post("/api/book/upload", bookData);
    return response.data;
  },

  getBooks: async () => {
    const response = await api.get("/api/book");
    return response.data;
  },

  deleteBook: async (bookId) => {
    const response = await api.delete(`/api/book/${bookId}`);
    return response.data;
  },

  updateProgress: async (bookId, page) => {
    const response = await api.put(`/api/book/${bookId}`, {
      lastPageRead: page,
      status: "reading",
    });
    return response.data;
  },
};

export default api;
