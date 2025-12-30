import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const TARGET_DIRS = [
    'public/images',
    'public/images/bento',
    'public/images/blog',
    'public/images/avatars'
];

async function optimizeFolder(dir) {
    const fullPath = join(process.cwd(), dir);
    const files = await readdir(fullPath);

    for (const file of files) {
        const filePath = join(fullPath, file);
        const fileStat = await stat(filePath);

        if (fileStat.isDirectory()) continue;

        const ext = extname(file).toLowerCase();
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            const outputName = basename(file, ext) + '.webp';
            const outputPath = join(fullPath, outputName);

            console.log(`Optimizing: ${file} -> ${outputName}`);
            await sharp(filePath)
                .webp({ quality: 85 })
                .toFile(outputPath);

            console.log(`Done: ${outputName}`);
        }
    }
}

async function run() {
    for (const dir of TARGET_DIRS) {
        console.log(`Processing directory: ${dir}`);
        try {
            await optimizeFolder(dir);
        } catch (error) {
            console.error(`Error processing ${dir}:`, error.message);
        }
    }
}

run();
