'use client';
import ViewSwitcher from '../../src/app/ViewSwitcher';
import React from 'react';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default function ContactPage() {
  return (
    <>
      <React.Suspense fallback={null}>
        <ViewSwitcher currentSelection="contact" />
      </React.Suspense>
    </>
  );
}
