const fs = require('fs');
const path = require('path');

const files = ['fr.json', 'nl.json', 'tr.json', 'en.json'];
const i18nDir = path.join(process.cwd(), 'src', 'data', 'i18n');

files.forEach(file => {
    const filePath = path.join(i18nDir, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    try {
        JSON.parse(content);
        console.log(`${file}: JSON Valid`);
    } catch (e) {
        console.log(`${file}: JSON INVALID - ${e.message}`);
    }

    const lines = content.split('\n');
    const keys = new Map();

    lines.forEach((line, index) => {
        const match = line.match(/^\s*"(.*?)":/);
        if (match) {
            const key = match[1];
            if (keys.has(key)) {
                console.log(`${file} | Duplicate Key: "${key}" | Line ${index + 1} (First seen at line ${keys.get(key)})`);
            } else {
                keys.set(key, index + 1);
            }
        }
    });
});
