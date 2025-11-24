import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';
import resolveImageUrl from '../../utils/images';

const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0'; // Manejo robusto de NaN
    return price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
    const [confirmClear, setConfirmClear] = useState({ show: false, loading: false });
    const navigate = useNavigate();

    const totalGeneral = cartItems.reduce((total, item) => {
        const price = item.precio_oferta || item.precio || 0;
        const quantity = item.cantidad || 1;
        return total + (price * quantity);
    }, 0);

    const [animatedTotal, setAnimatedTotal] = useState(totalGeneral);
    useEffect(() => {
        const start = animatedTotal;
        const end = totalGeneral;
        const duration = 600;
        const startTime = performance.now();
        const step = (now) => {
            const t = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setAnimatedTotal(Math.round(start + (end - start) * eased));
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [totalGeneral, animatedTotal]);

    const rowVariants = {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 }
    };

    const handleClearConfirm = () => {
        setConfirmClear({ show: true, loading: false });
    };

    const performClear = () => {
        setConfirmClear({ show: true, loading: true });
        clearCart();
        setConfirmClear({ show: false, loading: false });
    };

    return (
        <div className="container my-5">
            <div className="d-flex align-items-center mb-4">
                <h1 className="m-0"><i className="bi bi-cart3"></i> Carrito de Compras</h1>
                <motion.span className="ms-3 badge bg-dark" key={cartItems.length} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </motion.span>
            </div>
            <div className="card card-glass shadow">
                <div className="card-header bg-dark text-white">
                    <i className="bi bi-bag"></i> Tus Productos
                </div>
                <div className="card-body">
                    {cartItems.length === 0 ? (
                        <div className="text-center p-5">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="lead fw-semibold mb-3" style={{ color: 'var(--color-text)' }}>Tu carrito está vacío.</p>
                                <p className="text-muted mb-4">Agrega productos para verlos aquí.</p>
                                <Link to="/productos" className="btn btn-soft-primary">
                                    <i className="bi bi-search"></i> Ver productos
                                </Link>
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Producto</th>
                                            <th className="text-center">Cantidad</th>
                                            <th>Precio Unitario</th>
                                            <th>Subtotal</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {cartItems.map(item => {
                                                const id = item.id || item.idProducto;
                                                const cantidad = item.cantidad || 1;
                                                const precioUnitario = item.precio_oferta || item.precio || 0;

                                                return (
                                                    <motion.tr key={id} variants={rowVariants} initial="initial" animate="animate" exit="exit">
                                                        <td>
                                                            <img src={resolveImageUrl(item.imagenes?.[0]?.url || item.imagenes?.[0])} alt={item.nombre} width="80" className="img-fluid rounded shadow-sm" />
                                                        </td>
                                                        <td>{item.nombre}</td>
                                                        <td className="text-center">
                                                            <div className="input-group" style={{ maxWidth: '120px', margin: 'auto' }}>
                                                                <button 
                                                                    className="btn btn-outline-secondary btn-sm" 
                                                                    type="button"
                                                                    onClick={() => updateQuantity(id, cantidad - 1)}
                                                                > - </button>
                                                                <input 
                                                                    type="text" 
                                                                    className="form-control form-control-sm text-center" 
                                                                    value={cantidad} 
                                                                    readOnly 
                                                                />
                                                                <button 
                                                                    className="btn btn-outline-secondary btn-sm" 
                                                                    type="button"
                                                                    onClick={() => updateQuantity(id, cantidad + 1)}
                                                                > + </button>
                                                            </div>
                                                            <small className="text-muted">Stock: {item.stock}</small>
                                                        </td>
                                                        <td>{formatPrice(precioUnitario)}</td>
                                                        <td><strong>{formatPrice(precioUnitario * cantidad)}</strong></td>
                                                        <td>
                                                            <button className="btn btn-sm btn-soft-danger" onClick={() => removeFromCart(id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 gap-3">
                                <h4 className="m-0">Total: <motion.span key={animatedTotal} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>{formatPrice(totalGeneral)}</motion.span></h4>
                                <div>
                                    <button className="btn btn-ecom btn-modern me-2" onClick={() => navigate('/checkout')} disabled={cartItems.length === 0}>
                                        <i className="bi bi-credit-card"></i> Finalizar Compra
                                    </button>
                                    <button className="btn btn-soft-danger" onClick={handleClearConfirm}><i className="bi bi-trash"></i> Vaciar Carrito</button>
                                </div>
                            </div>

                            <ConfirmModal
                                show={confirmClear.show}
                                title="Vaciar carrito"
                                body="¿Deseas vaciar tu carrito? Esta acción no se puede deshacer."
                                confirmLabel="Vaciar"
                                confirmVariant="danger"
                                iconClass="bi bi-trash"
                                loading={confirmClear.loading}
                                onConfirm={performClear}
                                onCancel={() => setConfirmClear({ show: false, loading: false })}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;