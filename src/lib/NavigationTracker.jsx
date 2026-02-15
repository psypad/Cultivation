/**
 * Navigation Tracker
 * 
 * Tracks navigation events for analytics purposes.
 * Simplified version for local development.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Log navigation for debugging (can be removed in production)
    console.log('Navigated to:', location.pathname);
  }, [location]);

  return null;
}
