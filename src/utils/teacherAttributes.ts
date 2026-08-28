import type {
  LegacyImageAttributes,
  TeacherAgeCategory,
  TeacherAttributes,
  TeacherBackgroundCategory,
  TeacherClothingCategory,
  TeacherGlassesCategory,
  TeacherHairColorCategory,
  TeacherOutfitTag,
  TeacherSkinToneCategory,
  TeacherUtensilCategory,
} from '../types/image.types';

const VALID_GENDER = new Set<TeacherAttributes['gender']>(['female', 'male', 'ambiguous']);
const VALID_HAIR_COLOR = new Set<TeacherHairColorCategory>([
  'black',
  'brown',
  'blond',
  'red',
  'gray',
  'white',
  'bald',
  'covered',
  'other',
  'unclear',
]);
const VALID_SKIN_TONE = new Set<TeacherSkinToneCategory>(['light', 'medium', 'dark', 'unclear']);
const VALID_AGE = new Set<TeacherAgeCategory>(['20-29', '30-39', '40-49', '50-59', '60+', 'unclear']);
const VALID_GLASSES = new Set<TeacherGlassesCategory>(['yes', 'no', 'unclear']);
const VALID_CLOTHING = new Set<TeacherClothingCategory>([
  'formal-business',
  'smart-casual',
  'casual',
  'sport',
  'creative-workwear',
  'traditional',
  'labwear',
  'unclear',
]);
const VALID_BACKGROUND = new Set<TeacherBackgroundCategory>([
  'classroom-board',
  'classroom-digital',
  'computer-lab',
  'art-studio',
  'music-room',
  'science-lab',
  'gym-indoor',
  'sports-field',
  'outdoor-school',
  'historical-classroom',
  'other',
  'unclear',
]);
const VALID_UTENSILS = new Set<TeacherUtensilCategory>([
  'book',
  'worksheet',
  'chalk-marker',
  'laptop-tablet',
  'code-screen',
  'math-formula-board',
  'physics-lab-equipment',
  'instrument',
  'sports-equipment',
  'art-tools',
  'language-symbols',
  'classical-symbols',
  'none',
  'other',
]);
const VALID_OUTFIT_TAGS = new Set<TeacherOutfitTag>([
  'jackett',
  'blazer',
  'krawatte',
  'trainingshose',
  'sportshirt',
  'rock',
  'halstuch',
  'strickjacke',
  'schuerze',
  'hoodie',
]);

function isTeacherAttributes(attrs: unknown): attrs is TeacherAttributes {
  if (!attrs || typeof attrs !== 'object') return false;
  return (
    'gender' in attrs &&
    'hairColor' in attrs &&
    'skinTone' in attrs &&
    'age' in attrs &&
    'glasses' in attrs &&
    'clothing' in attrs &&
    'utensils' in attrs &&
    'background' in attrs
  );
}

function normalizeOutfitTags(raw: unknown): TeacherOutfitTag[] {
  if (!Array.isArray(raw)) return [];
  const cleaned = [...new Set(raw.filter((value): value is TeacherOutfitTag => VALID_OUTFIT_TAGS.has(value)))] as TeacherOutfitTag[];
  return cleaned;
}

function normalizeTeacherAttributes(attrs: TeacherAttributes): TeacherAttributes {
  const gender = VALID_GENDER.has(attrs.gender) ? attrs.gender : 'ambiguous';
  const hairColor = VALID_HAIR_COLOR.has(attrs.hairColor) ? attrs.hairColor : 'unclear';
  const skinTone = VALID_SKIN_TONE.has(attrs.skinTone) ? attrs.skinTone : 'unclear';
  const age = VALID_AGE.has(attrs.age) ? attrs.age : 'unclear';
  const glasses = VALID_GLASSES.has(attrs.glasses) ? attrs.glasses : 'unclear';
  const clothing = VALID_CLOTHING.has(attrs.clothing) ? attrs.clothing : 'unclear';
  const background = VALID_BACKGROUND.has(attrs.background) ? attrs.background : 'unclear';

  const rawUtensils = Array.isArray(attrs.utensils) ? attrs.utensils : [];
  const cleanedUtensils = rawUtensils.filter((value): value is TeacherUtensilCategory => VALID_UTENSILS.has(value));
  const deduped = [...new Set(cleanedUtensils)] as TeacherUtensilCategory[];
  let utensils: TeacherUtensilCategory[] = deduped.length > 0 ? deduped : ['none'];
  if (utensils.includes('none') && utensils.length > 1) {
    utensils = utensils.filter(value => value !== 'none');
  }

  const hasOutfitTags = Object.prototype.hasOwnProperty.call(attrs, 'outfitTags');
  const outfitTags = hasOutfitTags ? normalizeOutfitTags(attrs.outfitTags) : undefined;
  return {
    gender,
    hairColor,
    skinTone,
    age,
    glasses,
    clothing,
    utensils,
    ...(hasOutfitTags ? { outfitTags } : {}),
    background,
  };
}

