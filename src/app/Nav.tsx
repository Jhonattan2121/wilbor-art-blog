'use client';

import ViewSwitcher, { SwitcherSelection } from '@/app/ViewSwitcher';
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

const NAV_HEIGHT_CLASS = HAS_DEFINED_SITE_DESCRIPTION
  ? 'min-h-[4rem] sm:min-h-[5rem]'
  : 'min-h-[4rem]';

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

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === PATH_ROOT) {
      return GRID_HOMEPAGE_ENABLED ? 'projects' : 'about';
    } else if (isPathGrid(pathname)) {
      return 'projects';
    } else if (isPathFeed(pathname)) {
      return 'about';
    } else if (pathname === '/exhibitions') {
      return 'exhibitions';
    }
  };

  return (
    <div className="w-full px-4 md:px-6">
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
                NAV_HEIGHT_CLASS,
                'px-2 md:px-4'
              )}>
              <div className="flex-1">
                <ViewSwitcher
                  currentSelection={switcherSelectionForPath()}
                  showAdmin={isUserSignedIn}
                />
              </div>
              <div className={clsx(
                'flex-none',
                'hidden xs:block',
                'translate-y-[-1px]',
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
