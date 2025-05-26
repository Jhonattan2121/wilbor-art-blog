'use client';

import ThemeSwitcher from '@/app/ThemeSwitcher';

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-center items-center"> 
          <div className="flex flex-col items-center justify-center">
            <ThemeSwitcher />
            <p className="text-sm mt-2">
            Wilbor Studio @ 2025
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}