/**
 * Input Component
 * WireFluid modern form input with validation
 */

'use client';

import React from 'react';
import classNames from 'classnames';
import type { InputProps } from '@/lib/types';

export const Input: React.FC<InputProps & { label?: string; error?: string; helperText?: string }> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-wire-text-secondary">
          {label}
        </label>
      )}
      <input
        className={classNames(
          'w-full px-4 py-3 bg-wire-darker border-2 rounded-wire text-wire-text placeholder-wire-text-muted',
          'focus:border-wire-primary focus:ring-2 focus:ring-wire-primary/30 focus:outline-none transition-all',
          error
            ? 'border-wire-danger focus:border-wire-danger focus:ring-wire-danger/30'
            : 'border-wire-border hover:border-wire-border/80',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-wire-danger">{error}</p>}
      {helperText && <p className="text-sm text-wire-text-muted">{helperText}</p>}
    </div>
  );
};

export default Input;
