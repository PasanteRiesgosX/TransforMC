import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  color?: 'cian' | 'morado' | 'magenta' | 'naranja' | 'teal' | 'rojo' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'neutral', 
  icon,
  className = '' 
}) => {
  return (
    <span className={`tag tag-${color} ${className}`.trim()}>
      {icon}
      {children}
    </span>
  );
};
