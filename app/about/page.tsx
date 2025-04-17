import About from '@/app/about/page';
import { createMetadata } from '@/utility/metadata';
import { Metadata } from 'next/types';

export const dynamic = 'force-static';
export const maxDuration = 60;

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Sobre',
    description: 'Wilson Domingues, conhecido como Wilbor, é um artista multifacetado do Rio de Janeiro que une skate, arte e audiovisual.',
    path: '/about'
  });
}

export default async function AboutPage() {
  return (
    <About />
  );
}
