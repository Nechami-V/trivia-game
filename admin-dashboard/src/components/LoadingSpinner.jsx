import React from 'react';

const LoadingSpinner = ({ message = 'טוען...', size = 'md' }) => {
  const sizeClasses = {
    sm: { width: '20px', height: '20px', borderWidth: '2px' },
    md: { width: '50px', height: '50px', borderWidth: '4px' },
    lg: { width: '80px', height: '80px', borderWidth: '6px' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="loading flex flex-col items-center justify-center p-4">
      <div 
        style={{
          border: `${currentSize.borderWidth} solid #f3f3f3`,
          borderTop: `${currentSize.borderWidth} solid #007bff`,
          borderRadius: '50%',
          width: currentSize.width,
          height: currentSize.height,
          animation: 'spin 1s linear infinite',
          margin: size === 'sm' ? '0' : '0 auto 20px'
        }}
      ></div>
      {size !== 'sm' && <p className="text-gray-600 text-center">{message}</p>}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
