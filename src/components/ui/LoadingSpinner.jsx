import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '', 
  text = null 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'w-3 h-3';
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-6 h-6';
      case 'lg': return 'w-8 h-8';
      case 'xl': return 'w-12 h-12';
      default: return 'w-6 h-6';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'border-primary border-t-transparent';
      case 'secondary': return 'border-secondary border-t-transparent';
      case 'white': return 'border-white border-t-transparent';
      case 'gray': return 'border-gray-400 border-t-transparent';
      default: return 'border-primary border-t-transparent';
    }
  };

  const spinnerClass = `${getSizeClass()} ${getColorClass()} border-2 rounded-full animate-spin ${className}`;

  if (text) {
    return (
      <div className="flex items-center gap-3">
        <div className={spinnerClass} />
        <span className="text-sm text-muted-foreground animate-pulse">{text}</span>
      </div>
    );
  }

  return <div className={spinnerClass} />;
};

export default LoadingSpinner; 