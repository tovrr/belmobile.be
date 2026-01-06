'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import {
    ChatBubbleLeftRightIcon,
    UserIcon,
    ClockIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    FunnelIcon,
    MagnifyingGlassIcon
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
}

const ChatManagement: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'escalated'>('all');
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

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
            sentiment: 'neutral'
        },
        {
            id: 'mock-2',
            userEmail: 'pro@company.be',
            lastMessage: '[Order Tracked] 56789',
            lastUpdated: new Date(Date.now() - 3600000),
            status: 'resolved',
            messagesCount: 12,
            language: 'nl',
            sentiment: 'positive'
        }
    ];

    useEffect(() => {
        // In a real scenario, we listen to 'chatbot_sessions' collection
        // For now, let's try to fetch, if empty use mocks designed for the demo.
        const q = query(collection(db, 'chatbot_sessions'), orderBy('lastUpdated', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatSession[];

            if (fetchedSessions.length > 0) {
                setSessions(fetchedSessions);
            } else {
                setSessions(MOCK_SESSIONS);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching sessions:", error);
            setSessions(MOCK_SESSIONS); // Fallback to mocks on error (e.g. permission)
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'escalated': return 'bg-red-100 text-red-700';
            case 'resolved': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

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
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
                            {sessions.length}
                        </span>
                    </div>
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Search email or content..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading sessions...</div>
                    ) : sessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSession?.id === session.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm text-gray-900 truncate max-w-[150px]">
                                    {session.userEmail || 'Anonymous Visitor'}
                                </span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                    {session.lastUpdated?.seconds ? format(new Date(session.lastUpdated.seconds * 1000), 'HH:mm', { locale: fr }) : 'Now'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                {session.lastMessage}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getStatusColor(session.status)}`}>
                                    {session.status || 'Active'}
                                </span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
                                    {session.language || 'FR'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Detail View */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {selectedSession ? (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{selectedSession.userEmail || 'Anonymous Visitor'}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                    <ClockIcon className="w-3 h-3" />
                                    Started {selectedSession.lastUpdated?.seconds ? format(new Date(selectedSession.lastUpdated.seconds * 1000), 'dd MMM HH:mm') : 'Recently'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm">
                                    Take Over (Live)
                                </button>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                                    Mark Resolved
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-50 p-6 flex items-center justify-center">
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
                                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-300" />
                                </div>
                                <h4 className="font-bold text-gray-900">Transcript Unavailable</h4>
                                <p className="text-sm text-gray-500 max-w-sm mt-2">
                                    Full transcript history requires <b>Pro Analytics</b>. <br />
                                    Currently showing session metadata only.
                                </p>
                            </div>
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
