const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_DIR = "D:\\Фото";
const TARGET_DIR = path.join(__dirname, "..", "public", "photos");
const DATA_DIR = path.join(__dirname, "..", "src", "data");
const OUTPUT_JSON = path.join(DATA_DIR, "wedding-photos.json");

async function main() {
  console.log("Checking source directory:", SOURCE_DIR);
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error("Source directory does not exist:", SOURCE_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp";
  });

  console.log(`Found ${files.length} photos to process from ${SOURCE_DIR}.`);

  const results = [];
  let processed = 0;

  for (const file of files) {
    const srcPath = path.join(SOURCE_DIR, file);
    // Sanitize filename for safe web URLs
    const safeName = file.replace(/[^a-zA-Z0-9._-]/g, "_");
    const destPath = path.join(TARGET_DIR, safeName);

    try {
      if (!fs.existsSync(destPath)) {
        await sharp(srcPath)
          .rotate() // auto-orient from EXIF
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(destPath);
      }

      const stat = fs.statSync(destPath);
      results.push({
        url: `/photos/${safeName}`,
        pathname: safeName,
        size: stat.size,
        uploadedAt: new Date(stat.mtime).toISOString(),
        downloadUrl: `/photos/${safeName}`,
      });

      processed++;
      if (processed % 25 === 0 || processed === files.length) {
        console.log(`Processed ${processed}/${files.length} photos...`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2), "utf8");
  console.log(`Done! Saved ${results.length} photos to ${OUTPUT_JSON}`);
}

main().catch(console.error);
