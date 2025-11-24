import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion'; // AnimatePresence ya no es necesario aquí

const DashboardPage = () => {
    const { user } = useAuth();
    const adminName = user?.nombres || 'Administrador';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalProductos: 0,
        totalClientes: 0,
        ofertas: 0,
        novedades: 0,
        lowStock: [],
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data } = await apiClient.get('/admin/stats');
                setStats(data);
            } catch (err) {
                setError(err?.message || 'Error cargando estadísticas');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cardVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <main className="flex-grow-1 p-4">
            <h1>Bienvenido al Panel, <span className="text-primary">{adminName}</span></h1>
            <p>Aquí tienes un resumen general de tu tienda.</p>
            <hr className="my-4" />
            {error && <div className="alert alert-danger">{String(error)}</div>}
            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="row">
                        {/* ... (Las tarjetas de estadísticas se quedan igual, no hay cambios aquí) ... */}
                        {/* Total de Productos */}
                        <div className="col-md-6 col-lg-3 mb-4">
                            <motion.div className="card text-white bg-dark h-100" variants={cardVariants} initial="initial" animate="animate" whileHover={{ y: -2 }} transition={{ duration: 0.25 }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="card-title">Total de Productos</h5>
                                            <h2 className="display-6" id="total-productos">{stats.totalProductos}</h2>
                                        </div>
                                        <i className="bi bi-box-seam" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        {/* Clientes Registrados */}
                        <div className="col-md-6 col-lg-3 mb-4">
                            <motion.div className="card text-white bg-secondary h-100" variants={cardVariants} initial="initial" animate="animate" whileHover={{ y: -2 }} transition={{ duration: 0.25, delay: 0.05 }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="card-title">Clientes Registrados</h5>
                                            <h2 className="display-6" id="total-clientes">{stats.totalClientes}</h2>
                                        </div>
                                        <i className="bi bi-people-fill" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="col-md-6 col-lg-3 mb-4">
                            <motion.div className="card text-white bg-success h-100" variants={cardVariants} initial="initial" animate="animate" whileHover={{ y: -2 }} transition={{ duration: 0.25, delay: 0.1 }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="card-title">Ventas Totales</h5>
                                            <h2 className="display-6">{stats.totalVentas}</h2>
                                        </div>
                                        <i className="bi bi-receipt" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    
                    <div className="row">
                        {/* Ofertas activas */}
                        <div className="col-md-6 col-lg-3 mb-4">
                            <motion.div className="card text-white bg-danger h-100" variants={cardVariants} initial="initial" animate="animate" whileHover={{ y: -2 }} transition={{ duration: 0.25, delay: 0.1 }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="card-title">Productos en Oferta</h5>
                                            <h2 className="display-6">{stats.ofertas}</h2>
                                        </div>
                                        <i className="bi bi-fire" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        {/* Novedades */}
                        <div className="col-md-6 col-lg-3 mb-4">
                            <motion.div className="card text-white bg-info h-100" variants={cardVariants} initial="initial" animate="animate" whileHover={{ y: -2 }} transition={{ duration: 0.25, delay: 0.15 }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="card-title">Novedades</h5>
                                            <h2 className="display-6">{stats.novedades}</h2>
                                        </div>
                                        <i className="bi bi-stars" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>    
                        
                    {/* Tabla de stock crítico */}
                    <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <span><i className="bi bi-exclamation-triangle me-2"></i> Stock crítico</span>
                            <span className="badge bg-danger">{stats.lowStock?.length || 0} productos</span>
                        </div>
                        <div className="card-body">
                            {Array.isArray(stats.lowStock) && stats.lowStock.length === 0 ? (
                                <p className="text-muted m-0">Sin productos en estado crítico.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Stock</th>
                                                {/* Eliminamos la columna "Categoría" porque no viene en los datos */}
                                            </tr>
                                        </thead>
                                        {/* --- INICIO DE LA CORRECCIÓN --- */}
                                        <tbody>
                                            {stats.lowStock?.map((p) => (
                                                <motion.tr 
                                                    key={p.id} 
                                                    initial={{ opacity: 0, y: 6 }} 
                                                    animate={{ opacity: 1, y: 0 }}
                                                    // Quitamos el 'exit' que requiere AnimatePresence
                                                >
                                                    <td>{p.nombre}</td>
                                                    <td><span className="badge bg-danger">{p.stock}</span></td>
                                                    {/* Eliminamos la celda de categoría */}
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                        {/* --- FIN DE LA CORRECCIÓN --- */}
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </main>
    );
};

export default DashboardPage;