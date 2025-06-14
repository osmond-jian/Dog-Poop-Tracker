// API Configuration - Easy to modify for different environments
export const API_CONFIG = {
  // Development endpoint - change this to your production API
  UPLOAD_ENDPOINT: 'https://api.example.com/dog-poop-upload',
  
  // Alternative endpoints for different environments
  ENDPOINTS: {
    development: 'http://localhost:3001/api/dog-poop-upload',
    staging: 'https://staging-api.example.com/dog-poop-upload',
    production: 'https://api.example.com/dog-poop-upload'
  },
  
  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Headers
  getHeaders: () => ({
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json',
    // Add authentication headers here if needed
    // 'Authorization': `Bearer ${getAuthToken()}`
  })
};

// Helper function to get current endpoint
export const getCurrentEndpoint = (): string => {
  const env = import.meta.env.MODE || 'development';
  return API_CONFIG.ENDPOINTS[env as keyof typeof API_CONFIG.ENDPOINTS] || API_CONFIG.UPLOAD_ENDPOINT;
};