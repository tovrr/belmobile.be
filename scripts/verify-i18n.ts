
import fs from 'fs';
import path from 'path';


const SRC_DIR = './src';
const I18N_DIR = './src/data/i18n';
const LANGUAGES = ['fr', 'en', 'nl', 'tr'];
const KEY_REGEX = /[^a-zA-Z0-9]t\(['"`]([^'"`]+)['"`]\)/g;

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                getAllSourceFiles(filePath, fileList);
            }
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function extractKeysFromFile(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const keys: string[] = [];
    let match;
    while ((match = KEY_REGEX.exec(content)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}

function verifyI18n() {
    console.log("🔍 Verifying Translation Integrity for ALL languages...");

    const files = getAllSourceFiles(SRC_DIR);

    // 1. Extract all used keys from source code
    const usedKeys = new Set<string>();
    files.forEach(file => {
        const keys = extractKeysFromFile(file);
        keys.forEach(k => usedKeys.add(k));
    });

    console.log(`ℹ️  Found ${usedKeys.size} unique keys used in source code.`);

    // 2. Check each language file
    let totalMissing = 0;

    LANGUAGES.forEach(lang => {
        const filePath = `${I18N_DIR}/${lang}.json`;
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Missing language file: ${filePath}`);
            totalMissing++;
            return;
        }

        try {
            const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const definedKeys = new Set(Object.keys(jsonContent));
            let missingInLang = 0;

            usedKeys.forEach(key => {
                // Ignore dynamic keys with ${}
                if (key.includes('${')) return;

                if (!definedKeys.has(key)) {
                    console.warn(`⚠️  [${lang.toUpperCase()}] Missing: "${key}"`);
                    missingInLang++;
                }
            });

            if (missingInLang > 0) {
                console.log(`❌ ${lang.toUpperCase()} has ${missingInLang} missing keys.`);
                totalMissing += missingInLang;
            } else {
                console.log(`✅ ${lang.toUpperCase()} is complete.`);
            }

        } catch (e) {
            console.error(`❌ Failed to parse ${filePath}:`, e);
        }
    });

    if (totalMissing > 0) {
        console.log(`\n❌ Validation Failed: ${totalMissing} missing translations across languages.`);
    } else {
        console.log("\n✅ All languages are fully synchronized!");
    }
}

verifyI18n();
