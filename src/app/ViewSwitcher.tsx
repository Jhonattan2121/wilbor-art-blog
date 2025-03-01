import IconFeed from '@/app/IconFeed';
import IconGrid from '@/app/IconGrid';
import IconInstagram from '@/app/IconInstagram';
import IconShop from '@/app/IconShop';
import IconVimeo from '@/app/IconVimeo';
import {
  PATH_ADMIN_PHOTOS,
  PATH_FEED_INFERRED,
  PATH_GRID_INFERRED,
} from '@/app/paths';
import Switcher from '@/components/Switcher';
import SwitcherItem from '@/components/SwitcherItem';
import { useAppState } from '@/state/AppState';
import { BiLockAlt } from 'react-icons/bi';
import { GRID_HOMEPAGE_ENABLED } from './config';
import IconContact from './IconContact';
import IconOdysee from './iconOdysee';
import IconSearch from './IconSearch';

export type SwitcherSelection = 'feed' | 'grid' | 'contact';

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
}) {
  const { setIsCommandKOpen } = useAppState();

  const renderItemFeed = () =>
    <SwitcherItem
      icon={<IconFeed />}
      href={PATH_FEED_INFERRED}
      active={currentSelection === 'feed'}
      noPadding
    />;

  const renderItemGrid = () =>
    <SwitcherItem
      icon={<IconGrid />}
      href={PATH_GRID_INFERRED}
      active={currentSelection === 'grid'}
      noPadding
    />;

  const renderItemContact = () =>
    <SwitcherItem
      icon={<IconContact />}
      href="/contact"
      active={currentSelection === 'contact'}
      noPadding
    />

  return (
    <div className="flex gap-1 sm:gap-2">
      <Switcher>
        {GRID_HOMEPAGE_ENABLED ? renderItemGrid() : renderItemFeed()}
        {GRID_HOMEPAGE_ENABLED ? renderItemFeed() : renderItemGrid()}
        {renderItemContact()} { }

        <SwitcherItem
          icon={<IconInstagram />}
          href="https://instagram.com/wilbordomingues"
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


        {showAdmin &&
          <SwitcherItem
            icon={<BiLockAlt size={16} className="translate-y-[-0.5px]" />}
            href={PATH_ADMIN_PHOTOS}
            active={currentSelection === 'contact'}
          />}
      </Switcher>
      <Switcher type="borderless">
        <SwitcherItem
          icon={<IconSearch />}
          onClick={() => setIsCommandKOpen?.(true)}
        />
      </Switcher>
    </div>
  );
}
