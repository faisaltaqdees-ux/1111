/**
 * Button Component
 * KittyPaws glassmorphic design with multiple variants
 */

'use client';

import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '@/lib/types';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className,
  ...props
}) => {
  const baseClasses = 'font-semibold transition-all duration-300 rounded-glass border cursor-pointer';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-paws-mauve to-paws-rose text-white shadow-lg hover:shadow-mauve-glow hover:scale-102 active:scale-98 border-0',
    secondary:
      'bg-glass text-white border-white/20 hover:bg-glass-hover hover:border-white/30 hover:shadow-glass-hover',
    outline:
      'border-2 border-paws-rose text-paws-rose hover:bg-paws-rose hover:text-white transition-all',
    ghost:
      'text-paws-rose hover:text-paws-mauve hover:bg-white/5 border-transparent',
  };

  return (
    <button
      className={classNames(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        isLoading && 'opacity-50 cursor-not-allowed',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && <span className="inline-block animate-spin">⟳</span>}
        {children}
      </div>
    </button>
  );
};

export default Button;
