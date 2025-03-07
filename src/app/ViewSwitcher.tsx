import IconFeed from '@/app/IconFeed';
import IconGrid from '@/app/IconGrid';
import {
  Path_Contact,
  PATH_FEED_INFERRED,
  PATH_GRID_INFERRED
} from '@/app/paths';
import Switcher from '@/components/Switcher';
import SwitcherItem from '@/components/SwitcherItem';
import { GRID_HOMEPAGE_ENABLED } from './config';
import IconContacts from './IconContacts';

export type SwitcherSelection = 'feed' | 'projects' | "contact";

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
}) {

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
      active={currentSelection === 'projects'}
      noPadding
    />;

    const renderItemContact = () =>
    <SwitcherItem
      icon={<IconContacts />}
      href={Path_Contact}
      active={currentSelection === 'contact'}
      noPadding
    />;

  return (
    <div className="flex gap-1 sm:gap-2">
      <Switcher>
        {GRID_HOMEPAGE_ENABLED ? renderItemGrid() : renderItemFeed()}
        {GRID_HOMEPAGE_ENABLED ? renderItemFeed() : renderItemGrid()}
        {renderItemContact()}

      </Switcher>
      {/* <Switcher type="borderless">
        <SwitcherItem
          icon={<IconSearch />}
          onClick={() => setIsCommandKOpen?.(true)}
        />
      </Switcher> */}
    </div>
  );
}
