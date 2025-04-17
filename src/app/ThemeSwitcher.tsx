'use client';

import Switcher from '@/components/Switcher';
import SwitcherItem from '@/components/SwitcherItem';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { BiDesktop, BiMoon, BiSun } from 'react-icons/bi';

export default function ThemeSwitcher () {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, forcedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);

    // Apply custom styles when dark theme is selected
    const applyCustomDarkTheme = () => {
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--tw-bg-opacity', '1');
        document.documentElement.style.backgroundColor = '#222222';
        
        // Apply to body too for full coverage
        document.body.style.backgroundColor = '#222222';
      } else {
        document.documentElement.style.removeProperty('--tw-bg-opacity');
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
      }
    };

    applyCustomDarkTheme();

    // Observer theme changes
    const observer = new MutationObserver(() => {
      applyCustomDarkTheme();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, [theme]);

  if (!mounted) {
    return null;
  }

  return (
    <Switcher>
      <SwitcherItem
        title="System"
        icon={<BiDesktop size={16} />}
        onClick={() => setTheme('system')}
        active={theme === 'system'}
      />
      <SwitcherItem
        title="Light"
        icon={<BiSun size={18} />}
        onClick={() => setTheme('light')}
        active={theme === 'light'}
      />
      <SwitcherItem
        title="Dark"
        icon={<BiMoon size={16} />}
        onClick={() => setTheme('dark')}
        active={theme === 'dark'}
      />
    </Switcher>
  );
}
