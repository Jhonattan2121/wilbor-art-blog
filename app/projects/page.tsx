import { getHivePosts, extractAndCountTags } from '@/lib/hive/project-logic';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { Photo } from '@/photo/components/types';
import ProjectsOnePageClient from './ProjectsOnePageClient';
import { Metadata } from 'next/types';
import { createMetadata } from '@/utility/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Projetos',
    description: 'Explore as exposições e exibições de Wilson Domingues "Wilbor", artista multifacetado que une skate, arte e audiovisual.',
    path: '/projects'
  });
}

export default async function GridPage(props: any) {
  const username = process.env.NEXT_PUBLIC_HIVE_USERNAME;

  if (!username) {
    console.error('Username not defined');
    return <PhotosEmptyState />;
  }

  const { formattedPosts, originalPosts } = await getHivePosts(username);

  const posts = formattedPosts.map(post => {
    return {
      ...post,
      type: post.src?.includes('ipfs.skatehive.app/ipfs/')
        ? 'iframe'
        : post.type
    } as Photo;
  });

  const postTags = extractAndCountTags(originalPosts, posts);
  const photosCount = formattedPosts.length;

  const projectsProps = {
    posts,
    tags: postTags,
    photosCount,
    cameras: [],
    simulations: [],
  };

  return (
    <ProjectsOnePageClient projectsProps={projectsProps} />
  );
}