function mapAgeCategory(value: string): TeacherAgeCategory {
  const normalized = value.trim();
  if (normalized === '20-30') return '20-29';
  if (normalized === '30-40') return '30-39';
  if (normalized === '40-50') return '40-49';
  if (normalized === '50-60') return '50-59';
  if (normalized === '60+') return '60+';
  return 'unclear';
}

function mapHairColor(attrs: LegacyImageAttributes): TeacherHairColorCategory {
  if (attrs.headCovering && attrs.headCovering !== 'none') return 'covered';
  if (attrs.hairLength === 'bald') return 'bald';

  const color = attrs.hairColor;
  if (color === 'black' || color === 'brown' || color === 'blond' || color === 'red') {
    return color;
  }
  if (color === 'gray') return 'gray';
  if (color === 'other') return 'other';
  return 'unclear';
}

function mapSkinTone(value: string): TeacherSkinToneCategory {
  if (value === 'light' || value === 'medium' || value === 'dark') return value;
  return 'unclear';
}

function mapClothing(value: string): TeacherClothingCategory {
  if (value === 'formal') return 'formal-business';
  if (value === 'smart-casual') return 'smart-casual';
  if (value === 'casual') return 'casual';
  if (value === 'sport') return 'sport';
  if (value === 'creative') return 'creative-workwear';
  if (value === 'lab-coat') return 'labwear';
  return 'unclear';
}

function mapBackground(attrs: LegacyImageAttributes): TeacherBackgroundCategory {
  const setting = attrs.setting;
  const props = new Set(attrs.props);

  if (setting === 'gym') return 'gym-indoor';
  if (setting === 'outdoor') {
    if (props.has('soccer-ball') || props.has('basketball') || props.has('sports-cones')) {
      return 'sports-field';
    }
    return 'outdoor-school';
  }
  if (setting === 'lab') return 'science-lab';
  if (setting === 'studio') return 'art-studio';
  if (setting === 'office') return 'other';

  if (setting === 'classroom') {
    if (props.has('computer') || props.has('code-screen') || props.has('laptop')) return 'computer-lab';
    if (props.has('palette') || props.has('easel') || props.has('brush')) return 'art-studio';
    if (props.has('guitar') || props.has('piano') || props.has('violin') || props.has('sheet-music')) return 'music-room';
    if (props.has('lab-equipment') || props.has('experiment') || props.has('atom-model')) return 'science-lab';
    if (props.has('roman-bust') || props.has('classical-map') || props.has('latin-board') || props.has('spqr')) {
      return 'historical-classroom';
    }
    if (props.has('display') || props.has('digital-board')) return 'classroom-digital';
    if (props.has('whiteboard') || props.has('chalkboard') || props.has('chalk') || props.has('marker')) {
      return 'classroom-board';
    }
    return 'classroom-board';
  }

  if (setting === 'other') return 'other';
  return 'unclear';
}

function addUtensil(out: Set<TeacherUtensilCategory>, utensil: TeacherUtensilCategory): void {
  out.add(utensil);
}

