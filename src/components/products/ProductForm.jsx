import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../common/Spinner';
import { toast } from 'react-hot-toast';

const defaultValues = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  precio_oferta: 0,
  es_oferta: false,
  es_novedad: false,
  estado_producto: true,
  categoriaId: '',
  codigo_producto: '',
  marca: '',
  // Específicos
  tipo_ropa: '',
  talla: '',
  genero: '',
  tipo_juguete: '',
  tamano: '',
  material: '',
};

const ProductForm = ({ editingProduct, onSaved, onCancel }) => {
  const [values, setValues] = useState(defaultValues);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imgLoadingIndex, setImgLoadingIndex] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const previewUrls = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => {
    return () => { previewUrls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [previewUrls]);

  const isEdit = useMemo(() => !!editingProduct?.id, [editingProduct]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get('/categorias');
        setCategories(data || []);
      } catch (err) {
        console.error('Error cargando categorías', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      const catId = editingProduct?.categoria?.id ?? '';
      setValues({
        nombre: editingProduct.nombre ?? '',
        descripcion: editingProduct.descripcion ?? '',
        precio: editingProduct.precio ?? 0,
        stock: editingProduct.stock ?? 0,
        precio_oferta: editingProduct.precio_oferta ?? 0,
        es_oferta: editingProduct.es_oferta ?? false,
        es_novedad: editingProduct.es_novedad ?? false,
        estado_producto: editingProduct.estado_producto ?? true,
        categoriaId: catId,
        codigo_producto: editingProduct.codigo_producto ?? '',
        marca: editingProduct.marca ?? '',
        tipo_ropa: editingProduct.tipo_ropa ?? '',
        talla: editingProduct.talla ?? '',
        genero: editingProduct.genero ?? '',
        tipo_juguete: editingProduct.tipo_juguete ?? '',
        tamano: editingProduct.tamano ?? '',
        material: editingProduct.material ?? '',
      });
      setExistingImages(Array.isArray(editingProduct.imagenes) ? editingProduct.imagenes : []);
    } else {
      setValues(defaultValues);
      setImages([]);
      setExistingImages([]);
    }
  }, [editingProduct]);

  // --- LÓGICA DE CAMPOS DINÁMICOS ---
  const selectedCategory = useMemo(() => {
    const id = Number(values.categoriaId);
    return categories.find((c) => c.id === id) || null;
  }, [values.categoriaId, categories]);

  const selectedName = (selectedCategory?.nombre || '').toLowerCase();
  
  // Banderas para mostrar campos
  const isRopa = selectedName === 'ropa';
  const isJuguetes = selectedName === 'juguetes';
  const isHogar = selectedName === 'hogar';
  const isDecoracion = selectedName.includes('decoraci'); // Coincide con 'Decoración' o 'Decoracion'
  const isDecoHogar = isHogar || isDecoracion;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const MAX_FILES = 3;
    const MAX_SIZE_MB = 3;
    const valid = [];
    for (const f of files) {
      if (!f.type?.startsWith('image/')) {
        toast.error(`Archivo no válido: ${f.name}`);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Imagen demasiado grande (> ${MAX_SIZE_MB}MB): ${f.name}`);
        continue;
      }
      valid.push(f);
      if (valid.length >= MAX_FILES) break;
    }
    setImages(valid);
  };

  const getImageId = (img) => img?.id ?? img?.idImagen ?? null;

  const handleDeleteImage = async (img, idx) => {
    if (!isEdit || !editingProduct?.id) return;
    const url = img?.url || img;
    if (!url) return;
    setImgLoadingIndex(idx);
    try {
      await apiClient.delete(`/productos/${editingProduct.id}/imagenes`, { params: { url } });
      setExistingImages((prev) => prev.filter((i) => (i?.url || i) !== url));
      toast.success('Imagen eliminada');
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar la imagen');
    } finally {
      setImgLoadingIndex(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const errs = {};
      const nombre = String(values.nombre || '').trim();
      const descripcion = String(values.descripcion || '').trim();
      const precio = Number(values.precio);
      const stock = Number(values.stock);
      const precioOferta = Number(values.precio_oferta);
      const categoriaId = Number(values.categoriaId);

      if (!nombre || nombre.length < 3) errs.nombre = 'Escribe al menos 3 caracteres';
      if (!descripcion) errs.descripcion = 'Ingresa una descripción';
      if (Number.isNaN(precio) || precio < 0) errs.precio = 'Precio inválido';
      if (Number.isNaN(stock) || stock < 0) errs.stock = 'Stock inválido';
      if (!categoriaId) errs.categoriaId = 'Selecciona una categoría';

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        toast.error('Corrige los campos marcados');
        return setLoading(false);
      }

      // Payload base con campos generales
      const payload = {
        nombre,
        descripcion,
        precio,
        stock,
        precio_oferta: values.es_oferta ? precioOferta : 0,
        es_oferta: values.es_oferta,
        es_novedad: values.es_novedad,
        estado_producto: values.estado_producto,
        categoriaId,
        codigo_producto: values.codigo_producto,
        marca: values.marca,
        // Campos específicos (se envían vacíos si no aplican)
        tipo_ropa: isRopa ? values.tipo_ropa : '',
        talla: isRopa ? values.talla : '',
        genero: isRopa ? values.genero : '',
        tipo_juguete: isJuguetes ? values.tipo_juguete : '',
        tamano: (isJuguetes || isDecoHogar) ? values.tamano : '',
        material: isDecoHogar ? values.material : '',
      };

      let productoId = editingProduct?.id;
      if (isEdit) {
        const { data } = await apiClient.put(`/productos/${productoId}`, payload);
        productoId = data.id;
      } else {
        const { data } = await apiClient.post('/productos', payload);
        productoId = data.id;
      }

      if (images.length > 0 && productoId) {
        const formData = new FormData();
        images.forEach((file) => formData.append('files', file));
        await apiClient.post(`/productos/${productoId}/imagenes`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
      onSaved?.();
      if (!isEdit) {
        setValues(defaultValues);
        setImages([]);
        setFieldErrors({});
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al guardar';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4 bg-white">
      <div className="card-header bg-dark text-white">
        {isEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}
      </div>
      <div className="card-body">
        {loading && <Spinner />}
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            
            {/* --- CAMPOS OBLIGATORIOS SUPERIORES --- */}
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input name="nombre" className={`form-control ${fieldErrors.nombre ? 'is-invalid' : ''}`} value={values.nombre} onChange={handleChange} />
              {fieldErrors.nombre && <div className="invalid-feedback">{fieldErrors.nombre}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Categoría</label>
              <select name="categoriaId" className={`form-select ${fieldErrors.categoriaId ? 'is-invalid' : ''}`} value={values.categoriaId} onChange={handleChange}>
                <option value="">Seleccione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {fieldErrors.categoriaId && <div className="invalid-feedback">{fieldErrors.categoriaId}</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea name="descripcion" className={`form-control ${fieldErrors.descripcion ? 'is-invalid' : ''}`} rows={3} value={values.descripcion} onChange={handleChange} />
            </div>
            
            {/* --- PRECIOS Y STOCK --- */}
            <div className="col-md-4">
              <label className="form-label">Precio</label>
              <input type="number" name="precio" className="form-control" value={values.precio} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Stock</label>
              <input type="number" name="stock" className="form-control" value={values.stock} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Precio Oferta</label>
              <input type="number" name="precio_oferta" className="form-control" value={values.precio_oferta} onChange={handleChange} />
            </div>

            {/* --- CHECKS --- */}
            <div className="col-md-4 form-check pt-3 ps-5">
              <input type="checkbox" id="es_oferta" name="es_oferta" className="form-check-input" checked={values.es_oferta} onChange={handleChange} />
              <label htmlFor="es_oferta" className="form-check-label">En oferta</label>
            </div>
            <div className="col-md-4 form-check pt-3 ps-5">
              <input type="checkbox" id="es_novedad" name="es_novedad" className="form-check-input" checked={values.es_novedad} onChange={handleChange} />
              <label htmlFor="es_novedad" className="form-check-label">Es novedad</label>
            </div>
            

            {/* --- CAMPOS GENERALES (SIEMPRE VISIBLES) --- */}
            <div className="col-12 border-top pt-2 mt-3"><h6 className="text-muted">Datos Generales</h6></div>
            
            <div className="col-md-6">
              <label className="form-label">Código</label>
              <input name="codigo_producto" className="form-control" value={values.codigo_producto} onChange={handleChange} placeholder="Ej: PROD-001" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Marca</label>
              <input name="marca" className="form-control" value={values.marca} onChange={handleChange} placeholder="Ej: Nike, Mattel, Genérico" />
            </div>

            {/* --- CAMPOS ESPECÍFICOS --- */}
            
            {/* ROPA: Tipo, Talla, Género */}
            {isRopa && (
                <>
                    <div className="col-12 border-top pt-2 mt-3"><h6 className="text-primary">Detalles de Ropa</h6></div>
                    <div className="col-md-4">
                        <label className="form-label">Tipo Ropa</label>
                        <input name="tipo_ropa" className="form-control" value={values.tipo_ropa} onChange={handleChange} placeholder="Ej: Polera, Pantalón" />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Talla</label>
                        <input name="talla" className="form-control" value={values.talla} onChange={handleChange} placeholder="S, M, L, 42" />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Género</label>
                        <input name="genero" className="form-control" value={values.genero} onChange={handleChange} placeholder="Hombre, Mujer, Unisex" />
                    </div>
                </>
            )}

            {/* JUGUETES: Tipo, Tamaño */}
            {isJuguetes && (
                <>
                    <div className="col-12 border-top pt-2 mt-3"><h6 className="text-primary">Detalles de Juguetes</h6></div>
                    <div className="col-md-6">
                        <label className="form-label">Tipo Juguete</label>
                        <input name="tipo_juguete" className="form-control" value={values.tipo_juguete} onChange={handleChange} placeholder="Ej: Figura de acción, Peluche" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Tamaño</label>
                        <input name="tamano" className="form-control" value={values.tamano} onChange={handleChange} placeholder="Ej: 30cm, Grande" />
                    </div>
                </>
            )}

            {/* DECORACIÓN / HOGAR: Material, Tamaño */}
            {isDecoHogar && (
                <>
                    <div className="col-12 border-top pt-2 mt-3"><h6 className="text-primary">Detalles de Hogar/Deco</h6></div>
                    <div className="col-md-6">
                        <label className="form-label">Material</label>
                        <input name="material" className="form-control" value={values.material} onChange={handleChange} placeholder="Ej: Madera, Vidrio" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Tamaño</label>
                        <input name="tamano" className="form-control" value={values.tamano} onChange={handleChange} placeholder="Ej: 50x50cm" />
                    </div>
                </>
            )}

            {/* IMÁGENES */}
            <div className="col-12 border-top pt-3 mt-3">
              <label className="form-label">Imágenes (máx. 3)</label>
              <input type="file" className="form-control" accept="image/*" multiple onChange={handleImagesChange} />
              
              {/* Previsualización de nuevas */}
              {previewUrls.length > 0 && (
                <div className="mt-2 d-flex gap-2">
                  {previewUrls.map((u, i) => (
                    <img key={i} src={u} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  ))}
                </div>
              )}

              {/* Imágenes existentes (Edición) */}
              {existingImages.length > 0 && (
                <div className="mt-3">
                  <h6>Imágenes guardadas:</h6>
                  <div className="d-flex gap-3">
                    {existingImages.map((img, idx) => (
                      <div key={getImageId(img) || idx} className="position-relative">
                        <img 
                            src={img.url || img} 
                            alt="guardada" 
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, opacity: imgLoadingIndex === idx ? 0.5 : 1 }} 
                        />
                        <button 
                            type="button" 
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0" 
                            style={{ width: 20, height: 20, lineHeight: 1 }}
                            onClick={() => handleDeleteImage(img, idx)}
                            disabled={imgLoadingIndex !== null}
                        >
                            &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-12 mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-modern" disabled={loading}>{isEdit ? 'Guardar cambios' : 'Crear Producto'}</button>
              {isEdit && (
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancelar</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
