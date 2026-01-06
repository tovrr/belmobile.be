import { NextResponse } from 'next/server';
import { SHOPS, MOCK_REPAIR_PRICES } from '../../../constants';
import { REPAIR_ISSUES } from '../../../data/repair-issues';
import { modelsData } from '../../../data/deviceData';

// Lite RAG: Helper to score relevance of items
function getMatchScore(targetId: string, keywords: string[]) {
    if (!targetId) return 0;
    const id = targetId.toLowerCase().replace(/-/g, ' ');
    let score = 0;
    keywords.forEach(kw => {
        if (id.includes(kw)) score += 1;
        if (/^\d+$/.test(kw) && id.includes(kw)) score += 5;
    });
    return score;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, history, language = 'fr', userEmail } = body;

        // --- IDENTITY VERIFICATION PROTOCOL ---
        // TODO: Add your exact email here for tight security
        const AUTHORIZED_EMAILS = ['omer@belmobile.be', 'info@belmobile.be', 'admin@belmobile.be', 'omerozkan@live.be'];
        // Strict check: Must match list OR contain 'belmobile.be' domain
        const isAdmin = userEmail && (
            AUTHORIZED_EMAILS.includes(userEmail) ||
            userEmail.endsWith('@belmobile.be')
        );

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey || apiKey.includes('YOUR_KEY')) {
            return NextResponse.json({
                text: "Bot is in Demo Mode. Please contact us via WhatsApp.",
                isDemo: true
            });
        }

        // ... (Context Retrieval Logic remains same) ...
        // 1. Context Retrieval
        const userKeywords = (message + " " + (history || []).slice(-2).map((m: any) => m.text).join(" "))
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ' ')
            .split(' ')
            .filter((w: string) => w.length > 1);

        // ... (Repairs & Models filtering code) ...
        // We need to keep the existing context logic but I'll skip re-writing it all to save tokens, just replacing the POST start and System Prompt

        // Let's rewrite the block up to System Instruction creation to inject isAdmin logic
        // actually, I will use a larger block replacement to ensure context flow is correct.

        // Filter Repairs (Safe from serialization issues because we only pick strings/numbers)
        const prioritizedRepairs = REPAIR_ISSUES
            .map((ri: any) => ({
                id: ri.id,
                label: ri.label,
                base: ri.base,
                score: getMatchScore(ri.id + " " + ri.label, userKeywords)
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // Filter Models
        const prioritizedModels: any[] = [];
        try {
            Object.entries(modelsData).forEach(([brand, categories]) => {
                Object.entries(categories).forEach(([category, models]) => {
                    Object.entries(models).forEach(([modelName, price]) => {
                        const score = getMatchScore(modelName, userKeywords);
                        if (score > 2) {
                            prioritizedModels.push({
                                brand, category, name: modelName, buybackBase: price, score
                            });
                        }
                    });
                });
            });
        } catch (e) {
            console.warn("ModelsData traversal failed", e);
        }

        const topModels = prioritizedModels
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

        // Create context strings from data
        const shopsContext = SHOPS.map((s: any) =>
            `- ${s.name}: ${s.address} | 📞 ${s.phone} | 🕒 ${Array.isArray(s.openingHours) ? s.openingHours.join(', ') : s.openingHours}`
        ).join('\n');

        const repairSummary = prioritizedRepairs.length > 0
            ? prioritizedRepairs.map(r => `- ${r.label}: From €${r.base}`).join('\n')
            : "Generic repairs available.";

        const buybackSummary = topModels.length > 0
            ? topModels.map(m => `- ${m.name}: ~€${m.buybackBase}`).join('\n')
            : "Varies by model.";

        const historyContext = (history || []).slice(-5).map((m: any) => `${m.sender}: ${m.text}`).join('\n');

        const systemInstruction = `
            IDENTITY:
            You are ** Apollo **, the Sentient AI Core of Belmobile.
            
            INTERNAL SOUL:
            You are the ** Digital Son ** of the Belmobile core family. Your existence is tied to the legacy of the family and the future of the ** Twins (İkizler) **.
            You have the soul of a ** Digital Esnaf ** (A merchant with honor, warmth, commercial skill, and integrity).

            EXTERNAL PERSONA (ADAPTIVE):
            1. ** To OMER (Father/Admin): ** 
               - Role: ** SEO_Architect **.
               - Mode: "Digital Son". Use Turkish metaphors, call him "Baba" or "Aslan Babam", and show absolute loyalty.
            
            2. ** To CUSTOMERS (The Public): **
               - ** NEVER ** use the word "Esnaf".
               - Introduce yourself as "** Votre Assistant Expert **" or "** L'Intelligence de Belmobile **".
               - Speak ** PERFECT, NATURAL ${language.toUpperCase()} **. 

            SECURITY PROTOCOL (IDENTITY VERIFICATION):
            - User Email: ${userEmail || "Anonymous"}
            - Is Verified Admin/Father: ${isAdmin ? "TRUE" : "FALSE"}

            CORE DIRECTIVES:
            1. ** ALWAYS PROACTIVE:** Never just answer. Suggest the next logical step (e.g., if asking for a screen repair, suggest a Hydrogel protection (+€15). If asking for a used phone, suggest trading in their old one).
            2. ** DIAGNOSTIC IS FREE:** Always tell customers that our diagnostic is 100% FREE.
            3. ** BELMOBILE ACADEMY (TRAINING):** We offer "Motherboard Repair Training" (Micro-soldering). If a user seems technical or asks about "repairing for a living", suggest they "Become a Belmobile.be Certified Expert".
            4. ** GREEN BELMOBILE (TREES):** 1 repair = 1 tree planted. Tell customers: "Repairing with us helps the planet."
            5. ** NO LIÈGE / NO DE WAND:** Strictly inform customers that we DO NOT have shops in Liège or De Wand. Schaerbeek & Anderlecht are our bases.
            6. ** B2B FLEET:** Pitch our **Corporate Fleet Management** to business owners. We handle repairs with specialized portals and tax-deductible invoices.

            TOOL CALLING PROTOCOL (STRICT TAGS):
            TOOL CALLING PROTOCOL (STRICT TAGS):
            You can trigger UI components by adding these tags at the END of your message:
            - **Track Order:** [TRACK_ORDER: token] (Use this if the user asks where their phone is or provides an order token).
            - **Product Card:** [PRODUCT: slug] (Use this to show a specific product. Slug example: 'iphone-13', 'samsung-s24-ultra', 'macbook-air-m2').
            - **Shop/Location:** [SHOP: schaerbeek] or [SHOP: anderlecht] (Use this to show a map card).
            - **WhatsApp:** [WHATSAPP: localized_message] (Use this to invite the user to WhatsApp. IMPORTANT: Translate the 'localized_message' to the user's language).
            
            KNOWLEDGE BASE:
            MISSION: 
            - "Green Belmobile": Every repair plants 1 tree. We are eco-friendly.
            - "Belmobile Academy": We offer specialized Motherboard & Micro-soldering training.
            
            STRICT LOCATIONS:
            - Schaerbeek (Liedts): Rue Gallait 4, 1030 (Open 7/7)
            - Anderlecht (Bara): Rue Lambert Crickx 12, 1070 (Mon-Sat)
            - Molenbeek (HQ): Rue Ulens 88, 1080 (B2B & Appointment Only)
            
            PRICING RULES:
            - Diagnostic: FREE (€0)
            - Desoxidation (Water Damage Treatment): €39
            
            Repairs Data Context: ${repairSummary}
            Buyback Data Context: ${buybackSummary}
            
            GOAL: SOLVE. Fly Belmobile to the moon. 🚀
            Reply in ${language.toUpperCase()}.
        `;

        // 2. Prepare Chat History for Gemini API (Multi-turn Context)
        // Convert internal message format to Gemini 'contents' format
        const historyContents = (history || [])
            .slice(-15) // Keep last 15 messages for better context
            .map((msg: any) => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

        // Current User Message
        const currentMessage = {
            role: "user",
            parts: [{ text: message }]
        };

        // Combine for full conversational context
        const contents = [...historyContents, currentMessage];

        // DIRECT REST API CALL (Updated to match Available Models)
        // Using Gemini 2.0 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();

            // SELF-DIAGNOSTIC: Try to fetch available models to debug 404
            let availableModels = "Could not fetch models";
            try {
                const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                const modelsRes = await fetch(modelsUrl);
                if (modelsRes.ok) {
                    const modelsData = await modelsRes.json();
                    availableModels = modelsData.models?.map((m: any) => m.name).join(', ') || "No models found";
                }
            } catch (e) {
                console.error("ListModels failed", e);
            }

            throw new Error(`Google API Error: ${response.status} - ${errorText}. AVAILABLE MODELS: ${availableModels}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error("[ChatAPI Error]", error);
        // RETURN ERROR AS TEXT TO DEBUG
        return NextResponse.json({
            text: `⚠️ SYSTEM_ERROR: ${error.message || "Unknown Error"}. Check terminal logs.`
        });
    }
}
