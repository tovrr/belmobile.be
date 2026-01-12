const fs = require('fs');
const path = require('path');

const files = ['fr.json', 'nl.json', 'en.json', 'tr.json'];
const dir = path.join(__dirname, '../src/data/i18n');

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        // Note: JSON.parse will automatically keep the LAST occurrence of a duplicate key.
        // This is exactly what we want to "fix duplicates".
        try {
            const data = JSON.parse(raw);

            // Special additions for fr.json
            if (file === 'fr.json') {
                if (!data['Sustainability']) data['Sustainability'] = 'Durabilité';
                if (!data['Buyback Offer']) data['Buyback Offer'] = 'Offre de reprise';
                if (!data['Repair Quote']) data['Repair Quote'] = 'Devis de réparation';
                if (!data['Device Details']) data['Device Details'] = "Détails de l'appareil";
                if (!data['Repair Cost']) data['Repair Cost'] = "Coût de la réparation";
                if (!data['By Appointment']) data['By Appointment'] = "Sur rendez-vous";
                if (!data['B2B Only']) data['B2B Only'] = "B2B uniquement";
                if (!data['Open Now']) data['Open Now'] = "Ouvert maintenant";
                if (!data['Closed']) data['Closed'] = "Fermé";
                if (!data['Temporarily Closed']) data['Temporarily Closed'] = "Fermé temporairement";
                if (!data['Submit']) data['Submit'] = "Envoyer";
                if (!data['Price']) data['Price'] = "Prix";
                if (!data['for']) data['for'] = "pour";
                if (!data['items_count']) data['items_count'] = "{0} articles";
                if (!data['need_help']) data['need_help'] = "Besoin d'aide ?";
                if (!data['need_help_short']) data['need_help_short'] = "Aide ?";
                if (!data['call_expert']) data['call_expert'] = "Appeler un expert";
                if (!data['call_expert_short']) data['call_expert_short'] = "Appeler";
                if (!data['call_support']) data['call_support'] = "Support";
                if (!data['Read More']) data['Read More'] = "Lire la suite";
                if (!data['Posted on']) data['Posted on'] = "Publié le";
                if (!data['By']) data['By'] = "Par";
            }

            const formatted = JSON.stringify(data, null, 4);
            fs.writeFileSync(filePath, formatted);
            console.log(`Processed ${file}: Fixed duplicates and added keys.`);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }
});
