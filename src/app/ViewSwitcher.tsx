"use client";
import {
  Path_Contact,
  Path_Exhibitions,
  PATH_FEED_INFERRED,
  PATH_GRID,
  Path_Partners
} from '@/app/paths';
import BannerWilborSwitcher from '@/components/BannerWilborSwitcher';
import { useTheme } from 'next-themes';
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
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  const isDarkMode = mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'));
  const headerBgColor = isDarkMode ? '#000000' : '#ffffff';
  const siteBgColor = isDarkMode ? '#222222' : '#ffffff';

  return (
    <>
      {/* Mobile: logo à esquerda e Drawer à direita, fixos no topo */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between pr-4" style={{ height: '64px', backgroundColor: headerBgColor }}>
        {/* Logo/thumbnail centralizado e contido no topo */}
        <div className="h-full overflow-hidden flex-1 flex items-center">
          <BannerWilborSwitcher forceWhiteLogo />
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
      <div className="md:hidden" style={{ height: '64px' }} />

      {/* Desktop: Header com faixa preta e menu separado */}
      <div className="hidden md:flex fixed top-0 left-0 w-full z-50 items-center justify-between" style={{ height: '90px' }}>
        {/* Faixa preta que vai até antes do menu */}
        <div className="h-full flex items-center relative pr-8 sm:pr-10" style={{ backgroundColor: headerBgColor, flex: '1 1 auto' }}>
          <BannerWilborSwitcher forceWhiteLogo />
        </div>
        {/* Menu FORA da faixa preta, com fundo do site */}
        <div className="flex items-center flex-shrink-0 pr-8 sm:pr-10 z-20" style={{ backgroundColor: siteBgColor, height: '100%', paddingLeft: '1rem' }}>
          <DrawerTagsDesktop
            tags={tagsToUse}
            selectedTag={drawerTagsProps?.selectedTag ?? null}
            setSelectedTag={drawerTagsProps?.setSelectedTag}
            menuItems={menuItems}
          />
        </div>
      </div>
      {/* Espaço para não sobrepor conteúdo no desktop */}
      <div className="hidden md:block" style={{ height: '90px' }} />
    </>
  );
}
