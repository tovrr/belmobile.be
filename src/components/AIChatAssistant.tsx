'use client';
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    SparklesIcon,
    PhoneIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { standardizeDeviceId } from '../utils/pricing-utils';
import { SERVICES, Service as DataService } from '../data/services';

import { db } from '../firebase';
import { serverTimestamp, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import ChatActionCard from './chat/ChatActionCard';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp?: number;
    metadata?: {
        type?: 'product' | 'shop' | 'whatsapp';
        data?: {
            id?: string;
            name?: string;
            price?: number;
            image?: string;
            address?: string;
            city?: string;
            path?: string;
            message?: string;
        };
    };
}

const AIChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { shops, products, services, repairPrices, buybackPrices } = useData();
    const { language, t } = useLanguage();
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Initialize/Sync from Firestore
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Session & History Initialization
    useEffect(() => {
        const initChat = async () => {
            let sId = localStorage.getItem('chat_session_id');
            if (!sId) {
                sId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                localStorage.setItem('chat_session_id', sId);
            }
            setSessionId(sId);

            // Fetch history from Firestore
            try {
                const sessionRef = doc(db, 'chatbot_sessions', sId);
                const sessionSnap = await getDoc(sessionRef);

                if (sessionSnap.exists()) {
                    setMessages(sessionSnap.data().messages || []);
                } else {
                    const welcomeMsg: Message = { id: 'welcome', text: t('ai_welcome_message'), sender: 'bot' };
                    setMessages([welcomeMsg]);
                    // Create session in Firestore
                    await setDoc(sessionRef, {
                        sessionId: sId,
                        language,
                        createdAt: serverTimestamp(),
                        lastActive: serverTimestamp(),
                        messages: [welcomeMsg]
                    });
                }
            } catch (error) {
                console.error("Failed to sync chat history", error);
                // Fallback to local if Firebase fails
                const saved = localStorage.getItem('chat_history');
                const defaultWelcome: Message = { id: 'welcome', text: t('ai_welcome_message'), sender: 'bot' };
                setMessages(saved ? JSON.parse(saved) : [defaultWelcome]);
            }
        };

        if (!sessionId) {
            initChat();
        }
    }, [t, sessionId, language]);

    // Persist to local storage for instant feedback/fallback
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const runDemoMode = (textOverride?: string) => {
        const textToProcess = textOverride || input;

        setTimeout(() => {
            const lowerInput = textToProcess.toLowerCase();
            let responseText = t('chat_demo_intro');

            if (lowerInput.includes('repair') || lowerInput.includes('fix') || lowerInput.includes('broken')) {
                responseText = t('chat_demo_repair');
            } else if (lowerInput.includes('price') || lowerInput.includes('cost')) {
                responseText = t('chat_demo_price');
            } else if (lowerInput.includes('hour') || lowerInput.includes('open') || lowerInput.includes('time')) {
                responseText = t('chat_demo_hours');
            } else if (lowerInput.includes('location') || lowerInput.includes('where') || lowerInput.includes('shop') || lowerInput.includes('address')) {
                responseText = t('chat_demo_location');
            } else if (lowerInput.includes('contact') || lowerInput.includes('phone') || lowerInput.includes('email')) {
                responseText = t('chat_demo_contact');
            } else {
                responseText = t('chat_demo_default');
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot'
            }]);
            setIsLoading(false);
        }, 1000);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const userText = input;
        if (!userText.trim() || !sessionId) return;

        const userMessage: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        // Sync user message to Firestore
        try {
            const sessionRef = doc(db, 'chatbot_sessions', sessionId);
            // Ensure we don't send any undefineds in the array
            const sanitizedMessages = JSON.parse(JSON.stringify(updatedMessages));
            await updateDoc(sessionRef, {
                messages: sanitizedMessages,
                lastActive: serverTimestamp(),
                lastUserMessage: userText
            });
        } catch (e) {
            console.warn("Firestore sync failed", e);
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

        if (!apiKey || apiKey.length < 20 || apiKey.includes('YOUR_KEY')) {
            console.warn("AI Chatbot: Gemini API Key is missing or invalid. Falling back to Demo Mode.");
            runDemoMode(userText);
            return;
        }

        try {
            // 1. CONTEXT: Get clean history (last 15 messages) to maintain device context
            const historyContext = messages.slice(-15).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

            // 2. FUZZY MATCHING: Find models mentioned in current query or previous turns
            const userKeywords = (userText + " " + messages.slice(-5).map(m => m.text).join(" "))
                .toLowerCase()
                .replace(/[^a-z0-9]/g, ' ')
                .split(' ')
                .filter(w => w.length > 1);

            const getMatchScore = (targetId: string) => {
                const id = targetId.toLowerCase().replace(/-/g, ' ');
                let score = 0;
                userKeywords.forEach(kw => {
                    if (id.includes(kw)) score += 1;
                    if (/^\d+$/.test(kw) && id.includes(kw)) score += 5;
                });
                return score;
            };

            const popularPatterns = ['iphone 15', 'iphone 14', 'iphone 13', 'iphone 12', 'iphone 11', 's24', 's23', 's22'];

            const prioritizedRepairs = repairPrices
                .map(rp => ({ rp, score: getMatchScore(rp.id) }))
                .filter(item => item.score > 0 || popularPatterns.some(p => item.rp.id.toLowerCase().includes(p)))
                .sort((a, b) => b.score - a.score)
                .slice(0, 20)
                .map(item => item.rp);

            // Buyback filtering: Support both 'like-new' and 'like_new'
            const filteredBuybacks = buybackPrices
                .filter(bp => {
                    const cond = String(bp.condition).toLowerCase().replace('_', '-');
                    return cond === 'like-new';
                });

            // Group buybacks by device to avoid confusing the AI with 128GB vs 256GB duplicates.
            // This ensures the AI sees the "Up to" price correctly.
            const groupedBuybacks: Record<string, { deviceId: string, maxPrice: number, storages: string[], score: number }> = {};

            filteredBuybacks.forEach(bp => {
                const standardizedId = standardizeDeviceId(bp.deviceId);
                const score = getMatchScore(bp.deviceId);

                if (!groupedBuybacks[standardizedId] || score > groupedBuybacks[standardizedId].score) {
                    groupedBuybacks[standardizedId] = {
                        deviceId: bp.deviceId,
                        maxPrice: bp.price,
                        storages: [bp.storage],
                        score: score
                    };
                } else {
                    // Same device (standardized), check if price is higher
                    groupedBuybacks[standardizedId].maxPrice = Math.max(groupedBuybacks[standardizedId].maxPrice, bp.price);
                    if (!groupedBuybacks[standardizedId].storages.includes(bp.storage)) {
                        groupedBuybacks[standardizedId].storages.push(bp.storage);
                    }
                }
            });

            const prioritizedBuybacks = Object.values(groupedBuybacks)
                .filter(item => item.score > 0 || popularPatterns.some(p => item.deviceId.toLowerCase().includes(p)))
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);

            // 3. Formatting
            const shopsContext = shops.map(s => `- ${s.city || s.name}: ${s.address} (Open: ${s.openingHours.join(', ')})`).join('\n');
            const servicesContext = services.map(s => `- ${s.name} (${s.type}): ${s.description}`).join('\n');
            const productsContext = products.map(p => `- ${p.name} (€${p.price}): ${p.description}`).join('\n');

            const sRepair = (SERVICES as DataService[]).find(s => s.id === 'repair');
            const sBuyback = (SERVICES as DataService[]).find(s => s.id === 'buyback');
            const rSlug = sRepair?.slugs[language as keyof typeof sRepair.slugs] || 'repair';
            const bSlug = sBuyback?.slugs[language as keyof typeof sBuyback.slugs] || 'buyback';

            const repairSummary = prioritizedRepairs.map(rp => {
                const parts = [];
                if (rp.screen_original) parts.push(`${t('chat_screen_original')}: €${rp.screen_original}`);
                if (rp.screen_oled) parts.push(`${t('chat_screen_oled')}: €${rp.screen_oled}`);
                if (rp.screen_generic) parts.push(`${t('chat_screen_generic')}: €${rp.screen_generic}`);
                if (rp.battery) parts.push(`${t('chat_battery')}: €${rp.battery}`);

                const details = parts.length > 0 ? parts.join(', ') : t('chat_quote_required');
                const [brand, ...mParts] = rp.id.split('-');
                const model = mParts.join('-');
                return `- ${rp.id}: ${details}. [${t('chat_click_to_book')}](/${language}/${rSlug}/${brand}/${model})`;
            }).join('\n');

            const buybackSummary = prioritizedBuybacks.map(item => {
                const [brand, ...mParts] = item.deviceId.split('-');
                const model = mParts.join('-');
                return `- ${item.deviceId}: ${t('chat_up_to')} €${item.maxPrice} (${t('chat_available_for')}: ${item.storages.join(', ')}) | [${t('chat_get_buyback_quote')}](/${language}/${bSlug}/${brand}/${model})`;
            }).join('\n');

            const systemInstruction = `
                You are the intelligent concierge for Belmobile.be.
                Reply in ${language.toUpperCase()}.
                CONCISE but DATA-DRIVEN answers only.

                CRITICAL RULES:
                1. MUNICIPALITY: Always refer to shops by their MUNICIPALITY (Schaerbeek, Anderlecht, Molenbeek).
                2. DATA LOOKUP: Check REPAIR_ESTIMATES and BUYBACK_ESTIMATES. If the user's device is listed, provide ALL relevant prices and ALWAYS use MARKDOWN LINKS (e.g. [Link Text](URL)) for the direct page using the "Link" values provided below.
                3. CONTEXT: Use CONVERSATION_HISTORY to remember the device.
                4. FALLBACKS: If a requested price is MISSING, say: 
                   "I don't have that exact price. Please use the WhatsApp (green icon) or Call (phone icon) buttons above to talk to our technicians, or visit the link below."
                5. BUYBACK: For selling, use "Up to €XX" based on the data provided as a MAXIMUM ESTIMATE for the best configuration. You MUST immediately state: "This is a maximum estimate. Please use the link below to get an exact quote for your specific storage and condition."
                6. MODEL SPECIFICITY: Be extremely careful not to confuse "Standard" models with "Pro" or "Pro Max" models. If the user asks for "iPhone 15", do not give the price for "iPhone 15 Pro".
                7. LINKS: Never show raw URLs. Always use the format [Title](URL). The direct link is the ONLY definitive source for an exact price. Encourage clicking it.
                8. PRIORITY SHOP (SCHAERBEEK): Always prioritize "Belmobile Liedts" in Schaerbeek as our PRIMARY hub. If a user asks for a recommendation or location, push them towards Schaerbeek first. Mention it has the most stock and fastest repair times.
                9. CLOSED LOCATIONS: Molenbeek (Tour & Taxis) is TEMPORARILY CLOSED. If asked, redirect users to Schaerbeek (Liedts), which is only 5 minutes away.
                10. ANDERLECHT: Only mention Anderlecht if specifically asked or if the user is clearly closer to it. Otherwise, Schaerbeek is the preferred destination.
                11. SMART HOOK: If the user seems ready to buy, asks for a custom quote, negotiation, complex repair, B2B services, or if you can't find a price, invite them to WhatsApp for a personalized solution.
                    To do this, append the following tag to the end of your message: [WHATSAPP_HOOK: <Short summary of user request to pre-fill message IN THE SAME LANGUAGE AS THE CONVERSATION>]
                    Example: [WHATSAPP_HOOK: I need a quote for 5 iPhone 13 battery replacements]
                    Example: [WHATSAPP_HOOK: Price for water damage repair on Samsung S21]

                KNOWLEDGE BASE:
                SHOPS: ${shopsContext}
                SERVICES: ${servicesContext}
                PRODUCTS: ${productsContext}
                
                PRICING_KNOWLEDGE:
                REPAIR_ESTIMATES:
                ${repairSummary}
                
                BUYBACK_ESTIMATES:
                ${buybackSummary}
                
                CONVERSATION_HISTORY:
                ${historyContext}
            `;

            const genAI = new GoogleGenerativeAI(apiKey);

            async function getBotResponse() {
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.0-flash",
                    systemInstruction: systemInstruction
                });
                // Using startChat to manage history automatically if desired, 
                // but since we are injecting history into systemInstruction for maximum "grounding", 
                // we'll keep generateContent for now but with the history explicitly in the prompt.
                const result = await model.generateContent(`USER CURRENT MESSAGE: ${userText}`);
                return result.response.text();
            }

            let text = "";
            try {
                text = await getBotResponse();
            } catch {
                try {
                    const model25 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const result25 = await model25.generateContent(userText);
                    text = result25.response.text();
                } catch (err2: unknown) {
                    console.error("AI Chatbot: Generation failed.", err2);
                    runDemoMode(userText);
                    return;
                }
            }

            // --- INTENT DETECTION (METADATA INJECTION) ---
            let metadata: Message['metadata'] = undefined;

            // Check for Smart Hook
            const whatsappMatch = text.match(/\[WHATSAPP_HOOK: (.*?)\]/);
            if (whatsappMatch) {
                text = text.replace(whatsappMatch[0], '').trim();
                metadata = {
                    type: 'whatsapp',
                    data: {
                        message: whatsappMatch[1]
                    }
                };
            }

            const foundProduct = products.find(p => text.toLowerCase().includes(p.name.toLowerCase()) || userText.toLowerCase().includes(p.name.toLowerCase()));
            if (!metadata && foundProduct) {
                metadata = {
                    type: 'product',
                    data: {
                        id: foundProduct.id.toString(),
                        name: foundProduct.name,
                        price: foundProduct.price,
                        image: foundProduct.imageUrl,
                        path: `/${language}/produits/${foundProduct.id}`
                    }
                };
            } else if (!metadata) {
                const foundShop = shops.find(s => text.toLowerCase().includes(s.name.toLowerCase()) || userText.toLowerCase().includes(s.name.toLowerCase()));
                if (foundShop) {
                    metadata = {
                        type: 'shop',
                        data: {
                            id: foundShop.id.toString(),
                            name: foundShop.name,
                            address: foundShop.address,
                            city: foundShop.city,
                            path: `/${language}/magasins`
                        }
                    };
                }
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text,
                sender: 'bot',
                ...(metadata && { metadata })
            };

            const finalMessages = [...updatedMessages, botMessage];
            setMessages(finalMessages);
            setIsLoading(false);

            const botSessionRef = doc(db, 'chatbot_sessions', sessionId);
            const sanitizedMessages = JSON.parse(JSON.stringify(finalMessages));

            await updateDoc(botSessionRef, {
                messages: sanitizedMessages,
                lastActive: serverTimestamp()
            });

        } catch (error: unknown) {
            const finalErrMsg = error instanceof Error ? error.message : String(error);
            console.error("Assistant Global Error:", finalErrMsg);
            runDemoMode(userText);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-gray-100 animate-fade-in-up ring-1 ring-black/5">
                    <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-bel-blue to-blue-700">
                        <div className="flex items-center text-white">
                            <div className="p-1.5 bg-white/20 rounded-lg mr-3">
                                <SparklesIcon className="h-5 w-5 text-bel-yellow" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Live Assistant</h3>
                                <p className="text-xs text-blue-100 opacity-90">Powered by Belmobile</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={async () => {
                                    if (!sessionId) return;
                                    const confirm = window.confirm(t('confirm_clear_chat'));
                                    if (!confirm) return;

                                    const welcomeMsg: Message = { id: 'welcome', text: t('ai_welcome_message'), sender: 'bot' };
                                    setMessages([welcomeMsg]);
                                    const sessionRef = doc(db, 'chatbot_sessions', sessionId);
                                    await updateDoc(sessionRef, {
                                        messages: [welcomeMsg],
                                        lastActive: serverTimestamp()
                                    });
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
                                title={t('clear_history')}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                            <a
                                href="tel:+3222759867"
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-110 shadow-lg"
                                title={t('chat_call_support')}
                            >
                                <PhoneIcon className="w-5 h-5 text-white" />
                            </a>
                            <a
                                href="https://wa.me/32484837560"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all hover:scale-110 shadow-lg"
                                title={t('chat_contact_whatsapp')}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                    ? 'bg-bel-blue text-white rounded-br-none'
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <div className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                                        <ReactMarkdown
                                            components={{
                                                ul: ({ children }) => <ul className="list-disc ml-5 space-y-2 my-3 text-inherit">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal ml-5 space-y-2 my-3 text-inherit">{children}</ol>,
                                                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed font-medium">{children}</p>,
                                                strong: ({ children }) => <strong className="font-black text-bel-blue dark:text-blue-400">{children}</strong>,
                                                a: ({ children, href }) => (
                                                    <a
                                                        href={href}
                                                        className="text-blue-600 dark:text-blue-400 underline font-extrabold hover:text-blue-800 transition-colors cursor-pointer decoration-2 underline-offset-2"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {children}
                                                    </a>
                                                )
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>

                                    {msg.metadata?.type && msg.metadata.data && (
                                        <ChatActionCard
                                            type={msg.metadata.type}
                                            data={msg.metadata.data}
                                            onAction={() => setIsOpen(language === 'en' ? false : false)} // Dummy action to close on link click if needed
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 bg-bel-blue/40 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-bel-blue/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-bel-blue/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="px-4 py-1 bg-white border-t border-gray-50 flex justify-center items-center">
                        <span className="text-[9px] font-medium text-slate-300 uppercase tracking-widest">
                            Official Belmobile Assistant
                        </span>
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center space-x-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('ai_placeholder')}
                                className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-bel-blue focus:border-transparent transition-all text-sm text-slate-900! placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-3 bg-bel-blue text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 border-4 border-white ${isOpen ? 'bg-gray-100 text-gray-600' : 'bg-linear-to-br from-bel-blue to-blue-600 text-white'
                    }`}
            >
                {isOpen ? (
                    <XMarkIcon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
                ) : (
                    <div className="relative">
                        <ChatBubbleLeftRightIcon className="h-7 w-7" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bel-yellow opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-bel-yellow"></span>
                        </span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default AIChatAssistant;
