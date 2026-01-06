'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';





import {
    ChatBubbleLeftRightIcon,
    UserIcon,
    ClockIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    TrashIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatSession {
    id: string;
    userEmail?: string;
    lastMessage?: string;
    lastUpdated?: any;
    status?: 'active' | 'resolved' | 'escalated';
    messagesCount?: number;
    language?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    messages?: any[];
    landingPage?: string;
    initialLandingPage?: string;
    lastSeenByUser?: any;
}

const ChatManagement: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'escalated'>('all');
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // Search State
    const replyInputRef = React.useRef<HTMLInputElement>(null); // Ref for Reply Input
    const messagesEndRef = React.useRef<HTMLDivElement>(null); // Ref for Auto-scroll
    const [showQuickReplies, setShowQuickReplies] = useState(false); // Quick Replies Toggle

    // Audio & State Refs
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const isFirstLoadRef = React.useRef(true);

    // Initialize Audio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/belmobile-message-ping.mp3');
            audioRef.current.volume = 1.0;
        }
    }, []);

    const QUICK_REPLIES = [
        "👋 Hello! How can I help you today?",
        "📍 Our shop is at Rue Gallait 4, 1030 Schaerbeek.",
        "🕒 We are open 7/7 from 10:00 to 19:00.",
        "💰 Diagnostic is 100% FREE.",
        "🏷️ Can you please provide the IMEI?",
        "✅ Looking into it, one moment please...",
        "📞 Can we call you? What is your number?"
    ];

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (selectedSession?.messages) {
            // Use timeout to allow render
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [selectedSession?.messages, selectedSession?.id]);

    // Mock Data for "Operation Velocity" Demo if DB is empty
    const MOCK_SESSIONS: ChatSession[] = [
        {
            id: 'mock-1',
            userEmail: 'client@gmail.com',
            lastMessage: 'Prix écran iPhone 13 ?',
            lastUpdated: new Date(),
            status: 'active',
            messagesCount: 4,
            language: 'fr',
            sentiment: 'neutral',
            landingPage: '/repair/iphone'
        },
        {
            id: 'mock-2',
            userEmail: 'pro@company.be',
            lastMessage: '[Order Tracked] 56789',
            lastUpdated: new Date(Date.now() - 3600000),
            status: 'resolved',
            messagesCount: 12,
            language: 'nl',
            sentiment: 'positive',
            landingPage: '/track'
        }
    ];

    useEffect(() => {
        // In a real scenario, we listen to 'chatbot_sessions' collection
        // For now, let's try to fetch, if empty use mocks designed for the demo.
        let unsubscribe: () => void = () => { };

        try {
            // Remove server-side sorting temporarily to ensure we catch ALL documents, even those missing 'lastActive'
            const q = query(collection(db, 'chatbot_sessions'), limit(100)); // Increased limit

            unsubscribe = onSnapshot(q, (snapshot) => {

                // Sound Alert Logic
                if (!isFirstLoadRef.current) {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added' || change.type === 'modified') {
                            const data = change.doc.data();
                            const msgs = data.messages || [];
                            const lastMsg = msgs[msgs.length - 1];

                            // Only ping for User messages
                            if (lastMsg && lastMsg.sender === 'user' && audioRef.current) {
                                console.log("🔔 Playing Sound for new message:", lastMsg.text);
                                audioRef.current.play().catch(e => console.warn("Audio blocked", e));
                            }
                        }
                    });
                } else {
                    isFirstLoadRef.current = false;
                }

                const fetchedSessions = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Handle legacy data structure
                    return {
                        id: doc.id,
                        ...data,
                        // Ensure we have a valid sortable date
                        sortDate: data.lastActive || data.lastUpdated || data.lastMessageTimestamp || data.timestamp || 0,
                        // Map for UI
                        lastUpdated: data.lastActive || data.lastUpdated
                    };
                }) as (ChatSession & { sortDate: any })[];

                // Filter out "Ghost" sessions (Only Bot Welcome)
                // We keep sessions that have:
                // 1. A user message (lastUserMessage exists)
                // 2. OR more than 1 message (User replied)
                const activeSessions = fetchedSessions.filter(s =>
                    s.lastMessage?.startsWith('[Admin]') || // Admin started/replied
                    (s.messages && s.messages.length > 1) || // User replied
                    s.userEmail // User is identified (logged in)
                );

                // Client-side Sort
                const sortedSessions = activeSessions.sort((a, b) => {
                    const dateA = a.sortDate?.toDate ? a.sortDate.toDate() : new Date(a.sortDate || 0);
                    const dateB = b.sortDate?.toDate ? b.sortDate.toDate() : new Date(b.sortDate || 0);
                    return dateB.getTime() - dateA.getTime();
                });

                console.log("ChatManagement: Snapshot received. Docs count:", snapshot.docs.length, "Active:", activeSessions.length);
                if (sortedSessions.length > 0) {
                    setSessions(sortedSessions);
                } else {
                    setSessions([]);
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching sessions:", error);
                setSessions(MOCK_SESSIONS);
                setLoading(false);
            });
        } catch (err) {
            console.error("Firestore init error:", err);
            setSessions(MOCK_SESSIONS);
            setLoading(false);
        }

        return () => unsubscribe();
    }, []);

    // Sync Selected Session with Real-Time Updates
    useEffect(() => {
        if (selectedSession && sessions.length > 0) {
            const updated = sessions.find(s => s.id === selectedSession.id);
            if (updated) {
                if (JSON.stringify(updated) !== JSON.stringify(selectedSession)) {
                    setSelectedSession(updated);
                }
            }
        }
    }, [sessions, selectedSession?.id]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'escalated': return 'bg-red-100 text-red-700';
            case 'resolved': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleAdminReply = async (text: string) => {
        if (!selectedSession || !text.trim()) return;

        try {
            const sessionRef = doc(db, 'chatbot_sessions', selectedSession.id);
            const newMessage = {
                id: Date.now().toString(),
                text: text,
                sender: 'admin',
                timestamp: Date.now()
            };

            // Calculate updated messages list
            const currentMessages = selectedSession.messages || [];
            const updatedMessages = [...currentMessages, newMessage];

            await updateDoc(sessionRef, {
                messages: updatedMessages,
                lastMessage: `[Admin] ${text}`,
                lastActive: serverTimestamp(),
                status: 'active'
            });

            // Optimistic update locally to show instant feedback
            setSelectedSession(prev => prev ? {
                ...prev,
                messages: updatedMessages
            } : null);

        } catch (error) {
            console.error("Failed to send admin reply:", error);
            alert("Failed to send message: " + error);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedSession) return;
        const newStatus = selectedSession.status === 'resolved' ? 'active' : 'resolved';

        try {
            const sessionRef = doc(db, 'chatbot_sessions', selectedSession.id);
            await updateDoc(sessionRef, {
                status: newStatus
                // Note: We do NOT update lastActive here to prevent resolved chats from jumping to the top
            });
            // Optimistic Update
            setSelectedSession(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            console.error("Failed to update session status:", error);
            alert("Error updating status");
        }
    };

    const handleDelete = async () => {
        if (!selectedSession) return;
        if (!confirm("Are you sure you want to delete this chat session? This cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, 'chatbot_sessions', selectedSession.id));
            setSelectedSession(null);
        } catch (error) {
            console.error("Failed to delete session:", error);
            alert("Error deleting session");
        }
    };

    const unreadCount = sessions.filter(s => {
        if (s.status === 'resolved') return false; // Ignore resolved sessions
        const msgs = s.messages || [];
        if (msgs.length === 0) return false;

        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sender === 'user') return true;

        // Also count as unread if User spoke recently (Bot replied, but Admin hasn't seen/replied)
        if (msgs.length > 1) {
            const secondLast = msgs[msgs.length - 2];
            // If last was bot response to user, still flag it so Admin sees it
            if (lastMsg.sender === 'bot' && secondLast.sender === 'user') return true;
        }

        return false;
    }).length;

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Session List */}
            <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-indigo-500" />
                            Live Sessions
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
                                {sessions.length}
                            </span>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-sm">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Search email, content, or page..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading sessions...</div>
                    ) : sessions
                        .filter(s =>
                            !searchTerm ||
                            s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.landingPage?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(session => {
                            const msgs = session.messages || [];
                            const last = msgs[msgs.length - 1];
                            const secondLast = msgs.length > 1 ? msgs[msgs.length - 2] : null;
                            const isUnread = session.status !== 'resolved' && (
                                (last?.sender === 'user') || (last?.sender === 'bot' && secondLast?.sender === 'user')
                            );
                            return (
                                <div
                                    key={session.id}
                                    onClick={() => setSelectedSession(session)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSession?.id === session.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-semibold text-sm truncate max-w-[150px] ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>
                                            {session.userEmail || 'Anonymous Visitor'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {session.lastUpdated?.seconds ? format(new Date(session.lastUpdated.seconds * 1000), 'HH:mm', { locale: fr }) : 'Now'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-xs line-clamp-2 mb-1 flex-1 ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                            {session.lastMessage}
                                        </p>
                                        {isUnread && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full shadow-sm mt-1 shrink-0 animate-pulse"></span>
                                        )}
                                    </div>

                                    {/* Metadata Badges */}
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getStatusColor(session.status)}`}>
                                            {session.status || 'Active'}
                                        </span>
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
                                            {session.language || 'FR'}
                                        </span>
                                        {session.landingPage && (
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full truncate max-w-[120px]" title={session.landingPage}>
                                                📍 {session.landingPage}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Chat Detail View */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {selectedSession ? (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{selectedSession.userEmail || 'Anonymous Visitor'}</h3>
                                <div className="text-xs text-gray-500 flex flex-col gap-1 mt-1">
                                    <p className="flex items-center gap-2">
                                        <ClockIcon className="w-3 h-3" />
                                        Last: {selectedSession.lastUpdated?.seconds ? format(new Date(selectedSession.lastUpdated.seconds * 1000), 'dd MMM HH:mm') : 'Recently'}
                                    </p>
                                    {selectedSession.initialLandingPage && (
                                        <p className="flex items-center gap-2 text-indigo-600 font-medium">
                                            <span>🚩 Original Page: {selectedSession.initialLandingPage}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTimeout(() => replyInputRef.current?.focus(), 50)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
                                >
                                    Take Over (Live)
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${selectedSession.status === 'resolved'
                                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                                        }`}
                                >
                                    {selectedSession.status === 'resolved' ? 'Re-Activate' : 'Mark Resolved'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 ml-1 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 transition-colors shadow-sm"
                                    title="Delete Session"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                            {selectedSession.messages && selectedSession.messages.length > 0 ? (
                                selectedSession.messages.map((msg: any, idx: number) => (
                                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                            ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                            : (msg.sender === 'admin'
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-br-none')
                                            }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-1">
                                            {msg.sender === 'bot' && '🤖 '}
                                            {msg.sender === 'admin' && '👨‍💼 '}
                                            {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}

                                            {/* Read Receipt */}
                                            {msg.sender === 'admin' && (
                                                <span className={`ml-1 text-[9px] ${selectedSession.lastSeenByUser?.seconds && (selectedSession.lastSeenByUser.seconds * 1000) > msg.timestamp
                                                    ? 'text-green-500 font-bold'
                                                    : 'text-gray-300'
                                                    }`}>
                                                    {selectedSession.lastSeenByUser?.seconds && (selectedSession.lastSeenByUser.seconds * 1000) > msg.timestamp ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center mt-10">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
                                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-300" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">No Messages Found</h4>
                                    <p className="text-sm text-gray-500 mt-2">
                                        This session has no recorded messages yet.
                                    </p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Admin Reply Input */}
                        <div className="p-4 bg-white border-t border-gray-100 relative">
                            {/* Floating Quick Replies Menu */}
                            {showQuickReplies && (
                                <div className="absolute bottom-20 left-4 bg-white shadow-2xl border border-gray-100 rounded-xl w-72 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="bg-gray-50 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                        Quick Replies
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {QUICK_REPLIES.map((reply, i) => (
                                            <button
                                                key={i}
                                                className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-50 text-gray-700 border-b border-gray-50 last:border-0 transition-colors flex items-center gap-2"
                                                onClick={() => {
                                                    if (replyInputRef.current) {
                                                        replyInputRef.current.value = reply;
                                                        replyInputRef.current.focus();
                                                    }
                                                    setShowQuickReplies(false);
                                                }}
                                            >
                                                <span className="text-lg">{reply.split(' ')[0]}</span>
                                                <span className="line-clamp-1">{reply.substring(reply.indexOf(' ') + 1)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const input = form.elements.namedItem('replyInput') as HTMLInputElement;
                                    handleAdminReply(input.value);
                                    input.value = '';
                                }}
                                className="flex gap-2 items-center"
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                                    className={`p-2 rounded-xl transition-colors ${showQuickReplies ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'}`}
                                    title="Quick Replies"
                                >
                                    <BoltIcon className="w-6 h-6" />
                                </button>

                                <input
                                    ref={replyInputRef}
                                    name="replyInput"
                                    type="text"
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Type a reply..."
                                    autoComplete="off"
                                />
                                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 mb-4 text-gray-200" />
                        <p>Select a session to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManagement;
