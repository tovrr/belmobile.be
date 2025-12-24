'use client';
import dynamic from 'next/dynamic';

const AIChatAssistant = dynamic(() => import('./AIChatAssistant'), {
    ssr: false,
});

export default function AIChatAssistantWrapper() {
    return <AIChatAssistant />;
}
