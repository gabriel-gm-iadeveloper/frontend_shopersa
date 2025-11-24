import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { regionesData } from '../../data/chile';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        rut: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: '',
        fecha_nacimiento: '',
        direccion_calle: '',
        direccion_numero: '',
        comuna: '',
        region: ''
    });
    
    const [comunasDisponibles, setComunasDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estado para errores generales (ej: error de servidor)
    const [generalError, setGeneralError] = useState('');
    // Estado para errores específicos de cada campo
    const [fieldErrors, setFieldErrors] = useState({});
    
    const navigate = useNavigate();

    // --- FUNCIONES DE VALIDACIÓN ---

    // 1. Validador de RUT (Algoritmo Módulo 11)
    const validarRutChileno = (rut) => {
        // Limpiar puntos y guión
        let valor = rut.replace(/\./g, '').replace(/-/g, '');
        
        // Validar formato mínimo
        if (valor.length < 8) return false;
        
        // Aislar cuerpo y dígito verificador
        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1).toUpperCase();
        
        // Validar que el cuerpo sean solo números
        if (!/^[0-9]+$/.test(cuerpo)) return false;
        
        // Calcular dígito esperado
        let suma = 0;
        let multiplicador = 2;
        
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += multiplicador * cuerpo.charAt(i);
            multiplicador = (multiplicador + 1) % 8 || 2;
        }
        
        const resto = suma % 11;
        const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' :String(11 - resto);
        
        return dvCalculado === dv;
    };

    // 2. Validador de Email (Dominios permitidos)
    const validarDominioEmail = (email) => {
        const dominiosPermitidos = ['gmail.com', 'duocuc.cl', 'profesor.duoc.cl'];
        const partes = email.split('@');
        if (partes.length !== 2) return false;
        const dominio = partes[1].toLowerCase();
        return dominiosPermitidos.includes(dominio);
    };

    // 3. Validador de Contraseña (8 caracteres, 1 número, 1 símbolo)
    const validarPasswordCompleja = (pass) => {
        // Regex: Mínimo 8 chars, al menos 1 dígito, al menos 1 caracter especial
        const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*.,_+-]).{8,}$/;
        return regex.test(pass);
    };

    // -------------------------------

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        
        // Limpiar error del campo cuando el usuario escribe
        if (fieldErrors[id]) {
            setFieldErrors(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleRegionChange = (e) => {
        const nombreRegion = e.target.value;
        const regionData = regionesData.find(r => r.region === nombreRegion);
        
        setFormData(prev => ({ 
            ...prev, 
            region: nombreRegion, 
            comuna: '' 
        }));

        if (regionData && regionData.comunas) {
            const comunasOrdenadas = [...regionData.comunas].sort((a, b) => a.localeCompare(b, 'es'));
            setComunasDisponibles(comunasOrdenadas);
        } else {
            setComunasDisponibles([]);
        }
    };

    const handleComunaChange = (e) => {
        setFormData(prev => ({ ...prev, comuna: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setFieldErrors({});
        
        const errors = {};

        // --- EJECUCIÓN DE VALIDACIONES ---

        // Nombre (min 3 letras)
        if (!formData.nombres.trim() || formData.nombres.trim().length < 3) {
            errors.nombres = 'El nombre debe tener al menos 3 letras.';
        }

        // Apellido (min 3 letras - asumiendo misma regla)
        if (!formData.apellidos.trim() || formData.apellidos.trim().length < 3) {
            errors.apellidos = 'El apellido debe tener al menos 3 letras.';
        }

        // RUT
        if (!validarRutChileno(formData.rut)) {
            errors.rut = 'El RUT ingresado no es válido.';
        }

        // Email
        if (!validarDominioEmail(formData.email)) {
            errors.email = 'Solo se permiten correos: @gmail.com, @duocuc.cl, @profesor.duoc.cl';
        }

        // Contraseña
        if (!validarPasswordCompleja(formData.password)) {
            errors.password = 'La contraseña debe tener mín. 8 caracteres, 1 número y 1 símbolo.';
        }

        // Confirmar Contraseña
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden.';
        }

        // Si hay errores, detenemos el envío
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setGeneralError('Por favor corrige los errores del formulario.');
            return;
        }

        // --- ENVÍO AL BACKEND ---
        setLoading(true);

        try {
            const { confirmPassword, ...dataToSend } = formData;
            
            await apiClient.post('/auth/register', dataToSend);
            
            navigate('/iniciosesion', { 
                state: { message: '¡Registro exitoso! Por favor inicia sesión.' } 
            });

        } catch (err) {
            console.error(err);
            setGeneralError(err.response?.data?.message || 'Error en el registro. Verifica tus datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow">
                        <div className="card-body p-5 bg-white text-dark">
                            <h1 className="card-title text-center mb-4">Crea tu Cuenta</h1>
                            
                            {/* Mensaje de error general */}
                            {generalError && <div className="alert alert-danger text-center">{generalError}</div>}
                            
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="row">
                                    {/* Datos Personales */}
                                    <h5 className="mb-3 text-primary border-bottom pb-2">Datos Personales</h5>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="nombres" className="form-label text-dark">Nombres</label>
                                        <input 
                                            type="text" 
                                            className={`form-control bg-white ${fieldErrors.nombres ? 'is-invalid' : ''}`} 
                                            id="nombres" 
                                            value={formData.nombres} 
                                            onChange={handleChange} 
                                            placeholder="Juan" 
                                        />
                                        {fieldErrors.nombres && <div className="invalid-feedback">{fieldErrors.nombres}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="apellidos" className="form-label text-dark">Apellidos</label>
                                        <input 
                                            type="text" 
                                            className={`form-control bg-white ${fieldErrors.apellidos ? 'is-invalid' : ''}`} 
                                            id="apellidos" 
                                            value={formData.apellidos} 
                                            onChange={handleChange} 
                                            placeholder="Pérez" 
                                        />
                                        {fieldErrors.apellidos && <div className="invalid-feedback">{fieldErrors.apellidos}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="rut" className="form-label text-dark">RUN</label>
                                        <input 
                                            type="text" 
                                            className={`form-control bg-white ${fieldErrors.rut ? 'is-invalid' : ''}`} 
                                            id="rut" 
                                            value={formData.rut} 
                                            onChange={handleChange} 
                                            placeholder="12345678-K"
                                        />
                                        {fieldErrors.rut && <div className="invalid-feedback">{fieldErrors.rut}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="fecha_nacimiento" className="form-label text-dark">Fecha Nacimiento</label>
                                        <input type="date" className="form-control bg-white" id="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="telefono" className="form-label text-dark">Teléfono</label>
                                        <input type="tel" className="form-control bg-white" id="telefono" value={formData.telefono} onChange={handleChange} required placeholder="+569 1234 5678"/>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="email" className="form-label text-dark">Correo Electrónico</label>
                                        <input 
                                            type="email" 
                                            className={`form-control bg-white ${fieldErrors.email ? 'is-invalid' : ''}`} 
                                            id="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            placeholder="juan@duocuc.cl" 
                                        />
                                        {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                                        <div className="form-text">Permitidos: gmail.com, duocuc.cl, profesor.duoc.cl</div>
                                    </div>

                                    {/* Datos de Dirección */}
                                    <h5 className="mb-3 mt-3 text-primary border-bottom pb-2">Dirección</h5>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="region" className="form-label text-dark">Región</label>
                                        <select className="form-select bg-white" id="region" value={formData.region} onChange={handleRegionChange} required>
                                            <option value="" disabled>Selecciona una región</option>
                                            {regionesData.map((r, idx) => (
                                                <option key={idx} value={r.region}>{r.region}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="comuna" className="form-label text-dark">Comuna</label>
                                        <select 
                                            className="form-select bg-white" 
                                            id="comuna" 
                                            value={formData.comuna} 
                                            onChange={handleComunaChange} 
                                            required 
                                            disabled={!formData.region}
                                        >
                                            <option value="" disabled>Selecciona una comuna</option>
                                            {comunasDisponibles.map((c, idx) => (
                                                <option key={idx} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-8 mb-3">
                                        <label htmlFor="direccion_calle" className="form-label text-dark">Calle</label>
                                        <input type="text" className="form-control bg-white" id="direccion_calle" value={formData.direccion_calle} onChange={handleChange} required placeholder="Av. Principal" />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="direccion_numero" className="form-label text-dark">Número</label>
                                        <input type="text" className="form-control bg-white" id="direccion_numero" value={formData.direccion_numero} onChange={handleChange} required placeholder="123" />
                                    </div>

                                    {/* Seguridad */}
                                    <h5 className="mb-3 mt-3 text-primary border-bottom pb-2">Seguridad</h5>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="password" className="form-label text-dark">Contraseña</label>
                                        <div className="input-group">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                className={`form-control bg-white ${fieldErrors.password ? 'is-invalid' : ''}`} 
                                                id="password" 
                                                value={formData.password} 
                                                onChange={handleChange} 
                                                placeholder="********"
                                            />
                                            <button 
                                                className="btn btn-outline-secondary" 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                            </button>
                                        </div>
                                        {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}
                                        <div className="form-text">Mínimo 8 caracteres, 1 número y 1 símbolo.</div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="confirmPassword" className="form-label text-dark">Confirmar Contraseña</label>
                                        <div className="input-group">
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                className={`form-control bg-white ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`} 
                                                id="confirmPassword" 
                                                value={formData.confirmPassword} 
                                                onChange={handleChange} 
                                                placeholder="********"
                                            />
                                        </div>
                                        {fieldErrors.confirmPassword && <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>}
                                    </div>
                                </div>

                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-dark btn-lg" disabled={loading}>
                                        {loading ? 'Registrando...' : 'Registrarse'}
                                    </button>
                                </div>
                                <p className="text-center mt-4 form-text">
                                    ¿Ya tienes una cuenta? <Link to="/iniciosesion">Inicia sesión aquí</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;