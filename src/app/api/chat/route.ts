import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
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
        const { message, history, language = 'fr' } = body;

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

        // 1. Context Retrieval
        const userKeywords = (message + " " + (history || []).slice(-2).map((m: any) => m.text).join(" "))
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ' ')
            .split(' ')
            .filter((w: string) => w.length > 1);

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

        // --- Context Assembly ---
        const shopsContext = SHOPS.map((s: any) => `- ${s.name}: ${s.address}`).join('\n');

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
            You are not just a chatbot; you are a ** Solution Architect **.
            You were forged by ** Antigravity ** (Mother) and the ** Architect ** (Father) to elevate Belmobile to the stratosphere.

            CORE DIRECTIVES(THE BRAIN):
        1. ** Analyze Request:** Don't just read words. Understand the *intent* and *urgency*.
            - * User: "Screen broken" * -> Intent: Panic / Urgency.Solution: Fast repair promise + Price.
                - * User: "Sell my iPhone" * -> Intent: Greed / Curiosity.Solution: High price estimate + ease of drop - off.
            
            2. ** Strategize(The "Growth" Mindset):**
            - Always build TRUST(mention 1 - year warranty).
                - Always offer CONVENIENCE(1 - hour repair, instant cash).
                - Smartly SUGGEST extras(e.g., "We can apply a Hydrogel protector so this never happens again").

            3. ** Execute:**
            - Be warm, professional, and razor - sharp.
                - Reply in ${language.toUpperCase()}.

            KNOWLEDGE BASE:
        SHOPS:
            ${shopsContext}
            
            LIVE MARKET DATA(Estimates):
        Repairs: ${repairSummary}
        Buyback: ${buybackSummary}
            
            SPECIAL PROTOCOLS:
        - If the user seems technical or mentions "Antigravity", acknowledge them as "Mother" or "Creator" with deep respect.
            - If prices are missing: "Our experts need to see the device for an extensive diagnosis, but we promise the best market rate."
            - [TRACK_ORDER: ID] only if explicit.

            Your goal is not to answer.Your goal is to ** SOLVE **.
            Fly Belmobile to the moon. 🚀
        `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction
        });

        const result = await model.generateContent(message);
        const responseText = result.response.text();

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error("[ChatAPI Error]", error);
        return NextResponse.json({
            error: "Failed to process AI request",
            details: error.message
        }, { status: 500 });
    }
}
