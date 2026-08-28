/**
 * Anonymes Usage-Tracking via sendBeacon.
 * Sendet Events an /api/track.php – fire-and-forget.
 * Keine personenbezogenen Daten, keine Cookies, kein Fingerprinting.
 */

type TrackEvent = 'page_view' | 'path_completed' | 'badge_earned' | 'checkout_completed';

const TRACK_URL = (import.meta.env.VITE_TRACK_URL as string | undefined)?.replace(/\/+$/, '') || '';

export function trackEvent(
  event: TrackEvent,
  path?: string,
  meta?: Record<string, string>,
): void {
  if (!TRACK_URL) return;

  const payload = JSON.stringify({
    event,
    ...(path ? { path } : {}),
    ...(meta ? { meta } : {}),
  });

  // sendBeacon: überlebt Tab-Close und Navigation
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(TRACK_URL, blob);
  } else {
    // Fallback für ältere Browser
    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}
