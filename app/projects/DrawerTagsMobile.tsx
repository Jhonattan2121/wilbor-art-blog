"use client";
import IconMenu from '@/app/IconMenu';
import { clsx } from 'clsx/lite';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DrawerTagsMobile({ tags, selectedTag, setSelectedTag }: {
    tags: string[];
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
}) {
    const [showMobileTags, setShowMobileTags] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const tagFromUrl = searchParams.get('tag');
        if (tagFromUrl && tags.includes(tagFromUrl) && tagFromUrl !== selectedTag) {
            setSelectedTag(tagFromUrl);
        }
    }, [searchParams, tags, selectedTag, setSelectedTag]);

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

    const handleTagSelection = (tag: string | null) => {
        setSelectedTag(tag);
        setShowMobileTags(false);

        if (tag) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('tag', tag);
            window.history.pushState({}, '', currentUrl.toString());
        } else {
            window.location.href = window.location.pathname;
        }
    };

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
                        className="fixed top-0 left-0 h-full w-64 shadow-2xl z-50 flex flex-col animate-slide-in-left bg-white dark:bg-black"
                        style={{ maxWidth: '80vw' }}
                        aria-label="Menu lateral de tags"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black">
                            <button
                                onClick={() => setShowMobileTags(false)}
                                className="ml-2 sm:ml-6 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors p-1 sm:p-2 focus:outline-none focus:ring-2 focus:ring-red-200 flex items-center justify-center border-2 border-gray-300 shadow-lg hover:border-red-500 hover:rotate-90 transition-all"
                                aria-label="Fechar"
                                title="Fechar"
                                style={{ width: 44, height: 44 }}
                            >
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="14" cy="14" r="12" stroke="#fff" strokeWidth="2" fill="#222" />
                                    <circle cx="14" cy="14" r="4" stroke="#fff" strokeWidth="2" fill="#d32f2f" />
                                    <rect x="13" y="7" width="2" height="14" rx="1" fill="#fff" />
                                    <rect x="7" y="13" width="14" height="2" rx="1" fill="#fff" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2 bg-white dark:bg-black">
                            <div className="flex flex-col gap-2 px-1">
                                {tags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagSelection(tag)}
                                        className={clsx(
                                            'w-full text-left px-5 py-2 text-base transition font-medium border-0',
                                            selectedTag === tag
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white'
                                        )}
                                        style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                                        aria-label={`Filtrar por tag ${tag}`}
                                        title={`Filtrar por tag ${tag}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => handleTagSelection(null)}
                            className="w-full px-5 py-3 text-left font-semibold bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 transition"
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
