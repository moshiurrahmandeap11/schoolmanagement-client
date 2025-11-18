// components/sharedItems/MainButton/MainButton.jsx

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
            className={`inline-flex items-center px-4 py-2 bg-[#1e90c9] hover:bg-[#30a9e5] text-white font-medium rounded-full cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default MainButton;