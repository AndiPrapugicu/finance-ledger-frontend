import axios from "axios";
import { API_BASE_URL } from "../constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unknown error occurred";
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.detail || 
                    error.response.data?.message ||
                    `API Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Request made but no response
      errorMessage = "Cannot connect to API server. Is it running?";
    } else {
      // Request setup error
      errorMessage = `Request failed: ${error.message}`;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export class ImportService {
  static async uploadImport(csvFile: File, rulesFile?: File, force?: boolean) {
    const formData = new FormData();
    formData.append("csv", csvFile);
    if (rulesFile) formData.append("rules", rulesFile);
    if (force) formData.append("force", "1");

    const response = await apiClient.post("/import/", formData, {
      headers: { 
        "Content-Type": "multipart/form-data"
      },
    });
    // Some backend handlers return { status: 'ok', result: { ... } }
    // while others return the payload directly. Normalize to the inner result when present.
    if (response.data && typeof response.data === 'object' && 'result' in response.data) {
      return response.data.result;
    }
    return response.data;
  }
}

export default ImportService;
