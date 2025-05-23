'use client';

import { SwitcherSelection } from '@/app/ViewSwitcher';
import {
  PATH_ROOT,
  isPathAdmin,
  isPathFeed,
  isPathGrid,
  isPathSignIn
} from '@/app/paths';
import { useAppState } from '@/state/AppState';
import { clsx } from 'clsx/lite';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AnimateItems from '../components/AnimateItems';
import {
  GRID_HOMEPAGE_ENABLED,
  HAS_DEFINED_SITE_DESCRIPTION,
  SITE_DESCRIPTION,
} from './config';

const NAV_HEIGHT_CLASS = '';

export default function Nav({
  siteDomainOrTitle,
}: {
  siteDomainOrTitle: string;
}) {
  const pathname = usePathname();
  const { isUserSignedIn } = useAppState();
  const showNav = !isPathSignIn(pathname);

  const renderLink = (
    text: string,
    linkOrAction: string | (() => void),
  ) =>
    typeof linkOrAction === 'string'
      ? <Link href={linkOrAction}>{text}</Link>
      : <button onClick={linkOrAction}>{text}</button>;

  return (
    <div className="w-full">
      <div className="max-w-[2000px] mx-auto">
        <AnimateItems
          animateOnFirstLoadOnly
          type={!isPathAdmin(pathname) ? 'bottom' : 'none'}
          distanceOffset={10}
          items={showNav
            ? [<div
              key="nav"
              className={clsx(
                'flex items-center justify-between w-full',
                NAV_HEIGHT_CLASS
              )}>
              <div className={clsx(
                'flex-none',
                'hidden xs:block',
                'translate-y-[-1px]'
              )}>
                <div className={clsx(
                  'truncate overflow-hidden',
                  HAS_DEFINED_SITE_DESCRIPTION && 'sm:font-bold',
                )}>
                  {renderLink(siteDomainOrTitle, PATH_ROOT)}
                </div>
                {HAS_DEFINED_SITE_DESCRIPTION &&
                  <div className={clsx(
                    'hidden sm:block truncate overflow-hidden',
                    'leading-tight',
                  )}>
                    {SITE_DESCRIPTION}
                  </div>}
              </div>
            </div>]
            : []}
        />
      </div>
    </div>
  );
}
