import React, { useState, useEffect } from 'react';

const SuccessCheckmark = ({ 
  size = 'md', 
  show = false, 
  duration = 2000,
  onComplete = null 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!visible) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-20 h-20';
      default: return 'w-12 h-12';
    }
  };

  return (
    <div className={`${getSizeClass()} relative animate-bounce`}>
      <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200">
        <svg 
          className="w-1/2 h-1/2 text-green-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M5 13l4 4L19 7" 
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

export default SuccessCheckmark; 