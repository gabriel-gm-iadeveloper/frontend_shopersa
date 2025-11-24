import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/apiClient';
import ProductCard from '../../components/products/ProductCard';
import Spinner from '../../components/common/Spinner';

const PRODUCTS_PER_PAGE = 16;

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        categoria: 'Todos',
        precioMax: 500000,
        // 1. Nuevos filtros
        soloOfertas: false,
        soloNovedades: false
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await apiClient.get('/categorias');
                setCategories(data || []);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Pedimos todo al backend y filtramos localmente para mayor rapidez
                const response = await apiClient.get('/productos');
                setProducts(response.data || []);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchQuery]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            // Manejamos checkbox y inputs normales
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const filteredProducts = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        
        return (products || [])
            .filter(p => Boolean(p.estadoProducto))
            .filter(p => {
                if (filters.categoria === 'Todos') return true;
                const nombreCat = p?.categoria?.nombre;
                return nombreCat === filters.categoria;
            })
            .filter(p => Number(p.precio || 0) <= Number(filters.precioMax || 0))
            // 2. Lógica de nuevos filtros
            .filter(p => !filters.soloOfertas || Boolean(p.es_oferta))
            .filter(p => !filters.soloNovedades || Boolean(p.es_novedad))
            .filter(p => !normalizedQuery || String(p.nombre || '').toLowerCase().includes(normalizedQuery));
    }, [products, filters, searchQuery]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="container-fluid my-4">
            <div className="row">
                <aside className="col-lg-3 mb-4">
                    <div className="card card-glass p-3 sticky-top" style={{ top: '20px', zIndex: 1 }}>
                         <h5 className="card-title">Filtros</h5>
                         <hr />
                         
                         <div className="mb-3">
                            <label htmlFor="search-input" className="form-label fw-bold">Buscar producto</label>
                            <input
                                id="search-input"
                                type="text"
                                className="form-control"
                                placeholder="Escribe el nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                         </div>
                         
                         <div className="mb-3">
                            <label htmlFor="categoria-select" className="form-label fw-bold">Categoría</label>
                            <select 
                                className="form-select" 
                                id="categoria-select"
                                name="categoria"
                                value={filters.categoria}
                                onChange={handleFilterChange}
                            >
                                <option value="Todos">Todos</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.nombre}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <hr />

                        {/* 3. UI de Checkboxes */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Estado</label>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="soloOfertas" 
                                    name="soloOfertas"
                                    checked={filters.soloOfertas}
                                    onChange={handleFilterChange}
                                />
                                <label className="form-check-label" htmlFor="soloOfertas">
                                    Solo Ofertas!!!
                                </label>
                            </div>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="soloNovedades" 
                                    name="soloNovedades"
                                    checked={filters.soloNovedades}
                                    onChange={handleFilterChange}
                                />
                                <label className="form-check-label" htmlFor="soloNovedades">
                                    Solo Novedades!!!
                                </label>
                            </div>
                        </div>

                        <hr />
                        
                        <div>
                            <label htmlFor="precio-range" className="form-label fw-bold">
                                Precio hasta: <span>${parseInt(filters.precioMax).toLocaleString('es-CL')}</span>
                            </label>
                            <input 
                                type="range" 
                                className="form-range" 
                                min="0" 
                                max="500000"
                                step="5000" 
                                id="precio-range"
                                name="precioMax"
                                value={filters.precioMax}
                                onChange={handleFilterChange}
                                style={{ accentColor: 'var(--color-primary)' }}
                            />
                            <div className="d-flex justify-content-between text-muted small">
                                <span>$0</span>
                                <span>$500.000</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="col-lg-9">
                    {/* ... (El resto del main se mantiene igual) */}
                    {loading ? (
                        <Spinner />
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted">
                                    Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
                                </span>
                            </div>

                            <div className="row g-3">
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map(product => (
                                        <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                                            <ProductCard product={product} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <h4>No se encontraron productos</h4>
                                        <p className="text-muted">Intenta ajustar los filtros de búsqueda.</p>
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <nav className="mt-5 d-flex justify-content-center">
                                    <ul className="pagination">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                                &laquo; Anterior
                                            </button>
                                        </li>
                                        
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                                Siguiente &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductsPage;