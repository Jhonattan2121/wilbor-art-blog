'use client';

import ContactContent from '@/components/ContactContent';

export default function Footer() {
  return (
    <footer className="w-full pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center"> 
          <div className="flex flex-col items-center justify-center">
          <section id="contact">
            <ContactContent/> 
          </section>
            <p className="text-lg mt-8 text-neutral-500 dark:text-neutral-400">
            Wilbor Studio @{new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
