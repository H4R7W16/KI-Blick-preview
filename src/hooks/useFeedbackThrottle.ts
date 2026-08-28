import { useCallback } from 'react';

const SENT_COOLDOWN_DAYS = 30;
const ABANDONED_COOLDOWN_DAYS = 14;
const DAY_MS = 86_400_000;
const ABANDONED_MIN_OPEN_MS = 3_000;

function storageKey(type: 'sent' | 'abandoned', contextId: string): string {
  return `kiblick_fb_${type}_${contextId}`;
}

function sessionMicroKey(area: string): string {
  return `kiblick_fb_session_micro_${area}`;
}

function daysSince(isoString: string): number {
  const timestamp = new Date(isoString).getTime();
  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return (Date.now() - timestamp) / DAY_MS;
}

export function useFeedbackThrottle() {
  const canShow = useCallback((contextId: string): boolean => {
    const sent = localStorage.getItem(storageKey('sent', contextId));
    const abandoned = localStorage.getItem(storageKey('abandoned', contextId));

    if (sent && daysSince(sent) < SENT_COOLDOWN_DAYS) {
      return false;
    }

    if (abandoned && daysSince(abandoned) < ABANDONED_COOLDOWN_DAYS) {
      return false;
    }

    return true;
  }, []);

  const markSent = useCallback((contextId: string): void => {
    localStorage.setItem(storageKey('sent', contextId), new Date().toISOString());
    localStorage.removeItem(storageKey('abandoned', contextId));
  }, []);

  const markAbandoned = useCallback((contextId: string, openedAt: number): void => {
    const elapsed = Date.now() - openedAt;
    if (elapsed >= ABANDONED_MIN_OPEN_MS) {
      localStorage.setItem(storageKey('abandoned', contextId), new Date().toISOString());
    }
  }, []);

  const canShowMicro = useCallback((area: string): boolean => {
    if (sessionStorage.getItem(sessionMicroKey(area))) {
      return false;
    }

    return canShow(`micro_${area}`);
  }, [canShow]);

  const markMicroShown = useCallback((area: string): void => {
    sessionStorage.setItem(sessionMicroKey(area), '1');
  }, []);

  return { canShow, markSent, markAbandoned, canShowMicro, markMicroShown };
}
