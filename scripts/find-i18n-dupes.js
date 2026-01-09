const fs = require('fs');
const path = require('path');

function findDuplicates(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const keys = {};
    const duplicates = [];

    lines.forEach((line, i) => {
        const match = line.match(/^\s*"([^"]+)"\s*:/);
        if (match) {
            const key = match[1];
            if (keys[key]) {
                duplicates.push({ key, line: i + 1, prevLine: keys[key] });
            }
            keys[key] = i + 1;
        }
    });

    return duplicates;
}

const trDupes = findDuplicates('c:/all projects/belmobile-live-be/next-platform/src/data/i18n/tr.json');
console.log('--- TR.JSON DUPLICATES ---');
trDupes.forEach(d => console.log(`Duplicate key "${d.key}" at line ${d.line} (previously at line ${d.prevLine})`));

const nlDupes = findDuplicates('c:/all projects/belmobile-live-be/next-platform/src/data/i18n/nl.json');
console.log('--- NL.JSON DUPLICATES ---');
nlDupes.forEach(d => console.log(`Duplicate key "${d.key}" at line ${d.line} (previously at line ${d.prevLine})`));

const enDupes = findDuplicates('c:/all projects/belmobile-live-be/next-platform/src/data/i18n/en.json');
console.log('--- EN.JSON DUPLICATES ---');
enDupes.forEach(d => console.log(`Duplicate key "${d.key}" at line ${d.line} (previously at line ${d.prevLine})`));

const frDupes = findDuplicates('c:/all projects/belmobile-live-be/next-platform/src/data/i18n/fr.json');
console.log('--- FR.JSON DUPLICATES ---');
frDupes.forEach(d => console.log(`Duplicate key "${d.key}" at line ${d.line} (previously at line ${d.prevLine})`));
