import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import CenteredLoader from '@/components/CenteredLoader';

/**
 * Protected Route component that checks authentication
 * Redirects to login if user is not authenticated
 * @param {React.ReactNode} children - Child components to render
 * @param {string} requiredRole - Minimum role required to access this route
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { loading, hasRole, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <CenteredLoader fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">{t('auth.accessDenied')}</h1>
          <p className="text-gray-600">{t('auth.accessDeniedDescription')}</p>
          <Button type="link" onClick={() => navigate('/dashboard')} className="mt-2">
            {t('auth.returnToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return children;
}
