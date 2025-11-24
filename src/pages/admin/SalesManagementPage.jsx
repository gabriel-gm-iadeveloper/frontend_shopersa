import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-hot-toast';

// Helpers de formato
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatPrice = (price) => price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });

const SalesManagementPage = () => {
    const [ventas, setVentas] = useState([]);
    const [envios, setEnvios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    
    // 1. Estado para el buscador
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [ventasRes, enviosRes] = await Promise.all([
                apiClient.get('/ventas'),
                apiClient.get('/envios')
            ]);
            setVentas(Array.isArray(ventasRes.data) ? ventasRes.data : []);
            setEnvios(Array.isArray(enviosRes.data) ? enviosRes.data : []);
        } catch (err) {
            setError('No se pudieron cargar los datos. Asegúrate de tener permisos de Administrador.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const enviosMap = useMemo(() => {
        const map = new Map();
        envios.forEach(envio => {
            if (envio.venta?.id) {
                map.set(envio.venta.id, envio);
            }
        });
        return map;
    }, [envios]);

    // 2. Lógica de Filtrado y Ordenamiento
    const ventasFiltradas = useMemo(() => {
        let procesadas = [...ventas];

        // Ordenar: Más reciente arriba (ID descendente)
        procesadas.sort((a, b) => b.id - a.id);

        // Filtrar por ID de cliente
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            procesadas = procesadas.filter(venta => {
                const clienteId = String(venta.usuario?.id || '');
                return clienteId.includes(query);
            });
        }

        return procesadas;
    }, [ventas, searchQuery]);

    const handleEstadoChange = async (envioId, nuevoEstado) => {
        setUpdatingStatus(envioId);
        try {
            await apiClient.patch(`/envios/${envioId}/estado`, { estado: nuevoEstado });
            toast.success(`Estado del envío #${envioId} actualizado a "${nuevoEstado}"`);
            await fetchData();
        } catch (err) {
            toast.error('No se pudo actualizar el estado.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    return (
        <div className="container my-5">
            <h1 className="mb-4">Gestión de Ventas y Envíos</h1>
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <div>
                        <i className="bi bi-receipt me-2"></i>
                        Listado de Todas las Ventas
                    </div>
                    
                    {/* 3. Input del Buscador */}
                    <div className="d-flex gap-2">
                        <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Buscar por ID Cliente..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '200px' }}
                        />
                        <button className="btn btn-light btn-sm" onClick={fetchData} title="Recargar">
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <Spinner />
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>ID Venta</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Estado del Envío</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                No se encontraron ventas.
                                            </td>
                                        </tr>
                                    ) : (
                                        ventasFiltradas.map(venta => {
                                            const envioAsociado = enviosMap.get(venta.id);
                                            const esRetiro = envioAsociado?.tipoEnvio?.nombre.toLowerCase().includes('retiro');
                                            const opcionesEstado = esRetiro
                                                ? ["En preparación", "Listo para retiro", "Entregado"]
                                                : ["En preparación", "Enviado", "Entregado"];

                                            return (
                                                <tr key={venta.id}>
                                                    <td><strong>#{venta.id}</strong></td>
                                                    <td>{formatDate(venta.fecha_creacion)}</td>
                    
                                                    <td>Cliente ID: {venta.usuario?.id || 'N/A'}</td>

                                                    <td>{formatPrice(venta.total)}</td>
                                                    <td>
                                                        {envioAsociado ? (
                                                            <select 
                                                                className="form-select form-select-sm" 
                                                                value={envioAsociado.estado}
                                                                onChange={(e) => handleEstadoChange(envioAsociado.id, e.target.value)}
                                                                disabled={updatingStatus === envioAsociado.id}
                                                            >
                                                                {opcionesEstado.map(opcion => (
                                                                    <option key={opcion} value={opcion}>{opcion}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span className="badge bg-secondary">Sin Envío Asociado</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesManagementPage;