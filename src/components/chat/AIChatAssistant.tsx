'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    SparklesIcon,
    PhoneIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { serverTimestamp, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import ChatActionCard from './ChatActionCard';

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
    const { language, t } = useLanguage();
    const { user } = useAuth(); // Get authenticated user
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Initialize/Sync from Firestore
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Typewriter effect states
    const [currentPlaceholder, setCurrentPlaceholder] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [placeholderSpeed, setPlaceholderSpeed] = useState(150);

    // Load placeholders from i18n
    const placeholders = (t('chat_placeholders') || "").split('|').filter(Boolean);

    // Placeholder typewriter effect
    useEffect(() => {
        if (placeholders.length === 0) return;

        const handleType = () => {
            const current = placeholders[placeholderIndex % placeholders.length];
            const updatedText = isDeleting
                ? current.substring(0, currentPlaceholder.length - 1)
                : current.substring(0, currentPlaceholder.length + 1);

            setCurrentPlaceholder(updatedText);

            if (!isDeleting && updatedText === current) {
                setPlaceholderSpeed(2000); // Wait before deleting
                setIsDeleting(true);
            } else if (isDeleting && updatedText === '') {
                setIsDeleting(false);
                setPlaceholderIndex((prev) => prev + 1);
                setPlaceholderSpeed(150);
            } else {
                setPlaceholderSpeed(isDeleting ? 50 : 150);
            }
        };

        const timer = setTimeout(handleType, placeholderSpeed);
        return () => clearTimeout(timer);
    }, [currentPlaceholder, isDeleting, placeholderIndex, placeholderSpeed, placeholders]);

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

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        const handleOpenWithQuery = (e: any) => {
            setIsOpen(true);
            if (e.detail?.query) {
                setInput(e.detail.query);
                // Optional: Auto-submit could be enabled here
            }
        };

        window.addEventListener('open-ai-chat', handleOpen);
        window.addEventListener('open-ai-chat-query', handleOpenWithQuery); // New event for deep linking

        return () => {
            window.removeEventListener('open-ai-chat', handleOpen);
            window.removeEventListener('open-ai-chat-query', handleOpenWithQuery);
        };
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleMenuState = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsMobileMenuOpen(customEvent.detail.isOpen);
        };
        window.addEventListener('mobile-menu-state', handleMenuState);
        return () => window.removeEventListener('mobile-menu-state', handleMenuState);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const userText = input;
        if (!userText.trim() || !sessionId) return;

        // Prevent spam
        if (isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // 1. Sync User Message to Firestore (Background)
            const sessionRef = doc(db, 'chatbot_sessions', sessionId);
            const sanitizedMessages = JSON.parse(JSON.stringify(updatedMessages));
            updateDoc(sessionRef, {
                messages: sanitizedMessages,
                lastActive: serverTimestamp(),
                lastUserMessage: userText
            }).catch(console.warn);


            // 2. Call Server-Side AI API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    history: messages.slice(-10), // Send last 10 turns context
                    language,
                    sessionId,
                    userEmail: user?.email || null // Send Email for Identity Verification
                })
            });

            let data;
            if (response.ok) {
                data = await response.json();
            } else {
                throw new Error('API Request Failed');
            }

            let text = data.text || t('chat_error_fallback');

            // --- SERVER-SIDE METADATA PARSING ---
            let metadata: Message['metadata'] = undefined;

            // Parse [TRACK_ORDER: token]
            const trackMatch = text.match(/\[TRACK_ORDER:\s*(.+?)\]/);
            if (trackMatch) {
                const token = trackMatch[1];
                text = text.replace(trackMatch[0], '').trim();
                metadata = {
                    type: 'product',
                    data: {
                        name: t('Track Order Status'),
                        path: `/track/${token}`,
                        message: t('Click to view your order status')
                    }
                };
            }

            if (data.isDemo) {
                // Handle demo/fallback specific UI if needed
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text,
                sender: 'bot',
                metadata
            };

            const finalMessages = [...updatedMessages, botMessage];
            setMessages(finalMessages);

            // Sync Bot Message to Firestore
            const finalSanitized = JSON.parse(JSON.stringify(finalMessages));
            await updateDoc(sessionRef, {
                messages: finalSanitized,
                lastActive: serverTimestamp()
            });

        } catch (error: any) {
            console.error("AI Chat Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `⚠️ CONNECTION ERROR: ${error.message || "Unknown"}. (Please refresh page)`,
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };
    // --- PROACTIVE ENGAGEMENT LOGIC ---
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const [showProactiveBubble, setShowProactiveBubble] = useState(false);
    const [proactiveMessageText, setProactiveMessageText] = useState('');
    const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Track triggered paths to avoid spamming
    const [triggeredPaths, setTriggeredPaths] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Don't trigger if:
        // 1. Path is empty (SSR)
        // 2. Chat is already open
        // 3. User has already interacted (messages > 1 means more than just welcome msg)
        // 4. Bubble is already showing
        if (!pathname || isOpen || messages.length > 1 || showProactiveBubble) return;

        // Clear existing timer on path change
        if (proactiveTimerRef.current) {
            clearTimeout(proactiveTimerRef.current);
        }

        const currentPath = pathname;
        if (triggeredPaths.has(currentPath)) return; // Already triggered here

        // Define Triggers
        let messageKey = '';
        let delay = 10000; // Default 10s wait

        // 1. Repair Context
        if (currentPath.includes('/repair') || currentPath.includes('/reparation') || currentPath.includes('/herstelling')) {
            if (currentPath.split('/').length > 3) {
                // Deep link (e.g. /repair/smartphone/apple/iphone-13)
                messageKey = 'proactive_repair_specific';
                delay = 8000; // 8s
            } else {
                messageKey = 'proactive_repair_general';
                delay = 5000; // 5s faster on main repair page
            }
        }
        // 2. Buyback Context
        else if (currentPath.includes('/buyback') || currentPath.includes('/vendre') || currentPath.includes('/verkopen')) {
            messageKey = 'proactive_buyback';
            delay = 8000;
        }
        // 3. Contact Page (High Intent)
        else if (currentPath.includes('/contact')) {
            messageKey = 'proactive_contact';
            delay = 12000;
        }

        if (messageKey) {
            proactiveTimerRef.current = setTimeout(() => {
                // Double check interaction state
                if (isOpen) return;

                const txt = t(messageKey);
                if (txt) {
                    setProactiveMessageText(txt);
                    setShowProactiveBubble(true);
                    setTriggeredPaths(prev => new Set(prev).add(currentPath));
                }
            }, delay);
        }

        return () => {
            if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
        };
    }, [pathname, isOpen, messages.length, triggeredPaths, t, showProactiveBubble]);

    // Handle clicking the bubble
    const handleBubbleClick = () => {
        setIsOpen(true);
        setShowProactiveBubble(false);
    };

    const handleDismissBubble = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowProactiveBubble(false);
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans transition-all ${isMobileMenuOpen ? 'hidden' : ''}`}>
            {/* Proactive Bubble - Outside main chat */}
            {!isOpen && showProactiveBubble && (
                <div
                    onClick={handleBubbleClick}
                    className="mb-4 mr-2 max-w-[280px] bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-br-none shadow-xl border border-gray-100 dark:border-slate-700 animate-fade-in-up cursor-pointer relative group hover:-translate-y-1 transition-transform duration-300"
                >
                    <button
                        onClick={handleDismissBubble}
                        className="absolute -top-2 -left-2 bg-gray-200 dark:bg-slate-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <XMarkIcon className="w-3 h-3 text-gray-500 dark:text-gray-300" />
                    </button>
                    <div className="flex items-start space-x-3">
                        <div className="shrink-0 p-2 bg-bel-blue/10 rounded-full">
                            <SparklesIcon className="w-5 h-5 text-bel-blue" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
                                {proactiveMessageText}
                            </p>
                            <span className="text-xs text-bel-blue mt-1 inline-block font-semibold">
                                Chat with Apollo &rarr;
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className="bg-white w-80 sm:w-96 h-[500px] max-h-[calc(100vh-140px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-gray-100 animate-fade-in-up ring-1 ring-black/5">
                    <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-bel-blue to-blue-700">
                        <div className="flex items-center text-white">
                            <div className="p-1.5 bg-white/20 rounded-lg mr-3">
                                <SparklesIcon className="h-5 w-5 text-bel-yellow" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Apollo AI</h3>
                                <p className="text-xs text-blue-100 opacity-90">{t('Online')}</p>
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
                                            onAction={() => setIsOpen(language === 'en' ? false : false)}
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
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                            Apollo • Powered by Belmobile
                        </span>
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center space-x-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={currentPlaceholder || t('ai_placeholder')}
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
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowProactiveBubble(false);
                }}
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