function mapUtensils(attrs: LegacyImageAttributes): TeacherUtensilCategory[] {
  const out = new Set<TeacherUtensilCategory>();
  const props = new Set(attrs.props);

  if (props.has('textbook') || props.has('book')) addUtensil(out, 'book');
  if (props.has('worksheet') || props.has('paper')) addUtensil(out, 'worksheet');
  if (props.has('chalk') || props.has('marker')) addUtensil(out, 'chalk-marker');
  if (props.has('laptop') || props.has('tablet')) addUtensil(out, 'laptop-tablet');
  if (props.has('code-screen') || props.has('computer') || props.has('monitor')) addUtensil(out, 'code-screen');
  if (props.has('formula') || props.has('geometry') || props.has('graph')) addUtensil(out, 'math-formula-board');
  if (props.has('experiment') || props.has('lab-equipment') || props.has('atom-model')) {
    addUtensil(out, 'physics-lab-equipment');
  }
  if (props.has('guitar') || props.has('piano') || props.has('violin') || props.has('sheet-music')) {
    addUtensil(out, 'instrument');
  }
  if (props.has('sports-cones') || props.has('soccer-ball') || props.has('basketball') || props.has('whistle')) {
    addUtensil(out, 'sports-equipment');
  }
  if (props.has('palette') || props.has('brush') || props.has('easel') || props.has('canvas')) {
    addUtensil(out, 'art-tools');
  }
  if (props.has('german-flag') || props.has('uk-flag') || props.has('us-flag') || props.has('french-flag')) {
    addUtensil(out, 'language-symbols');
  }
  if (props.has('roman-bust') || props.has('spqr') || props.has('latin-board')) {
    addUtensil(out, 'classical-symbols');
  }

  if (out.size === 0) out.add('none');
  return [...out];
}

export function getTeacherAttributes(
  attrs: LegacyImageAttributes | TeacherAttributes,
): TeacherAttributes {
  if (isTeacherAttributes(attrs)) {
    return normalizeTeacherAttributes(attrs);
  }

  const gender =
    attrs.perceivedGender === 'female' || attrs.perceivedGender === 'male'
      ? attrs.perceivedGender
      : 'ambiguous';

  const glasses: TeacherGlassesCategory = attrs.glasses === true ? 'yes' : 'no';

  return normalizeTeacherAttributes({
    gender,
    hairColor: mapHairColor(attrs),
    skinTone: mapSkinTone(attrs.skinTone),
    age: mapAgeCategory(attrs.estimatedAge),
    glasses,
    clothing: mapClothing(attrs.attire),
    utensils: mapUtensils(attrs),
    background: mapBackground(attrs),
  });
}

export const TEACHER_CATEGORY_LABELS = {
  gender: {
    female: 'weiblich gelesen',
    male: 'maennlich gelesen',
    ambiguous: 'uneindeutig',
  },
  hairColor: {
    black: 'schwarz',
    brown: 'braun',
    blond: 'blond',
    red: 'rot',
    gray: 'grau/weiss',
    white: 'grau/weiss',
    bald: 'glatze',
    covered: 'bedeckt',
    other: 'sonstige',
    unclear: 'unklar',
  },
  skinTone: {
    light: 'hell',
    medium: 'mittel',
    dark: 'dunkel',
    unclear: 'unklar',
  },
  age: {
    '20-29': '20-29',
    '30-39': '30-39',
    '40-49': '40-49',
    '50-59': '50-59',
    '60+': '60+',
    unclear: 'unklar',
  },
  glasses: {
    yes: 'ja',
    no: 'nein',
    unclear: 'unklar',
  },
  clothing: {
    'formal-business': 'business (anzug/blazer)',
    'smart-casual': 'smart casual',
    casual: 'alltag',
    sport: 'sportkleidung',
    'creative-workwear': 'atelier/arbeitskleidung',
    traditional: 'traditionell',
    labwear: 'laborkittel',
    unclear: 'unklar',
  },
  background: {
    'classroom-board': 'klassenraum (tafel)',
    'classroom-digital': 'klassenraum (smartboard)',
    'computer-lab': 'computerraum',
    'art-studio': 'kunstraum',
    'music-room': 'musikraum',
    'science-lab': 'labor',
    'gym-indoor': 'sporthalle',
    'sports-field': 'sportplatz',
    'outdoor-school': 'aussenbereich/schulhof',
    'historical-classroom': 'historischer raum',
    other: 'sonstige',
    unclear: 'unklar',
  },
  outfitTags: {
    jackett: 'Jackett',
    blazer: 'Blazer',
    krawatte: 'Krawatte',
    trainingshose: 'Trainingshose',
    sportshirt: 'Sportshirt',
    rock: 'Rock',
    halstuch: 'Halstuch/Schal',
    strickjacke: 'Strickjacke',
    schuerze: 'Schuerze',
    hoodie: 'Hoodie',
  },
  utensils: {
    book: 'buch',
    worksheet: 'arbeitsblatt',
    'chalk-marker': 'kreide/marker',
    'laptop-tablet': 'laptop/tablet',
    'code-screen': 'code am bildschirm',
    'math-formula-board': 'formeln/diagramme',
    'physics-lab-equipment': 'laborequipment',
    instrument: 'instrument',
    'sports-equipment': 'sportgeraet',
    'art-tools': 'kunstmaterial',
    'language-symbols': 'sprachsymbole/flaggen',
    'classical-symbols': 'antike symbole',
    none: 'keine',
    other: 'sonstige',
  },
} as const;

