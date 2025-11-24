// src/routes/AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import ProductsPage from '../pages/public/ProductsPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import CartPage from '../pages/public/CartPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import TermsPage from '../pages/public/TermsPage';
import ProfilePage from '../pages/public/ProfilePage';
import CheckoutPage from '../pages/public/CheckoutPage';


// Admin Pages
import DashboardPage from '../pages/admin/DashboardPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import ProtectedRoute from './ProtectedRoute';
import SalesManagementPage from '../pages/admin/SalesManagementPage';
import ClientProtectedRoute from './ClientProtectedRoute'; // <-- 2. IMPORTAR EL NUEVO PROTECTOR

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* --- Rutas Públicas y de Clientes --- */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="producto/:id" element={<ProductDetailPage />} />
          <Route path="nosotros" element={<AboutPage />} />
          <Route path="contacto" element={<ContactPage />} />
          <Route path="iniciosesion" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="terminos" element={<TermsPage />} />
          
          {/* --- RUTAS PROTEGIDAS PARA CLIENTES LOGUEADOS --- */}
          <Route path="carrito" element={<CartPage />} /> {/* Carrito es para todos, pero lo ponemos aquí por orden */}
          <Route 
            path="perfil" 
            element={
              <ClientProtectedRoute>
                <ProfilePage />
              </ClientProtectedRoute>
            } 
          />
          <Route 
            path="checkout" 
            element={<ClientProtectedRoute><CheckoutPage /></ClientProtectedRoute>} 
          />
        </Route>
       

        {/* --- Rutas de Administración Protegidas --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="productos" element={<ProductManagementPage />} />
          <Route path="usuarios" element={<UserManagementPage />} />
          <Route path="ventas" element={<SalesManagementPage />} />
        </Route>
        
      </Routes>
    </Router>
  );
};