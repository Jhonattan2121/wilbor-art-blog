import {
  PATH_FEED_INFERRED,
  PATH_GRID_INFERRED
} from '@/app/paths';
import { useState } from 'react';
import IconMenu from './IconMenu';
import SocialLink from './SocialLink';
import SwitcherItem from './SwitcherItem';

export type SwitcherSelection = 'projects' | 'about';

export default function ViewSwitcher({
  currentSelection,
  showAdmin,
}: {
  currentSelection?: SwitcherSelection
  showAdmin?: boolean
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const socialLinks = [
    { text: "Instagram", href: "https://instagram.com/wilbor_domina" },
    { text: "Vimeo", href: "https://vimeo.com/wilbor" },
    { text: "Odysee", href: "https://odysee.com/@wilbor" },
    { text: "Shop", href: "https://web.marcelforart.com/wilson_domingues/collections" },
    { text: "WhatsApp", href: "https://wa.me/5521986351316" },
    { text: "Email", href: "mailto:wilsondomingues@gmail.com" },
  ];

  return (
    <div className="flex flex-col pl-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Menu mobile */}
        <div className="sm:hidden relative">
          <SwitcherItem
            icon={<IconMenu />}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            noPadding
          />

          {/* Menu mobile dropdown */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}>
              <div 
                className="absolute left-0 top-10 z-50 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-row items-center overflow-x-auto py-1 pl-2 gap-1">
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
          )}
        </div>

        {/* Main navigation */}
        <div className="flex gap-6">
          <SwitcherItem
            text="Projetos"
            href={PATH_GRID_INFERRED}
            active={currentSelection === 'projects'}
          />
          <SwitcherItem
            text="Sobre"
            href={PATH_FEED_INFERRED}
            active={currentSelection === 'about'}
          />
        </div>

        {/* Social media links */}
        <div className="hidden sm:flex sm:ml-6 items-center">
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
