import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../../context/ThemeContext';

const LoginSchema = Yup.object({
  email: Yup.string().email('Correo no válido').required('Ingresa tu correo'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Ingresa tu contraseña'),
  remember: Yup.boolean(),
});

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = (theme === 'dark') || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = (user?.isAdmin ?? user?.admin ?? false) || (String(user?.role).toUpperCase() === 'ADMIN');
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus(undefined);
    try {
      const payload = { email: values.email.trim().toLowerCase(), password: values.password, remember: !!values.remember };
      const { data } = await apiClient.post('/auth/login', payload);
      const userInfo = data?.user || data?.usuario || data;
      const token = data?.token || data?.jwt || null;
      login(userInfo, token, !!values.remember);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setStatus(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-4">
            <img 
              src="/img/logo2.png" 
              alt="Logo ShopPersa" 
              className="login-logo"
              style={{ 
                maxWidth: '200px', 
                height: 'auto',
                filter: isDark ? 'brightness(0.85) contrast(1.05)' : 'brightness(1) contrast(1)'
              }}
            />
          </div>
          
          <div className={`card shadow-sm ${isDark ? 'bg-dark text-light' : 'bg-white'}`}>
            <div className="card-body login-card">
              <h2 className={`mb-4 text-center fw-bold ${isDark ? 'text-light' : 'text-dark'}`}>Ingresar</h2>
              <Formik initialValues={{ email: '', password: '', remember: false }} validationSchema={LoginSchema} onSubmit={handleSubmit}>
                {({ isSubmitting, errors, touched, status }) => (
                  <Form noValidate>
                    {status && <div className="alert alert-danger">{status}</div>}

                    <div className="mb-3">
                      <label htmlFor="email" className={`form-label fw-semibold ${isDark ? 'text-light' : 'text-dark'}`}>Correo</label>
                      <Field 
                        type="email" 
                        name="email" 
                        id="email" 
                        className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                        placeholder="correo@ejemplo.com" 
                      />
                      <ErrorMessage name="email" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className={`form-label fw-semibold ${isDark ? 'text-light' : 'text-dark'}`}>Contraseña</label>
                      
                      {/* INPUT GROUP PARA EL OJITO */}
                      <div className="input-group">
                        <Field 
                          type={showPassword ? "text" : "password"} // Aquí cambiamos el tipo dinámicamente
                          name="password" 
                          id="password" 
                          className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                          placeholder="********"
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ zIndex: 0 }} // Fix para bordes en bootstrap input-group
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                        {/* El mensaje de error debe ir fuera del input-group si usas is-invalid, o controlarlo manualmente */}
                        <ErrorMessage name="password" component="div" className="invalid-feedback" />
                      </div>
                      {/* Hack visual: si hay error, mostramos el mensaje debajo del input-group */}
                      {touched.password && errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                    </div>

                    <div className="form-check mb-3">
                      <Field type="checkbox" name="remember" id="remember" className="form-check-input" />
                      <label className={`form-check-label ${isDark ? 'text-light' : 'text-dark'}`} htmlFor="remember">Recordarme</label>
                    </div>

                    <button type="submit" className="btn btn-dark btn-modern w-100" disabled={isSubmitting}>
                      {isSubmitting ? <span className="spinner-border spinner-border-sm" /> : 'Ingresar'}
                    </button>

                    <p className={`text-center mt-3 ${isDark ? 'text-light' : 'text-dark'}`}>
                      ¿No tienes una cuenta? <Link className="link-primary" to="/registro">Regístrate aquí</Link>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;