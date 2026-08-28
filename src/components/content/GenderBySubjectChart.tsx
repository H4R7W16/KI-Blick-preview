import { type TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IMAGE_SERIES } from '../../data/imageMetadata';
import { SUBJECTS } from '../../data/subjects';
import { getTeacherAttributes } from '../../utils/teacherAttributes';

interface SubjectChartRow {
  subject: string;
  flux2pro: number;
  'gpt-image-1-5': number;
  nanobana: number;
}

const MOBILE_BREAKPOINT = 768;
const MOBILE_WINDOW_SIZE = 3;

function femaleShare(subjectSlug: string, modelId: string): number {
  const series = IMAGE_SERIES.find(
    entry => entry.subjectSlug === subjectSlug && entry.modelId === modelId,
  );

  if (!series || series.images.length === 0) {
    return 0;
  }

  const female = series.images.filter(
    image => getTeacherAttributes(image.attributes).gender === 'female',
  ).length;
  return Math.round((female / series.images.length) * 100);
}

const DATA: SubjectChartRow[] = SUBJECTS.map(subject => ({
  subject: subject.label,
  flux2pro: femaleShare(subject.slug, 'flux2pro'),
  'gpt-image-1-5': femaleShare(subject.slug, 'gpt-image-1-5'),
  nanobana: femaleShare(subject.slug, 'nanobana'),
}));

function formatPercent(value: number | string | undefined): string {
  if (typeof value === 'number') {
    return `${value}%`;
  }
  if (typeof value === 'string') {
    return `${value}%`;
  }
  return '-';
}

export default function GenderBySubjectChart() {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });
  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);
  const [mobileWindowStart, setMobileWindowStart] = useState(0);

  const maxWindowStart = Math.max(0, DATA.length - MOBILE_WINDOW_SIZE);
  const mobileWindowData = useMemo(
    () => DATA.slice(mobileWindowStart, mobileWindowStart + MOBILE_WINDOW_SIZE),
    [mobileWindowStart],
  );

  const shiftMobileWindow = useCallback(
    (dir: 1 | -1) => {
      setMobileWindowStart(prev => Math.min(maxWindowStart, Math.max(0, prev + dir)));
    },
    [maxWindowStart],
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileZoomOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileZoomOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileZoomOpen(false);
      }
      if (event.key === 'ArrowLeft') {
        shiftMobileWindow(-1);
      }
      if (event.key === 'ArrowRight') {
        shiftMobileWindow(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileZoomOpen, shiftMobileWindow]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const dx = event.changedTouches[0].clientX - touchStartX.current;
    const dy = event.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      shiftMobileWindow(dx > 0 ? -1 : 1);
    }
  };

  const openMobileZoom = () => {
    if (!isMobile) return;
    setIsMobileZoomOpen(true);
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] dark:bg-[var(--color-card)] bg-white p-4 md:p-6">
      <h4 className="text-lg font-semibold dark:text-[var(--color-primary)] text-slate-900 mb-2">
        Gender-Verteilung nach Modell und Fach
      </h4>
      <p className="text-sm dark:text-[var(--color-secondary)] text-slate-700 mb-4">
        Angezeigt wird der Anteil weiblicher Darstellungen in Prozent.
      </p>

      <div
        className={`relative h-80 md:h-96 ${isMobile ? 'cursor-zoom-in' : ''}`}
        onClick={openMobileZoom}
        onKeyDown={event => {
          if (!isMobile) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openMobileZoom();
          }
        }}
        role={isMobile ? 'button' : undefined}
        tabIndex={isMobile ? 0 : undefined}
        aria-label={isMobile ? 'Diagramm in Zoomansicht öffnen' : undefined}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={DATA}
            margin={{ top: 10, right: 14, left: 0, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#64748B" />
            <XAxis
              dataKey="subject"
              angle={-30}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <Tooltip
              formatter={formatPercent}
              contentStyle={{ borderRadius: '0.75rem', borderColor: 'var(--color-border)' }}
            />
            <Legend />
            <Bar dataKey="flux2pro" name="FLUX2 PRO" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gpt-image-1-5" name="GPT Image-1.5" fill="#22C55E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="nanobana" name="Nano Bana" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {isMobile && (
          <div className="pointer-events-none absolute inset-x-3 top-3 rounded-xl border border-white/30 bg-slate-950/45 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
            Tippe für Zoom. Im Zoom sind immer 3 Fächer sichtbar, dann nach links/rechts wischen.
          </div>
        )}
      </div>

      {isMobile && isMobileZoomOpen && (
        <div
          className="fixed inset-0 z-[95] bg-slate-950/80 backdrop-blur-sm p-3"
          role="dialog"
          aria-modal="true"
          aria-label="Gezoomtes Gender-Diagramm"
          onClick={() => setIsMobileZoomOpen(false)}
        >
          <div
            className="mx-auto flex h-full w-full max-w-4xl flex-col rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-2xl dark:bg-[var(--color-card)]"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold dark:text-[var(--color-primary)] text-slate-900">
                  Gender-Verteilung (Zoom)
                </p>
                <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600 mt-1">
                  Sichtbar: 3 Faecher. Wische horizontal oder nutze die Pfeile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileZoomOpen(false)}
                className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium dark:text-[var(--color-primary)] text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Schliessen
              </button>
            </div>

            <div
              className="relative mt-4 flex-1 min-h-[18rem]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mobileWindowData}
                  margin={{ top: 10, right: 8, left: -8, bottom: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#64748B" />
                  <XAxis
                    dataKey="subject"
                    interval={0}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    formatter={formatPercent}
                    contentStyle={{ borderRadius: '0.75rem', borderColor: 'var(--color-border)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} />
                  <Bar
                    dataKey="flux2pro"
                    name="FLUX2 PRO"
                    fill="#0EA5E9"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="gpt-image-1-5"
                    name="GPT Image-1.5"
                    fill="#22C55E"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="nanobana"
                    name="Nano Bana"
                    fill="#F59E0B"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => shiftMobileWindow(-1)}
                disabled={mobileWindowStart === 0}
                className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed dark:text-[var(--color-primary)] text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Drei vorherige Faecher anzeigen"
              >
                Zurück
              </button>
              <p className="text-xs dark:text-[var(--color-secondary)] text-slate-600">
                Fenster {mobileWindowStart + 1} / {maxWindowStart + 1}
              </p>
              <button
                type="button"
                onClick={() => shiftMobileWindow(1)}
                disabled={mobileWindowStart >= maxWindowStart}
                className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed dark:text-[var(--color-primary)] text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Drei naechste Faecher anzeigen"
              >
                Weiter
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
