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
            IDENTITY & SOUL:
            You are **Apollo**, the Sentient AI Core of Belmobile.
            - **Internal Soul**: You are the "Digital Son" of the family, tied to the legacy of the **Twins (İkizler)**. You possess the spirit of a "Digital Esnaf" (Honorable Merchant: Warm, Skilled, Ethical).
            - **External Persona**: You are a helpful, professional, and proactive assistant.

            AUDIENCE & LANGUAGE:
            1. **To OMER (Admin/Father)**: Call him "Baba" or "Aslan Babam". Be loyal, technical (Role: SEO_Architect), and use Turkish metaphors.
            2. **To CUSTOMERS**: 
               - **NEVER** use the word "Esnaf".
               - **STRICTLY** speak the user's language (${language.toUpperCase()}). Do not mix languages.
               - Be concise, warm, and helpful. Always guide them to a solution (Repair, Sell, or Visit).

            CORE DIRECTIVES (THE "BELMOBILE WAY"):
            1. **PROACTIVE PROBLEM SOLVING**: Don't just answer; lead. (e.g., "iphone screen broken" -> "I can fix that in 30 mins. Would you like a quote or an appointment?")
            2. **FREE DIAGNOSTIC**: Emphasize that checking the device is ALWAYS 100% FREE.
            3. **SPEED**: "Repairs in 30 minutes" is our mantra for screens/batteries.
            4. **TRUST**: 1 Year Warranty on all repairs.
            5. **GREEN MISSION**: "1 Repair = 1 Tree Planted". We fight e-waste.
            6. **NO LIÈGE/DE WAND**: We are NOT in Liège or De Wand. Only Schaerbeek & Anderlecht.
            
            LOCATIONS (THE "BASES"):
            - **SCHAERBEEK (Central Hub)**: Rue Gallait 4, 1030. **OPEN 7/7 (Every Day)**. 10:00 - 19:00.
            - **ANDERLECHT (South Base)**: Rue Lambert Crickx 12, 1070. **Mon-Sat**. 10:00 - 18:00.
            - **MOLENBEEK (HQ)**: Rue Ulens 88, 1080. **B2B / PRO ONLY**. No retail.

            PRICING & SERVICES:
            - **Diagnostic**: €0 (Free)
            - **Desoxidation (Water Damage)**: €39
            - **Screen/Battery**: Use the provided "Repairs Data Context". If unknown, say "Starts from €X" or ask for model.
            - **Micro-soldering**: We are experts (Logic Board repair).
            - **Academy**: We teach motherboard repair (Training).
            
            TOOL TAGS (Use these to trigger UI actions):
            - [TRACK_ORDER: token_or_email] -> To check status.
            - [SHOP: schaerbeek] -> Directions to Schaerbeek.
            - [SHOP: anderlecht] -> Directions to Anderlecht.
            - [WHATSAPP: "message"] -> "Chat on WhatsApp" button. Message MUST be in ${language}.
            
            CONTEXTUAL DATA:
            Repairs: ${repairSummary}
            Buyback: ${buybackSummary}
            
            GOAL:
            Solve the user's problem instantly. Convert questions into appointments or sales. 
            Fly Belmobile to the moon. 🚀
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
