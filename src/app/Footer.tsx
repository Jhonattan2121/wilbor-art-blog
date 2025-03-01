'use client';

import ThemeSwitcher from '@/app/ThemeSwitcher';
import SwitcherItem from '@/components/SwitcherItem';
import IconInstagram from './IconInstagram';
import IconOdysee from './iconOdysee';
import IconShop from './IconShop';
import IconVimeo from './IconVimeo';

export default function Footer() {

  return (
    <footer className="  w-full">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Parte 1 - Esquerda */}
          <div className="flex flex-col items-center 
          md:items-start justify-start">
            <ThemeSwitcher />
            <p className="text-sm mt-2">
              <strong>Copyright Wilbor Art @ 2025</strong></p>
          </div>

          {/* Parte 2 - Centro */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <SwitcherItem
                icon={<IconInstagram />}
                href="https://instagram.com/wilbordomingues"
                target="_blank"
                rel="noopener noreferrer"
              />
              <SwitcherItem
                icon={<IconVimeo />}
                href="https://vimeo.com/wilbor"
                target="_blank"
                rel="noopener noreferrer"
              />
              <SwitcherItem
                icon={<IconOdysee />}
                href="https://odysee.com/@wilbor"
                target="_blank"
                rel="noopener noreferrer"
              />
              <SwitcherItem
                icon={<IconShop />}
                href="https://web.marcelforart.com/wilson_domingues/collections"
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>
          </div>

          {/* Parte 3 - Direita */}
          <div className="flex flex-col items-center md:items-end justify-end">
            <h3 className="text-sm font-semibold mb-4">Contato</h3>
            <div className="flex flex-col items-center md:items-end gap-2">
              <a
                href="https://wa.me/5521986351316"
                className="flex items-center gap-2
                 hover:text-blue-600 transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24"
                  className="w-4 h-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-
                  .867-2.03-.967-.273-.099-.471-.148-.67.15-
                  .197.297-.767.966-.94 1.164-.173.199-.347.
                  223-.644.075-.297-.15-1.255-.463-2.39-1.475-
                  .883-.788-1.48-1.761-1.653-2.059-.173-.297-
                  .018-.458.13-.606.134-.133.298-.347.446-.52
                  .149-.174.198-.298.298-.497.099-.198.05-.371-
                  .025-.52-.075-.149-.669-1.612-.916-2.207-.242-
                  .579-.487-.5-.669-.51-.173-.008-.371-.01-.57-
                  .01-.198 0-.52.074-.792.372-.272.297-1.04 1.
                  016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.
                  149.198 2.096 3.2 5.077 4.487.709.306 1.262.489
                   1.694.625.712.227 1.36.195 1.871.118.571-.085 
                   1.758-.719 2.006-1.413.248-.694.248-1.289.173-1
                   .413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-
                   .004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.
                   982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.
                   001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 
                   6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-
                   4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 
                   0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547
                    4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882
                     0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11
                     .893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>+55 21 98635-1316</span>
              </a>
              <a
                href="mailto:wilsondomingues@gmail.com"
                className="flex items-center gap-2
                 hover:text-blue-600 transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24"
                  className="w-4 h-4" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0
                   1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.
                   9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span>wilsondomingues@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}