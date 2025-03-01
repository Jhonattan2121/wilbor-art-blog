'use client';

import ThemeSwitcher from '@/app/ThemeSwitcher';
import AnimateItems from '@/components/AnimateItems';
import { clsx } from 'clsx/lite';
import { usePathname } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
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
              <div className="flex gap-x-3 xs:gap-x-4 grow flex-wrap">
                <p><strong>&nbsp;&nbsp; Copyright Wilbor Art @ 2025</strong></p>
              </div>
              <div className="flex gap-x-6 items-center">
                <a className="flex items-center gap-2 hover:text-blue-600">
                  <FaWhatsapp className="text-xl" />
                  <span>+55 21 98635-1316</span>
                </a>

                <a className="flex items-center gap-2 hover:text-blue-600">
                  <MdEmail className="text-xl" />
                  <span>wilsondomingues@gmail.com</span>
                </a>
              </div>
            </div>]
            : []}
        />}
    />
  );
}
