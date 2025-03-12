import IconFeed from '@/app/IconFeed';
import IconGrid from '@/app/IconGrid';
import {
  PATH_FEED_INFERRED,
  PATH_GRID_INFERRED
} from '@/app/paths';
import Switcher from '@/components/Switcher';
import SwitcherItem from '@/components/SwitcherItem';
import { useState } from 'react';
import { GRID_HOMEPAGE_ENABLED } from './config';
import IconEmail from './IconEmail';
import IconInstagram from './IconInstagram';
import IconMenu from './IconMenu';
import IconOdysee from './iconOdysee';
import IconShop from './IconShop';
import IconVimeo from './IconVimeo';
import IconWhatsapp from './IconWhatsapp';

export type SwitcherSelection = 'projects' | 'about';

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderItemGrid = () =>
    <SwitcherItem
      icon={<IconGrid />}
      href={PATH_GRID_INFERRED}
      active={currentSelection === 'projects'}
      noPadding
    />;

  const renderItemFeed = () =>
    <SwitcherItem
      icon={<IconFeed />}
      href={PATH_FEED_INFERRED}
      active={currentSelection === 'about'}
      noPadding
    />;

  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between relative">
        {/* Menu mobile */}
        <div className="sm:hidden relative">
          <SwitcherItem
            icon={<IconMenu />}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            noPadding
          />

          {/* Menu mobile dropdown */}
          <Switcher className={`
            ${!isMenuOpen ? 'hidden' : 'flex'} 
            absolute 
            left-5 
            ml-2
            top-3 
            -translate-y-1/2 
            bg-white 

          `}>
            <SwitcherItem
              icon={<IconInstagram />}
              href="https://instagram.com/wilbor_domina"
              target="_blank"
              rel="noopener noreferrer"
            />
            <SwitcherItem
              icon={<IconVimeo />}
              href="https://vimeo.com/wilbor"
              target="_blank"
              rel="noopener noreferrer"
            />
            <SwitcherItem
              icon={<IconOdysee />}
              href="https://odysee.com/@wilbor"
              target="_blank"
              rel="noopener noreferrer"
            />
            <SwitcherItem
              icon={<IconShop />}
              href="https://web.marcelforart.com/wilson_domingues/collections"
              target="_blank"
              rel="noopener noreferrer"
            />
            <SwitcherItem
              icon={<IconWhatsapp />}
              href="https://wa.me/5521986351316"
              target="_blank"
              rel="noopener noreferrer"
            />
            <SwitcherItem
              icon={<IconEmail />}
              href="mailto:wilsondomingues@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            />
          </Switcher>
        </div>

        {/* Main navigation */}
        <div className="flex gap-1 sm:gap-2">
          <Switcher>
            {GRID_HOMEPAGE_ENABLED ? renderItemGrid() : renderItemFeed()}
            {GRID_HOMEPAGE_ENABLED ? renderItemFeed() : renderItemGrid()}
          </Switcher>
        </div>

        {/* Social media links */}
        <Switcher className="hidden sm:flex">
          <SwitcherItem
            icon={<IconInstagram />}
            href="https://instagram.com/wilbor_domina"
            target="_blank"
            rel="noopener noreferrer"
          />
          <SwitcherItem
            icon={<IconVimeo />}
            href="https://vimeo.com/wilbor"
            target="_blank"
            rel="noopener noreferrer"
          />
          <SwitcherItem
            icon={<IconOdysee />}
            href="https://odysee.com/@wilbor"
            target="_blank"
            rel="noopener noreferrer"
          />
          <SwitcherItem
            icon={<IconShop />}
            href="https://web.marcelforart.com/wilson_domingues/collections"
            target="_blank"
            rel="noopener noreferrer"
          />
          <SwitcherItem
            icon={<IconWhatsapp />}
            href="https://wa.me/5521986351316"
            target="_blank"
            rel="noopener noreferrer"
          />
          <SwitcherItem
            icon={<IconEmail />}
            href="mailto:wilsondomingues@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          />
        </Switcher>
      </div>
    </div>
  );
}
