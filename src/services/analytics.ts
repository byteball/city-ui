import ReactGA from 'react-ga4';

// GA4 Measurement ID (пример – G-A1B2C3D4E5)
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? '';

// Инициализация. Вызывайте ОДИН раз в самом начале.
export function initGA() {
  if (!MEASUREMENT_ID) return;
  ReactGA.initialize(MEASUREMENT_ID);
}

/**
 * Send page-view to GA4.
 * @param path URL-path + query string ("/about?ref=header" etc.)
 */
export function trackPageView(path: string) {
  if (!MEASUREMENT_ID) return;

  // Recommended GA4 parameters
  ReactGA.send({
    hitType: 'pageview',
    page: path,                     // page_path
    title: document.title,          // page_title
    location: window.location.href, // page_location
  });
}

/**
 * Track a GA4 event.
 *
 * @param name   Event name in snake_case (GA4 best practice)
 * @param params Optional extra parameters (up to 25 per event)
 *
 * Example:
 *   trackEvent('sign_up', { method: 'email' });
 *   trackEvent('add_to_cart', { currency: 'USD', value: 19.99 });
 */
export function trackEvent(
  name: string,
  params: Record<string, any> = {},
) {
  if (!MEASUREMENT_ID) return;

  // react-ga4: first argument is event name, second – parameters
  ReactGA.event(name, params);
}