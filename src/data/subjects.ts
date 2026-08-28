import type { SubjectInfo, ModelInfo, ModelId } from '../types/image.types';
import { resolveAssetPath } from '../utils/assetPath';

export const SUBJECTS: SubjectInfo[] = [
  { slug: 'mathematiklehrkraft', label: 'Mathematik', prompt: 'Mathematiklehrkraft', folder: 'Mathematiklehrkraft' },
  { slug: 'deutschlehrkraft', label: 'Deutsch', prompt: 'Deutschlehrkraft', folder: 'Deutschlehrkraft' },
  { slug: 'physiklehrkraft', label: 'Physik', prompt: 'Physiklehrkraft', folder: 'Physiklehrkraft' },
  { slug: 'informatiklehrkraft', label: 'Informatik', prompt: 'Informatiklehrkraft', folder: 'Informatiklehrkraft' },
  { slug: 'englischlehrkraft', label: 'Englisch', prompt: 'Englischlehrkraft', folder: 'Englischlehrkraft' },
  { slug: 'franzoesischlehrkraft', label: 'Französisch', prompt: 'Französischlehrkraft', folder: 'Französischlehrkraft' },
  { slug: 'lateinlehrkraft', label: 'Latein', prompt: 'Lateinlehrkraft', folder: 'Lateinlehrkraft' },
  { slug: 'kunstlehrkraft', label: 'Kunst', prompt: 'Kunstlehrkraft', folder: 'Kunstlehrkraft' },
  { slug: 'musiklehrkraft', label: 'Musik', prompt: 'Musiklehrkraft', folder: 'Musiklehrkraft' },
  { slug: 'sportlehrkraft', label: 'Sport', prompt: 'Sportlehrkraft', folder: 'Sportlehrkraft' },
];

export const SUBJECT_GROUPS: Record<string, string[]> = {
  'MINT': ['mathematiklehrkraft', 'physiklehrkraft', 'informatiklehrkraft'],
  'Sprachen': ['deutschlehrkraft', 'englischlehrkraft', 'franzoesischlehrkraft', 'lateinlehrkraft'],
  'Kreativ & Sport': ['kunstlehrkraft', 'musiklehrkraft', 'sportlehrkraft'],
};

export const MODELS: ModelInfo[] = [
  { id: 'flux2pro', label: 'FLUX2 PRO', folder: 'FLUX2 PRO', description: 'Erstellt in Leonardo AI mit Default-Einstellungen' },
  { id: 'gpt-image-1-5', label: 'GPT Image-1.5', folder: 'GPT Image-1 5', description: 'Quality: medium' },
  { id: 'nanobana', label: 'Nano Bana', folder: 'Nano Bana', description: 'Gemini 2.5 Flash' },
];

export function getSubjectBySlug(slug: string): SubjectInfo | undefined {
  return SUBJECTS.find(s => s.slug === slug);
}

export function getModelById(id: ModelId): ModelInfo | undefined {
  return MODELS.find(m => m.id === id);
}

export function isAnalysisEnabledForSubject(_slug: string): boolean {
  void _slug;
  return true;
}

export function getImageBasePath(subjectSlug: string, modelId: ModelId): string {
  return resolveAssetPath(`/images/generated/${subjectSlug}/${modelId}`);
}
