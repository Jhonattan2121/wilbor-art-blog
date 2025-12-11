'use client';

import ThemeSwitcher from '@/app/ThemeSwitcher';
import { ContactContent } from '../../app/contact/page';

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center"> 
          <div className="flex flex-col items-center justify-center">
          <section id="contact">
            <ContactContent/> 
          </section>
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