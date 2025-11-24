"use client";

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import BannerWilbor from '../../public/wilborPhotos/newnew-thumbnail.png';

export default function BannerWilborSwitcher() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  let bannerSrc = BannerWilbor;
  let imageStyle = {};
  if (mounted) {
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    if (resolvedTheme === 'light') {
      bannerSrc = BannerWilbor;
      imageStyle = {};
    } else {
      bannerSrc = BannerWilbor;
      imageStyle = { filter: 'invert(1)' };
    }
  }
  return (
    <Image
      src={bannerSrc}
      alt="Wilbor Art Logo"
      className="h-32 sm:h-40 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
      style={imageStyle}
      priority
    />
  );
}
