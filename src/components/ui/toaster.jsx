/**
 * Toaster Component
 * 
 * A simple toast notification system using sonner.
 */

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#2a2a2a',
          color: '#e8e4dc',
          border: '1px solid #3a3a3a',
        },
      }}
    />
  );
}
