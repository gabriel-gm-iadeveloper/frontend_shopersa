// src/routes/ClientProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ClientProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Si no está logueado, lo mandamos al login, guardando la página que quería visitar
    return <Navigate to="/iniciosesion" state={{ from: location }} replace />;
  }

  return children;
};

export default ClientProtectedRoute;