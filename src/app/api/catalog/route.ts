import { NextResponse } from 'next/server';
import { modelsData } from '../../../data/deviceData';
import { REPAIR_ISSUES } from '../../../data/repair-issues';

export async function GET() {
  // 1. Generate XML Header
  let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Belmobile Product Catalog</title>
    <link>https://belmobile.be</link>
    <description>Belmobile Buyback &amp; Repair Catalog for Meta Marketplace</description>
    `;

  // 2. Add Buyback Items (Top Priority for Ads)
  Object.entries(modelsData).forEach(([brand, categories]) => {
    Object.entries(categories).forEach(([category, models]) => {
      Object.entries(models).forEach(([modelName, price]) => {
        // We create a "Buyback" product
        const id = `buyback-${brand}-${modelName}`.toLowerCase().replace(/\s+/g, '-');
        const title = `Vendez votre ${modelName} (${brand.toUpperCase()})`;
        const description = `Obtenez jusqu'à ${price}€ pour votre ${modelName}. Estimation instantanée chez Belmobile. Paiement immédiat à Schaerbeek ou Anderlecht.`;
        const link = `https://belmobile.be/fr/rachat/${brand}/${modelName.toLowerCase().replace(/\s+/g, '-')}`;

        // DYNAMIC OG IMAGE (Premium Touch)
        const image = `https://belmobile.be/api/og?title=${encodeURIComponent(modelName)}&subtitle=${encodeURIComponent(`Cash Rapide: ${price}€`)}`;

        xml += `
    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:condition>used</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${price} EUR</g:price>
      <g:brand>${brand.toUpperCase()}</g:brand>
      <g:google_product_category>Electronics &gt; Video Game Console &gt; Handheld Game Console</g:google_product_category>
    </item>`;
      });
    });
  });

  // 3. Add Repair Service Items
  REPAIR_ISSUES.forEach((repair) => {
    const id = `repair-${repair.id}`.toLowerCase();
    const title = `Réparation ${repair.label}`;
    const description = `${repair.desc}. Service rapide chez Belmobile (Schaerbeek & Anderlecht). Garantie 1 an incluse.`;
    const link = `https://belmobile.be/fr/reparation`;

    // DYNAMIC OG IMAGE for Repair Services
    const image = `https://belmobile.be/api/og?title=${encodeURIComponent(repair.label)}&subtitle=${encodeURIComponent(`Garantie 1 An | Dès ${repair.base}€`)}`;

    xml += `
    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${repair.base} EUR</g:price>
      <g:brand>BELMOBILE</g:brand>
      <g:google_product_category>Electronics &gt; Electronics Repairs</g:google_product_category>
    </item>`;
  });

  // 4. Close XML
  xml += `
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=86400', // Cache for 1 day
    },
  });
}
