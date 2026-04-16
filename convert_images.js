import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BANNERS_DIR = 'public/banners';

async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    const oldSize = fs.statSync(inputPath).size / 1024 / 1024;
    const newSize = fs.statSync(outputPath).size / 1024 / 1024;
    console.log(`✅ ${path.basename(inputPath)} -> ${path.basename(outputPath)} (${oldSize.toFixed(2)}MB -> ${newSize.toFixed(2)}MB)`);
  } catch (err) {
    console.error(`❌ Error en ${inputPath}:`, err.message);
  }
}

async function extractSvgToWebP(svgPath, outputPath) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    // Buscar la cadena base64 del PNG embebido
    const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
    if (!match) {
        // Intentar formato alternativo (href sin xlink)
        const match2 = svgContent.match(/href="data:image\/png;base64,([^"]+)"/);
        if (!match2) throw new Error('No se encontró imagen base64 en el SVG');
        return processBase64(match2[1], outputPath, svgPath);
    }
    return processBase64(match[1], outputPath, svgPath);
  } catch (err) {
    console.error(`❌ Error extrayendo SVG ${svgPath}:`, err.message);
  }
}

async function processBase64(base64Data, outputPath, originalPath) {
    const buffer = Buffer.from(base64Data, 'base64');
    await sharp(buffer)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    const oldSize = fs.statSync(originalPath).size / 1024 / 1024;
    const newSize = fs.statSync(outputPath).size / 1024 / 1024;
    console.log(`✅ ${path.basename(originalPath)} (Extracted) -> ${path.basename(outputPath)} (${oldSize.toFixed(2)}MB -> ${newSize.toFixed(2)}MB)`);
}

async function run() {
  console.log('--- Iniciando Conversión a WebP ---');
  
  // 1. Imágenes directas
  await convertToWebP(path.join(BANNERS_DIR, 'bg-7.png'), path.join(BANNERS_DIR, 'bg-7.webp'));
  await convertToWebP(path.join(BANNERS_DIR, 'logo-footer.png'), path.join(BANNERS_DIR, 'logo-footer.webp'));

  // 2. SVGs pesados
  await extractSvgToWebP(path.join(BANNERS_DIR, 'mobile.svg'), path.join(BANNERS_DIR, 'mobile.webp'));
  await extractSvgToWebP(path.join(BANNERS_DIR, 'desktop.svg'), path.join(BANNERS_DIR, 'desktop.webp'));
  
  console.log('--- Conversión Finalizada ---');
}

run();
