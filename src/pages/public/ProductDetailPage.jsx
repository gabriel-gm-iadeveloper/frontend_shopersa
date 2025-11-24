import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import { useCart } from '../../context/CartContext';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import resolveImageUrl from '../../utils/images';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomSrc, setZoomSrc] = useState(null);
    const [added, setAdded] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { addToCart } = useCart();

    const images = React.useMemo(() => {
        const raw = Array.isArray(product?.imagenes)
            ? product?.imagenes
            : [product?.imagen_principal, product?.imagen1, product?.imagen2, product?.imagen3, product?.imagen_url, product?.imagen];
        return (raw || [])
            .map((img) => typeof img === 'string' ? img : (img?.url || img?.path || null))
            .filter(Boolean)
            .slice(0, 3)
            .map((src) => resolveImageUrl(src));
    }, [product]);

    useEffect(() => {
        if (images.length === 0) return;
        if (selectedIndex >= images.length) setSelectedIndex(0);
    }, [images.length, selectedIndex]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await apiClient.get(`/productos/${id}`);
                setProduct(response.data);
                setError(null);
            } catch (err) {
                console.error('Error al cargar el detalle del producto:', err);
                setError('Producto no encontrado.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <Spinner />;
    if (error) return <div className="alert alert-danger text-center my-5"><h2>{error}</h2><Link to="/productos">Volver a la tienda</Link></div>;
    if (!product) return null;

    const isActive = (
        product.estado_producto !== undefined ? product.estado_producto :
        product.estadoProducto !== undefined ? product.estadoProducto :
        true
    );

    if (!isActive) {
        return (
            <div className="container my-5">
                <div className="alert alert-warning text-center">
                    <h2>Producto no disponible</h2>
                    <p>Este producto está desactivado actualmente.</p>
                    <Link to="/productos" className="btn btn-primary mt-3">Volver a la tienda</Link>
                </div>
            </div>
        );
    }

    const finalPrice = product.es_oferta && product.precio_oferta ? product.precio_oferta : product.precio;
    const hasOffer = Boolean(product.es_oferta && product.precio && product.precio_oferta);
    const discountPct = hasOffer ? Math.round(((product.precio - product.precio_oferta) / product.precio) * 100) : null;

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };

    const goPrev = () => setSelectedIndex((i) => (i - 1 + images.length) % images.length);
    const goNext = () => setSelectedIndex((i) => (i + 1) % images.length);

    // --- FUNCIÓN PARA RENDERIZAR ESPECIFICACIONES SEGÚN CATEGORÍA ---
    const renderProductSpecs = () => {
        const catName = product.categoria?.nombre?.toLowerCase() || '';
        let specs = [];

        // Campos comunes
        if (product.marca) specs.push({ label: 'Marca', value: product.marca });
        if (product.codigo_producto) specs.push({ label: 'Código', value: product.codigo_producto });

        // Campos específicos
        if (catName === 'ropa') {
            if (product.tipo_ropa) specs.push({ label: 'Tipo de Prenda', value: product.tipo_ropa });
            if (product.talla) specs.push({ label: 'Talla', value: product.talla });
            if (product.genero) specs.push({ label: 'Género', value: product.genero });
        } else if (catName === 'juguetes') {
            if (product.tipo_juguete) specs.push({ label: 'Tipo de Juguete', value: product.tipo_juguete });
            if (product.tamano) specs.push({ label: 'Tamaño', value: product.tamano });
        } else if (catName === 'decoración' || catName === 'decoracion' || catName === 'hogar') {
            if (product.material) specs.push({ label: 'Material', value: product.material });
            if (product.tamano) specs.push({ label: 'Tamaño', value: product.tamano });
        } else if (catName === 'tecnología' || catName === 'tecnologia') {
             // Aquí podrías agregar campos si tecnología tuviera específicos en el futuro
        }

        if (specs.length === 0) return null;

        return (
            <div className="bg-light p-3 rounded mb-4 border">
                <h6 className="fw-bold mb-2">Características:</h6>
                <ul className="list-unstyled mb-0" style={{ fontSize: '0.9rem' }}>
                    {specs.map((spec, index) => (
                        <li key={index} className="mb-1">
                            <strong>{spec.label}:</strong> {spec.value}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
    // ----------------------------------------------------------------

    return (
        <div className="container my-5">
            <div className="row g-4">
                <div className="col-lg-7">
                    {images.length > 0 ? (
                        <div className="d-flex gap-3 align-items-start product-gallery">
                            <div className="d-flex flex-column gap-2 gallery-thumbs">
                                {images.map((src, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`thumb-premium ${selectedIndex === idx ? 'thumb-active' : ''}`}
                                        onClick={() => setSelectedIndex(idx)}
                                        aria-label={`Ver imagen ${idx + 1}`}
                                    >
                                        <img src={src} alt={`${product.nombre}-mini-${idx}`} />
                                    </button>
                                ))}
                            </div>
                            <div className="flex-grow-1 position-relative gallery-viewer">
                                <img
                                    src={images[selectedIndex]}
                                    className="img-fluid rounded shadow-sm"
                                    alt={`${product.nombre}-${selectedIndex}`}
                                    onClick={() => setZoomSrc(images[selectedIndex])}
                                    style={{ cursor: 'zoom-in' }}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button type="button" className="btn-gallery-nav prev" onClick={goPrev} aria-label="Anterior"><i className="bi bi-chevron-left"></i></button>
                                        <button type="button" className="btn-gallery-nav next" onClick={goNext} aria-label="Siguiente"><i className="bi bi-chevron-right"></i></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <img src="/img/modelo.jpg" className="img-fluid rounded shadow-sm" alt={product.nombre} />
                    )}
                </div>
                <div className="col-lg-5">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <h1 className="h2 m-0">{product.nombre}</h1>
                        {discountPct && <span className="badge bg-danger">-{discountPct}%</span>}
                    </div>

                    <div className="d-flex align-items-end gap-3 mb-3">
                        <span className="display-6 text-danger fw-bold">{finalPrice?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                        {hasOffer && (
                            <s className="text-muted">{product.precio?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</s>
                        )}
                    </div>

                    <p className="text-muted mb-3">{product.descripcion || 'Producto sin descripción disponible.'}</p>

                    {/* --- AQUÍ INSERTAMOS LA FICHA TÉCNICA --- */}
                    {renderProductSpecs()}
                    {/* ---------------------------------------- */}

                    <div className="d-flex align-items-center gap-2 mb-3">
                        {typeof product.stock === 'number' && (
                            product.stock > 0 ? (
                                <span className="badge bg-success">{product.stock} disponibles</span>
                            ) : (
                                <span className="badge bg-secondary">Sin stock</span>
                            )
                        )}
                        {product.categoria?.nombre && (
                            <span className="badge bg-dark">{product.categoria.nombre}</span>
                        )}
                    </div>

                    <button className={`btn btn-ecom btn-modern ${added ? 'btn-ecom-added' : ''}`} onClick={handleAdd} disabled={!isActive || (typeof product.stock === 'number' && product.stock <= 0)}>
                        <i className={`bi ${added ? 'bi-check-lg' : 'bi-cart-plus'}`}></i> {added ? 'Agregado!' : 'Agregar al Carrito'}
                    </button>

                    <div className="card card-glass mt-4">
                        <div className="card-body">
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-3">
                                    <i className="bi bi-truck fs-4 text-primary"></i>
                                    <div>
                                        <div className="fw-semibold">Despacho a todo Chile</div>
                                        <div className="text-muted">Envío rápido y seguro a tu dirección.</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <i className="bi bi-shield-check fs-4 text-primary"></i>
                                    <div>
                                        <div className="fw-semibold">Garantía de satisfacción</div>
                                        <div className="text-muted">Devoluciones sencillas dentro de 10 días.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {zoomSrc && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={() => setZoomSrc(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
                        <div className="modal-content bg-dark">
                            <div className="modal-body p-0">
                                <img src={zoomSrc} alt="zoom" className="img-fluid w-100" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;