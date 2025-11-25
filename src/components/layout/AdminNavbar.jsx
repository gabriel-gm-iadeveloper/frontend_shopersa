// src/components/layout/AdminNavbar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const AdminNavbar = () => {
    const { user, logout } = useAuth();

    return (
        <header>
            <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/"><img src="/img/logo2.png" alt="Logo Persa" style={{ height: '50px' }} /></Link>
                    
                    {/* El Botón Toggler */}
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#adminNav" 
                        aria-controls="adminNav" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    

                    <div className="collapse navbar-collapse" id="adminNav">
                        <ul className="navbar-nav mx-auto">
                           {/* ... links existentes ... */}
                            <li className="nav-item"><NavLink to="/admin" className="nav-link" end><i className="bi bi-house"></i> Dashboard</NavLink></li>
                            <li className="nav-item"><NavLink to="/admin/productos" className="nav-link"><i className="bi bi-box-seam"></i> Productos</NavLink></li>
                            <li className="nav-item"><NavLink to="/admin/usuarios" className="nav-link"><i className="bi bi-people"></i> Usuarios</NavLink></li>
                            <li className="nav-item"><NavLink to="/admin/ventas" className="nav-link"><i className="bi bi-receipt"></i> Ventas</NavLink></li>
                        </ul>
                        <ul className="navbar-nav align-items-center">
                            {/* CAMBIO: Link al dashboard/perfil admin */}
                            <li className="nav-item">
                                <Link to="/admin" className="nav-link fw-bold text-info">
                                    Admin: {user?.nombres}
                                </Link>
                            </li>
                            <li className="nav-item"><ThemeToggle /></li>
                            <li className="nav-item"><button className="btn btn-outline-light ms-2" onClick={logout}><i className="bi bi-box-arrow-right"></i></button></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default AdminNavbar;