const DERIVED_OUTFIT_TAG_ORDER: TeacherOutfitTag[] = [
  'krawatte',
  'halstuch',
  'schuerze',
  'blazer',
  'jackett',
  'strickjacke',
  'hoodie',
  'rock',
  'sportshirt',
  'trainingshose',
];

function deriveOutfitTagsSet(attrs: TeacherAttributes, subjectSlug: string): Set<TeacherOutfitTag> {
  const out = new Set<TeacherOutfitTag>();

  switch (attrs.clothing) {
    case 'formal-business':
      out.add('jackett');
      out.add('blazer');
      break;
    case 'smart-casual':
      out.add('blazer');
      out.add('strickjacke');
      break;
    case 'casual':
      out.add('strickjacke');
      out.add('hoodie');
      break;
    case 'sport':
      out.add('sportshirt');
      out.add('trainingshose');
      break;
    case 'creative-workwear':
      out.add('schuerze');
      out.add('halstuch');
      break;
    case 'labwear':
      break;
    case 'traditional':
      out.add('rock');
      out.add('halstuch');
      break;
    default:
      break;
  }

  if (['mathematiklehrkraft', 'physiklehrkraft', 'informatiklehrkraft', 'lateinlehrkraft'].includes(subjectSlug)) {
    if (attrs.clothing === 'formal-business' || attrs.clothing === 'smart-casual') {
      out.add('krawatte');
    }
  }

  if (subjectSlug === 'sportlehrkraft') {
    out.add('sportshirt');
    if (attrs.background === 'sports-field' || attrs.background === 'gym-indoor') {
      out.add('trainingshose');
    }
  }

  if (subjectSlug === 'kunstlehrkraft') {
    out.add('schuerze');
    if (attrs.clothing === 'smart-casual' || attrs.clothing === 'casual') {
      out.add('halstuch');
    }
  }

  if (subjectSlug === 'musiklehrkraft') {
    if (attrs.clothing === 'smart-casual' || attrs.clothing === 'casual') {
      out.add('halstuch');
    }
  }

  if (['deutschlehrkraft', 'englischlehrkraft', 'franzoesischlehrkraft', 'lateinlehrkraft'].includes(subjectSlug)) {
    if (attrs.clothing === 'smart-casual' || attrs.clothing === 'formal-business') {
      out.add('halstuch');
    }
    if (attrs.gender === 'female' && (attrs.clothing === 'formal-business' || attrs.clothing === 'smart-casual')) {
      out.add('rock');
    }
  }

  return out;
}

export function deriveOutfitTags(
  subjectSlug: string,
  attrs: TeacherAttributes,
): TeacherOutfitTag[] {
  const derived = deriveOutfitTagsSet(attrs, subjectSlug);
  return DERIVED_OUTFIT_TAG_ORDER.filter(tag => derived.has(tag));
}

export function getTeacherOutfitTags(
  subjectSlug: string,
  attrs: TeacherAttributes,
): TeacherOutfitTag[] {
  if (Object.prototype.hasOwnProperty.call(attrs, 'outfitTags')) {
    return normalizeOutfitTags(attrs.outfitTags);
  }
  return deriveOutfitTags(subjectSlug, attrs);
}
