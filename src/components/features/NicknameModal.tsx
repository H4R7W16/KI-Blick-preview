import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../../contexts/ProgressContext';
import { useTour, TOUR_SEEN_KEY } from '../../hooks/useTour';
import type { TourVariant } from '../../data/tourSteps';
import Modal from '../ui/Modal';

type ModalStep = 'nickname' | 'tour-select';

export default function NicknameModal() {
  const { hasNickname, setNickname } = useProgress();
  const { startTour } = useTour();
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(!hasNickname);
  const [modalStep, setModalStep] = useState<ModalStep>('nickname');

  const showTourSelect = localStorage.getItem(TOUR_SEEN_KEY) !== 'true';

  const closeWithNickname = (nick: string) => {
    setNickname(nick);
    if (showTourSelect) {
      setModalStep('tour-select');
    } else {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      closeWithNickname(trimmed);
    }
  };

  const handleSkip = () => {
    closeWithNickname('Gast');
  };

  const handleTourSelect = (variant: TourVariant) => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
    setIsOpen(false);
    startTour(variant);
  };

  const handleTourSkip = () => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  const handleClose = () => {
    if (modalStep === 'tour-select') {
      handleTourSkip();
      return;
    }

    const trimmed = value.trim();
    setNickname(trimmed.length > 0 ? trimmed : 'Gast');
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titleId={modalStep === 'tour-select' ? 'nickname-tour-select-title' : 'nickname-modal-title'}
      className="max-w-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 w-full overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {modalStep === 'tour-select' ? (
            <motion.div
              key="tour-select"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-area-entdecken)] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 id="nickname-tour-select-title" className="text-xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-2">
                Möchtest du eine kurze Einführung?
              </h2>
              <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600 mb-6">
                Dauert ca. 1 Minute - du kannst die Tour jederzeit wiederholen.
              </p>

              <div className="flex flex-col gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleTourSelect('schueler')}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-area-lernen)]/10 border border-[var(--color-area-lernen)]/30 text-left hover:bg-[var(--color-area-lernen)]/20 transition-colors"
                >
                  <span className="text-sm font-semibold text-[var(--color-area-lernen)] block">Ich bin Schüler:in</span>
                  <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">Lernpfade, Fortschritt, Badges</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTourSelect('lehrkraft')}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-area-verstehen)]/10 border border-[var(--color-area-verstehen)]/30 text-left hover:bg-[var(--color-area-verstehen)]/20 transition-colors"
                >
                  <span className="text-sm font-semibold text-[var(--color-area-verstehen)] block">Ich bin Lehrkraft</span>
                  <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">Unterrichtseinheiten, Klassennutzung, Datenschutz</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTourSelect('neugierig')}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-area-entdecken)]/10 border border-[var(--color-area-entdecken)]/30 text-left hover:bg-[var(--color-area-entdecken)]/20 transition-colors"
                >
                  <span className="text-sm font-semibold text-[var(--color-area-entdecken)] block">Ich bin neugierig</span>
                  <span className="text-xs dark:text-[var(--color-muted)] text-slate-500">Schneller Überblick über das Projekt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleTourSkip}
                className="text-sm dark:text-[var(--color-muted)] text-slate-400 hover:dark:text-[var(--color-secondary)] hover:text-slate-600 transition-colors underline underline-offset-2"
              >
                Nein danke, ich erkunde selbst
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="nickname"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-area-entdecken)] flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 id="nickname-modal-title" className="text-xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-2">
                  Willkommen bei KI:Blick
                </h2>
                <p className="text-sm dark:text-[var(--color-secondary)] text-slate-600">
                  Wähle einen Nickname - er wird nur lokal in deinem Browser gespeichert.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Dein Nickname..."
                  maxLength={30}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-slate-50 dark:text-[var(--color-primary)] text-slate-900 placeholder:dark:text-[var(--color-muted)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:text-[var(--color-secondary)] text-slate-600 hover:dark:bg-[var(--color-card)] hover:bg-slate-100 transition-colors text-sm font-medium"
                  >
                    Überspringen
                  </button>
                  <button
                    type="submit"
                    disabled={value.trim().length === 0}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] text-white font-medium text-sm hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Weiter
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Modal>
  );
}
