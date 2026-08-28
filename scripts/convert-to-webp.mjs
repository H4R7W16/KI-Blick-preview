import { readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const IMAGE_DIR = 'public/images';
const DRY_RUN = process.argv.includes('--dry-run');
const DELETE_ORIGINALS = process.argv.includes('--delete-originals');

function walkDir(dir, callback) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (['.jpg', '.jpeg', '.png'].includes(extname(fullPath).toLowerCase())) {
      callback(fullPath);
    }
  }
}

async function convert() {
  const sharp = (await import('sharp')).default;
  const files = [];

  walkDir(IMAGE_DIR, (filePath) => files.push(filePath));

  console.log(`Found ${files.length} images to convert.`);
  if (DRY_RUN) {
    console.log('DRY RUN – no files will be written.');
    files.forEach(f => console.log(' ', f));
    return;
  }

  let count = 0;
  let skipped = 0;
  let errors = 0;
  const sizeBefore = [];
  const sizeAfter = [];

  for (const filePath of files) {
    const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    // Skip if WebP already exists
    if (existsSync(webpPath)) {
      skipped++;
      continue;
    }

    const isContactSheet = basename(filePath).startsWith('_kontaktblatt');
    const quality = isContactSheet ? 85 : 82;

    try {
      const beforeSize = statSync(filePath).size;
      await sharp(filePath).webp({ quality }).toFile(webpPath);
      const afterSize = statSync(webpPath).size;
      sizeBefore.push(beforeSize);
      sizeAfter.push(afterSize);
      count++;

      if (count % 50 === 0 || count === files.length) {
        console.log(`  Converted ${count}/${files.length - skipped}...`);
      }
    } catch (err) {
      console.error(`ERROR converting ${filePath}:`, err.message);
      errors++;
    }
  }

  const totalBefore = sizeBefore.reduce((a, b) => a + b, 0);
  const totalAfter = sizeAfter.reduce((a, b) => a + b, 0);
  const savings = ((1 - totalAfter / totalBefore) * 100).toFixed(1);

  console.log(`\nDone: ${count} converted, ${skipped} skipped (already exist), ${errors} errors`);
  console.log(`Size before: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Size after:  ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Savings:     ${savings}%`);

  if (DELETE_ORIGINALS && errors === 0) {
    console.log('\nDeleting originals...');
    let deleted = 0;
    walkDir(IMAGE_DIR, (filePath) => {
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (existsSync(webpPath)) {
        unlinkSync(filePath);
        deleted++;
      }
    });
    console.log(`Deleted ${deleted} original files.`);
  } else if (DELETE_ORIGINALS && errors > 0) {
    console.log('\nNOT deleting originals because there were errors.');
  }
}

convert();
