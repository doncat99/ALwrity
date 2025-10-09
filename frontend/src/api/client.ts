import axios from 'axios';

// Optional token getter installed from within the app after Clerk is available
let authTokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  authTokenGetter = getter;
};

// Get API URL from environment variables
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the environment variable or fallback
    return process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL;
  }
  return ''; // Use proxy in development
};

// Create a shared axios instance for all API calls
export const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 60000, // Increased to 60 seconds for regular API calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a specialized client for AI operations with extended timeout
export const aiApiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 180000, // 3 minutes timeout for AI operations (matching 20-25 second responses)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a specialized client for long-running operations like SEO analysis
export const longRunningApiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 300000, // 5 minutes timeout for SEO analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a specialized client for polling operations with reasonable timeout
export const pollingApiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 60000, // 60 seconds timeout for polling status checks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging (optional)
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    try {
      const token = authTokenGetter ? await authTokenGetter() : null;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // non-fatal
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with automatic token refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't retried yet, try to refresh token and retry
    if (error?.response?.status === 401 && !originalRequest._retry && authTokenGetter) {
      originalRequest._retry = true;
      
      try {
        // Get fresh token
        const newToken = await authTokenGetter();
        if (newToken) {
          // Update the request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          // Retry the request
          return apiClient(originalRequest);
        }
      } catch (retryError) {
        console.error('Token refresh failed:', retryError);
      }
      
      // If retry failed and not in onboarding, redirect
      const isOnboardingRoute = window.location.pathname.includes('/onboarding') || 
                                 window.location.pathname === '/';
      if (!isOnboardingRoute) {
        try { window.location.assign('/'); } catch {}
      } else {
        console.warn('401 Unauthorized - token refresh failed');
      }
    }
    
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Add interceptors for AI client
aiApiClient.interceptors.request.use(
  async (config) => {
    console.log(`Making AI ${config.method?.toUpperCase()} request to ${config.url}`);
    try {
      const token = authTokenGetter ? await authTokenGetter() : null;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

aiApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't retried yet, try to refresh token and retry
    if (error?.response?.status === 401 && !originalRequest._retry && authTokenGetter) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authTokenGetter();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return aiApiClient(originalRequest);
        }
      } catch (retryError) {
        console.error('Token refresh failed:', retryError);
      }
      
      const isOnboardingRoute = window.location.pathname.includes('/onboarding') || 
                                 window.location.pathname === '/';
      if (!isOnboardingRoute) {
        try { window.location.assign('/'); } catch {}
      } else {
        console.warn('401 Unauthorized - token refresh failed');
      }
    }
    
    console.error('AI API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Add interceptors for long-running client
longRunningApiClient.interceptors.request.use(
  async (config) => {
    console.log(`Making long-running ${config.method?.toUpperCase()} request to ${config.url}`);
    try {
      const token = authTokenGetter ? await authTokenGetter() : null;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

longRunningApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // Only redirect on 401 if we're not in onboarding flow
      const isOnboardingRoute = window.location.pathname.includes('/onboarding') || 
                                 window.location.pathname === '/';
      if (!isOnboardingRoute) {
        try { window.location.assign('/'); } catch {}
      } else {
        console.warn('401 Unauthorized during onboarding - token may need refresh');
      }
    }
    console.error('Long-running API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Add interceptors for polling client
pollingApiClient.interceptors.request.use(
  async (config) => {
    console.log(`Making polling ${config.method?.toUpperCase()} request to ${config.url}`);
    try {
      const token = authTokenGetter ? await authTokenGetter() : null;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

pollingApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // Only redirect on 401 if we're not in onboarding flow
      const isOnboardingRoute = window.location.pathname.includes('/onboarding') || 
                                 window.location.pathname === '/';
      if (!isOnboardingRoute) {
        try { window.location.assign('/'); } catch {}
      } else {
        console.warn('401 Unauthorized during onboarding - token may need refresh');
      }
    }
    console.error('Polling API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
); 