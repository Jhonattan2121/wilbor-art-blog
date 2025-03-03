import IconFeed from '@/app/IconFeed';
import IconGrid from '@/app/IconGrid';
import {
  PATH_FEED_INFERRED,
  PATH_GRID_INFERRED
} from '@/app/paths';
import Switcher from '@/components/Switcher';
import SwitcherItem from '@/components/SwitcherItem';
import { useAppState } from '@/state/AppState';
import { GRID_HOMEPAGE_ENABLED } from './config';

export type SwitcherSelection = 'feed' | 'portifolio';

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
      active={currentSelection === 'portifolio'}
      noPadding
    />;

  return (
    <div className="flex gap-1 sm:gap-2">
      <Switcher>
        {GRID_HOMEPAGE_ENABLED ? renderItemGrid() : renderItemFeed()}
        {GRID_HOMEPAGE_ENABLED ? renderItemFeed() : renderItemGrid()}

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
