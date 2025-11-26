import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
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

// Auth API
export const register = (userData) => API.post("/auth/register", userData);
export const login = (userData) => API.post("/auth/login", userData);
export const getCurrentUser = () => API.get("/auth/me");

// Events API
export const fetchEvents = (page = 1, limit = 10) => 
  API.get(`/events?page=${page}&limit=${limit}`);
export const createEvent = (eventData) => API.post("/events", eventData);
export const fetchEvent = (id) => API.get(`/events/${id}`);
export const updateEvent = (id, eventData) => API.put(`/events/${id}`, eventData);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// RSVP API
export const createRSVP = (rsvpData) => API.post("/rsvps", rsvpData);
export const fetchMyRSVPs = () => API.get("/rsvps/my-rsvps");
export const fetchEventRSVPs = (eventId) => API.get(`/rsvps/event/${eventId}`);

export default API;
