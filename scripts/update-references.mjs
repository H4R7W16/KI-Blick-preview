import { readFileSync, writeFileSync } from 'fs';

const filesToUpdate = [
  'src/pages/LandingPage.tsx',
  'src/pages/TaskPage.tsx',
  'src/components/content/BiasClassifier.tsx',
  'src/data/einordnenContent.ts',
  'src/components/content/ShareDecisionTool.tsx',
  'src/components/content/BiasSpectrumExplorer.tsx',
  'src/components/content/PipelineAnimation.tsx',
  'src/components/content/NoiseToImage.tsx',
  'src/components/content/ModelComparisonGrid.tsx',
  'src/components/content/PromptWorkshop.tsx',
  'src/components/content/ImageTextPairExplorer.tsx',
];

for (const file of filesToUpdate) {
  const content = readFileSync(file, 'utf8');

  // Replace _kontaktblatt.jpg and any /images/...*.jpg paths
  const updated = content
    .replace(/_kontaktblatt\.jpg/g, '_kontaktblatt.webp')
    .replace(/\/images\/([^'"` \n]+)\.jpg/g, '/images/$1.webp');

  if (content !== updated) {
    writeFileSync(file, updated, 'utf8');
    const count =
      (content.match(/_kontaktblatt\.jpg/g) || []).length +
      (content.match(/\/images\/([^'"` \n]+)\.jpg/g) || []).length;
    console.log(`${file}: ${count} replacements`);
  } else {
    console.log(`${file}: no changes needed`);
  }
}
