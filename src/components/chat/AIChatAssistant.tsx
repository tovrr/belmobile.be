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
import { serverTimestamp, setDoc, doc, getDoc, updateDoc, onSnapshot, deleteField } from 'firebase/firestore';
import ChatActionCard from './ChatActionCard';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useHaptic } from '../../hooks/useHaptic';
import { STATIC_PRODUCTS } from '../../constants';
import { sendGAEvent } from '../../utils/analytics';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp?: number;
    metadata?: {
        type?: 'product' | 'shop' | 'whatsapp' | 'order';
        data?: {
            id?: string;
            name?: string;
            price?: number;
            image?: string;
            address?: string;
            city?: string;
            path?: string;
            message?: string;
            status?: string;
            phoneNumber?: string;
        };
    };
}

import { usePathname } from 'next/navigation';

const AIChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { language, t } = useLanguage();
    const { user } = useAuth(); // Get authenticated user
    const [sessionId, setSessionId] = useState<string | null>(null);
    const haptic = useHaptic();
    const pathname = usePathname(); // Track Landing Page

    // Initialize/Sync from Firestore
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesRef = useRef(messages);
    const [botMuted, setBotMuted] = useState(false);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Analytics: Track Chat Open
    useEffect(() => {
        if (isOpen) {
            sendGAEvent({ action: 'apollo_chat_open', category: 'Chat', label: 'Open' });
        }
    }, [isOpen]);

    // Typewriter effect states
    const [currentPlaceholder, setCurrentPlaceholder] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [placeholderSpeed, setPlaceholderSpeed] = useState(150);

    // Load placeholders from i18n
    const placeholders = (t('chat_placeholders') || "").split('|').filter(Boolean);

    // Only verify "isMobile" on Client side to avoid hydration mismatch
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent background scroll on mobile when chat is open
    useLockBodyScroll(isOpen && isMobile);

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

    // 1. Initialize Session ID
    useEffect(() => {
        let sId = localStorage.getItem('chat_session_id');
        if (!sId) {
            sId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            localStorage.setItem('chat_session_id', sId);
        }
        setSessionId(sId);
    }, []);

    // 2. Real-time Sync with Firestore
    useEffect(() => {
        if (!sessionId) return;

        const sessionRef = doc(db, 'chatbot_sessions', sessionId);

        const unsubscribe = onSnapshot(sessionRef, async (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.messages) {
                    setMessages(data.messages);
                }
                setBotMuted(data.botMuted || false);
            } else {
                // Session deleted by Admin OR First load.
                // If we had active messages, it means the session was deleted.
                if (messagesRef.current.length > 1) {
                    // Force new Session ID to avoid resurrection loop
                    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                    localStorage.setItem('chat_session_id', newId);
                    setSessionId(newId);
                    // Reset UI
                    setMessages([{ id: 'welcome', text: t('ai_welcome_message'), sender: 'bot' }]);
                } else {
                    // Fresh load or just reset.
                    setMessages([{ id: 'welcome', text: t('ai_welcome_message'), sender: 'bot' }]);
                }
            }
        });

        return () => unsubscribe();
    }, [sessionId, t, language]); // Reduced dependencies to avoid excessive reconnects

    // 3. Mark Messages as Seen by User
    useEffect(() => {
        if (!sessionId || !isOpen || messages.length === 0) return;

        const markSeen = async () => {
            const sessionRef = doc(db, 'chatbot_sessions', sessionId);
            updateDoc(sessionRef, {
                lastSeenByUser: serverTimestamp()
            }).catch(e => console.error("Error marking seen", e));
        };
        markSeen();
    }, [sessionId, isOpen, messages.length]);

    // Persist to local storage for instant feedback/fallback
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    // Track Landing Page Navigation logic
    useEffect(() => {
        if (sessionId && pathname) {
            const sessionRef = doc(db, 'chatbot_sessions', sessionId);
            // Only update if session exists (we use updateDoc, not setDoc)
            updateDoc(sessionRef, {
                landingPage: pathname
            }).catch(() => {
                // Ignore errors (e.g. session deleted), don't resurrect
            });
        }
    }, [pathname, sessionId]);

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

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const lastDraftUpdateRef = useRef(0);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);

        if (!sessionId) return;

        // 1. Initial Typing Trigger (Instant)
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            updateDoc(doc(db, 'chatbot_sessions', sessionId), {
                isTyping: true,
                currentDraft: val
            }).catch(() => { });
        }

        // 2. Throttled Draft Update (Live Preview)
        const now = Date.now();
        if (now - lastDraftUpdateRef.current > 300) {
            updateDoc(doc(db, 'chatbot_sessions', sessionId), { currentDraft: val }).catch(() => { });
            lastDraftUpdateRef.current = now;
        }

        // 3. Reset Timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            if (sessionId) {
                updateDoc(doc(db, 'chatbot_sessions', sessionId), {
                    isTyping: false,
                    currentDraft: deleteField() // Cleanup
                }).catch(() => { });
            }
        }, 2000);
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const userText = input;
        // Debug Mute Status
        console.log(`[Chat] Sending: "${userText}". Bot Muted:`, botMuted);

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

            const isFirstUserMessage = messages.length <= 1;
            const updatePayload: any = {
                messages: sanitizedMessages,
                lastActive: serverTimestamp(),
                lastUserMessage: userText,
                userEmail: user?.email || null,
                landingPage: pathname || '/'
            };

            if (isFirstUserMessage) {
                updatePayload.initialLandingPage = pathname || '/';
            }

            await setDoc(sessionRef, updatePayload, { merge: true });

            if (botMuted) {
                setIsLoading(false);
                return;
            }

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
                    type: 'order',
                    data: {
                        name: t('track_order_status'),
                        path: `/track/${token}`,
                        status: t('click_to_view_live_updates'),
                        message: t('click_to_view_your_order_status')
                    }
                };
            }

            // Parse [PRODUCT: slug]
            const productMatch = text.match(/\[PRODUCT:\s*(.+?)\]/);
            if (productMatch) {
                const slug = productMatch[1];
                text = text.replace(productMatch[0], '').trim();

                // Lookup product
                const product = STATIC_PRODUCTS.find(p => p.slug === slug || p.id.toString() === slug) || STATIC_PRODUCTS[0];

                metadata = {
                    type: 'product',
                    data: {
                        name: product.name,
                        price: product.price,
                        image: product.imageUrl,
                        path: `/products/${product.slug}`
                    }
                };
                sendGAEvent({ action: 'apollo_proactive_offer', category: 'Chat', label: slug });
            }

            // Parse [SHOP: location]
            // Parse [SHOP: location]
            // We use a broader regex to catch [SHOP: anderlecht] even if there are weird spaces or brackets mismatch
            const shopMatch = text.match(/\[SHOP:\s*([a-zA-Z]+)(?:\])?/i);
            if (shopMatch) {
                const location = shopMatch[1].toLowerCase();
                // Replace the FULL matched string to remove it cleanly
                text = text.replace(shopMatch[0], '').trim();
                // Double check for lingering brackets if regex missed
                text = text.replace(']', '').trim();

                metadata = {
                    type: 'shop',
                    data: {
                        name: location.includes('schaerbeek') ? 'Schaerbeek (Liedts)' : 'Anderlecht (Bara)',
                        address: location.includes('schaerbeek') ? 'Rue Gallait 4' : 'Rue Lambert Crickx 12',
                        city: location.includes('schaerbeek') ? '1030 Schaerbeek' : '1070 Anderlecht',
                        path: location.includes('schaerbeek')
                            ? 'https://www.google.com/maps/search/?api=1&query=Belmobile+Liedts&query_place_id=ChIJk6VQXpHDw0cRNEdLpSrOUkY'
                            : 'https://www.google.com/maps/search/?api=1&query=Belmobile+Bara&query_place_id=ChIJY6KmKtLDw0cRy7JDeNAZ2wQ'
                    }
                };
            }

            // Parse [WHATSAPP: message]
            const waMatch = text.match(/\[WHATSAPP:\s*(.+?)\]/);
            if (waMatch) {
                const waMessage = waMatch[1];
                text = text.replace(waMatch[0], '').trim();
                metadata = {
                    type: 'whatsapp',
                    data: {
                        message: waMessage,
                        phoneNumber: '+32484837560' // Liedts primary mobile
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

    // AIChatAssistant.tsx Floating Logic
    const [mobileBottomOffset, setMobileBottomOffset] = useState('24px'); // Default to native place
    const [isBarExpanded, setIsBarExpanded] = useState(false);

    useEffect(() => {
        const handleResize = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { expanded, h } = customEvent.detail;

            setIsBarExpanded(expanded);

            // Use provided height or fallback logic
            if (window.innerWidth < 1024) {
                if (expanded) {
                    setMobileBottomOffset('calc(45vh + 20px)');
                } else {
                    setMobileBottomOffset(h ? `${h + 24}px` : '130px'); // Increased padding slightly
                }
            } else {
                setMobileBottomOffset('24px');
            }
        };

        window.addEventListener('apollo-mobile-bar-resize', handleResize);
        return () => window.removeEventListener('apollo-mobile-bar-resize', handleResize);
    }, []);

    // Dynamic styles based on Open State
    // const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024; // REMOVED: Using state-based isMobile from lines 60-67
    const shouldHide = !isOpen && isBarExpanded && isMobile;

    // When Open on Mobile: Full Screen Overlay
    // When Closed on Mobile: Floating Button above Bottom Bar
    // Desktop: Standard Floating Widget

    const containerClasses = isOpen && isMobile
        ? `fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm transition-all duration-300`
        : `fixed z-[100] flex flex-col items-end font-sans transition-all duration-500 
           ${isMobileMenuOpen || shouldHide ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'} 
           max-md:right-4 max-md:left-auto
           md:bottom-6 md:right-6`;

    const containerStyle: React.CSSProperties = (isOpen && isMobile)
        ? {}
        : { bottom: isMobile ? mobileBottomOffset : undefined };

    return (
        <div
            className={containerClasses}
            style={containerStyle}
        >
            <style jsx>{`
                @keyframes apollo-float {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-5px) scale(1.02); }
                }
                .apollo-alive {
                    animation: apollo-float 3s ease-in-out infinite;
                }
                .apollo-glow-ring {
                    animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                @keyframes ping-slow {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>

            {/* Overlay Close Trigger (Mobile Only) */}
            {isOpen && isMobile && (
                <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />
            )}

            {/* Proactive Bubble - Outside main chat (Only when closed) */}
            {!isOpen && showProactiveBubble && (
                <div
                    onClick={(e) => { haptic.trigger('medium'); handleBubbleClick(); }}
                    className="mb-4 mr-2 max-w-[280px] bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-br-none shadow-xl border border-gray-100 dark:border-slate-700 animate-fade-in-up cursor-pointer relative group hover:-translate-y-1 transition-transform duration-300 active-press"
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); haptic.trigger('light'); handleDismissBubble(e); }}
                        className="absolute -top-2 -left-2 bg-gray-200 dark:bg-slate-700 rounded-full p-1 opacity-100 shadow-sm hover:bg-gray-300 transition-colors z-10 active-press"
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
                <div className={`
                    relative z-10 flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in-up font-sans
                    ${isMobile
                        ? 'w-full h-[85vh] rounded-t-3xl rounded-b-none' // Mobile Sheet
                        : 'w-80 sm:w-96 h-[500px] max-h-[calc(100vh-140px)] rounded-3xl mb-4 ring-1 ring-black/5'} // Desktop Popup
                `}>
                    <div className="p-4 px-5 border-b border-white/10 flex justify-between items-center bg-linear-to-r from-slate-900 via-[#0B0F19] to-slate-900 relative overflow-hidden shrink-0">
                        {/* Header Background Effects */}
                        <div className="absolute inset-0 bg-linear-to-r from-bel-blue/20 to-purple-500/20 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-bel-blue/30 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="flex items-center text-white relative z-10">
                            <div className="p-2 bg-white/10 rounded-xl mr-3 backdrop-blur-md ring-1 ring-white/10 shadow-lg relative group-hover:scale-105 transition-transform">
                                <SparklesIcon className="h-5 w-5 text-cyber-citron" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></div>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm tracking-wide">
                                    {botMuted ? 'Live Support 👨‍💻' : 'Apollo AI'}
                                </h3>
                                <p className="text-[10px] text-blue-200 font-medium tracking-wider uppercase flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${botMuted ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                    {botMuted ? 'Agent Active' : t('Online')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 relative z-10">
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
                            <button onClick={() => setIsOpen(false)} className="p-2 text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm transition-all duration-200 ${msg.sender === 'user'
                                    ? 'bg-linear-to-br from-bel-blue to-indigo-600 text-white rounded-br-none shadow-blue-500/20'
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-gray-200/50'
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

                    <div className="px-4 py-1.5 bg-white border-t border-gray-50 flex justify-center items-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            Powered by Belmobile.be
                        </span>
                    </div>

                    <div className="p-3 bg-white/80 backdrop-blur-md border-t border-gray-100 shrink-0 mb-[env(safe-area-inset-bottom)]">
                        <form onSubmit={handleSend} className="relative group">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-bel-blue/30 to-purple-500/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                            <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-gray-200 focus-within:border-bel-blue/50 focus-within:ring-2 focus-within:ring-bel-blue/10 transition-all overflow-hidden">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInput}
                                    placeholder={currentPlaceholder || t('ai_placeholder')}
                                    className="flex-1 p-3.5 bg-transparent border-none focus:ring-0 text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 mr-1.5 my-1.5 bg-slate-900 text-white rounded-lg hover:bg-bel-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center w-10 h-10"
                                >
                                    <PaperAirplaneIcon className="h-4 w-4 -ml-0.5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button (Hidden when open on mobile) */}
            {(!isOpen || !isMobile) && (
                <button
                    onClick={() => {
                        haptic.trigger('medium');
                        setIsOpen(!isOpen);
                        setShowProactiveBubble(false);
                    }}
                    className={`active-press group p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 border-4 border-white ${isOpen
                        ? 'bg-gray-100 text-gray-600 scale-100'
                        : 'bg-linear-to-br from-bel-blue to-blue-600 text-white apollo-alive'
                        }`}
                >
                    {isOpen ? (
                        <XMarkIcon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
                    ) : (
                        <div className="relative">
                            <ChatBubbleLeftRightIcon className="h-6 w-6 md:h-7 md:w-7 relative z-10" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3 z-20">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bel-yellow opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-bel-yellow"></span>
                            </span>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-20 apollo-glow-ring"></div>
                        </div>
                    )}
                </button>
            )}
        </div>
    );
};

export default AIChatAssistant;
