// components/sharedItems/MainButton/MainButton.jsx
import React from 'react';

const MainButton = ({ 
    children, 
    onClick, 
    type = 'button',
    disabled = false,
    className = '',
    ...props 
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center px-4 py-2 bg-[#E6F9FD] text-blue-600 font-medium rounded-full cursor-pointer shadow-md transition-all duration-200 hover:bg-[#D1F2F7] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default MainButton;