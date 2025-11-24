import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import UserForm from '../../components/users/UserForm';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagementPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowLoading, setRowLoading] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/usuarios');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error al cargar usuarios. Verifica permisos (rol Admin)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleToggleInternal = async (u) => {
    setRowLoading(u.id);
    try {
      const nuevoEstado = !u.estado;
      await apiClient.patch(`/usuarios/${u.id}/estado`, { estado: nuevoEstado });
      await cargarUsuarios();
      toast.success(nuevoEstado ? 'Usuario habilitado' : 'Usuario bloqueado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cambiar el estado');
    } finally {
      setRowLoading(null);
    }
  };

  const handleDeleteInternal = async (u) => {
    setRowLoading(u.id);
    try {
      await apiClient.delete(`/usuarios/${u.id}`);
      await cargarUsuarios();
      toast.success('Usuario eliminado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar el usuario');
    } finally {
      setRowLoading(null);
    }
  };

  const openConfirm = (type, u) => {
    const displayName = u.nombres ? `${u.nombres} ${u.apellidos}` : u.email;
    if (type === 'toggle') {
      const isBlocking = u.estado === true; // si está habilitado, la acción es bloquear
      setConfirmDialog({
        show: true,
        title: isBlocking ? 'Bloquear usuario' : 'Desbloquear usuario',
        body: `${isBlocking ? '¿Bloquear' : '¿Desbloquear'} a "${displayName}"?`,
        confirmLabel: isBlocking ? 'Bloquear' : 'Desbloquear',
        confirmVariant: 'warning',
        iconClass: isBlocking ? 'bi bi-slash-circle' : 'bi bi-check-circle',
        loading: false,
        onConfirm: async () => {
          setConfirmDialog((d) => ({ ...d, loading: true }));
          await handleToggleInternal(u);
          setConfirmDialog((d) => ({ ...d, show: false, loading: false }));
        },
      });
    } else if (type === 'delete') {
      setConfirmDialog({
        show: true,
        title: 'Eliminar usuario',
        body: `¿Eliminar a "${displayName}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        confirmVariant: 'danger',
        iconClass: 'bi bi-trash',
        loading: false,
        onConfirm: async () => {
          setConfirmDialog((d) => ({ ...d, loading: true }));
          await handleDeleteInternal(u);
          setConfirmDialog((d) => ({ ...d, show: false, loading: false }));
        },
      });
    }
  };

  // Filtrado por nombre o correo
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleUsers = normalizedQuery ? usuarios.filter(u => (
    String(u.nombres || '').toLowerCase().includes(normalizedQuery) ||
    String(u.apellidos || '').toLowerCase().includes(normalizedQuery) ||
    String(u.email || '').toLowerCase().includes(normalizedQuery)
  )) : usuarios;

  return (
    <div className="container my-5">
      <h1 className="mb-4">Administración de Usuarios</h1>

      <UserForm
        editingUser={editingUser}
        onSaved={async () => {
          await cargarUsuarios(); // Recargar la lista de usuarios
          setEditingUser(null); // Cerrar el formulario de edición
          setShowCreate(false); // Cerrar el formulario de creación si estaba abierto
        }}
        onCancel={() => setEditingUser(null)}
      />

      <motion.div className="card bg-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="card-header bg-dark text-white">
          <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between">
            <span><i className="bi bi-people"></i> Lista de Usuarios</span>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar por nombre o correo..."
              style={{ maxWidth: 260 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="alert alert-danger">{String(error)}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>RUN</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.length === 0 ? (
                    <tr><td colSpan="7" className="text-center">Sin usuarios</td></tr>
                  ) : (
                    <AnimatePresence initial={false}>
                      {visibleUsers.map((u) => (
                        <motion.tr key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                          <td>{u.id}</td>
                          <td>{u.rut || '-'}</td>
                          <td>{u.nombres} {u.apellidos}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className="badge bg-primary text-capitalize">{u.permiso?.nombre || (u.admin ? 'Administrador' : 'Cliente')}</span>
                          </td>
                          <td>
                            {u.estado ? (
                              <span className="badge bg-success">Activo</span>
                            ) : (
                              <span className="badge bg-secondary">Inactivo</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button className="btn btn-sm btn-primary btn-modern" onClick={() => setEditingUser(u)} disabled={rowLoading === u.id} title="Editar">
                                {rowLoading === u.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-pencil"></i>}
                              </button>
                              <button className={`btn btn-sm ${u.estado ? 'btn-warning' : 'btn-success'} btn-modern`} onClick={() => openConfirm('toggle', u)} disabled={rowLoading === u.id} title={u.estado ? 'Bloquear' : 'Desbloquear'}>
                                {rowLoading === u.id ? <span className="spinner-border spinner-border-sm" /> : (u.estado ? <i className="bi bi-slash-circle"></i> : <i className="bi bi-check-circle"></i>)}
                              </button>
                              <button className="btn btn-sm btn-danger btn-modern" onClick={() => openConfirm('delete', u)} disabled={rowLoading === u.id} title="Eliminar">
                                {rowLoading === u.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-trash"></i>}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
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

export default UserManagementPage;