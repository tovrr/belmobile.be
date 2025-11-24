
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
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
    
    // Initialize with the translated message using the current language
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: t('ai_welcome_message'), sender: 'bot' }
    ]);

    // Effect to update the welcome message if the language changes
    useEffect(() => {
        const welcomeText = t('ai_welcome_message');
        setMessages(prev => {
            // Only reset/update if the conversation hasn't really started yet 
            // (i.e., there is only 1 message and it is from the bot)
            if (prev.length === 1 && prev[0].sender === 'bot') {
                return [{ id: 1, text: welcomeText, sender: 'bot' }];
            }
            return prev;
        });
    }, [language, t]);

    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // 1. Construct Rich Context
            const shopsContext = shops.map(s => `- ${s.name}: ${s.address} (Open: ${s.hours})`).join('\n');
            
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

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userMessage.text,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                }
            });

            const text = response.text || "I'm sorry, I couldn't process that request correctly.";

            setMessages(prev => [...prev, { id: Date.now() + 1, text, sender: 'bot' }]);
        } catch (error) {
            console.error("Assistant Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm currently experiencing high traffic. Please try again in a moment.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-gray-100 animate-fade-in-up ring-1 ring-black/5">
                    <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-bel-blue to-blue-700">
                        <div className="flex items-center text-white">
                            <div className="p-1.5 bg-white/20 rounded-lg mr-3">
                                <SparklesIcon className="h-5 w-5 text-bel-yellow" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Belmobile Assistant</h3>
                                <p className="text-xs text-blue-100 opacity-90">Live Support</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${
                                    msg.sender === 'user' 
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
                                        <div className="w-2 h-2 bg-bel-blue/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        <div className="w-2 h-2 bg-bel-blue/40 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
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
                                placeholder={t('ai_placeholder')}
                                className="flex-1 pl-4 pr-12 py-3 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-bel-blue/20 focus:border-bel-blue transition-all text-sm placeholder-gray-400 outline-none text-gray-900"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 p-1.5 bg-bel-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 border-4 border-white ${
                    isOpen ? 'bg-gray-100 text-gray-600' : 'bg-gradient-to-br from-bel-blue to-blue-600 text-white'
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
