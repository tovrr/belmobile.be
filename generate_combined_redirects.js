import fs from 'fs';
import { URL } from 'url';

// Hardcoded DEVICE_CATALOG from constants.ts
const DEVICE_CATALOG = {
    smartphone: {
        Apple: { 
            'iPhone 17 Pro Max': 1150, 'iPhone 17 Pro': 1050, 'iPhone 17 Plus': 900, 'iPhone 17': 850,
            'iPhone 16 Pro Max': 1050, 'iPhone 16 Pro': 950, 'iPhone 16 Plus': 800, 'iPhone 16': 750, 'iPhone 16E': 600,
            'iPhone 15 Pro Max': 950, 'iPhone 15 Pro': 850, 'iPhone 15 Plus': 700, 'iPhone 15': 650,
            'iPhone 14 Pro Max': 750, 'iPhone 14 Pro': 680, 'iPhone 14 Plus': 550, 'iPhone 14': 500,
            'iPhone 13 Pro Max': 580, 'iPhone 13 Pro': 500, 'iPhone 13': 400, 'iPhone 13 mini': 350,
            'iPhone 12 Pro Max': 380, 'iPhone 12 Pro': 330, 'iPhone 12': 280, 'iPhone 12 mini': 230,
            'iPhone 11 Pro Max': 280, 'iPhone 11 Pro': 240, 'iPhone 11': 200,
            'iPhone XS Max': 200, 'iPhone XS': 170, 'iPhone XR': 150, 'iPhone X': 140,
            'iPhone SE (3rd Gen)': 200, 'iPhone SE (2020)': 150
        },
        Samsung: { 
            'Galaxy S25 Ultra': 1100, 'Galaxy S25+': 950, 'Galaxy S25': 850, 'Galaxy S25 FE': 700,
            'Galaxy S24 Ultra': 900, 'Galaxy S24+': 750, 'Galaxy S24': 650, 'Galaxy S24 FE': 550,
            'Galaxy S23 Ultra': 700, 'Galaxy S23+': 600, 'Galaxy S23': 480, 'Galaxy S23 FE': 400,
            'Galaxy S22 Ultra': 550, 'Galaxy S22+': 450, 'Galaxy S22': 380,
            'Galaxy S21 Ultra': 400, 'Galaxy S21+': 320, 'Galaxy S21': 280, 'Galaxy S21 FE': 250,
            'Galaxy S20 Ultra': 300, 'Galaxy S20+': 250, 'Galaxy S20': 220, 'Galaxy S20 FE': 200,
            'Galaxy S9': 120, 'Galaxy S9+': 140, 'Galaxy S8': 100, 'Galaxy S8+': 120, 'Galaxy S7 Edge': 80, 'Galaxy S7': 70,
            'Galaxy Z Fold7': 1300, 'Galaxy Z Flip7': 900,
            'Galaxy Z Fold6': 1100, 'Galaxy Z Flip6': 750,
            'Galaxy Z Fold5': 850, 'Galaxy Z Flip5': 550,
            'Galaxy Z Fold4': 600, 'Galaxy Z Flip4': 400,
            'Galaxy Z Fold3': 450, 'Galaxy Z Flip3': 300,
            'Galaxy Z Flip 5G': 250, 'Galaxy Z Fold2': 350,
            'Galaxy Note 20 Ultra': 350, 'Galaxy Note 20': 280,
            'Galaxy Note 10+': 250, 'Galaxy Note 10': 200, 'Galaxy Note 10 Lite': 180,
            'Galaxy Note 9': 150, 'Galaxy Note 8': 120,
            'Galaxy A56': 320, 'Galaxy A55': 280, 'Galaxy A54': 220, 'Galaxy A53': 180, 'Galaxy A52': 150, 'Galaxy A51': 120, 'Galaxy A50': 100,
            'Galaxy A72': 180, 'Galaxy A71': 150, 'Galaxy A70': 130,
            'Galaxy A36': 240, 'Galaxy A35': 200, 'Galaxy A34': 160, 'Galaxy A32': 130, 'Galaxy A31': 110, 'Galaxy A30': 100,
            'Galaxy A26': 180, 'Galaxy A25': 150, 'Galaxy A24': 120, 'Galaxy A23': 110, 'Galaxy A22': 100, 'Galaxy A21s': 90, 'Galaxy A20e': 80,
            'Galaxy A17': 130, 'Galaxy A16': 110, 'Galaxy A15': 90, 'Galaxy A14': 70, 'Galaxy A13': 60, 'Galaxy A12': 50, 'Galaxy A10': 40,
            'Galaxy A04s': 50, 'Galaxy A03s': 40, 'Galaxy A02s': 35
        },
        Google: { 
            'Pixel 10 Pro XL': 1100, 'Pixel 10 Pro': 1000, 'Pixel 10': 850,
            'Pixel 9 Pro Fold': 1400,
            'Pixel 9 Pro XL': 950, 'Pixel 9 Pro': 900, 'Pixel 9': 750,
            'Pixel Fold': 800,
            'Pixel 8 Pro': 600, 'Pixel 8': 450, 'Pixel 8a': 350,
            'Pixel 7 Pro': 350, 'Pixel 7': 300, 'Pixel 7a': 250,
            'Pixel 6 Pro': 250, 'Pixel 6': 200, 'Pixel 6a': 150
        },
        Huawei: {
            'P40 Pro': 200, 'P40 Lite': 120, 'P30 Pro': 150, 'P30': 120, 'P30 Lite': 80,
            'P20 Pro': 100, 'P20': 80, 'Mate 20 Pro': 120, 'Mate 20 Lite': 70
        },
        OnePlus: { 
            'OnePlus 15': 950, 'OnePlus 14': 850, 'OnePlus 13': 750,
            'OnePlus 12': 650, 'OnePlus 12R': 450,
            'OnePlus 11': 450, 'OnePlus 11R': 350,
            'OnePlus 10 Pro': 350, 'OnePlus 10T': 300, 'OnePlus 10R': 280,
            'OnePlus 9 Pro': 280, 'OnePlus 9': 230, 'OnePlus 9RT': 220,
            'OnePlus 8 Pro': 200, 'OnePlus 8T': 180, 'OnePlus 8': 160,
            'OnePlus Open': 1000,
            'OnePlus Nord 4': 300, 'OnePlus Nord 3': 250, 'OnePlus Nord 2T': 200, 'OnePlus Nord 2': 180,
            'OnePlus Nord CE 4': 250, 'OnePlus Nord CE 3': 200,
            'OnePlus Nord CE 4 Lite': 200, 'OnePlus Nord CE 3 Lite': 150
        },
        Xiaomi: {
            'Xiaomi 14 Ultra': 850, 'Xiaomi 14': 650,
            'Xiaomi 13 Ultra': 600, 'Xiaomi 13 Pro': 450, 'Xiaomi 13': 380, 'Xiaomi 13 Lite': 200,
            'Xiaomi 13T Pro': 400, 'Xiaomi 13T': 300,
            'Xiaomi 12 Pro': 280, 'Xiaomi 12': 220, 'Xiaomi 12T Pro': 250, 'Xiaomi 12T': 200,
            'Xiaomi 11T Pro': 180, 'Xiaomi 11T': 150, 'Mi 11 Ultra': 250, 'Mi 11': 180, 'Mi 11 Lite': 120,
            'Redmi Note 13 Pro+': 250, 'Redmi Note 13 Pro': 200, 'Redmi Note 13': 150,
            'Redmi Note 12 Pro+': 180, 'Redmi Note 12 Pro': 140, 'Redmi Note 12': 100,
            'Redmi Note 11 Pro': 110, 'Redmi Note 11': 80,
            'Redmi 13C': 80, 'Redmi 12': 70, 'Redmi 10': 50, 'Redmi 9': 40,
            'POCO F6 Pro': 350, 'POCO F6': 280,
            'POCO X6 Pro': 220, 'POCO X6': 180,
            'POCO F5 Pro': 220, 'POCO F5': 180,
            'POCO X5 Pro': 140, 'POCO X5': 120
        },
        Oppo: {
            'Find X7 Ultra': 900, 'Find X7': 750,
            'Find X6 Pro': 600, 'Find X6': 450,
            'Find X5 Pro': 350, 'Find X5': 280,
            'Find N3': 1000, 'Find N3 Flip': 650,
            'Find N2': 700, 'Find N2 Flip': 450,
            'Reno 12 Pro': 450, 'Reno 12': 350,
            'Reno 11 Pro': 350, 'Reno 11': 280,
            'Reno 10 Pro+': 320, 'Reno 10 Pro': 260, 'Reno 10': 200,
            'Oppo A98 5G': 200, 'Oppo A79 5G': 150, 'Oppo A78': 130
        }
    },
    tablet: {
        Apple: { 
            'iPad Pro 12.9 M2': 800, 'iPad Pro 12.9 (2022)': 750, 'iPad Pro 12.9 (2021)': 650, 'iPad Pro 12.9 (2020)': 550, 'iPad Pro 12.9 (2018)': 450,
            'iPad Pro 11 (2022)': 600, 'iPad Pro 11 (2021)': 500, 'iPad Pro 11 (2020)': 400, 'iPad Pro 11 (2018)': 350,
            'iPad Air 5': 450, 'iPad Air 4': 350, 'iPad Air 3': 250,
            'iPad mini 6': 350, 'iPad mini 5': 250, 'iPad mini 4': 180,
            'iPad (10th Gen)': 300, 'iPad 9': 220, 'iPad 8': 180 
        },
        Samsung: { 
            'Galaxy Tab S9 Ultra': 800, 'Galaxy Tab S9': 600, 
            'Galaxy Tab S8 Ultra': 550, 'Galaxy Tab S8+': 450, 'Galaxy Tab S8': 400,
            'Galaxy Tab S7+': 350, 'Galaxy Tab S7 FE': 250, 'Galaxy Tab S7': 280,
            'Galaxy Tab S6 Lite': 150, 'Galaxy Tab S6': 180,
            'Galaxy Tab A8': 120, 'Galaxy Tab A7': 100
        },
        Microsoft: { 'Surface Pro 9': 700, 'Surface Go 3': 300 },
        Lenovo: { 'Tab P11 Pro': 250, 'Yoga Tab 13': 350 }
    },
    laptop: {
        Apple: { 
            'MacBook Pro 16 M2': 1800, 'MacBook Pro 14 M2': 1500, 
            'MacBook Pro 16 (M2 Pro/Max)': 1600, 'MacBook Pro 14 (M2 Pro/Max)': 1400,
            'MacBook Pro 13 M2': 1000, 'MacBook Air M2': 900, 'MacBook Air M1': 600,
            'MacBook Air 13 (2018-2020)': 400, 'MacBook Air 13 (2010-2017)': 250
        },
        Samsung: { 'Galaxy Book3 Pro': 1000, 'Galaxy Book3': 700 },
        HP: { 'Spectre x360': 850, 'Envy 13': 600 },
        Dell: { 'XPS 13': 900, 'Inspiron 15': 400 },
        Lenovo: { 'ThinkPad X1 Carbon': 1000, 'IdeaPad 5': 450 }
    },
    smartwatch: {
        Apple: { 
            'Apple Watch Ultra 2': 600, 'Apple Watch Ultra': 500, 
            'Apple Watch Series 9': 350, 'Apple Watch Series 8': 280, 'Apple Watch Series 7': 220,
            'Apple Watch SE 2': 180, 'Apple Watch SE': 140
        },
        Samsung: { 
            'Galaxy Watch 6 Classic': 250, 'Galaxy Watch 6': 180, 
            'Galaxy Watch 5 Pro': 150, 'Galaxy Watch 5': 120, 
            'Galaxy Watch 4 Classic': 100
        }
    },
    console: {
        Sony: { 'PlayStation 5 (Disc)': 350, 'PlayStation 5 (Digital)': 300, 'PlayStation 4 Pro': 120, 'PlayStation 4 Slim': 100, 'PlayStation 3 Slim': 60 },
        Xbox: { 'Xbox Series X': 350, 'Xbox Series S': 180, 'Xbox One': 80, 'Xbox 360': 40 },
        Nintendo: { 'Switch OLED': 200, 'Switch V2': 160, 'Switch Lite': 100, '3DS XL': 80 }
    }
};

