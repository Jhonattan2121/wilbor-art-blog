'use client';

import { groupMediaByPermlink } from '@/components/MediaUtils';
import '@/styles/slider-custom.css';
import { clsx } from 'clsx/lite';
import { useEffect, useRef, useState } from 'react';
import { MediaItem } from './components/MediaItem';
import { PhotoGridContainerProps } from './components/types';

export default function PhotoGridContainer({
  sidebar,
  media = [],
  header,
  selectedTag,
  setSelectedTag,
  username,
  postingKey,
  isEditMode,
}: PhotoGridContainerProps & {
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}) {
  const [expandedPermlinks, setExpandedPermlinks] = useState<string[]>([]);
  const [hasLargeContentMap, setHasLargeContentMap] = 
    useState<Record<string, boolean>>({});
  const groupedMedia = groupMediaByPermlink(media);
  
  const mediaGroups = Array.from(groupedMedia.entries())
    .filter(([_, group]) => {
      if (!selectedTag) return true;
      return group[0].tags?.includes(selectedTag);
    })
    .map(([permlink, group]) => ({
      permlink,
      group,
      mainItem: group[0],
    }));
  
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setExpandedPermlinks([]);

    const url = new URL(window.location.href);
    if (selectedTag !== tag) {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.pushState({}, '', url);
  };
  
  const handleContentSizeChange = (permlink: string, isLarge: boolean) => {
    setHasLargeContentMap(prev => ({ ...prev, [permlink]: isLarge }));
  };
  
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (expandedPermlinks.length === 1) {
      const permlink = expandedPermlinks[0];
      const ref = cardRefs.current[permlink];
      if (ref) {
        setTimeout(() => {
          ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [expandedPermlinks]);
  
  return (
    <div className="w-full">
      <div 
        className={clsx(
          'max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8',
          header ? 'mb-5 sm:mb-5' : 'mb-2',
        )}
      >
        {header}

        <div 
          className="grid gap-y-10 sm:gap-y-6 gap-x-2 sm:gap-x-4 md:gap-5 
                    grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                    xl:grid-cols-4 grid-flow-dense"
        >
          {mediaGroups.map(({ permlink, group }, idx) => {
            const isExpanded = expandedPermlinks.includes(permlink);
            const isOdd = idx % 2 === 1;
            return (
              <div
                key={permlink}
                ref={el => { cardRefs.current[permlink] = el; }}
                className={clsx(
                  'relative overflow-hidden rounded-lg w-full shadow-sm',
                  'transition-all duration-300',
                  isExpanded
                    ? (hasLargeContentMap[permlink]
                      ? 'sm:col-span-2 md:col-span-3 lg:col-span-3 '
                        + 'row-span-3 h-auto'
                      : 'sm:col-span-2 md:col-span-3 lg:col-span-3 '
                        + 'row-span-2 h-auto')
                    : 'col-span-1',
                )}
                tabIndex={0}
                aria-label={`Projeto ${group[0]?.title || ''}`}
                title={group[0]?.title || ''}
              >
                <MediaItem
                  items={group}
                  isExpanded={isExpanded}
                  onExpand={() => {
                    setExpandedPermlinks(prev =>
                      prev.includes(permlink)
                        ? []
                        : [permlink],
                    );
                  }}
                  onContentSizeChange={isLarge => 
                    handleContentSizeChange(permlink, isLarge)
                  }
                  onTagClick={handleTagClick}
                  hasLargeContent={!!hasLargeContentMap[permlink]}
                  username={username}
                  postingKey={postingKey}
                  isEditMode={isEditMode}
                  isReversedLayout={isOdd}
                />
              </div>
            );
          })}
        </div>
      </div>
      {sidebar && (
        <div className="hidden md:block">
          {sidebar}
        </div>
      )}
    </div>
  );
}