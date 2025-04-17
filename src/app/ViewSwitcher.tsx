import {
  PATH_FEED_INFERRED
} from '@/app/paths';
import { useEffect, useRef, useState } from 'react';
import SocialLink from './SocialLink';
import SwitcherItem from './SwitcherItem';

export type SwitcherSelection = 'projects' | 'about' | 'exhibitions';

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const socialLinks = [
    { text: "Instagram", href: "https://instagram.com/wilbor_domina" },
    { text: "Vimeo", href: "https://vimeo.com/wilbor" },
    { text: "Odysee", href: "https://odysee.com/@wilbor" },
    { text: "Shop", href: "https://web.marcelforart.com/wilson_domingues/collections" },
    { text: "WhatsApp", href: "https://wa.me/5521986351316" },
    { text: "Email", href: "mailto:wilsondomingues@gmail.com" },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="sm:hidden" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 mb-2 rounded-full text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none flex items-center"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          <span className="ml-2 text-sm font-medium">Menu</span>
        </button>
        
        {isMenuOpen && (
          <div className="mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
            <div className="p-3">
              <h3 className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">Navegação</h3>
              <nav className="flex flex-col space-y-1">
                {/* <a 
                  href={PATH_GRID_INFERRED} 
                  className={`px-3 py-2 rounded-md ${currentSelection === 'projects' ? 'bg-red-50 text-red-600 dark:text-red-400 font-medium' : 'text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  onClick={() => setIsMenuOpen(false)}
                >
                 Projetos
                </a> */}
                <a 
                  href="/exhibitions" 
                  className={`px-3 py-2 rounded-md ${currentSelection === 'exhibitions' ? 'bg-red-50 text-red-600 dark:text-red-400 font-medium' : 'text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  exposições/exibições
                </a>
                <a 
                  href={PATH_FEED_INFERRED} 
                  className={`px-3 py-2 rounded-md ${currentSelection === 'about' ? 'bg-red-50 text-red-600 dark:text-red-400 font-medium' : 'text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sobre
                </a>
              </nav>
            </div>
            
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3"></div>
            
            <div className="p-3">
              <h3 className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">Redes Sociais</h3>
              <div className="grid grid-cols-2 gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 rounded-md text-sm truncate hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-row items-center gap-2">
        <div className="flex gap-2 ml-0 md:ml-2">
          {/* <SwitcherItem
            text="Projetos"
            href={PATH_GRID_INFERRED}
            active={currentSelection === 'projects'}
          /> */}
          <SwitcherItem
            text="exposições/exibições"
            href="/exhibitions"
            active={currentSelection === 'exhibitions'}
          />
          <SwitcherItem
            text="Sobre"
            href={PATH_FEED_INFERRED}
            active={currentSelection === 'about'}
          />
        </div>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

        <div className="flex ml-1 items-center">
          {socialLinks.map((link) => (
            <SocialLink
              key={link.href}
              {...link}
              target="_blank"
              rel="noopener noreferrer"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
