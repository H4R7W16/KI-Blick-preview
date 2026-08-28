import { Link, useParams, useSearchParams } from 'react-router-dom';
import LearningPathBriefing from '../components/features/LearningPathBriefing';
import { useLearningPath } from '../contexts/LearningPathContext';
import { useProgress } from '../contexts/ProgressContext';
import { getPathById } from '../data/learningPaths';

export default function LearningPathBriefingPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const [searchParams] = useSearchParams();
  const { startPath } = useLearningPath();
  const { progress } = useProgress();

  const path = pathId ? getPathById(pathId) : undefined;
  const subjectFromQuery = searchParams.get('fach') ?? undefined;

  if (!path) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold dark:text-[var(--color-primary)] text-slate-900 mb-4">
          Lernpfad nicht gefunden
        </h1>
        <Link to="/lernen" className="text-[var(--color-area-lernen)] hover:underline">
          Zurück zu den Lernpfaden
        </Link>
      </div>
    );
  }

  const existingProgress = progress.learningPaths[path.id];
  const subject = subjectFromQuery ?? existingProgress?.selectedSubject;

  const handleStart = () => {
    startPath(path.id, { subject });
  };

  return <LearningPathBriefing path={path} onStart={handleStart} />;
}
