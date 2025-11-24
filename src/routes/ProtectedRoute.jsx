import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdmin = (user?.isAdmin ?? user?.admin ?? false) || (String(user?.role).toUpperCase() === 'ADMIN');
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/iniciosesion" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;