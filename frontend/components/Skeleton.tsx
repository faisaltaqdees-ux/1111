/**
 * Loading Skeleton Component
 * Production-grade loading indicators
 */

'use client';

import React from 'react';
import classNames from 'classnames';

interface SkeletonProps {
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = '1rem',
  width = '100%',
  circle = false,
  className,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={classNames('skeleton', className)}
          style={{
            height: circle ? width : height,
            width,
            borderRadius: circle ? '50%' : '0.5rem',
          }}
        />
      ))}
    </>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="card space-y-4">
    <Skeleton height="1.5rem" width="60%" />
    <Skeleton count={3} height="1rem" className="mb-2" />
    <div className="flex gap-2 pt-4">
      <Skeleton height="2.5rem" width="40%" />
      <Skeleton height="2.5rem" width="40%" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton height="1.5rem" width="20%" />
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="1.5rem" width="20%" />
        <Skeleton height="1.5rem" width="30%" />
      </div>
    ))}
  </div>
);

export default Skeleton;
