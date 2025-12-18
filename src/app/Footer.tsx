'use client';

import ContactContent from '@/components/ContactContent';

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center"> 
          <div className="flex flex-col items-center justify-center">
          <section id="contact">
            <ContactContent/> 
          </section>
            <p className="text-sm mt-2">
            Wilbor Studio @ 2025
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}