// 1. Read files
const pagesCsv = fs.readFileSync('pages.csv', 'utf-8');
const legacyUrlMapContent = fs.readFileSync('utils/legacyUrlMap.ts', 'utf-8');

// 2. Extract data from files
const legacyUrlMapString = legacyUrlMapContent.substring(legacyUrlMapContent.indexOf('{'), legacyUrlMapContent.lastIndexOf('}') + 1);
const LEGACY_URL_MAP = new Function('return ' + legacyUrlMapString)();

const urls = pagesCsv.split('\n')
  .map(line => line.split(',')[0])
  .filter(url => url && url.startsWith('https://belmobile.be/'));

const combinedRedirects = { ...LEGACY_URL_MAP };

for (const url of urls) {
  let path = new URL(url).pathname;

  // Skip if already in legacyUrlMap
  if (combinedRedirects[path]) {
    continue;
  }

  // Skip root, product, collection, and new format URLs
  if (path === '/' || path.startsWith('/products/') || path.startsWith('/collections/') || path.startsWith('/fr/') || path.startsWith('/nl/')) {
    continue;
  }

  const normalizedPath = path.toLowerCase().replace(/[-_]/g, ' ');
  let foundMatch = false;

  for (const [category, brands] of Object.entries(DEVICE_CATALOG)) {
    for (const [brand, models] of Object.entries(brands)) {
      for (const model of Object.keys(models)) {
        const normalizedModel = model.toLowerCase();
        if (normalizedPath.includes(normalizedModel)) {
          const isBuyback = normalizedPath.includes('vendre') || normalizedPath.includes('sell') || normalizedPath.includes('rachat');
          const action = isBuyback ? 'buyback' : 'repair';
          const destination = `/fr/${action}/${category}/${encodeURIComponent(brand.toLowerCase())}/${encodeURIComponent(model.toLowerCase().replace(/ /g, '-'))}`;
          
          combinedRedirects[path] = destination;

          foundMatch = true;
          break;
        }
      }
      if (foundMatch) break;
    }
    if (foundMatch) break;
  }
}

// Write combined redirects to a JSON file
fs.writeFileSync('combined_redirects.json', JSON.stringify(combinedRedirects, null, 2));

console.log(`Generated ${Object.keys(combinedRedirects).length} combined redirects.`);
