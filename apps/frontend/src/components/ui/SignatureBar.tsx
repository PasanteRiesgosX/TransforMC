import React from 'react';

export const SignatureBar: React.FC = () => {
  return (
    <div className="flex w-full h-[4px]">
      <div style={{ backgroundColor: 'var(--cian)', flex: 1 }}></div>
      <div style={{ backgroundColor: 'var(--morado)', flex: 1 }}></div>
      <div style={{ backgroundColor: 'var(--magenta)', flex: 1 }}></div>
      <div style={{ backgroundColor: 'var(--naranja)', flex: 1 }}></div>
    </div>
  );
};
