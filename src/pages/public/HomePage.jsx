import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Swiper solo para el Banner Principal
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import { Autoplay, Navigation } from 'swiper/modules';

import apiClient from '../../api/apiClient';
import ProductCard from '../../components/products/ProductCard';
import Skeleton from '../../components/common/Skeleton';
import { useNavigate, Link } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/images';

const HomePage = () => {
  const [ofertas, setOfertas] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomePageProducts = async () => {
      try {
        // Traemos más productos para poder filtrar en el cliente si la API no filtra
        const [ofertasRes, novedadesRes] = await Promise.all([
          apiClient.get('/productos'), // Traemos todos (o una cantidad grande)
          apiClient.get('/productos'),
        ]);
        
        // --- AQUÍ ESTÁ LA CORRECCIÓN: FILTRADO ESTRICTO ---
        
        const allProductsOfertas = Array.isArray(ofertasRes.data) ? ofertasRes.data : [];
        const ofertasActivas = allProductsOfertas.filter(p => 
            Boolean(p.estadoProducto) === true && Boolean(p.es_oferta) === true
        );
            
        const allProductsNovedades = Array.isArray(novedadesRes.data) ? novedadesRes.data : [];
        const novedadesActivas = allProductsNovedades.filter(p => 
            Boolean(p.estadoProducto) === true && Boolean(p.es_novedad) === true
        );
        
        // ---------------------------------------------------
            
        setOfertas(ofertasActivas);
        setNovedades(novedadesActivas);
      } catch (error) {
        console.error('Error al cargar los productos:', error);
        setOfertas([]);
        setNovedades([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchHomePageProducts();
  }, []);

  // ... (El resto del código: Buscador, Renderizado, etc. se mantiene IGUAL)
  
  useEffect(() => {
    const termRaw = searchTerm.trim();
    if (termRaw.length < 2) { setSuggestions([]); setIsOpen(false); return; }
    const term = termRaw.toLowerCase();
    const handle = setTimeout(async () => {
      try {
        const res = await apiClient.get('/productos', { params: { buscar: termRaw, limit: 6 } });
        const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        const activos = list.filter(p => Boolean(p.estadoProducto));
        const filteredByName = activos.filter(p => String(p.nombre || '').toLowerCase().includes(term));
        setSuggestions(filteredByName.slice(0, 6));
        setIsOpen(filteredByName.length > 0);
        setActiveIndex(-1);
      } catch (e) {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (term) navigate(`/productos?buscar=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        const p = suggestions[activeIndex];
        const id = p.idProducto || p.id;
        setIsOpen(false);
        navigate(`/producto/${id}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const renderSkeletonGrid = () => (
    <div className="row g-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="col-12 col-sm-6 col-lg-3" key={i}>
          <div className="card card-glass h-100">
            <div className="ratio ratio-1x1">
              <Skeleton className="w-100 h-100" />
            </div>
            <div className="card-body">
              <Skeleton className="w-75 mb-2" />
              <Skeleton className="w-100 mb-2" />
              <Skeleton className="w-50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Barra de búsqueda superior */}
      <div className="search-bar-container">
        <div className="container">
          <div className="row justify-content-center py-2">
            <div className="col-md-8 col-lg-6 position-relative" ref={containerRef}>
              <form className="input-group" onSubmit={handleSearchSubmit}>
                <input
                  id="home-search-input"
                  type="text"
                  className="form-control search-emphasis"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="btn btn-dark" type="submit" aria-label="Buscar">
                  <i className="bi bi-search"></i>
                </button>
              </form>
              <AnimatePresence>
                {isOpen && suggestions.length > 0 && searchTerm.trim() && (
                  <motion.div
                    id="home-suggestions"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="position-absolute top-100 start-0 w-100 mt-2 suggestions-premium p-2"
                    style={{ zIndex: 10 }}
                  >
                    {suggestions.map((p, idx) => (
                      <motion.div
                        key={p.idProducto || p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded suggestion-item-premium ${activeIndex === idx ? 'suggestion-active' : ''}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseLeave={() => setActiveIndex(-1)}
                      >
                        <Link
                          to={`/producto/${p.idProducto || p.id}`}
                          className="d-flex align-items-center gap-2 text-decoration-none py-2 px-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <img
                            src={resolveImageUrl(
                              (Array.isArray(p.imagenes) ? (p.imagenes[0]?.url || p.imagenes[0]) : p.imagen_url)
                            )}
                            alt={p.nombre}
                            width="40"
                            height="40"
                            className="rounded object-fit-cover"
                          />
                           <div className="flex-grow-1">
                             <div className="text-white">{p.nombre}</div>
                             <small className="text-light">{(p.precio_oferta || p.precio)?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</small>
                           </div>
                           <i className="bi bi-arrow-right-short text-light"></i>
                         </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Carrusel principal (Banners) */}
      <section className="hero-carousel">
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop
            slidesPerView={1}
            navigation
            className="w-100 h-100"
          >
            {[ '/img/modelo.jpg', '/img/juguetes.jpg', '/img/decoracion.jpg' ].map((src, idx) => (
              <SwiperSlide key={idx}>
                <div className="position-relative w-100 h-100">
                  <img src={src} alt={`banner-${idx}`} className="slide-img" />
                  <div className="hero-caption text-white text-center">
                    {idx === 0 && (
                      <>
                        <h3 className="mb-1">Mega Ofertas de la Semana</h3>
                        <p className="mb-0">Hasta 40% de descuento en productos de ropa.</p>
                      </>
                    )}
                    {idx === 1 && (
                      <>
                        <h3 className="mb-1">Juguetes con Descuento</h3>
                        <p className="mb-0">Hasta 30% en juguetes seleccionados.</p>
                      </>
                    )}
                    {idx === 2 && (
                      <>
                        <h3 className="mb-1">Decora tu Espacio</h3>
                        <p className="mb-0">Encuentra tesoros para tu hogar.</p>
                      </>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
      </section>

      {/* Hero secundario */}
      <section className="py-5 bg-gradient" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="display-5 fw-bold">Descubre Tesoros en ShoPersa</h1>
            <p className="lead">Ofertas únicas y novedades que llegan cada semana.</p>
            <a href="#ofertas" className="btn btn-primary btn-lg mt-3">Ver Ofertas</a>
          </motion.div>
        </div>
      </section>

      {/* --- SECCIÓN OFERTAS (GRILLA 4 ITEMS) --- */}
      <div className="container my-5" id="ofertas">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Ofertas Imperdibles 🔥</h2>
            <Link to="/productos" className="btn btn-outline-primary btn-sm">
                Ver todo <i className="bi bi-arrow-right"></i>
            </Link>
        </div>

        {loading ? (
          renderSkeletonGrid()
        ) : ofertas.length > 0 ? (
          <div className="row g-4">
            {ofertas.slice(0, 4).map((product) => (
              <div className="col-12 col-sm-6 col-lg-3" key={product.idProducto || product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border rounded bg-light">
            <p className="text-muted mb-0">No hay ofertas activas en este momento.</p>
          </div>
        )}

        <hr className="my-5" />

        {/* --- SECCIÓN NOVEDADES (GRILLA 4 ITEMS) --- */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">¡Recién Llegados! ✨</h2>
            <Link to="/productos" className="btn btn-outline-primary btn-sm">
                Ver todo <i className="bi bi-arrow-right"></i>
            </Link>
        </div>

        {loading ? (
          renderSkeletonGrid()
        ) : novedades.length > 0 ? (
          <div className="row g-4">
            {novedades.slice(0, 4).map((product) => (
              <div className="col-12 col-sm-6 col-lg-3" key={product.idProducto || product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border rounded bg-light">
            <p className="text-muted mb-0">No hay novedades recientes.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;