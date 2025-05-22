import {
  Path_Contact,
  Path_Exhibitions,
  PATH_FEED_INFERRED,
  Path_Partners,
  Path_Social_Media
} from '@/app/paths';
import SwitcherItem from './SwitcherItem';

export type SwitcherSelection = 'projects' | 'about' | 'exhibitions' | 'partners' | 'contact'; 

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
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
    <div className="flex flex-col w-full">
      <div className="sm:hidden w-full mb-1">
        <div className="flex justify-between px-2 py-1">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`px-1 py-0.5 text-center text-sm whitespace-nowrap transition-colors text-red-500
                ${item.active
                  ? 'font-semibold'
                  : 'font-sans'
                }`}
            >
              {item.mobileText}
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
