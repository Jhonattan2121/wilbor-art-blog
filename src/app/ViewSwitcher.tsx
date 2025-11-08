import {
  Path_Contact,
  Path_Exhibitions,
  PATH_FEED_INFERRED,
  Path_Partners
} from '@/app/paths';
import DrawerTagsDesktop from '../../app/projects/DrawerTagsDesktop';
import DrawerTagsMobile from '../../app/projects/DrawerTagsMobile';

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
      text: "sobre",
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
      text: "parceiros",
      mobileText: "parceiros",
      href: Path_Partners,
      active: currentSelection === 'partners',
    },
    {
      text: "contato",
      mobileText: "contato",
      href: Path_Contact,
      active: currentSelection === 'contact',
    }
  ];

  return (
    <>
      <div className="md:hidden w-full mb-8 flex justify-center mx-auto">
          <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={
                  `px-2 py-1 text-center text-xs whitespace-nowrap transition-colors rounded-md font-ibmplexmono font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${item.active ? 'text-red-500' : 'text-white'}`
                }
              >
                {item.mobileText}
              </a>
            ))}
            <DrawerTagsMobile
              tags={drawerTagsProps?.tags ?? []}
              selectedTag={drawerTagsProps?.selectedTag ?? null}
              setSelectedTag={drawerTagsProps?.setSelectedTag ?? (() => {})}
            />
          </div>
      </div>

      {/* Desktop menu unchanged but keep spacing consistent */}
      <div className="hidden sm:flex sm:flex-row items-center gap-6 w-full mt-4 mb-6" style={{ marginLeft: '56px' }}>
        <div className="flex flex-row gap-6 flex-1 items-center">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`px-4 py-2 text-center text-lg whitespace-nowrap transition-colors rounded-md font-ibmplexmono font-medium hover:text-red-400 dark:hover:text-red-400 ${item.active ? 'text-red-500' : ''}`}
            >
              {item.text}
            </a>
          ))}
          <DrawerTagsDesktop
            tags={drawerTagsProps?.tags ?? []}
            selectedTag={drawerTagsProps?.selectedTag ?? null}
            setSelectedTag={drawerTagsProps?.setSelectedTag ?? (() => {})}
          />
        </div>
      </div>
    </>
  );
}
