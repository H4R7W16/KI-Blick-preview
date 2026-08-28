import { useCallback, useEffect, useState } from 'react';
import type { FeedbackRole } from '../types/feedback.types';

const STORAGE_KEY = 'kiblick_role';
const ROLE_CHANGE_EVENT = 'kiblick:role-change';

const VALID_ROLES = new Set<Exclude<FeedbackRole, null>>(['lehrkraft', 'lernende', 'other']);

function readStoredRole(): FeedbackRole {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedRole = localStorage.getItem(STORAGE_KEY);
  if (!storedRole) {
    return null;
  }

  return VALID_ROLES.has(storedRole as Exclude<FeedbackRole, null>)
    ? (storedRole as Exclude<FeedbackRole, null>)
    : null;
}

export function useSavedRole() {
  const [role, setRoleState] = useState<FeedbackRole>(() => readStoredRole());
  const syncRole = useCallback(() => {
    setRoleState(readStoredRole());
  }, []);

  const setRole = useCallback((newRole: FeedbackRole) => {
    if (typeof window === 'undefined') {
      setRoleState(newRole);
      return;
    }

    if (newRole) {
      localStorage.setItem(STORAGE_KEY, newRole);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    setRoleState(newRole);
    window.dispatchEvent(new CustomEvent(ROLE_CHANGE_EVENT, { detail: newRole }));
  }, []);

  const clearRole = useCallback(() => {
    setRole(null);
  }, [setRole]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        syncRole();
      }
    };
    const handleRoleChange = () => {
      syncRole();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(ROLE_CHANGE_EVENT, handleRoleChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(ROLE_CHANGE_EVENT, handleRoleChange);
    };
  }, [syncRole]);

  return { role, setRole, clearRole };
}
