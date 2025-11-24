import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import ProductForm from '../../components/products/ProductForm';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import resolveImageUrl from '../../utils/images';

const ProductManagementPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [rowLoading, setRowLoading] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    body: '',
    confirmLabel: '',
    confirmVariant: 'primary',
    iconClass: 'bi bi-question-circle',
    loading: false,
    onConfirm: () => {}
  });

  const cargarProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/productos');
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  // --- NUEVA FUNCIÓN PARA MOSTRAR DETALLES SEGÚN CATEGORÍA ---
  const renderSpecificDetails = (p) => {
    const catName = p.categoria?.nombre?.toLowerCase() || '';
    const styles = { fontSize: '0.85rem', lineHeight: '1.2' };

    if (catName === 'ropa') {
      return (
        <div style={styles} className="text-muted">
          {p.marca && <div><strong>Marca:</strong> {p.marca}</div>}
          {p.tipo_ropa && <div><strong>Tipo:</strong> {p.tipo_ropa}</div>}
          {p.talla && <div><strong>Talla:</strong> {p.talla}</div>}
          {p.genero && <div><strong>Género:</strong> {p.genero}</div>}
        </div>
      );
    } 
    
    if (catName === 'juguetes') {
      return (
        <div style={styles} className="text-muted">
          {p.marca && <div><strong>Marca:</strong> {p.marca}</div>}
          {p.tipo_juguete && <div><strong>Tipo:</strong> {p.tipo_juguete}</div>}
          {p.tamano && <div><strong>Tam.:</strong> {p.tamano}</div>}
        </div>
      );
    }

    if (catName === 'decoración' || catName === 'decoracion' || catName === 'hogar') {
        return (
          <div style={styles} className="text-muted">
            {p.marca && <div><strong>Marca:</strong> {p.marca}</div>}
            {p.material && <div><strong>Mat.:</strong> {p.material}</div>}
            {p.tamano && <div><strong>Tam.:</strong> {p.tamano}</div>}
          </div>
        );
    }

    // Default para Tecnología u otros
    return (
        <div style={styles} className="text-muted">
            {p.marca && <div><strong>Marca:</strong> {p.marca}</div>}
            {p.material && <div><strong>Mat.:</strong> {p.material}</div>}
            {p.codigo_producto && <div><strong>Cód.:</strong> {p.codigo_producto}</div>}
        </div>
    );
  };
  // ------------------------------------------------------------

  const openConfirm = (type, producto) => {
    const nombre = producto?.nombre || `ID ${producto.id}`;
    if (type === 'delete') {
      setConfirmDialog({
        show: true,
        title: 'Eliminar producto',
        body: `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        confirmVariant: 'danger',
        iconClass: 'bi bi-trash',
        loading: false,
        onConfirm: async () => {
          setConfirmDialog((d) => ({ ...d, loading: true }));
          await handleDeleteInternal(producto.id);
          setConfirmDialog((d) => ({ ...d, show: false, loading: false }));
        },
      });
    } else if (type === 'deactivate') {
      setConfirmDialog({
        show: true,
        title: 'Desactivar producto',
        body: `¿Desactivar "${nombre}"?`,
        confirmLabel: 'Desactivar',
        confirmVariant: 'warning',
        iconClass: 'bi bi-slash-circle',
        loading: false,
        onConfirm: async () => {
          setConfirmDialog((d) => ({ ...d, loading: true }));
          await handleDeactivateInternal(producto.id);
          setConfirmDialog((d) => ({ ...d, show: false, loading: false }));
        },
      });
    } else if (type === 'activate') {
      setConfirmDialog({
        show: true,
        title: 'Activar producto',
        body: `¿Activar "${nombre}"?`,
        confirmLabel: 'Activar',
        confirmVariant: 'success',
        iconClass: 'bi bi-check-circle',
        loading: false,
        onConfirm: async () => {
          setConfirmDialog((d) => ({ ...d, loading: true }));
          await handleActivateInternal(producto.id);
          setConfirmDialog((d) => ({ ...d, show: false, loading: false }));
        },
      });
    }
  };

  const handleDeleteInternal = async (id) => {
    setRowLoading(id);
    try {
      await apiClient.delete(`/productos/${id}`);
      await cargarProductos();
      toast.success('Producto eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar');
    } finally {
      setRowLoading(null);
    }
  };

  const handleDeactivateInternal = async (id) => {
    setRowLoading(id);
    try {
      await apiClient.patch(`/productos/${id}/desactivar`);
      await cargarProductos();
      toast.success('Producto desactivado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo desactivar');
    } finally {
      setRowLoading(null);
    }
  };

  const handleActivateInternal = async (id) => {
    setRowLoading(id);
    try {
      await apiClient.patch(`/productos/${id}/activar`);
      await cargarProductos();
      toast.success('Producto activado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo activar');
    } finally {
      setRowLoading(null);
    }
  };

  const categories = React.useMemo(() => {
    const names = new Set(productos.map(p => p.categoria?.nombre).filter(Boolean));
    return ['Todos', ...Array.from(names)];
  }, [productos]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredByName = normalizedQuery
    ? productos.filter(p => String(p.nombre || '').toLowerCase().includes(normalizedQuery))
    : productos;
  const visibleProductos = categoryFilter !== 'Todos'
    ? filteredByName.filter(p => (p.categoria?.nombre || '-') === categoryFilter)
    : filteredByName;

  return (
    <div className="container my-5">
      <h1 className="mb-4">Administración de Productos</h1>

      <ProductForm
        editingProduct={editingProduct}
        onSaved={cargarProductos}
        onCancel={() => setEditingProduct(null)}
      />

      <motion.div className="card bg-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="card-header bg-dark text-white">
          <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between">
            <span><i className="bi bi-box-seam"></i> Lista de Productos</span>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar por nombre..."
                style={{ maxWidth: 220 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 200 }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="btn btn-outline-light btn-sm" onClick={cargarProductos} disabled={loading}>Recargar</button>
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    {/* --- AÑADIDO TH DETALLES --- */}
                    <th style={{ minWidth: '140px' }}>Detalles</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {visibleProductos.map((p) => (
                      <motion.tr key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                        <td>{p.id}</td>
                        <td>
                          {Array.isArray(p.imagenes) && p.imagenes.length > 0 ? (
                            <img src={resolveImageUrl(p.imagenes[0]?.url || p.imagenes[0])} alt={p.nombre} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                          ) : (
                            <img src="/img/modelo.jpg" alt={p.nombre} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                          )}
                        </td>
                        <td>
                            <div className="fw-bold">{p.nombre}</div>
                            {(p.es_oferta || p.es_novedad) && (
                                <div className="d-flex gap-1 mt-1">
                                    {p.es_oferta && <span className="badge bg-danger" style={{fontSize: '0.65rem'}}>Oferta</span>}
                                    {p.es_novedad && <span className="badge bg-info text-dark" style={{fontSize: '0.65rem'}}>Nuevo</span>}
                                </div>
                            )}
                        </td>
                        
                        {/* --- LLAMADA A LA FUNCIÓN DE DETALLES --- */}
                        <td>{renderSpecificDetails(p)}</td>
                        
                        <td>
                            <div>${(p.precio || 0).toLocaleString('es-CL')}</div>
                            {p.es_oferta && <small className="text-danger fw-bold">O: ${(p.precio_oferta || 0).toLocaleString('es-CL')}</small>}
                        </td>
                        <td><span className={p.stock < 5 ? 'badge bg-danger' : 'badge bg-secondary'}>{p.stock}</span></td>
                        <td>{p.categoria?.nombre || '-'}</td>
                        <td>
                            {p.estadoProducto 
                                ? <span className="badge bg-success">Activo</span> 
                                : <span className="badge bg-secondary">Inactivo</span>
                            }
                        </td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-sm btn-primary btn-modern" onClick={() => setEditingProduct(p)} disabled={rowLoading === p.id} title="Editar producto">
                              {rowLoading === p.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-pencil"></i>}
                            </button>
                            {p.estadoProducto ? (
                              <button className="btn btn-sm btn-warning btn-modern" onClick={() => openConfirm('deactivate', p)} disabled={rowLoading === p.id} title="Desactivar producto">
                                {rowLoading === p.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-slash-circle"></i>}
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-success btn-modern" onClick={() => openConfirm('activate', p)} disabled={rowLoading === p.id} title="Activar producto">
                                {rowLoading === p.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check-circle"></i>}
                              </button>
                            )}
                            <button className="btn btn-sm btn-danger btn-modern" onClick={() => openConfirm('delete', p)} disabled={rowLoading === p.id} title="Eliminar producto">
                               {rowLoading === p.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-trash"></i>}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmModal
        show={confirmDialog.show}
        title={confirmDialog.title}
        body={confirmDialog.body}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        iconClass={confirmDialog.iconClass}
        loading={confirmDialog.loading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((d) => ({ ...d, show: false }))}
      />
    </div>
  );
};

export default ProductManagementPage;