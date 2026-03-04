import React from 'react';

const FormError = ({ error }) => {
    if (!error) return null;

    // Si c'est un tableau (Laravel style), on prend le premier message
    let message = Array.isArray(error) ? error[0] : error;

    if (!message || typeof message !== 'string') return null;

    return (
        <div className="form-error-msg" style={{
            color: '#dc2626', // Red-600
            fontSize: '0.75rem',
            marginTop: '4px',
            fontStyle: 'italic',
            fontFamily: "'Jost', sans-serif",
            textAlign: 'left',
            fontWeight: '600', // Un peu plus gras pour la visibilité
            display: 'block', // S'assurer qu'il est visible
            zIndex: 10
        }}>
            {message}
        </div>
    );
};

export default FormError;
