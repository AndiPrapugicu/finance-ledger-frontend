import { 
  createContext, 
  useReducer, 
  useEffect, 
  type ReactNode 
} from 'react';
import type { 
  AuthState, 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthError 
} from '../types/auth';
import { authService } from '../services/authService';

// Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context type
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = authService.getStoredToken();
      
      if (token && authService.isTokenValid()) {
        dispatch({ type: 'AUTH_START' });
        
        try {
          const user = await authService.getCurrentUser();
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { user, token } 
          });
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          dispatch({ 
            type: 'AUTH_ERROR', 
            payload: { message: 'Session expired' } 
          });
        }
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const { user, token } = await authService.login(credentials);
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: { 
          message: error instanceof Error ? error.message : 'Login failed' 
        }
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const { user, token } = await authService.register(userData);
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user, token } 
      });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: { 
          message: error instanceof Error ? error.message : 'Registration failed' 
        }
      });
      throw error;
    }
  };

  const logout = async () => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      await authService.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: updatedUser 
      });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: { 
          message: error instanceof Error ? error.message : 'Profile update failed' 
        }
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}