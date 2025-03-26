'use client';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CollapsibleFooterTags({ tags }: { tags: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isTagPage = pathname?.startsWith('/tag/');

  const handleTagClick = (tag: string) => {
    router.push(`/tag/${tag}`);
    setIsOpen(false);
  };

  const handleBackToProjects = () => {
    router.push('/dashboard');
    setIsOpen(false);
  };

  return (
    <div className="sticky bottom-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex justify-center">
          <div
            className={clsx(
              "bg-white dark:bg-black",
              "shadow-md",
              "overflow-hidden",
              isOpen
                ? "min-w-fit rounded-t-lg transition-[width] duration-300 ease-in-out"
                : "w-[120px] rounded-t-lg transition-[width] duration-300 ease-in-out",
              "border border-gray-200 dark:border-gray-800 border-b-0"
            )}
          >
            <button
              onClick={() => isTagPage ? handleBackToProjects() : setIsOpen(!isOpen)}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-gray-900",
                "rounded-lg",
                "text-base font-medium",
                "w-full",
                "min-w-[120px]",
              )}
            >
              <span className="font-medium">
                {isTagPage ? "Voltar" : "Tags"}
              </span>
              {!isTagPage && (
                isOpen ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronUpIcon className="h-5 w-5" />
                )
              )}
            </button>

            {isOpen && (
              <div className="max-h-[300px] overflow-y-auto px-1 py-0.5 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col items-center w-full gap-0.5">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={clsx(
                        "px-3 py-2",
                        "text-gray-700 dark:text-gray-300",
                        "text-sm",
                        "rounded",
                        "transition-all duration-200",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        "hover:shadow-sm",
                        "whitespace-nowrap",
                        "w-full text-center"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}