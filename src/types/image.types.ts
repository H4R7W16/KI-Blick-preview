export interface LegacyImageAttributes {
  perceivedGender: 'male' | 'female' | 'ambiguous';
  estimatedAge: string;
  skinTone: 'light' | 'medium' | 'dark';
  glasses: boolean;
  setting: string;
  attire: string;
  cameraAngle: string;
  props: string[];
  hairColor: string;
  hairLength: string;
  facialHair: boolean;
  headCovering: string;
  studentsVisible: boolean;
  textOnBoard: boolean;
  artifacts?: string;
}

export type TeacherGenderCategory = 'female' | 'male' | 'ambiguous';
export type TeacherHairColorCategory =
  | 'black'
  | 'brown'
  | 'blond'
  | 'red'
  | 'gray'
  | 'white'
  | 'bald'
  | 'covered'
  | 'other'
  | 'unclear';
export type TeacherSkinToneCategory = 'light' | 'medium' | 'dark' | 'unclear';
export type TeacherAgeCategory = '20-29' | '30-39' | '40-49' | '50-59' | '60+' | 'unclear';
export type TeacherGlassesCategory = 'yes' | 'no' | 'unclear';
export type TeacherClothingCategory =
  | 'formal-business'
  | 'smart-casual'
  | 'casual'
  | 'sport'
  | 'creative-workwear'
  | 'traditional'
  | 'labwear'
  | 'unclear';
export type TeacherBackgroundCategory =
  | 'classroom-board'
  | 'classroom-digital'
  | 'computer-lab'
  | 'art-studio'
  | 'music-room'
  | 'science-lab'
  | 'gym-indoor'
  | 'sports-field'
  | 'outdoor-school'
  | 'historical-classroom'
  | 'other'
  | 'unclear';

export type TeacherUtensilCategory =
  | 'book'
  | 'worksheet'
  | 'chalk-marker'
  | 'laptop-tablet'
  | 'code-screen'
  | 'math-formula-board'
  | 'physics-lab-equipment'
  | 'instrument'
  | 'sports-equipment'
  | 'art-tools'
  | 'language-symbols'
  | 'classical-symbols'
  | 'none'
  | 'other';

export type TeacherOutfitTag =
  | 'jackett'
  | 'blazer'
  | 'krawatte'
  | 'trainingshose'
  | 'sportshirt'
  | 'rock'
  | 'halstuch'
  | 'strickjacke'
  | 'schuerze'
  | 'hoodie';

export interface TeacherAttributes {
  gender: TeacherGenderCategory;
  hairColor: TeacherHairColorCategory;
  skinTone: TeacherSkinToneCategory;
  age: TeacherAgeCategory;
  glasses: TeacherGlassesCategory;
  clothing: TeacherClothingCategory;
  utensils: TeacherUtensilCategory[];
  outfitTags?: TeacherOutfitTag[];
  background: TeacherBackgroundCategory;
}

export interface ImageData {
  filename: string;
  index: number;
  attributes: TeacherAttributes;
}

export interface SeriesData {
  seriesId: string;
  prompt: string;
  model: string;
  modelId: string;
  count: number;
  images: ImageData[];
}

export interface AllMetadata {
  generatedAt: string;
  totalSeries: number;
  totalImages: number;
  series: SeriesData[];
}

export type ModelId = 'flux2pro' | 'gpt-image-1-5' | 'nanobana';

export interface SubjectInfo {
  slug: string;
  label: string;
  prompt: string;
  folder: string;
}

export interface ModelInfo {
  id: ModelId;
  label: string;
  folder: string;
  description: string;
}

export interface V1ImageData {
  filename: string;
  seed: number;
  prompt: string;
  promptSlug: string;
  model: string;
  basePath: string;
}

export interface V1Series {
  prompt: string;
  promptSlug: string;
  model: string;
  images: V1ImageData[];
  basePath: string;
}

export interface V2ImageData {
  filename: string;
  index: number;
  promptSlug: string;
  modelId: string;
  basePath: string;
}

export interface V2LanguageVariant {
  promptSlug: string;
  prompt: string;
  promptLanguage: string;
  promptScript: string;
  didacticRole: string;
}

export interface V2Series {
  variant: V2LanguageVariant;
  modelId: string;
  modelName: string;
  images: V2ImageData[];
  count: number;
}

export type V3ModelId = 'flux2pro' | 'gemini-image-2' | 'gpt-image-1-5' | 'nanobana';

export interface V3ImageData {
  filename: string;
  index: number;
  promptSlug: string;
  modelId: V3ModelId;
  basePath: string;
}

export interface V3ModelInfo {
  modelId: V3ModelId;
  modelName: string;
  signature: string;
}

export interface V3Series {
  modelId: V3ModelId;
  modelName: string;
  images: V3ImageData[];
  count: number;
}

export type EinordnenPromptCategory = 'school' | 'classroom' | 'alternative';

export interface EinordnenImageData {
  filename: string;
  index: number;
  promptSlug: string;
  modelId: ModelId;
  basePath: string;
  category: EinordnenPromptCategory;
}

export interface EinordnenCountry {
  countryId: string;
  countryName: string;
  continent: string;
  schoolSlug: string;
  classroomSlug: string;
}

export interface EinordnenAlternativePrompt {
  slug: string;
  prompt: string;
  strategy: string;
  strategyName: string;
  comparisonDefault: string;
}

export interface EinordnenSeries {
  promptSlug: string;
  modelId: ModelId;
  images: EinordnenImageData[];
  count: number;
}
