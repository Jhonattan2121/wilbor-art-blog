'use client';
import ViewSwitcher from '../../src/app/ViewSwitcher';
import React from 'react';
import ContactContent from '@/components/ContactContent';

export const dynamic = 'force-static';
export const maxDuration = 60;

export default function ContactPage() {
  return (
    <>
      <React.Suspense fallback={null}>
        <ViewSwitcher currentSelection="contact" />
      </React.Suspense>
      <ContactContent />
    </>
  );
}
