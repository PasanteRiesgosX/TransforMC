import React from 'react';
import logoUrl from '../../assets/img/logoMulti.png';

interface LogoPlaceholderProps {
  variant?: 'landing' | 'topbar';
  className?: string;
}

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({ 
  variant = 'landing',
  className = ''
}) => {
  const isLanding = variant === 'landing';
  const variantClass = isLanding ? 'h-[38px] block mx-auto' : 'h-[22px]';

  return (
    <img
      src={logoUrl}
      alt="Logo"
      className={`w-auto ${variantClass} ${className}`}
    />
  );
};
