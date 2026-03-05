// Central API URL configuration
// In production (Netlify), set VITE_API_URL env var to your deployed backend URL
// For local development, defaults to localhost:5001
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001"
