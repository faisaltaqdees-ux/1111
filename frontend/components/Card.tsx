/**
 * Card Component
 * KittyPaws glassmorphic design
 */

'use client';

import React from 'react';
import classNames from 'classnames';
import type { CardProps } from '@/lib/types';

export const Card: React.FC<CardProps> = ({
  gradient = false,
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'glass-card transition-all duration-300 hover:border-paws-rose/50 hover:shadow-mauve-glow';

  const gradientClasses = gradient
    ? 'bg-gradient-to-br from-white/8 to-white/3'
    : '';

  return (
    <div
      className={classNames(baseClasses, gradientClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
