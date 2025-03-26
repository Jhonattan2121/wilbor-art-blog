'use client';

import { PATH_ROOT } from '@/app/paths';
import useClickInsideOutside from '@/utility/useClickInsideOutside';
import useEscapeHandler from '@/utility/useEscapeHandler';
import useMetaThemeColor from '@/utility/useMetaThemeColor';
import usePrefersReducedMotion from '@/utility/usePrefersReducedMotion';
import { clsx } from 'clsx/lite';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import AnimateItems from './AnimateItems';

export default function Modal({
  onClosePath,
  onClose,
  className,
  anchor = 'center',
  children,
  fast,
}: {
  onClosePath?: string
  onClose?: () => void
  className?: string
  anchor?: 'top' | 'center'
  children: ReactNode
  fast?: boolean
}) {
  const router = useRouter();

  const prefersReducedMotion = usePrefersReducedMotion();

  const contentRef = useRef<HTMLDivElement>(null);

  const [htmlElements, setHtmlElements] =
    useState<RefObject<HTMLDivElement | null>[]>([]);

  useEffect(() => {
    if (contentRef.current) {
      setHtmlElements([contentRef]);
    }
  }, []);

  useMetaThemeColor({ colorLight: '#333' });

  useClickInsideOutside({
    htmlElements,
    onClickOutside: () => {
      if (onClose) {
        onClose();
      } else {
        router.push(
          onClosePath ?? PATH_ROOT,
          { scroll: false },
        );
      }
    },
  });

  useEscapeHandler(onClose, true);

  return (
    <motion.div
      className={clsx(
        'fixed inset-0 z-[9999] flex justify-center',
        anchor === 'top'
          ? 'items-start pt-4 sm:pt-24'
          : 'items-center',
        'bg-black',
      )}
      initial={!prefersReducedMotion
        ? { backgroundColor: 'rgba(0, 0, 0, 0)' }
        : false}
      animate={{ backgroundColor: 'rgba(0, 0, 0, 0.80)' }}
      transition={{ duration: 0.3, easing: 'easeOut' }}
    >
      <AnimateItems
        duration={fast ? 0.1 : 0.3}
        items={[<div
          ref={contentRef}
          key="modalContent"
          className={clsx(
            'w-[calc(100vw-1.5rem)] sm:w-[min(1200px,98vw)]',
            'p-3 rounded-lg',
            'md:p-4 md:rounded-xl',
            'bg-white dark:bg-black',
            'dark:border dark:border-gray-800',
            'relative z-[10000]',
            className,
          )}
        >
          {children}
        </div>]}
      />
    </motion.div>
  );
};
