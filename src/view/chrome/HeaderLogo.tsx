import React from 'react';

export const HeaderLogo: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      width: '100%',
      padding: '10px 0'
    }}>
      <img 
        src="/sdcc-logo.png" 
        alt="San Diego City College" 
        style={{ 
          height: "60px", 
          width: "auto",
          objectFit: "contain",
          maxWidth: "100%"
        }} 
      />
    </div>
  );
};
