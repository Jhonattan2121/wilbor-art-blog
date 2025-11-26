"use client";

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BannerWilborBlack from '../../public/wilborPhotos/Wilbor_Studio_Site_head_preto.png';
import BannerWilborWhite from '../../public/wilborPhotos/wilbor.studio.new.png';

export default function BannerWilborSwitcher({ forceWhiteLogo = false }: { forceWhiteLogo?: boolean } = {}) {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  let bannerSrc = BannerWilborBlack;
  if (forceWhiteLogo) {
    bannerSrc = BannerWilborWhite;
  } else if (mounted) {
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    if (resolvedTheme === 'dark') {
      bannerSrc = BannerWilborWhite;
    } else {
      bannerSrc = BannerWilborBlack;
    }
  }
  return (
    <Image
      src={bannerSrc}
      alt="Wilbor Art Logo"
      className="h-10 sm:h-24 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
      priority
      onClick={() => router.push('/projects')}
      style={{ cursor: 'pointer' }}
    />
  );
}

