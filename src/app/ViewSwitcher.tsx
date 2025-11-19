"use client";
import {
  Path_Contact,
  Path_Exhibitions,
  PATH_FEED_INFERRED,
  PATH_GRID,
  Path_Partners
} from '@/app/paths';
import DrawerTagsDesktop from '../../app/projects/DrawerTagsDesktop';
import DrawerTagsMobile from '../../app/projects/DrawerTagsMobile';

export type SwitcherSelection = 'projects' | 'about' | 'exhibitions' | 'partners' | 'contact'; 


export default function ViewSwitcher({
  currentSelection,
  drawerTagsProps,
  tags
}: {
  currentSelection?: SwitcherSelection
  tags?: any
  showAdmin?: boolean
  drawerTagsProps?: {
    tags: string[];
    selectedTag: string | null;
    setSelectedTag?: (tag: string | null) => void;
  }
}) {
  const menuItems = [
    {
      text: "SOBRE WILBOR",
      mobileText: "SOBRE WILBOR",
      href: PATH_FEED_INFERRED,
      active: currentSelection === 'about',
    },
     {
      text: "PROJETOS",
      mobileText: "PROJETOS",
      href: PATH_GRID,
      active: currentSelection === 'projects',
    },
    {
      text: "EXPOSIÇÕES / EXIBIÇÕES",
      mobileText: "EXPOSIÇÕES / EXIBIÇÕES",
      href: Path_Exhibitions,
      active: currentSelection === 'exhibitions',
    },
    {
      text: "PARCEIROS",
      mobileText: "PARCEIROS",
      href: Path_Partners,
      active: currentSelection === 'partners',
    },
    {
      text: "CONTATO",
      mobileText: "CONTATO",
      href: Path_Contact,
      active: currentSelection === 'contact',
    },
   
  ];

  return (
    <>
      {/* Mobile: botão Drawer alinhado à esquerda */}
      <div className="md:hidden w-full mb-8 flex items-center mx-auto">
        <div className="flex items-center w-auto ml-2">
          <DrawerTagsMobile
            tags={drawerTagsProps?.tags ?? []}
            selectedTag={drawerTagsProps?.selectedTag ?? null}
            setSelectedTag={drawerTagsProps?.setSelectedTag}
            menuItems={menuItems}
          />
        </div>
      </div>

      {/* Desktop: botão Drawer alinhado à esquerda */}
      <div className="hidden sm:flex w-full mt-4 mb-6 items-center">
        <div className="flex items-center w-auto ml-14">
          <DrawerTagsDesktop
            tags={drawerTagsProps?.tags ?? []}
            selectedTag={drawerTagsProps?.selectedTag ?? null}
            setSelectedTag={drawerTagsProps?.setSelectedTag}
            menuItems={menuItems}
          />
        </div>
      </div>
    </>
  );
}
