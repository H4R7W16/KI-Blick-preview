import Shepherd, { type Step, type StepOptionsButton } from 'shepherd.js';
const { Tour } = Shepherd;
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef } from 'react';
import { TOUR_STEPS, type TourVariant, type TourStepConfig } from '../data/tourSteps';

export const TOUR_SEEN_KEY = 'ki-blick-tour-seen';

const HIGHLIGHT_CLASS = 'shepherd-target-highlight';
const SIDEBAR_HIGHLIGHT_CLASS = 'shepherd-sidebar-highlight';

function isMobile(): boolean {
  return window.innerWidth < 768;
}

function removeAllHighlights() {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach(el => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });
}

function removeSidebarHighlight() {
  document.querySelectorAll('aside').forEach(el => {
    el.classList.remove(SIDEBAR_HIGHLIGHT_CLASS);
  });
}

type TourInstance = InstanceType<typeof Tour>;
type StepInstance = Step;

function addProgressDots(step: StepInstance, tour: TourInstance) {
  const allSteps = tour.steps;
  const currentIndex = allSteps.indexOf(step);
  const stepEl = step.getElement();
  const content = stepEl?.querySelector('.shepherd-content');
  if (!content) return;

  // Remove existing dots to avoid duplicates
  content.querySelectorAll('.shepherd-progress').forEach((el: Element) => el.remove());

  const footer = content.querySelector('.shepherd-footer');
  const dots = document.createElement('div');
  dots.className = 'shepherd-progress';
  dots.innerHTML = allSteps
    .map(
      (_: unknown, i: number) =>
        `<span class="shepherd-progress-dot ${i === currentIndex ? 'shepherd-progress-dot--active' : ''}"></span>`
    )
    .join('');

  if (footer) {
    content.insertBefore(dots, footer);
  } else {
    content.appendChild(dots);
  }
}

export function useTour() {
  const navigate = useNavigate();
  const tourRef = useRef<TourInstance | null>(null);

  const stopTour = useCallback(() => {
    if (tourRef.current) {
      tourRef.current.cancel();
      tourRef.current = null;
    }
  }, []);

  const startTour = useCallback(
    (variant: TourVariant) => {
      // Cancel any existing tour
      if (tourRef.current) {
        tourRef.current.cancel();
      }
      removeAllHighlights();

      const tour = new Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: { enabled: true },
          classes: '',
          buttons: [],
          modalOverlayOpeningPadding: 10,
          modalOverlayOpeningRadius: 10,
        },
      });
      tourRef.current = tour;

      const stepConfigs = TOUR_STEPS[variant];

      stepConfigs.forEach((config: TourStepConfig, index: number) => {
        const isLast = index === stepConfigs.length - 1;
        const isFirst = index === 0;

        const buttons: StepOptionsButton[] = [];

        if (!isFirst) {
          buttons.push({
            text: 'Zurück',
            classes: 'shepherd-button-secondary',
            action() {
              tour.back();
            },
          });
        }

        buttons.push({
          text: isLast ? 'Fertig' : 'Weiter',
          action() {
            if (isLast) {
              localStorage.setItem(TOUR_SEEN_KEY, 'true');
              tour.complete();
            } else {
              tour.next();
            }
          },
        });

        const mobile = isMobile();
        const skipOnMobile = config.mobileSkip && mobile;

        // Only skip attachTo on mobile — visibility is checked at show-time (after navigation)
        const attachTo = !skipOnMobile && config.attachTo ? config.attachTo : undefined;

        // Capture sidebar side at step-creation time so show() doesn't rely on
        // finding the inner element in the DOM (which may not be rendered yet).
        const sidebarSide =
          config.sidebarEvent === 'left' || config.sidebarEvent === 'right'
            ? config.sidebarEvent
            : null;

        tour.addStep({
          id: config.id,
          title: config.title,
          text: config.text,
          attachTo,
          buttons,
          beforeShowPromise: config.navigateTo || config.sidebarEvent
            ? () =>
                new Promise<void>(resolve => {
                  if (config.navigateTo) {
                    navigate(config.navigateTo);
                  }
                  if (config.sidebarEvent) {
                    window.dispatchEvent(
                      new CustomEvent('tour:open-sidebar', {
                        detail: config.sidebarEvent,
                      })
                    );
                  }
                  // Wait for route render + sidebar animation
                  setTimeout(resolve, 500);
                })
            : undefined,
          when: {
            show() {
              addProgressDots(this, tour);
              removeAllHighlights();
              removeSidebarHighlight();
              if (sidebarSide) {
                // Highlight the sidebar directly by its data attribute — reliable
                // regardless of whether the inner target element is rendered yet.
                const sidebar = document.querySelector(`[data-sidebar-side="${sidebarSide}"]`);
                sidebar?.classList.add(SIDEBAR_HIGHLIGHT_CLASS);
              } else if (attachTo?.element) {
                const el = document.querySelector(attachTo.element);
                el?.classList.add(HIGHLIGHT_CLASS);
              }
            },
            hide() {
              removeSidebarHighlight();
              if (attachTo?.element) {
                document.querySelector(attachTo.element)?.classList.remove(HIGHLIGHT_CLASS);
              }
            },
          },
        });
      });

      // Clean up highlights on tour end
      tour.on('cancel', () => {
        localStorage.setItem(TOUR_SEEN_KEY, 'true');
        removeAllHighlights();
        removeSidebarHighlight();
        tourRef.current = null;
      });
      tour.on('complete', () => {
        removeAllHighlights();
        removeSidebarHighlight();
        tourRef.current = null;
      });

      tour.start();
    },
    [navigate]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      tourRef.current?.cancel();
      removeAllHighlights();
    };
  }, []);

  return { startTour, stopTour };
}
