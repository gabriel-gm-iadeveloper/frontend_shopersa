import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-4">
            <div className="container">
                <div className="row">
                    <div className="col-md-3 col-lg-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">ShopPersa</h5>
                        <p>Tu tienda de tesoros y hallazgos únicos. Encuentra todo lo que buscas, desde ropa, juguetes vintage, hasta decoración para tu hogar.</p>
                    </div>
                    <div className="col-md-2 col-lg-2 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Categorías</h5>
                        <p><Link to="/productos?categoria=Ropa" className="footer-link">Ropa</Link></p>
                        <p><Link to="/productos?categoria=Juguetes" className="footer-link">Juguetes</Link></p>
                        <p><Link to="/productos?categoria=Decoracion" className="footer-link">Decoración</Link></p>
                        <p><Link to="/productos?categoria=Hogar" className="footer-link">Hogar</Link></p>
                    </div>
                    <div className="col-md-3 col-lg-2 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Métodos de Pago</h5>
                        <div className="payment-icons"><i className="bi bi-credit-card-2-front"></i> <i className="bi bi-paypal"></i> <span>Webpay</span></div>
                    </div>
                    <div className="col-md-4 col-lg-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 font-weight-bold">Síguenos:</h5>
                        <div className="social-icons">
                            <a href="https://www.facebook.com/gonzalmauricio?locale=es_LA" target="_blank" rel="noopener noreferrer" className="footer-link"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="footer-link"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="footer-link"><i className="bi bi-twitter-x"></i></a>
                            <a href="#" className="footer-link"><i className="bi bi-tiktok"></i></a>
                        </div>
                    </div>
                </div>
                <hr className="mb-4" />
                <div className="row">
                    <div className="col-md-12 text-center pt-3">
                        <p className="small">
                            <Link to="/terminos" className="footer-link">Términos y Condiciones</Link>
                        </p>
                    </div>
                </div>
                <div className="row align-items-center">
                    <div className="col-md-12 text-center">
                        <p>&copy; {new Date().getFullYear()} ShopPersa. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;