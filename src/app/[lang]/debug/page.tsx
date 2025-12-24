import React from 'react';
import { headers } from 'next/headers';

export default async function DebugPage({ params, searchParams }: any) {
    const headerList = await headers();
    const allHeaders: Record<string, string> = {};
    headerList.forEach((val, key) => {
        allHeaders[key] = val;
    });

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug Page</h1>
            <div className="mb-4">
                <h2 className="font-bold">Params</h2>
                <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(await params, null, 2)}</pre>
            </div>
            <div className="mb-4">
                <h2 className="font-bold">Search Params</h2>
                <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(await searchParams, null, 2)}</pre>
            </div>
            <div className="mb-4">
                <h2 className="font-bold">Headers</h2>
                <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(allHeaders, null, 2)}</pre>
            </div>
        </div>
    );
}
