import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

async function fixDesktop() {
    try {
        const svgPath = 'public/banners/desktop.svg';
        const outPath = 'public/banners/desktop.webp';
        
        console.log(`Leyendo ${svgPath}...`);
        const content = fs.readFileSync(svgPath, 'utf8');
        
        // Buscar el inicio de la data base64
        const startMarker = 'data:image/png;base64,';
        const startIndex = content.indexOf(startMarker);
        
        if (startIndex === -1) throw new Error('No se encontró el marcador base64');
        
        const b64Start = startIndex + startMarker.length;
        // Buscar el cierre de la comilla
        const endIndex = content.indexOf('"', b64Start);
        
        if (endIndex === -1) throw new Error('No se encontró el final del atributo base64');
        
        const b64Data = content.substring(b64Start, endIndex).replace(/\s+/g, ''); // Quitar posibles espacios/saltos
        
        console.log('Extrayendo buffer...');
        const buffer = Buffer.from(b64Data, 'base64');
        
        console.log('Convirtiendo a WebP...');
        await sharp(buffer)
            .webp({ quality: 80 })
            .toFile(outPath);
            
        console.log(`✅ Desktop optimizado: ${fs.statSync(outPath).size / 1024} KB`);
    } catch (err) {
        console.error('❌ Error en fixDesktop:', err.message);
    }
}

fixDesktop();
