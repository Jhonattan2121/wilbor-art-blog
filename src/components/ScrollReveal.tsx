'use client';

import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

export default function ScrollReveal({ 
  children, 
  className = "", 
  placeholderHeight = "min-h-[50vh]",
  forceMount = false 
}: { 
  children: ReactNode; 
  className?: string;
  placeholderHeight?: string;
  forceMount?: boolean;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
    threshold: 0,
    skip: forceMount // Skip observation if forced
  });

  const shouldRender = forceMount || inView;

  return (
    <div ref={ref} className={`transition-opacity duration-700 ease-out ${shouldRender ? 'opacity-100' : 'opacity-0'} ${className}`}>
      {shouldRender ? children : <div className={`w-full ${placeholderHeight}`} />}
    </div>
  );
}

