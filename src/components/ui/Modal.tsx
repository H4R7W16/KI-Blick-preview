import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
  className?: string;
  backdropClassName?: string;
  fullscreen?: boolean;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let openModalCount = 0;
let previousBodyOverflow: string | null = null;

function getFocusableElements(container: HTMLDivElement | null) {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export default function Modal({
  isOpen,
  onClose,
  titleId,
  children,
  className = '',
  backdropClassName = '',
  fullscreen = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const frame = requestAnimationFrame(() => {
      const focusable = getFocusableElements(dialogRef.current)[0];
      if (focusable) {
        focusable.focus();
        return;
      }
      dialogRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    previousFocusRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
    }

    openModalCount += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow ?? '';
        previousBodyOverflow = null;
      }
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const backdropBaseClass = fullscreen
    ? 'fixed inset-0 z-[200] flex items-center justify-center p-0 bg-black/60 backdrop-blur-sm'
    : 'fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';

  const dialogBaseClass = fullscreen
    ? 'w-screen h-screen max-w-none rounded-none border-none bg-transparent shadow-none'
    : 'w-full max-w-sm rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-surface)] bg-white shadow-2xl';

  return createPortal(
    <div
      className={`${backdropBaseClass} ${backdropClassName}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`${dialogBaseClass} ${className}`}
        onClick={event => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
