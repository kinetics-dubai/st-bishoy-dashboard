import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '@/store/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading } = useSelector((state) => state.auth);

  const login = (userData, token) => {
    dispatch(loginAction({ user: userData, token }));
    navigate('/home', { replace: true });
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate('/login', { replace: true });
  };

  const hasRole = (requiredRole) => {
    if (!user || !user.roleDetails?.name) return false;
    
    const roleHierarchy = {
      'Super Admin': 3,
      'Admin': 2,
      'User': 1,
    };

    return roleHierarchy[user.roleDetails.name] >= roleHierarchy[requiredRole];
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
