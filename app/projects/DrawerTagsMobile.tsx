"use client";
import IconMenu from '@/app/IconMenu';
import { clsx } from 'clsx/lite';
import { useEffect, useState } from 'react';

export default function DrawerTagsMobile({ tags, selectedTag, setSelectedTag }: {
    tags: string[];
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
}) {
    const [showMobileTags, setShowMobileTags] = useState(false);

    useEffect(() => {
        if (showMobileTags) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showMobileTags]);

    if (!tags || tags.length === 0) return null;

    return (
        <div className="sm:hidden flex items-center">
            <button
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-bold transition-colors w-auto bg-transparent border-none shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none"
                style={{ outline: 'none', boxShadow: 'none' }}
                onClick={() => setShowMobileTags(true)}
                aria-label="Abrir menu de tags"
                title="Abrir menu de tags"
            >
                <IconMenu width={22} />
            </button>
            {showMobileTags && (
                <>
                    <div
                        className="fixed inset-0 z-40 transition-opacity animate-fade-in bg-black/30 dark:bg-black/60"
                        style={{ backdropFilter: 'blur(2px)' }}
                        onClick={() => setShowMobileTags(false)}
                        aria-label="Fechar menu de tags"
                        title="Fechar menu de tags"
                    />
                    <aside
                        id="mobile-tags-drawer"
                        className="fixed top-0 left-0 h-full w-64 shadow-2xl z-50 flex flex-col animate-slide-in-left bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800"
                        style={{ maxWidth: '80vw' }}
                        aria-label="Menu lateral de tags"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                            <button
                                onClick={() => setShowMobileTags(false)}
                                className="hover:text-black dark:hover:text-white p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                style={{ outline: 'none', boxShadow: 'none' }}
                                aria-label="Fechar menu"
                                title="Fechar menu"
                            >
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2 bg-white dark:bg-black">
                            <div className="flex flex-col gap-2 px-1">
                                {tags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => { setSelectedTag(tag); setShowMobileTags(false); }}
                                        className={clsx(
                                            'w-full text-left px-5 py-2 text-base rounded transition font-medium',
                                            selectedTag === tag
                                                ? 'bg-gray-50 text-red-600 font-bold border-l-4 border-red-300 dark:bg-gray-800 dark:text-red-400 dark:border-red-500'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-200 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white'
                                        )}
                                        style={{ outline: 'none', boxShadow: 'none' }}
                                        aria-label={`Filtrar por tag ${tag}`}
                                        title={`Filtrar por tag ${tag}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => { setSelectedTag(null); setShowMobileTags(false); }}
                            className="w-full px-5 py-3 text-left font-semibold bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                            style={{ outline: 'none', boxShadow: 'none' }}
                            aria-label="Limpar filtro de tags"
                            title="Limpar filtro de tags"
                        >
                            Limpar filtro
                        </button>
                    </aside>
                </>
            )}
        </div>
    );
}
