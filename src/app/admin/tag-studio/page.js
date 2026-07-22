"use client";

import { useState } from 'react';
import { FaExpand, FaExternalLinkAlt, FaRedo, FaTags } from 'react-icons/fa';

export default function TagStudioAdminPage() {
    const [iframeKey, setIframeKey] = useState(0);

    const handleReload = () => {
        setIframeKey(prev => prev + 1);
    };

    const handleOpenNewTab = () => {
        window.open('/tag-studio/index.html', '_blank');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            {/* Header Bar */}
            <div className="bg-gray-900 text-white px-5 py-3.5 flex flex-wrap justify-between items-center gap-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary p-2 rounded-lg">
                        <FaTags className="text-xl text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">Tag Studio</h1>
                        <p className="text-xs text-gray-400">Design & Print Product Tags & Promotional Offer Posters</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReload}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Reload Tag Studio"
                    >
                        <FaRedo className="text-xs" />
                        <span>Reload</span>
                    </button>
                    <button
                        onClick={handleOpenNewTab}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                        title="Open Tag Studio in Fullscreen / New Window"
                    >
                        <FaExternalLinkAlt className="text-xs" />
                        <span>Open Full Screen</span>
                    </button>
                </div>
            </div>

            {/* Embedded Tag Studio Iframe */}
            <div className="flex-1 w-full h-full bg-gray-100 relative">
                <iframe
                    key={iframeKey}
                    src="/tag-studio/index.html"
                    className="w-full h-full border-none shadow-inner"
                    title="Tag Studio Application"
                    allow="clipboard-read; clipboard-write; printing"
                />
            </div>
        </div>
    );
}
