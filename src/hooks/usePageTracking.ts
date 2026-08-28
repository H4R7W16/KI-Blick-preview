/**
 * Trackt Seitenaufrufe bei Routenwechseln.
 * Entprellt: maximal 1 Event pro Pfad pro Session.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../services/trackingService';

const trackedPaths = new Set<string>();

export function usePageTracking(): void {
  const { pathname } = useLocation();
  const previousPath = useRef<string>('');

  useEffect(() => {
    // Normalisieren: Trailing Slash entfernen
    const normalized = pathname.replace(/\/+$/, '') || '/';

    // Nur tracken wenn sich der Pfad geändert hat UND noch nicht gesendet
    if (normalized !== previousPath.current && !trackedPaths.has(normalized)) {
      trackedPaths.add(normalized);
      previousPath.current = normalized;
      trackEvent('page_view', normalized);
    }
  }, [pathname]);
}
