import React from 'react';

const Spinner = ({ message = 'Cargando...' }) => {
    return (
        <div className="text-center my-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">{message}</span>
            </div>
            <p className="mt-2">{message}</p>
        </div>
    );
};

export default Spinner;