const fs = require('fs');
const path = require('path');

const files = ['en.json', 'fr.json', 'nl.json', 'tr.json'];
const baseDir = path.join('c:', 'all projects', 'belmobile-live-be', 'next-platform', 'src', 'data', 'i18n');

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        try {
            // Using a simple object to remove duplicates while preserving the LAST occurrence (usually the one we just added)
            // JSON.parse doesn't handle duplicates well in some environments but here we can't easily parse it if it has duplicates without a library
            // So we'll do it by line/regex if complex, but the lint implies it's standard JSON with duplicate keys which is technically valid but frowned upon.

            // Actually, we can just use the object approach if we're careful.
            // But wait, if I use JSON.parse, the last key wins.
            const obj = JSON.parse(content);
            const sortedKeys = Object.keys(obj).sort();
            const newObj = {};
            // Re-assembling with sorted keys (optional but good for diffing)
            sortedKeys.forEach(key => {
                newObj[key] = obj[key];
            });
            fs.writeFileSync(filePath, JSON.stringify(newObj, null, 4), 'utf8');
            console.log(`Successfully cleaned ${file}`);
        } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
        }
    }
});
