import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
    'public/images/microsoldering_hero_bespoke.png',
    'public/images/hero_phone_branded.png'
];

async function run() {
    for (const file of files) {
        const input = path.resolve(file);
        const output = input.replace('.png', '.webp');
        if (!fs.existsSync(input)) {
            console.error(`Input file not found: ${input}`);
            continue;
        }
        console.log(`Converting ${input} -> ${output}`);
        try {
            await sharp(input)
                .webp({ quality: 80 })
                .toFile(output);
            console.log('Done');
        } catch (e) {
            console.error(`Error converting ${file}:`, e);
        }
    }
}
run();
