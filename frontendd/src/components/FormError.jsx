import React from 'react';

const FormError = ({ error }) => {
    if (!error) return null;

    // Si c'est un tableau (Laravel style), on prend le premier message
    const message = Array.isArray(error) ? error[0] : error;

    return (
        <div style={{
            color: '#c0675a',
            fontSize: '0.75rem',
            marginTop: '4px',
            fontStyle: 'italic',
            fontFamily: "'Jost', sans-serif",
            textAlign: 'left'
        }}>
            {message}
        </div>
    );
};

export default FormError;
