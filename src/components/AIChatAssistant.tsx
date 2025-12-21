'use client';
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, SparklesIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const AIChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { shops, products, services } = useData();
    const { language, t } = useLanguage();

    // Initialize from localStorage or default
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const saved = localStorage.getItem('chat_history');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to parse chat history", e);
        }
        return [{ id: 1, text: t('ai_welcome_message'), sender: 'bot' }];
    });

    // Persist to localStorage whenever messages change
    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    // Effect to update the welcome message if the language changes
    useEffect(() => {
        const welcomeText = t('ai_welcome_message');
        // Use a timeout to avoid synchronous setState during effect execution
        const timer = setTimeout(() => {
            setMessages(prev => {
                if (prev.length === 1 && prev[0].sender === 'bot' && prev[0].text !== welcomeText) {
                    return [{ id: 1, text: welcomeText, sender: 'bot' }];
                }
                return prev;
            });
        }, 0);
        return () => clearTimeout(timer);
    }, [language, t]);

    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const runDemoMode = (textOverride?: string) => {
        // Use override or current input (safety fallback)
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
                id: Date.now() + 1,
                text: responseText,
                sender: 'bot'
            }]);
            setIsLoading(false);
        }, 1000);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const userText = input; // Capture immediately
        if (!userText.trim()) return;

        const userMessage: Message = { id: Date.now(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Check for API Key availability
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        // Robust check for invalid/placeholder keys
        if (!apiKey || apiKey.length < 20 || apiKey.includes('YOUR_KEY')) {
            console.warn("AI Chat: Invalid or missing API Key. Switching to Demo Mode.");
            runDemoMode(userText);
            return;
        }

        try {
            // 2. Construct Rich Context
            const shopsContext = shops.map(s => `- ${s.name}: ${s.address} (Open: ${s.openingHours.join(', ')})`).join('\n');

            const servicesContext = services.map(s => `- ${s.name} (${s.type}): ${s.description}`).join('\n');

            const productsContext = products.map(p => {
                const stockInfo = shops.map(s => `${s.name}: ${p.availability[s.id] || 0}`).join(', ');
                return `- ${p.name} (€${p.price}): ${p.description}. Stock levels: [${stockInfo}]`;
            }).join('\n');

            const systemInstruction = `
                You are the intelligent concierge for Belmobile.be, a premium mobile shop in Belgium.
                
                Current Language Context: ${language.toUpperCase()} (Always reply in this language).
                
                YOUR KNOWLEDGE BASE:
                
                --- SHOPS & LOCATIONS ---
                ${shopsContext}
                
                --- SERVICES ---
                ${servicesContext}
                
                --- LIVE PRODUCT INVENTORY ---
                ${productsContext}
                
                RULES:
                1. Be concise, professional, and helpful.
                2. If asked about stock, check the Inventory data above and be specific about which shop has the item.
                3. If asked about repairs not listed, suggest they use the 'Repair' page form for a custom quote.
                4. You are helpful and polite.
                5. Currency is Euros (€).
            `;

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction
            });

            const result = await model.generateContent(userText);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { id: Date.now() + 1, text, sender: 'bot' }]);
            setIsLoading(false);
        } catch (error: unknown) {
            console.error("Assistant Error:", error);
            // Fallback to demo mode if API fails
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
                            <a
                                href="tel:+3222759867"
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-110 shadow-lg"
                                title="Call Support"
                            >
                                <PhoneIcon className="w-5 h-5" />
                            </a>
                            <a
                                href="https://wa.me/32484837560"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all hover:scale-110 shadow-lg"
                                title="Contact on WhatsApp"
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
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                    ? 'bg-bel-blue text-white rounded-br-none'
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    {msg.text}
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

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center space-x-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 p-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-bel-blue focus:bg-white transition-all text-sm"
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
