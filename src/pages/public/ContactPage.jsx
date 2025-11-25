import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        mensaje: ''
    });
    const [status, setStatus] = useState({ loading: false, error: null, success: null });

    // Función para validar los dominios permitidos
    const validarDominioEmail = (email) => {
        const dominiosPermitidos = ['gmail.com', 'duocuc.cl', 'profesor.duoc.cl'];
        const partes = email.split('@');
        if (partes.length !== 2) return false;
        const dominio = partes[1].toLowerCase();
        return dominiosPermitidos.includes(dominio);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        
        // Validación de longitud para el mensaje en tiempo real
        if (id === 'mensaje' && value.length > 500) {
            return; // No permite escribir más
        }

        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validar Email
        if (!validarDominioEmail(formData.email)) {
            setStatus({ 
                loading: false, 
                error: 'Solo se permiten correos: @gmail.com, @duocuc.cl, @profesor.duoc.cl', 
                success: null 
            });
            return;
        }

        // 2. Validar Longitud Mensaje (por seguridad)
        if (formData.mensaje.length > 500) {
            setStatus({ 
                loading: false, 
                error: 'El mensaje no puede superar los 500 caracteres.', 
                success: null 
            });
            return;
        }

        setStatus({ loading: true, error: null, success: null });
        try {
            // Esta línea ahora funcionará porque el endpoint existe
            await apiClient.post('/contacto', formData); 
            
            toast.success('¡Mensaje enviado con éxito!');
            setStatus({ loading: false, error: null, success: '¡Mensaje enviado! Te contactaremos pronto.' });
            setFormData({ nombre: '', email: '', mensaje: '' });
        } catch (err) {
            console.error(err);
            toast.error('No se pudo enviar el mensaje. Intenta nuevamente.');
            setStatus({ loading: false, error: 'No se pudo enviar el mensaje. Intenta nuevamente.', success: null });
        }
    };

    const cardMotion = {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring', stiffness: 120, damping: 18 }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>Contáctanos</motion.h1>
                <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.4 }}>
                    ¿Tienes alguna pregunta? Envíanos un mensaje y te responderemos a la brevedad.
                </motion.p>
            </div>

            <div className="row">
                {/* Columna izquierda: Mapa y datos */}
                <div className="col-lg-6 mb-4">
                    <motion.div className="p-4 rounded shadow bg-white text-dark h-100 light-card" {...cardMotion} whileHover={{ y: -2 }}>
                        <h4 className="mb-3">Nuestra Ubicación</h4>
                        <div className="ratio ratio-16x9">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1923.3628135533488!2d-70.74532657681054!3d-33.43675599038776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c30052c9d607%3A0xffa49a9db48daf6a!2sPuesto%20Persa%3A%20ShoPersa!5e0!3m2!1ses-419!2scl!4v1761114145882!5m2!1ses-419!2scl" 
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mapa ShopPersa"
                            ></iframe>
                        </div>
                        <div className="mt-3">
                            <a href="https://www.google.com/maps?q=Persa%20Teniente%20Cruz%2C%20Pudahuel" target="_blank" rel="noopener noreferrer" className="btn btn-soft-primary">
                                Abrir en Google Maps
                            </a>
                        </div>
                        <ul className="list-unstyled mt-4 text-dark">
                            <li><i className="bi bi-geo-alt-fill me-2 text-danger"></i> Persa Teniente Cruz, Pudahuel</li>
                            <li><i className="bi bi-clock-fill me-2 text-primary"></i> Sábados, Domingos y Festivos, 09:00–15:00</li>
                            <li><i className="bi bi-telephone-fill me-2 text-success"></i> +56 9 1234 5678</li>
                        </ul>
                    </motion.div>
                </div>

                {/* Columna derecha: Formulario */}
                <div className="col-lg-6">
                    <motion.div className="p-4 rounded shadow bg-white text-dark h-100 light-card" {...cardMotion} whileHover={{ y: -2 }}>
                        <h4 className="mb-3">Envíanos un Mensaje</h4>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label text-dark">Tu Nombre</label>
                                <input type="text" className="form-control bg-white" id="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Juan Pérez" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label text-dark">Tu Correo Electrónico</label>
                                <input type="email" className="form-control bg-white" id="email" value={formData.email} onChange={handleChange} required placeholder="juan.perez@gmail.com" />
                                <div className="form-text">Permitidos: gmail.com, duocuc.cl, profesor.duoc.cl</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="mensaje" className="form-label text-dark">Comentario</label>
                                <textarea 
                                    className="form-control bg-white" 
                                    id="mensaje" 
                                    rows="5" 
                                    value={formData.mensaje} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="Cuéntanos en qué podemos ayudarte..."
                                    maxLength={500}
                                ></textarea>
                                {/* Contador de caracteres */}
                                <div className="text-end mt-1">
                                    <small className={formData.mensaje.length >= 500 ? 'text-danger fw-bold' : 'text-muted'}>
                                        {formData.mensaje.length} / 500
                                    </small>
                                </div>
                            </div>

                            {status.success && <div className="alert alert-success">{status.success}</div>}
                            {status.error && <div className="alert alert-danger">{status.error}</div>}

                            <motion.button type="submit" className="btn btn-dark w-100" disabled={status.loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                                {status.loading ? 'Enviando...' : 'Enviar Mensaje'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
