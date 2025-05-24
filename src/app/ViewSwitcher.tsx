import {
  Path_Contact,
  Path_Exhibitions,
  PATH_FEED_INFERRED,
  Path_Partners
} from '@/app/paths';
import DrawerTagsMobile from '../../app/projects/DrawerTagsMobile';
import SwitcherItem from './SwitcherItem';

export type SwitcherSelection = 'projects' | 'about' | 'exhibitions' | 'partners' | 'contact'; 

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
  drawerTagsProps,
  tags
}: {
  currentSelection?: SwitcherSelection
  tags?: any
  showAdmin?: boolean
  drawerTagsProps?: {
    tags: string[];
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
  }
}) {
  
  const menuItems = [
    {
      text: "Sobre",
      mobileText: "sobre",
      href: PATH_FEED_INFERRED,
      active: currentSelection === 'about',
    },
    {
      text: "exposições/exibições",
      mobileText: "expo",
      href: Path_Exhibitions,
      active: currentSelection === 'exhibitions',
    },
  
    {
      text: "Parceiros",
      mobileText: "parceiros",
      href: Path_Partners,
      active: currentSelection === 'partners',
    },
    {
      text: "Contato",
      mobileText: "contato",
      href: Path_Contact,
      active: currentSelection === 'contact',
    }
  ];

  return (
    <>
      <div className="sm:hidden w-full mb-0"> 
        <div className="flex items-center justify-center gap-4 px-2 py-1">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`px-2 py-1 text-center text-base whitespace-nowrap transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 
                ${item.active ? 'text-red-500 font-semibold' : 'text-gray-500 font-sans'}`}
            >
              {item.mobileText}
            </a>
          ))}
          <div style={{ width: 40, display: 'flex', justifyContent: 'center' }}>
            {drawerTagsProps ? (
              <DrawerTagsMobile
                tags={drawerTagsProps.tags}
                selectedTag={drawerTagsProps.selectedTag}
                setSelectedTag={drawerTagsProps.setSelectedTag}
              />
            ) : (
              <div style={{ width: 22, height: 22, opacity: 0 }} />
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:flex sm:flex-row items-center gap-4 w-full mt-4 mb-4" style={{ marginLeft: '56px' }}>
        <div className="flex flex-row gap-4 flex-1 items-center">
          <SwitcherItem
            text="Sobre"
            href={PATH_FEED_INFERRED}
            active={currentSelection === 'about'}
          />
          <SwitcherItem
            text="exposições/exibições"
            href={Path_Exhibitions}
            active={currentSelection === 'exhibitions'}
          />
          <SwitcherItem
            text="Parceiros"
            href={Path_Partners}
            active={currentSelection === 'partners'}
          />
          <SwitcherItem
            text="Contato"
            href={Path_Contact}
            active={currentSelection === 'contact'}
          />
        </div>
      </div>
    </>
  );
}
