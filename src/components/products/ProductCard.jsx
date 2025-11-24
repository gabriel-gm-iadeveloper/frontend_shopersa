import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import resolveImageUrl from '../../utils/images';

// Función para formatear precios
const formatPrice = (price) => {
    return price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const hasOffer = !!product.precio_oferta && !!product.precio;
    const finalPrice = product.precio_oferta || product.precio;
    const id = product.idProducto || product.id;

    const rawPrimary = Array.isArray(product.imagenes)
        ? (product.imagenes[0]?.url || product.imagenes[0] || '/img/modelo.jpg')
        : (product.imagenUrl || product.imagen_url || '/img/modelo.jpg');
    const primaryImage = resolveImageUrl(rawPrimary);

    const discountPct = hasOffer
        ? Math.round(((product.precio - product.precio_oferta) / product.precio) * 100)
        : null;

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
    };

    const isDisabled = (typeof product.stock === 'number' && product.stock <= 0) || product.active === false || product.estado_producto === false;

    return (
        <motion.div
            className="card card-glass h-100"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
            <Link to={`/producto/${id}`} className="text-decoration-none text-reset">
                <div className="position-relative">
                    <div className="ratio ratio-1x1">
                        <img src={primaryImage} className="card-img-top object-fit-cover" alt={product.nombre} />
                    </div>
                    <div className="position-absolute bottom-0 start-0 end-0 p-2" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.35))' }}>
                        <h6 className="text-white mb-0">{product.nombre}</h6>
                    </div>
                    {discountPct && (
                        <span className="product-badge">-{discountPct}%</span>
                    )}
                </div>
            </Link>
            <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold text-danger">{formatPrice(finalPrice)}</span>
                    {hasOffer && (
                        <s className="price-old">{formatPrice(product.precio)}</s>
                    )}
                </div>
                <button className={`btn btn-ecom btn-modern w-100 mt-2 ${added ? 'btn-ecom-added' : ''}`} onClick={handleAdd} disabled={isDisabled}>
                    <i className={`bi ${added ? 'bi-check-lg' : 'bi-cart-plus'}`}></i> {added ? 'Agregado!' : 'Agregar'}
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;