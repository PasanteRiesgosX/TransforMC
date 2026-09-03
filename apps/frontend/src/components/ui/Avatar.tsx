import React from 'react';

interface AvatarProps {
  name?: string;
  lastName?: string;
  size?: 'sm' | 'lg';
  colorIndex?: number;
  className?: string;
}

const colors = [
  'var(--cian)',
  'var(--morado)',
  'var(--magenta)',
  'var(--naranja)',
  'var(--teal)',
];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  lastName,
  size = 'sm',
  colorIndex,
  className = '',
}) => {
  const initials = `${name?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  
  const finalColorIndex = colorIndex !== undefined 
    ? colorIndex % colors.length 
    : getHashIndex((name || '') + (lastName || ''), colors.length);
  
  const backgroundColor = colors[finalColorIndex];

  const sizeClasses = size === 'sm' 
    ? 'w-[30px] h-[30px] rounded-full text-[11px]' 
    : 'w-[44px] h-[44px] rounded-[12px] text-[15px]';

  return (
    <div 
      className={`flex items-center justify-center font-bold text-white shrink-0 ${sizeClasses} ${className}`}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
};
