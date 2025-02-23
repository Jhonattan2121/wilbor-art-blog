'use client';

import ThemeSwitcher from '@/app/ThemeSwitcher';
import AnimateItems from '@/components/AnimateItems';
import { clsx } from 'clsx/lite';
import { usePathname } from 'next/navigation';
import SiteGrid from '../components/SiteGrid';
import { isPathAdmin, isPathSignIn } from './paths';

export default function Footer() {
  const pathname = usePathname();


  const showFooter = !isPathSignIn(pathname);

  const shouldAnimate = !isPathAdmin(pathname);

  return (
    <SiteGrid
      contentMain={
        <AnimateItems
          animateOnFirstLoadOnly
          type={!shouldAnimate ? 'none' : 'bottom'}
          distanceOffset={10}
          items={showFooter
            ? [<div
              key="footer"
              className={clsx(
                'flex items-center gap-1',
                'text-dim min-h-10',
              )}>
          
              <div className="flex items-center h-10">
                <ThemeSwitcher />
              </div>
            </div>]
            : []}
        />}
    />
  );
}
