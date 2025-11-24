import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';

// Helper para formatear fechas y precios
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CL');
const formatPrice = (price) => price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });

// Componente pequeño para mostrar el estado del envío con un color
const EstadoEnvioBadge = ({ estado }) => {
    let badgeClass = 'bg-secondary';
    if (estado?.toLowerCase().includes('enviado') || estado?.toLowerCase().includes('camino')) {
        badgeClass = 'bg-info text-dark';
    } else if (estado?.toLowerCase().includes('entregado') || estado?.toLowerCase().includes('listo')) {
        badgeClass = 'bg-success';
    } else if (estado?.toLowerCase().includes('preparación')) {
        badgeClass = 'bg-warning text-dark';
    }
    
    return <span className={`badge ${badgeClass}`}>{estado}</span>;
};

const ProfilePage = () => {
    const { user } = useAuth();
    const [compras, setCompras] = useState([]);
    // --- 1. AÑADIMOS ESTADO PARA GUARDAR LOS ENVÍOS ---
    const [envios, setEnvios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // --- 2. HACEMOS LAS DOS LLAMADAS EN PARALELO ---
                const [comprasRes, enviosRes] = await Promise.all([
                    apiClient.get('/ventas/mis-compras'),
                    apiClient.get('/envios/mis-envios')
                ]);
                
                setCompras(Array.isArray(comprasRes.data) ? comprasRes.data : []);
                setEnvios(Array.isArray(enviosRes.data) ? enviosRes.data : []);

            } catch (err) {
                setError('No se pudo cargar tu historial.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);
    
    // --- 3. CREAMOS UN MAPA PARA BUSCAR ENVÍOS RÁPIDAMENTE ---
    // Esto es mucho más eficiente que buscar en un array dentro de un loop.
    const enviosMap = useMemo(() => {
        const map = new Map();
        envios.forEach(envio => {
            if (envio.venta?.id) {
                map.set(envio.venta.id, envio);
            }
        });
        return map;
    }, [envios]);


    return (
        <div className="container my-5">
            <h1 className="mb-4">Mi Perfil</h1>

            <div className="row">
                {/* Columna de Datos del Usuario (sin cambios) */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-dark text-white">
                            <i className="bi bi-person-fill me-2"></i>
                            Mis Datos
                        </div>
                        <div className="card-body">
                            <p><strong>Nombre:</strong> {user?.nombres} {user?.apellidos}</p>
                            <p><strong>Email:</strong> {user?.email}</p>
                            <p><strong>RUN:</strong> {user?.rut || 'No especificado'}</p>
                            <p><strong>Teléfono:</strong> {user?.telefono || 'No especificado'}</p>
                            {/* Mostramos la dirección por defecto del perfil */}
                            <p className="mb-0"><strong>Dirección:</strong> {`${user?.direccion_calle || ''} ${user?.direccion_numero || ''}, ${user?.comuna || ''}, ${user?.region || ''}`}</p>
                        </div>
                    </div>
                </div>

                {/* Columna de Historial de Compras (CON CAMBIOS) */}
                <div className="col-md-8">
                    <div className="card shadow-sm">
                         <div className="card-header bg-dark text-white">
                            <i className="bi bi-receipt me-2"></i>
                            Mi Historial de Compras
                        </div>
                        <div className="card-body">
                            {loading ? <Spinner /> : error ? (
                                <div className="alert alert-danger">{error}</div>
                            ) : compras.length === 0 ? (
                                <p className="text-muted">Aún no has realizado ninguna compra.</p>
                            ) : (
                                <div className="accordion" id="accordionCompras">
                                    {compras.map((compra) => {
                                        // --- 4. BUSCAMOS EL ENVÍO ASOCIADO EN NUESTRO MAPA ---
                                        const envioAsociado = enviosMap.get(compra.id);
                                        
                                        return (
                                            <div className="accordion-item" key={compra.id}>
                                                <h2 className="accordion-header" id={`heading${compra.id}`}>
                                                    <button className="accordion-button collapsed d-flex justify-content-between" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${compra.id}`}>
                                                        <div className="flex-grow-1">
                                                            <span className="fw-bold">Compra #{compra.id}</span>
                                                            <small className="text-muted ms-2">{formatDate(compra.fecha_creacion)}</small>
                                                        </div>
                                                        <div className="ms-auto d-flex align-items-center gap-3">
                                                            {/* --- 5. MOSTRAMOS EL ESTADO DEL ENVÍO --- */}
                                                            {envioAsociado ? (
                                                                <EstadoEnvioBadge estado={envioAsociado.estado} />
                                                            ) : (
                                                                <span className="badge bg-secondary">Procesando</span>
                                                            )}
                                                            <span className="badge bg-success">{formatPrice(compra.total)}</span>
                                                        </div>
                                                    </button>
                                                </h2>
                                                <div id={`collapse${compra.id}`} className="accordion-collapse collapse" data-bs-parent="#accordionCompras">
                                                    <div className="accordion-body">
                                                        <h5>Detalles de la Compra:</h5>
                                                        <ul className="list-group mb-3">
                                                            {compra.detallesVenta.map(detalle => (
                                                                <li key={detalle.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                                    {detalle.producto.nombre} (x{detalle.cantidadVendido})
                                                                    <span>{formatPrice(detalle.precioUnitarioProducto * detalle.cantidadVendido)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        
                                                        {/* --- 6. MOSTRAMOS LOS DETALLES DEL ENVÍO --- */}
                                                        {envioAsociado && (
                                                            <>
                                                                <h5>Detalles del Envío:</h5>
                                                                <p className="mb-1"><strong>Método:</strong> {envioAsociado.tipoEnvio.nombre}</p>
                                                                <p className="mb-0"><strong>Dirección:</strong> {envioAsociado.direccion}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;