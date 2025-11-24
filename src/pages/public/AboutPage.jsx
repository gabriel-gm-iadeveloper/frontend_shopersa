import React from 'react';

const AboutPage = () => {
    return (
        <div className="container py-5">
            <section className="text-center mb-5">
                <h1 className="display-4">Nuestra Historia</h1>
                <p className="lead">Un pequeño rincón de tesoros con corazón de familia.</p>
            </section>

            <section className="row align-items-center mb-5">
                <div className="col-lg-6">
                    <img src="/img/foto_persa.jpg" className="img-fluid rounded shadow" alt="Foto del persa" />
                </div>
                <div className="col-lg-6">
                    <h3>Una Pyme Familiar</h3>
                    <p>Somos una pyme familiar que lleva años trabajando con pasión en el corazón del Persa Teniente Cruz en Pudahuel. Lo que comenzó como un pequeño puesto ha crecido gracias al cariño de nuestros clientes y a nuestra dedicación por encontrar productos únicos.</p>
                    <p>En ShopPersa, cada artículo tiene una historia. Nos especializamos en una mezcla ecléctica de productos que no encontrarás en ningún otro lugar: desde ropa vintage con estilo, juguetes que despiertan la nostalgia, hasta objetos de decoración que le darán un toque especial a tu casa.</p>
                </div>
            </section>
            
            <hr className="my-5" />

            <section className="text-center">
                <h2 className="mb-5">El Equipo Detrás del Código</h2>
                <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Ignacio San Martin</h4>
                                <h6 className="card-subtitle mb-2 text-muted">31 años</h6>
                                <p className="card-text">Estudiante de segundo año de Ingeniería en Informática en Duoc UC, apasionado por las base de datos, desarrollo Full Stack y por encontrar soluciones creativas a problemas.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h4 className="card-title">Gabriel González</h4>
                                <h6 className="card-subtitle mb-2 text-muted">25 años</h6>
                                <p className="card-text">Estudiante de segundo año de Ingeniería en Informática en Duoc UC, enfocado en la experiencia de usuario y el diseño de interfaces limpias y funcionales que faciliten la vida de las personas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;