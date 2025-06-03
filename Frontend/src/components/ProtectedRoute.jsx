import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Define role-based route access
  const authorityRoutes = ['/authority-dashboard'];
  const userRoutes = ['/user-dashboard'];
  const currentPath = location.pathname;

  console.log('Current user role:', userRole); // Debug log
  console.log('Current path:', currentPath); // Debug log

  // Check if user is trying to access authority routes
  if (authorityRoutes.includes(currentPath)) {
    if (userRole !== 'authority') {
      console.log('Non-authority user trying to access authority route'); // Debug log
      return <Navigate to="/user-dashboard" />;
    }
  }

  // Check if authority is trying to access user routes
  if (userRoutes.includes(currentPath)) {
    if (userRole === 'authority') {
      console.log('Authority user trying to access user route'); // Debug log
      return <Navigate to="/authority-dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute; 