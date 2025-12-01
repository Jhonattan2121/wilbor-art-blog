"use client";

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignatureLight from '../../public/wilborPhotos/Assinatura Clara.png';
import SignatureDark from '../../public/wilborPhotos/Assinatura Escura.png';
import HeaderBgLight from '../../public/wilborPhotos/Fundo header claro 2.png';
import HeaderBgDark from '../../public/wilborPhotos/Fundo header escuro 2.png';

export default function BannerWilborSwitcher({ forceWhiteLogo = false }: { forceWhiteLogo?: boolean } = {}) {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Define se o header deve seguir o modo escuro
  let isDarkHeader = false;
  if (mounted) {
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    isDarkHeader = resolvedTheme === 'dark';
  }

  const backgroundSrc = isDarkHeader ? HeaderBgDark : HeaderBgLight;
  const signatureSrc = isDarkHeader ? SignatureLight : SignatureDark;
  const backgroundColor = forceWhiteLogo
    ? isDarkHeader 
      ? '#1c1c1c' // cinza escuro para o header mobile no modo dark
      : '#ffffff' // branco para o header mobile no modo light
    : isDarkHeader
      ? '#000000'
      : '#dddddd';

  return (
    <div
      onClick={() => router.push('/projects')}
      className={`relative ${forceWhiteLogo ? 'h-full' : 'h-20 sm:h-32'} w-full max-w-[460px] cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
      style={{
        cursor: 'pointer',
        backgroundColor,
      }}
    >
      {/* Fundo com o grafite em grande, preenchendo toda a faixa */}
      <Image
        src={backgroundSrc}
        alt=""
        fill
        priority
        className="object-cover object-right md:object-center pointer-events-none select-none"
      />

      {/* Assinatura / logo por cima, encostada à borda esquerda */}
      <div className="relative h-full flex items-center pl-0 sm:pl-1">
        <Image
          src={signatureSrc}
          alt="Wilbor Studio logo"
          className="h-12 sm:h-24 w-auto object-contain drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]"
          priority
        />
      </div>
    </div>
  );
}

