'use client';

import React from "react";
import ViewSwitcher from '../../src/app/ViewSwitcher';
import ExhibitionsContent from '@/components/ExhibitionsContent';

export const dynamic = 'force-static';
export const maxDuration = 60;

export default function ExhibitionsPage() {
  return (
    <>
      <React.Suspense fallback={null}>
        <ViewSwitcher currentSelection="exhibitions" />
      </React.Suspense>
      <ExhibitionsContent />
    </>
  );
}