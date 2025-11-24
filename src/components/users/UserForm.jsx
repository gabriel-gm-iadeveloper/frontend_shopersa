import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import apiClient from '../../api/apiClient';
import Spinner from '../common/Spinner';
import { toast } from 'react-hot-toast';

const UserSchema = (isEdit) => Yup.object({
  nombres: Yup.string().trim().min(2, 'Escribe al menos 2 caracteres').required('Ingresa tus nombres'),
  apellidos: Yup.string().trim().min(2, 'Escribe al menos 2 caracteres').required('Ingresa tus apellidos'),
  email: Yup.string().email('Correo no válido').required('Ingresa tu correo'),
  rut: Yup.string().trim().matches(/^\d{7,8}-[\dkK]$/, 'Formato RUT: 12345678-9').nullable(),
  permiso: Yup.string().oneOf(['ADMIN','CLIENTE'], 'Selecciona un permiso válido').required('Selecciona un permiso'),
  estado: Yup.boolean().required('Selecciona el estado'),
  password: isEdit ? Yup.string().nullable() : Yup.string().min(6, 'Mínimo 6 caracteres').required('Ingresa una contraseña'),
});

const defaultValues = {
  nombres: '',
  apellidos: '',
  email: '',
  rut: '',
  permiso: 'CLIENTE',
  estado: true,
  password: '',
};

const UserForm = ({ editingUser, onSaved, onCancel }) => {
  const isEdit = !!editingUser?.id;
  const initialValues = isEdit ? {
    nombres: editingUser.nombres || '',
    apellidos: editingUser.apellidos || '',
    email: editingUser.email || '',
    rut: editingUser.rut || '',
    permiso: editingUser.admin ? 'ADMIN' : (editingUser.permiso?.nombre?.toUpperCase() || 'CLIENTE'),
    estado: editingUser.estado ?? true,
    password: '',
  } : defaultValues;

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus(null);
    try {
      const payload = {
        nombres: values.nombres.trim(),
        apellidos: values.apellidos.trim(),
        email: values.email.trim().toLowerCase(),
        rut: values.rut?.trim() || null,
        permiso: values.permiso,
        estado: values.estado,
      };
      if (values.password) payload.password = values.password;

      if (isEdit) {
        await apiClient.put(`/usuarios/${editingUser.id}`, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        await apiClient.post('/usuarios', payload);
        toast.success('Usuario creado correctamente');
      }
      onSaved?.();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Ocurrió un error');
      toast.error(err.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mb-4 bg-white">
      <div className="card-header bg-dark text-white">
        {isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </div>
      <div className="card-body">
        <Formik initialValues={initialValues} validationSchema={UserSchema(isEdit)} onSubmit={handleSubmit} enableReinitialize>
          {({ isSubmitting, status, errors, touched }) => (
            <Form noValidate>
              {status && <div className="alert alert-danger">{status}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombres</label>
                  <Field name="nombres" className={`form-control ${touched.nombres && errors.nombres ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="nombres" component="div" className="invalid-feedback" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Apellidos</label>
                  <Field name="apellidos" className={`form-control ${touched.apellidos && errors.apellidos ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="apellidos" component="div" className="invalid-feedback" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <Field type="email" name="email" className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">RUT</label>
                  <Field name="rut" className={`form-control ${touched.rut && errors.rut ? 'is-invalid' : ''}`} placeholder="12345678-9" />
                  <ErrorMessage name="rut" component="div" className="invalid-feedback" />
                </div>
                {!isEdit && (
                  <div className="col-md-6">
                    <label className="form-label">Contraseña</label>
                    <Field type="password" name="password" className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`} />
                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                  </div>
                )}
                {isEdit && (
                  <div className="col-md-6">
                    <label className="form-label">Nueva Contraseña (opcional)</label>
                    <Field type="password" name="password" className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`} />
                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                  </div>
                )}
                <div className="col-md-4">
                  <label className="form-label">Permiso</label>
                  <Field as="select" name="permiso" className={`form-select ${touched.permiso && errors.permiso ? 'is-invalid' : ''}`}>
                    <option value="CLIENTE">Cliente</option>
                    <option value="ADMIN">Administrador</option>
                  </Field>
                  <ErrorMessage name="permiso" component="div" className="invalid-feedback" />
                </div>
                <div className="col-md-4">
                  <div className="form-check mt-4">
                    <Field type="checkbox" name="estado" className="form-check-input" id="estado" />
                    <label htmlFor="estado" className="form-check-label">Habilitado</label>
                  </div>
                </div>
              </div>
              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-modern" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner small /> : (isEdit ? 'Guardar cambios' : 'Crear Usuario')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default UserForm;