import React, { memo } from "react";

interface LoaderProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

const Loader = memo<LoaderProps>(({ 
  width = 32, 
  height = 32, 
  className = "",
  color = "accent"
}) => {
  const borderWidth = Math.min(width, height) / 8;
  
  return (
    <div className={`flex justify-center w-full mt-4 py-6 ${className}`}>
      <span
        className={`animate-spin rounded-full border-5 border-t-4 border-b-4 border-x-${color} border-y-${color}/50`}
        style={{ 
          width, 
          height, 
          borderWidth,
          // Optimize animation performance
          willChange: 'transform',
        }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </span>
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;
