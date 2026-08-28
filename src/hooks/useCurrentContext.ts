import { useLocation } from 'react-router-dom';
import type { FeedbackArea } from '../types/feedback.types';

interface CurrentFeedbackContext {
  area: FeedbackArea;
  unitId: string;
}

function normalizePath(pathname: string): string {
  const normalized = pathname.trim().replace(/\/+/g, '/');
  if (!normalized || normalized === '/') {
    return '/';
  }

  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

export function useCurrentContext(): CurrentFeedbackContext {
  const { pathname } = useLocation();
  const normalizedPath = normalizePath(pathname);
  const segments = normalizedPath.split('/').filter(Boolean);
  const [root, second, third, fourth] = segments;

  if (root === 'verstehen') {
    return {
      area: 'verstehen',
      unitId: second ?? 'overview',
    };
  }

  if (root === 'entdecken') {
    return {
      area: 'entdecken',
      unitId: second ?? 'overview',
    };
  }

  if (root === 'einordnen') {
    return {
      area: 'einordnen',
      unitId: second ?? 'overview',
    };
  }

  if (root === 'lernen') {
    if (second && third && fourth) {
      return {
        area: 'lernen',
        unitId: `${second}_${third}_${fourth}`,
      };
    }

    return {
      area: 'lernen',
      unitId: second ?? 'overview',
    };
  }

  if (root === 'informationen') {
    return {
      area: 'verstehen',
      unitId: 'informationen',
    };
  }

  return {
    area: 'verstehen',
    unitId: 'landing',
  };
}
