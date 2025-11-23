"use client";
import {
  Path_Contact,
  Path_Exhibitions,
  PATH_FEED_INFERRED,
  PATH_GRID,
  Path_Partners
} from '@/app/paths';
import BannerWilborSwitcher from '@/components/BannerWilborSwitcher';
import { useEffect, useState } from 'react';
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
  const [fetchedTags, setFetchedTags] = useState<string[]>([]);

  // If the page didn't provide tags, fetch them from the API so other routes also
  // show the same tags as the projects page.
  useEffect(() => {
    if (!drawerTagsProps?.tags || drawerTagsProps?.tags.length === 0) {
      fetch('/api/tags')
        .then(res => res.ok ? res.json() : [])
        .then((data: any[]) => {
          if (Array.isArray(data)) setFetchedTags(data.map(d => d.tag));
        })
        .catch(() => {
          // ignore errors silently
        });
    }
  }, [drawerTagsProps?.tags]);

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
  const tagsToUse = (drawerTagsProps?.tags && drawerTagsProps.tags.length > 0)
    ? drawerTagsProps.tags
    : (Array.isArray(tags) && tags.length > 0) ? tags : fetchedTags;

  return (
    <>
      {/* Mobile: logo à esquerda e Drawer à direita, fixos no topo */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-black flex items-center justify-between px-4 py-3" style={{ minHeight: '64px' }}>
        {/* Logo/thumbnail centralizado e contido no topo */}
        <div className="max-h-12 overflow-hidden flex-1 flex items-center">
          <BannerWilborSwitcher />
        </div>
        <div className="flex items-center flex-shrink-0 mr-0">
          <DrawerTagsMobile
            tags={tagsToUse}
            selectedTag={drawerTagsProps?.selectedTag ?? null}
            setSelectedTag={drawerTagsProps?.setSelectedTag}
            menuItems={menuItems}
          />
        </div>
      </div>
      {/* Espaço para não sobrepor conteúdo no mobile */}
      <div className="md:hidden" style={{ height: '44px' }} />

      {/* Desktop: logo acima e Drawer abaixo, ambos à esquerda */}
      <div className="hidden sm:block w-full mt-4 mb-6">
        <div className="ml-14">
          <BannerWilborSwitcher />
        </div>
        <div className="ml-14 mt-2">
          <DrawerTagsDesktop
            tags={tagsToUse}
            selectedTag={drawerTagsProps?.selectedTag ?? null}
            setSelectedTag={drawerTagsProps?.setSelectedTag}
            menuItems={menuItems}
          />
        </div>
      </div>
    </>
  );
}
