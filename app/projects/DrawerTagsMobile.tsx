"use client";
import IconMenu from '@/app/IconMenu';
import { IconX } from '@/components/IconX';
import { clsx } from 'clsx/lite';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DrawerTagsMobile({ tags, selectedTag, setSelectedTag, menuItems, onMenuItemClick }: {
    tags: string[];
    selectedTag?: string | null;
    setSelectedTag?: (tag: string | null) => void;
    menuItems: { text: string; mobileText: string; href: string; active: boolean }[];
    onMenuItemClick?: (href: string) => void;
}) {
    const [showMobileTags, setShowMobileTags] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerActive, setDrawerActive] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const tagFromUrl = searchParams.get('tag');
        if (tagFromUrl && tags.includes(tagFromUrl) && tagFromUrl !== selectedTag) {
            if (typeof setSelectedTag === 'function') {
                setSelectedTag(tagFromUrl);
            }
        }
    }, [searchParams, tags, selectedTag, setSelectedTag]);

    useEffect(() => {
        if (showMobileTags) {
            setDrawerVisible(true);
            document.body.style.overflow = 'hidden';
            // Ativa animação de entrada após montagem
            setTimeout(() => setDrawerActive(true), 20);
        } else {
            setDrawerActive(false);
            document.body.style.overflow = '';
            const timeout = setTimeout(() => setDrawerVisible(false), 350);
            return () => clearTimeout(timeout);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showMobileTags]);

    const handleTagSelection = (tag: string | null) => {
        if (typeof setSelectedTag === 'function') {
            setSelectedTag(tag);
            if (tag) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('tag', tag);
                window.history.pushState({}, '', currentUrl.toString());
            } else {
                window.location.href = window.location.pathname;
            }
        } else {
            if (tag) {
                window.location.href = `/projects?tag=${encodeURIComponent(tag)}`;
            } else {
                window.location.href = '/projects';
            }
        }
        setShowMobileTags(false);
    };


    return (
        <div className="flex items-center -mr-4 bg-transparent">
            <button
                className="flex items-center justify-center gap-2 rounded-md text-base font-bold transition-colors bg-transparent border-none shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none"
                style={{ outline: 'none', boxShadow: 'none', cursor: 'pointer', width: 64, height: 44, padding: 0 }}
                onClick={() => setShowMobileTags(true)}
                aria-label="Abrir menu lateral"
                title="Abrir menu lateral"
            >
                <IconMenu width={44} />
            </button>
            {drawerVisible && (
                <>
                    <div
                        className={clsx(
                            'fixed inset-0 z-40 bg-black/30 dark:bg-black/60 transition-opacity duration-300',
                            showMobileTags ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        )}
                        style={{ backdropFilter: 'blur(2px)' }}
                        onClick={() => setShowMobileTags(false)}
                        aria-label="Fechar menu de navegação"
                        title="Fechar menu de navegação"
                    ></div>
                    <aside
                        id="mobile-tags-drawer"
                        className={clsx(
                            'fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-900 w-screen h-screen shadow-2xl border border-gray-200 dark:border-neutral-800 rounded-xl transition-transform duration-300',
                            drawerActive ? 'translate-x-0' : 'translate-x-full'
                        )}
                        aria-label="Menu lateral de navegação"
                    >
                        <div className="flex items-center justify-end px-4 py-4 bg-white dark:bg-neutral-900 rounded-t-xl border-b border-gray-100 dark:border-neutral-800">
                            <button
                                onClick={() => setShowMobileTags(false)}
                                className="rounded-full transition-colors p-2 flex items-center justify-center focus:outline-none hover:bg-gray-200 dark:hover:bg-neutral-800"
                                aria-label="Fechar"
                                title="Fechar"
                                style={{ width: 44, height: 44, background: 'transparent', border: 'none', boxShadow: 'none' }}
                            >
                                <IconX size={28} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 px-4 pt-2 pb-24">
                            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                                {menuItems.map((item, idx) => {
                                    const isLink = !onMenuItemClick;
                                    const Component = isLink ? 'a' : 'button';
                                    return (
                                    <Component
                                        key={item.text + idx}
                                        href={isLink ? item.href : undefined}
                                        onClick={(e: any) => {
                                            if (onMenuItemClick) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowMobileTags(false);
                                                requestAnimationFrame(() => {
                                                    onMenuItemClick(item.href);
                                                });
                                            } else {
                                                // Navegação normal (âncora /projects#rota) mas fechando o drawer
                                                setShowMobileTags(false);
                                            }
                                        }}
                                        className={clsx(
                                            'w-full text-left px-4 py-3 text-lg transition font-mono border-0 rounded-lg',
                                            item.active
                                                ? 'text-red-600 dark:text-red-400 bg-gray-100 dark:bg-neutral-800 shadow'
                                                : 'text-gray-900 dark:text-gray-100 hover:text-red-700 dark:hover:text-red-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                        )}
                                        style={{ outline: 'none', boxShadow: 'none', border: 'none', display: 'block' }}
                                        aria-label={item.mobileText}
                                        title={item.mobileText}
                                        type={isLink ? undefined : "button"}
                                    >
                                        {item.mobileText}
                                    </Component>
                                    );
                                })}
                                {/* Separador visual elegante */}
                                {Array.isArray(tags) && tags.length > 0 && (
                                    <div className="flex items-center justify-center my-4">
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
                                    </div>
                                )}
                                {/* Tags */}
                                {Array.isArray(tags) && tags.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagSelection(tag)}
                                                className={clsx(
                                                    // mesma “força” visual do menu: fonte em negrito (sem forçar maiúsculas)
                                                    'w-full text-left px-4 py-3 text-lg transition font-mono border-0 rounded-lg',
                                                    selectedTag === tag
                                                        ? 'text-red-600 dark:text-red-400 bg-gray-100 dark:bg-neutral-800 shadow'
                                                        : 'text-gray-900 dark:text-gray-100 hover:text-red-700 dark:hover:text-red-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                                )}
                                                style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                                                aria-label={`Filtrar por tag ${tag}`}
                                                title={`Filtrar por tag ${tag}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Só mostra botão limpar filtro se houver tags */}
                        {Array.isArray(tags) && tags.length > 0 && (
                            <div className="w-full px-4 pb-4 pt-2 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 sticky bottom-0 z-10">
                                <button
                                    onClick={() => handleTagSelection(null)}
                                    className="w-full px-4 py-3 text-center font-semibold bg-red-50 dark:bg-neutral-800 text-red-700 dark:text-red-300 rounded-lg transition border-none shadow focus:outline-none hover:bg-red-100 dark:hover:bg-neutral-700"
                                    style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                                    aria-label="Limpar filtro de tags"
                                    title="Limpar filtro de tags"
                                >
                                    Limpar filtro
                                </button>
                            </div>
                        )}
                    </aside>
                </>
            )}
        </div>
    );
}
