import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { trackPageView } from '@/services/analytics';

/**
 * Tracks every route change as a page view.
 * Mount once (e.g. inside <App /> or Layout component).
 */
export function usePageTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    trackPageView(pathname + search);
  }, [pathname, search]);
}