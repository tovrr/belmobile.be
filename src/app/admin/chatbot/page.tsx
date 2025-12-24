'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { ChatBubbleLeftRightIcon, UserIcon, ComputerDesktopIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ChatSession {
    id: string;
    sessionId: string;
    language: string;
    createdAt: Timestamp;
    lastActive: Timestamp;
    lastUserMessage?: string;
    messages: any[];
}

export default function ChatbotAdmin() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'chatbot_sessions'),
            orderBy('lastActive', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sessionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatSession[];
            setSessions(sessionsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '...';
        const date = timestamp.toDate();
        return date.toLocaleString();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-electric-indigo" />
                        AI Chatbot Monitor
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time customer interaction tracking</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Total Sessions</p>
                        <p className="text-xl font-black text-electric-indigo">{sessions.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {/* Session List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-sm bg-slate-50/50 dark:bg-slate-900/50">
                        Recent Activity
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center animate-pulse text-slate-300">Loading sessions...</div>
                        ) : sessions.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 italic">No chat sessions found.</div>
                        ) : sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${selectedSession?.id === session.id ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-inset ring-electric-indigo/20' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded uppercase">
                                        {session.language}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {formatDate(session.lastActive).split(',')[1]}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {session.lastUserMessage || "New Session"}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {session.messages?.length || 0} messages
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Details */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                    {selectedSession ? (
                        <>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white">Session Detail</h2>
                                    <p className="text-[12px] text-slate-500 font-mono">{selectedSession.sessionId}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span className="text-xs">{formatDate(selectedSession.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/10">
                                {selectedSession.messages?.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-indigo-100 text-electric-indigo' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {msg.sender === 'user' ? <UserIcon className="w-5 h-5" /> : <ComputerDesktopIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                                    ? 'bg-electric-indigo text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-600 rounded-tl-none'
                                                    }`}>
                                                    {msg.text}
                                                    {msg.metadata && (
                                                        <div className="mt-3 pt-3 border-t border-white/20 dark:border-slate-600/50">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold uppercase bg-white/20 px-1.5 py-0.5 rounded">Action Card: {msg.metadata.type}</span>
                                                                <span className="text-[10px] opacity-70 italic">{msg.metadata.data?.name}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                            <ChatBubbleLeftRightIcon className="w-20 h-20 opacity-10 mb-4" />
                            <p className="font-bold">Select a session to view the conversation</p>
                            <p className="text-sm opacity-70">Live updates are active</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
