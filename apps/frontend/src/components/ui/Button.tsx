import React, { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'warn';
  size?: 'md' | 'sm';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    danger: 'btn-danger',
    warn: 'btn-warn',
  }[variant];
  
  const sizeClasses = size === 'sm' ? 'btn-sm' : '';
  const widthClass = fullWidth ? 'btn-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex items-center justify-center">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex items-center justify-center">{icon}</span>}
    </button>
  );
};
