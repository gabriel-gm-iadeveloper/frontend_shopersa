// src/components/layout/Header.jsx
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ThemeToggle from '../common/ThemeToggle';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();

  // Determinar ruta de perfil según rol
  const profilePath = user?.isAdmin ? '/admin' : '/perfil';

  return (
    <header className="main-header">
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/"><img src="/img/logo2.png" alt="Logo ShopPersa" className="logo-navbar" /></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span className="navbar-toggler-icon"></span></button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/productos">Productos</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/nosotros">Nosotros</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/contacto">Contacto</NavLink></li>
            </ul>
            <ul className="navbar-nav">
              {/* --- AQUÍ EL CAMBIO: Agregamos 'gap-3' para separar los íconos --- */}
              <div className="navbar-nav align-items-center gap-3">
                
                <li className="nav-item">
                    <NavLink className="nav-link position-relative" to="/carrito">
                        <i className="bi bi-cart3" style={{ fontSize: '1.2rem' }}></i> 
                        {cartCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.7rem'}}>
                                {cartCount}
                            </span>
                        )}
                    </NavLink>
                </li>
                
                <li className="nav-item"><ThemeToggle /></li>
                
                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                        <Link className="nav-link fw-bold text-warning" to={profilePath}>
                            <i className="bi bi-person-circle me-1"></i> Hola, {user?.nombres}
                        </Link>
                    </li>
                    <li className="nav-item">
                        {/* Quitamos el ms-2 porque el gap-3 ya hace el trabajo */}
                        <button className="btn btn-outline-light btn-sm" onClick={logout}>
                            <i className="bi bi-box-arrow-right"></i> Salir
                        </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item"><NavLink className="nav-link" to="/iniciosesion">Iniciar Sesión</NavLink></li>
                    <li className="nav-item"><NavLink className="nav-link" to="/registro">Registro</NavLink></li>
                  </>
                )}
                
              </div>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};
export default Header;