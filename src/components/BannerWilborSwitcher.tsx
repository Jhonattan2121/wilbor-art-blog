"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import BannerWilbor from '../../public/wilborPhotos/bannerWilbor.png';
import BannerWilborLight from '../../public/wilborPhotos/bannerWilbor-light.png';

export default function BannerWilborSwitcher() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  let bannerSrc = BannerWilbor;
  if (mounted) {
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    if (resolvedTheme === 'light') {
      bannerSrc = BannerWilborLight;
    }
  }
  return (
    <Image
      src={bannerSrc}
      alt="Wilbor Art Logo"
      className="h-24 sm:h-32 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
      priority
    />
  );
}
