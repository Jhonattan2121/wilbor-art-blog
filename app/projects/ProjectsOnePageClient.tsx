'use client';

import ViewSwitcher, { SwitcherSelection } from '@/app/ViewSwitcher';
import About from '@/app/about/page';
import { PATH_GRID } from '@/app/paths';
import ExhibitionsContent from '@/components/ExhibitionsContent';
import PartnersContent from '@/components/PartnersContent';
import ScrollReveal from '@/components/ScrollReveal';
import { useSearchParams } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';
import ProjectsClient from './ProjectsClient';

const MemoizedProjectsClient = memo(ProjectsClient);
const MemoizedAbout = memo(About);
const MemoizedExhibitionsContent = memo(ExhibitionsContent);
const MemoizedPartnersContent = memo(PartnersContent);

export default function ProjectsOnePageClient({ projectsProps }: { projectsProps: any }) {
  const [activeSection, setActiveSection] = useState<SwitcherSelection>('projects');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Always reset scroll and URL to /projects (sem hash) ao recarregar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.pathname === PATH_GRID) {
      window.history.replaceState(null, '', PATH_GRID);
      window.scrollTo(0, 0);
    }
  }, []);

  // Sync tag with URL on mount and update
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    } else {
      setSelectedTag(null);
    }
  }, [searchParams]);

  const handleTagChange = useCallback((tag: string | null) => {
    const url = new URL(window.location.href);
    if (tag) {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.pushState({}, '', url.toString());
    setSelectedTag(tag);
  }, []);

  // Handler para navegação por hash (scroll suave até a seção)
  const handleMenuItemClick = useCallback((href: string) => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(href, window.location.origin);
    let targetId: string | null = null;
    
    if (url.hash) {
      targetId = url.hash.substring(1); // Remove o #
    } else if (url.pathname === PATH_GRID) {
      // Se for apenas /projects sem hash, vai para a seção projects
      targetId = 'projects';
    }
    
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerHeight = 90; // Altura do header
        const yOffset = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
        // Atualiza a URL sem recarregar a página
        const newHref = targetId === 'projects' ? PATH_GRID : `${PATH_GRID}#${targetId}`;
        window.history.pushState(null, '', newHref);
      }
    } else {
      // Fallback: se não encontrar a seção, recarrega a página
      window.location.href = href;
    }
  }, []);

  // Atualiza rota /projects#secao conforme o usuário rola (scroll spy baseado na seção mais próxima do centro)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'));
    if (sections.length === 0) return;

    let ticking = false;

    const updateActiveSection = () => {
      ticking = false;
      const viewportCenter = window.innerHeight / 2;
      const viewportTop = 0;
      const viewportBottom = window.innerHeight;

      let closestId: SwitcherSelection = 'projects';
      let minDistance = Infinity;

      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        // Só considera seções que estão visíveis na viewport (pelo menos parcialmente)
        const isVisible = rect.bottom > viewportTop && rect.top < viewportBottom;
        
        if (isVisible) {
          const sectionCenter = rect.top + rect.height / 2;
          const distance = Math.abs(sectionCenter - viewportCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = sec.id as SwitcherSelection;
          }
        }
      });

      // Se nenhuma seção visível foi encontrada, volta para projects
      if (minDistance === Infinity) {
        closestId = 'projects';
      }

      setActiveSection(closestId);

      const targetUrl =
        closestId === 'projects' ? PATH_GRID : `${PATH_GRID}#${closestId}`;
      const currentUrl = window.location.pathname + window.location.hash;

      if (currentUrl !== targetUrl) {
        window.history.replaceState(null, '', targetUrl);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveSection);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Atualiza logo no início para corrigir URL se vier com hash antigo
    updateActiveSection();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <ViewSwitcher
        currentSelection={activeSection}
        isLandingPage={true}
        drawerTagsProps={{
          tags: projectsProps.tags.map((t: any) => t.tag),
          selectedTag,
          setSelectedTag: handleTagChange,
        }}
        onMenuItemClick={handleMenuItemClick}
      />

      <div className="flex flex-col w-full">
        {/* PROJETOS (mantido como estava, só grid + filtros) */}
        <section id="projects" className="min-h-screen w-full bg-white dark:bg-neutral-950 pt-8 sm:pt-12 md:pt-16">
          <MemoizedProjectsClient
            {...projectsProps}
            hideSwitcher={true}
            externalSelectedTag={selectedTag}
            onTagChange={handleTagChange}
          />
        </section>

        {/* ABOUT COMO SEÇÃO DA LANDING */}
        <section id="about" className="w-full bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200/40 dark:border-neutral-800/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16">
            <div className="mb-8">
              <p className="uppercase tracking-[0.25em] text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                SOBRE
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Sobre Wilbor
              </h2>
            </div>
            <ScrollReveal forceMount>
              <MemoizedAbout />
            </ScrollReveal>
          </div>
        </section>

        {/* EXHIBITIONS COMO SEÇÃO DA LANDING */}
        <section id="exhibitions" className="w-full bg-gray-100 dark:bg-neutral-800 border-t border-neutral-200/40 dark:border-neutral-800/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16">
            <div className="mb-8">
              <p className="uppercase tracking-[0.25em] text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300">
                EXPOSIÇÕES · EXIBIÇÕES
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Mostras e exposições selecionadas
              </h2>
            </div>
            <ScrollReveal forceMount>
              <MemoizedExhibitionsContent />
            </ScrollReveal>
          </div>
        </section>

        {/* PARTNERS COMO SEÇÃO DA LANDING */}
        <section id="partners" className="w-full bg-slate-100 dark:bg-neutral-700 border-t border-neutral-200/40 dark:border-neutral-800/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16">
            <div className="mb-8">
              <p className="uppercase tracking-[0.25em] text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300">
                PARCEIROS
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Colaborações e parcerias
              </h2>
            </div>
            <ScrollReveal forceMount>
              <MemoizedPartnersContent />
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
