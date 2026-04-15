/**
 * Toast Provider Component
 * WireFluid styled notifications
 */

'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#151f3a',
            color: '#00d4ff',
            border: '2px solid #00d4ff',
            borderRadius: '0.75rem',
            padding: '1rem',
            backdropFilter: 'blur(10px)',
          },
          success: {
            style: {
              color: '#10b981',
              borderColor: '#10b981',
            },
          },
          error: {
            style: {
              color: '#ef4444',
              borderColor: '#ef4444',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
