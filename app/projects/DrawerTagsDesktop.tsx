"use client";
import IconMenu from '@/app/IconMenu';
import { clsx } from 'clsx/lite';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DrawerTagsDesktop({ tags, selectedTag, setSelectedTag }: {
  tags: string[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}) {
  const [showDrawer, setShowDrawer] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl && tags.includes(tagFromUrl) && tagFromUrl !== selectedTag) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams, tags, selectedTag, setSelectedTag]);

  useEffect(() => {
    if (showDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDrawer]);

  const handleTagSelection = (tag: string | null) => {
    setSelectedTag(tag);
    setShowDrawer(false);

    if (tag) {
      const url = new URL(window.location.href);
      url.searchParams.set('tag', tag);
      window.history.pushState({}, '', url.toString());
    } else {
      window.location.href = window.location.pathname;
    }
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="inline-flex items-center ml-2">
      <button
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-base font-bold border border-gray-400 focus:ring-2 focus:ring-red-200 transition-colors shadow-sm w-auto outline-none"
        onClick={() => setShowDrawer(true)}
        aria-label="Abrir menu de tags"
        title="Abrir menu de tags"
      >
        <IconMenu width={22} />
      </button>
      {showDrawer && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity animate-fade-in bg-black/30 dark:bg-black/60"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={() => setShowDrawer(false)}
            aria-label="Fechar menu de tags"
            title="Fechar menu de tags"
          />
          <aside
            id="desktop-tags-drawer"
            className="fixed top-0 left-0 h-full w-72 shadow-2xl z-50 flex flex-col animate-slide-in-left bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800"
            style={{ maxWidth: '90vw' }}
            aria-label="Menu lateral de tags"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <button
                onClick={() => setShowDrawer(false)}
                className="hover:text-black dark:hover:text-white p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
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
                    onClick={() => handleTagSelection(tag)}
                    className={clsx(
                      'w-full text-left px-5 py-2 text-base rounded transition font-medium dark:text-gray-200 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white',
                      selectedTag === tag && 'bg-gray-200 dark:bg-gray-800 font-bold text-black dark:text-white border-l-4 border-gray-500 dark:border-gray-400'
                    )}
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
              className="w-full px-5 py-3 text-left font-semibold bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
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
