import {
  Path_Contact,
  Path_Exhibitions,
  PATH_FEED_INFERRED,
  Path_Partners,
  Path_Social_Media
} from '@/app/paths';
import SwitcherItem from './SwitcherItem';

export type SwitcherSelection = 'projects' | 'about' | 'exhibitions' | 'social-media' | 'partners' | 'contact'; 

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
}) {
  const menuItems = [
    {
      text: "exposições/exibições",
      href: Path_Exhibitions,
      active: currentSelection === 'exhibitions',
    },
    {
      text: "Sobre",
      href: PATH_FEED_INFERRED,
      active: currentSelection === 'about',
    },
    {
      text: "Mídia Social",
      href: Path_Social_Media,
      active: currentSelection === 'social-media',
    },
    {
      text: "Parceiros",
      href: Path_Partners,
      active: currentSelection === 'partners',
    },
    {
      text: "Contato",
      href: Path_Contact,
      active: currentSelection === 'contact',
    }
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="sm:hidden w-full mb-1">
        <div className="flex justify-around px-0 py-0.5">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`px-1 py-1 text-center text-base transition-colors text-red-500
                ${item.active
                  ? 'font-semibold'
                  : 'font-sans'
                }`}
            >
              {item.text.replace('/exibições', '')}
            </a>
          ))}
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:flex sm:flex-row items-center gap-2">
        <div className="flex gap-2 ml-0 md:ml-2">
          {menuItems.map((item, index) => (
            <SwitcherItem
              key={index}
              text={item.text}
              href={item.href}
              active={item.active}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
