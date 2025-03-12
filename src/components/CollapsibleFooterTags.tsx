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
    router.push('/projects');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={clsx(
          "bg-white dark:bg-black",
          "shadow-md",
          "overflow-hidden",
          isOpen
            ? "min-w-fit rounded-md transition-[width] duration-300 ease-in-out"
            : "w-[80px] rounded-md transition-[width] duration-300 ease-in-out",
          "border border-gray-200 dark:border-gray-800"
        )}
      >
        <button
          onClick={() => isTagPage ? handleBackToProjects() : setIsOpen(!isOpen)}
          className={clsx(
            "flex items-center justify-center gap-1 px-2 py-1",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-50 dark:hover:bg-gray-900",
            "rounded-md",
            "text-xs",
            "w-full",
            "min-w-[80px]",
          )}
        >
          <span className="font-medium">
            {isTagPage ? "Voltar" : "Tags"}
          </span>
          {!isTagPage && (
            isOpen ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronUpIcon className="h-3 w-3" />
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
                    "px-1.5 py-0.5",
                    "text-gray-700 dark:text-gray-300",
                    "text-xs",
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
  );
}