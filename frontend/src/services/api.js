import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://eventflow-u7tx.onrender.com",
});

// Add token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ UPDATED: Added /api prefix to all endpoints
// Auth API
export const register = (userData) => API.post("/api/auth/register", userData);
export const login = (userData) => API.post("/api/auth/login", userData);
export const getCurrentUser = () => API.get("/api/auth/me");

// Events API
export const fetchEvents = (page = 1, limit = 10) => 
  API.get(`/api/events?page=${page}&limit=${limit}`);
export const createEvent = (eventData) => API.post("/api/events", eventData);
export const fetchEvent = (id) => API.get(`/api/events/${id}`);
export const updateEvent = (id, eventData) => API.put(`/api/events/${id}`, eventData);
export const deleteEvent = (id) => API.delete(`/api/events/${id}`);

// RSVP API
export const createRSVP = (rsvpData) => API.post("/api/rsvps", rsvpData);
export const fetchMyRSVPs = () => API.get("/api/rsvps/my-rsvps");
export const fetchEventRSVPs = (eventId) => API.get(`/api/rsvps/event/${eventId}`);

export default API;
