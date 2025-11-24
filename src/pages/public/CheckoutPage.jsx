import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0';
    return price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [direccionEnvio, setDireccionEnvio] = useState({
        calle: user?.direccion_calle || '',
        numero: user?.direccion_numero || '',
        comuna: user?.comuna || '',
        region: user?.region || '',
    });

    const [tiposEnvio, setTiposEnvio] = useState([]);
    const [selectedEnvioId, setSelectedEnvioId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTiposEnvio = async () => {
            try {
                const { data } = await apiClient.get('/tipos-envio');
                setTiposEnvio(data);
                const despacho = data.find(d => d.nombre.toLowerCase().includes('domicilio'));
                if (despacho) setSelectedEnvioId(despacho.id);
            } catch (err) {
                setError('No se pudieron cargar las opciones de envío.');
            }
        };
        fetchTiposEnvio();
    }, []);
    
    const selectedEnvio = useMemo(() => 
        tiposEnvio.find(e => e.id === Number(selectedEnvioId)),
        [selectedEnvioId, tiposEnvio]
    );

    const requiresAddress = useMemo(() => 
        selectedEnvio && !selectedEnvio.nombre.toLowerCase().includes('retiro'),
        [selectedEnvio]
    );

    const handleDireccionChange = (e) => {
        const { name, value } = e.target;
        setDireccionEnvio(prev => ({...prev, [name]: value}));
    };

    const subtotal = useMemo(() => 
        cartItems.reduce((total, item) => {
            const price = item.precio_oferta || item.precio || 0;
            const quantity = item.cantidad || 1;
            return total + (price * quantity);
        }, 0),
        [cartItems]
    );

    const costoEnvio = useMemo(() => selectedEnvio?.costo || 0, [selectedEnvio]);
    const totalGeneral = subtotal + costoEnvio;
    
    const totalItems = useMemo(() => 
        cartItems.reduce((count, item) => count + (item.cantidad || 1), 0),
        [cartItems]
    );

    const handleRealizarPedido = async () => {
        if (!selectedEnvioId) {
            toast.error('Por favor, selecciona un método de envío.');
            return;
        }

        if (requiresAddress && (!direccionEnvio.calle || !direccionEnvio.numero || !direccionEnvio.comuna || !direccionEnvio.region)) {
            toast.error('Para despacho a domicilio, por favor completa todos los campos de la dirección.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const ventaDTO = {
                detalles: cartItems.map(item => ({
                    productoId: item.id || item.idProducto,
                    cantidad: item.cantidad || 1
                })),
                total: totalGeneral // <-- AÑADIR ESTA LÍNEA
            };
        
            const ventaResponse = await apiClient.post('/ventas', ventaDTO);
            const nuevaVenta = ventaResponse.data;
            
            const direccionParaEnvio = requiresAddress 
                ? `${direccionEnvio.calle} ${direccionEnvio.numero}, ${direccionEnvio.comuna}, ${direccionEnvio.region}`
                : "Retiro en Tienda";

            const envioDTO = {
                ventaId: nuevaVenta.id,
                tipoEnvioId: Number(selectedEnvioId),
                direccion: direccionParaEnvio
            };
            await apiClient.post('/envios', envioDTO);

            toast.success('¡Compra realizada con éxito!');
            clearCart();
            navigate('/perfil');

        } catch (err) {
            // --- ESTE ES EL CAMBIO ---
            // Imprimimos en la consola el error COMPLETO que viene del backend
            console.error("ERROR DETALLADO DEL BACKEND:", err.response?.data || err.message);
            
            // Mostramos al usuario un mensaje más específico si el backend lo envía
            const backendError = err.response?.data?.message || err.response?.data;
            setError(backendError || 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
            
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !loading) {
        return (
            <div className="container my-5 text-center">
                <h2>Tu carrito está vacío</h2>
                <Link to="/productos" className="btn btn-primary mt-3">Volver a la tienda</Link>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h1>Finalizar Compra</h1>
            <div className="row g-5">
                <div className="col-md-5 col-lg-4 order-md-last">
                    <h4 className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-primary">Tu Carrito</span>
                        <span className="badge bg-primary rounded-pill">{totalItems}</span>
                    </h4>
                    <ul className="list-group mb-3">
                        {cartItems.map(item => {
                            const price = item.precio_oferta || item.precio || 0;
                            const quantity = item.cantidad || 1;
                            return (
                                <li key={item.id || item.idProducto} className="list-group-item d-flex justify-content-between lh-sm">
                                    <div>
                                        <h6 className="my-0">{item.nombre}</h6>
                                        <small className="text-muted">Cantidad: {quantity}</small>
                                    </div>
                                    <span className="text-muted">{formatPrice(price * quantity)}</span>
                                </li>
                            );
                        })}
                        <li className="list-group-item d-flex justify-content-between">
                            <span>Subtotal</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span>Envío</span>
                            <strong>{formatPrice(costoEnvio)}</strong>
                        </li>
                        <li className="list-group-item d-flex justify-content-between bg-light">
                            <span className="text-success">Total (CLP)</span>
                            <strong className="text-success">{formatPrice(totalGeneral)}</strong>
                        </li>
                    </ul>
                </div>

                <div className="col-md-7 col-lg-8">
                    <h4 className="mb-3">Método de Envío</h4>
                    <div className="my-3">
                        {tiposEnvio.map(tipo => (
                            <div className="form-check" key={tipo.id}>
                                <input id={`envio-${tipo.id}`} name="tipoEnvio" type="radio" className="form-check-input" value={tipo.id} checked={selectedEnvioId === tipo.id} onChange={(e) => setSelectedEnvioId(Number(e.target.value))} required />
                                <label className="form-check-label" htmlFor={`envio-${tipo.id}`}>{tipo.nombre} ({formatPrice(tipo.costo)})</label>
                            </div>
                        ))}
                    </div>

                    <AnimatePresence>
                        {requiresAddress && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <h4 className="mb-3 mt-4">Dirección de Despacho</h4>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label htmlFor="nombreCompleto" className="form-label">Nombre Completo</label>
                                        <input type="text" className="form-control" id="nombreCompleto" value={`${user?.nombres || ''} ${user?.apellidos || ''}`} readOnly disabled />
                                    </div>
                                    <div className="col-sm-8">
                                        <label htmlFor="calle" className="form-label">Calle</label>
                                        <input type="text" className="form-control" id="calle" name="calle" value={direccionEnvio.calle} onChange={handleDireccionChange} required />
                                    </div>
                                    <div className="col-sm-4">
                                        <label htmlFor="numero" className="form-label">Número</label>
                                        <input type="text" className="form-control" id="numero" name="numero" value={direccionEnvio.numero} onChange={handleDireccionChange} required />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="comuna" className="form-label">Comuna</label>
                                        <input type="text" className="form-control" id="comuna" name="comuna" value={direccionEnvio.comuna} onChange={handleDireccionChange} required />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="region" className="form-label">Región</label>
                                        <input type="text" className="form-control" id="region" name="region" value={direccionEnvio.region} onChange={handleDireccionChange} required />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {!requiresAddress && selectedEnvio && (
                        <div className="alert alert-info mt-4">
                            <h5 className="alert-heading">Información de Retiro</h5>
                            <p>Podrás retirar tu pedido en <strong>Persa Teniente Cruz, Pudahuel</strong>.</p>
                        </div>
                    )}

                    <hr className="my-4" />
                    
                    {error && <div className="alert alert-danger">{error}</div>}

                    <button className="w-100 btn btn-primary btn-lg" onClick={handleRealizarPedido} disabled={loading || !selectedEnvioId}>
                        {loading ? <Spinner /> : `Pagar ${formatPrice(totalGeneral)}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;