import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '../src/data/models');
const OUTPUT_FILE = path.join(__dirname, '../src/data/search-index.ts');

const BRAND_MAP = {
    'apple': 'Apple',
    'samsung': 'Samsung',
    'xiaomi': 'Xiaomi',
    'oneplus': 'OnePlus',
    'google': 'Google',
    'huawei': 'Huawei',
    'oppo': 'Oppo',
    'sony': 'Sony',
    'dell': 'Dell',
    'hp': 'HP',
    'lenovo': 'Lenovo',
    'microsoft': 'Microsoft',
    'nintendo': 'Nintendo',
    'realme': 'Realme',
    'xbox': 'Xbox',
    'motorola': 'Motorola'
};

const CATEGORY_MAP = {
    'smartphone': 'smartphone',
    'tablet': 'tablet',
    'laptop': 'laptop',
    'smartwatch': 'smartwatch',
    'console': 'console'
};

function generateSlug(model) {
    return model.toLowerCase()
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/\+/g, '-plus')
        .replace(/\//g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

function parseFile(filePath, filename) {
    const content = fs.readFileSync(filePath, 'utf8');
    const brandKey = filename.replace('.ts', '');
    const brand = BRAND_MAP[brandKey] || brandKey.charAt(0).toUpperCase() + brandKey.slice(1);

    // Simple regex to find categories and models
    // We look for patterns like: 'Model Name': price,

    const entries = [];

    // Crude extraction of MODELS block
    const modelsMatch = content.match(/export const MODELS = ({[\s\S]+?});/);
    if (!modelsMatch) return [];

    const modelsBlock = modelsMatch[1];

    // Extract categories
    // Matches:  category: {
    const categoryRegex = /([a-z]+):\s*{([\s\S]*?)}/g;
    let match;

    while ((match = categoryRegex.exec(modelsBlock)) !== null) {
        const categoryKey = match[1];
        const innerBlock = match[2];
        const category = CATEGORY_MAP[categoryKey] || categoryKey;

        // Extract models from the inner block
        // Matches: 'Model Name':
        const modelRegex = /'([^']+)'\s*:/g;
        let modelMatch;
        while ((modelMatch = modelRegex.exec(innerBlock)) !== null) {
            const modelName = modelMatch[1];
            const slug = generateSlug(modelName);

            // Add useful keywords for better search
            const keywords = [
                brand.toLowerCase(),
                modelName.toLowerCase(),
                brand.toLowerCase() + modelName.toLowerCase().replace(/\s+/g, ''),
                modelName.toLowerCase().replace(/\s+/g, ''),
                slug.replace(/-/g, '')
            ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

            entries.push({
                slug: slug,
                brand: brand,
                category: category,
                model: modelName,
                keywords: keywords
            });
        }
    }

    return entries;
}

function main() {
    const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith('.ts'));
    let allEntries = {};

    files.forEach(file => {
        const entries = parseFile(path.join(MODELS_DIR, file), file);
        entries.forEach(entry => {
            allEntries[entry.slug] = {
                brand: entry.brand,
                category: entry.category,
                model: entry.model,
                keywords: entry.keywords
            };
        });
    });

    const outputContent = `// Automatically generated comprehensive search index
// This file aggregates all models from src/data/models/*.ts

export const SEARCH_INDEX: Record<string, { brand: string, category: string, model: string, keywords?: string[] }> = {
${Object.keys(allEntries).map(slug => {
        const entry = allEntries[slug];
        const keywordsStr = entry.keywords ? `, keywords: ${JSON.stringify(entry.keywords)}` : '';
        return `    '${slug}': { brand: '${entry.brand}', category: '${entry.category}', model: '${entry.model.replace(/'/g, "\\'")}'${keywordsStr} }`;
    }).join(',\n')}
};
`;

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log(`Generated search index with ${Object.keys(allEntries).length} entries.`);
}

main();
