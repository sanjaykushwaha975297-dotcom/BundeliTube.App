const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function processOriginalLogo() {
  const publicDir = path.join(__dirname, "..", "public");
  
  // Look for user-uploaded original images in public/
  const possibleNames = ["1.png", "logo.png", "original_logo.png", "logo.jpg", "1.jpg", "app_logo.png"];
  let originalPath = null;

  for (const name of possibleNames) {
    const p = path.join(publicDir, name);
    if (fs.existsSync(p)) {
      originalPath = p;
      console.log(`Found original user logo at: ${p}`);
      break;
    }
  }

  if (!originalPath) {
    console.log("No 1.png or logo.png found in public/ yet.");
    return false;
  }

  try {
    const metadata = await sharp(originalPath).metadata();
    console.log(`Original logo dimensions: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Resize keeping exact original aspect ratio and padding to avoid cropping
    // Using fit: 'contain' with safe-area margin
    await sharp(originalPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent background
      })
      .png()
      .toFile(path.join(publicDir, "logo-app-512.png"));

    await sharp(originalPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, "logo-app-192.png"));

    // Also update icon-512 and icon-192
    fs.copyFileSync(path.join(publicDir, "logo-app-512.png"), path.join(publicDir, "icon-512.png"));
    fs.copyFileSync(path.join(publicDir, "logo-app-192.png"), path.join(publicDir, "icon-192.png"));

    console.log("Successfully generated pixel-perfect logo-app-512.png and logo-app-192.png from your original file!");
    return true;
  } catch (err) {
    console.error("Error processing original logo:", err);
    return false;
  }
}

processOriginalLogo();
