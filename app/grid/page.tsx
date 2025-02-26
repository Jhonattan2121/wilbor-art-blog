import { HiveAuth } from '@/auth/hive/HiveAuth';
import {
  generateOgImageMetaForPhotos
} from '@/photo';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { FujifilmSimulation } from '@/platforms/fujifilm';
import { Metadata } from 'next/types';
import { cache } from 'react';
import { MarkdownRenderer } from '../../utils/MarkdownRenderer';
import { Cameras, FilmSimulations, Photo, Tag, Tags } from './types';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

const IPFS_GATEWAYS = [
  'ipfs.skatehive.app/ipfs/',
  'ipfs.io/ipfs/',
  'gateway.ipfs.io/ipfs/',
  'cloudflare-ipfs.com/ipfs/'
];

const getPhotosCached = cache(async () => {
  if (!HIVE_USERNAME) {
    console.error('HIVE_USERNAME não configurado');
    return [];
  }

  console.log('Buscando posts para:', HIVE_USERNAME);
  const hiveAuth = new HiveAuth();
  const allPosts = [];
  const uniqueMediaMap = new Map();

  try {
    const firstBatch = await hiveAuth.getUserPosts(HIVE_USERNAME, 20);
    console.log('Primeira busca:', firstBatch?.length || 0, 'posts');
    allPosts.push(...(firstBatch || []));

    if (firstBatch?.length === 20) {
      const lastPermlink = firstBatch[firstBatch.length - 1].permlink;
      const secondBatch = await hiveAuth.getUserPosts(lastPermlink, 20);
      console.log('Segunda busca:', secondBatch?.length || 0, 'posts');
      allPosts.push(...(secondBatch || []));
    }

    console.log('Total de posts encontrados:', allPosts.length);

    allPosts.forEach((post) => {
      try {
        const medias = MarkdownRenderer.extractImagesFromMarkdown(post.body);

        medias.forEach((media) => {
          const key = media.url;
          if (!uniqueMediaMap.has(key)) {
            const isIpfs = IPFS_GATEWAYS.some(gateway =>
              media.url.includes(gateway) ||
              MarkdownRenderer.getIpfsHash(media.url)
            );

            console.log('Verificando mídia:', {
              url: media.url,
              isIpfs,
              type: media.type,
              ipfsHash: MarkdownRenderer.getIpfsHash(media.url)
            });

            uniqueMediaMap.set(key, {
              id: `${post.id}-${media.url.split('/').pop()?.split('?')[0]}`,
              url: media.url,
              type: media.url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/) ||
                media.url.includes('type=video') ||
                media.type === 'video' ? 'video' : 'image',
              ipfsHash: MarkdownRenderer.getIpfsHash(media.url),
              title: post.title || '',
              createdAt: new Date(post.created),
              updatedAt: new Date(post.last_update),
              blurData: '',
              tags: Array.isArray(JSON.parse(post.json_metadata).tags)
                ? JSON.parse(post.json_metadata).tags
                : [],
              takenAt: new Date(),
              takenAtNaive: new Date().toISOString(),
              takenAtNaiveFormatted: new Date().toLocaleDateString(),
              extension: media.url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/) ||
                media.url.includes('type=video') ||
                media.type === 'video' ? 'video' : 'image',
              aspectRatio: media.url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/) ||
                media.url.includes('type=video') ||
                media.type === 'video' ? 16 / 9 : 1,
              camera: null,
              simulation: null,
            });

            console.log('Mídia processada:', {
              url: media.url,
              type: media.url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/) ||
                media.url.includes('type=video') ||
                media.type === 'video' ? 'video' : 'image',
              title: post.title
            });
          }
        });

        console.log('Mídias processadas:', Array.from(uniqueMediaMap.values()));
      } catch (error) {
        console.error('Erro processando post:', error);
      }
    });

    return Array.from(uniqueMediaMap.values()) as Photo[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached()
    .catch(() => [] as Photo[]);
  return generateOgImageMetaForPhotos(photos);
}

export default async function GridPage() {
  const photos = await getPhotosCached() || [];
  const photosCount = photos.length;

  const tags: Tags = photos.reduce<Tag[]>((acc, photo) => {
    photo.tags?.forEach((tag: string) => {
      const existingTag = acc.find(t => t.tag === tag);
      if (existingTag) {
        existingTag.count++;
      } else {
        acc.push({ tag, count: 1 });
      }
    });
    return acc;
  }, []);

  const cameras: Cameras = photos.reduce<Cameras>((acc, photo) => {
    if (photo.camera) {
      const existingCamera = acc.find(c => c.camera === photo.camera);
      if (existingCamera) {
        existingCamera.count++;
      } else {
        acc.push({
          camera: photo.camera,
          cameraKey: photo.camera.toString(),
          count: 1,
        });
      }
    }
    return acc;
  }, []);

  const simulations: FilmSimulations = photos.reduce<FilmSimulations>((acc, photo) => {
    if (photo?.simulation) {
      try {
        const existingSimulation = acc.find(
          s => s.simulation === photo.simulation,
        );

        if (existingSimulation) {
          existingSimulation.count++;
        } else {
          const simulation = photo.simulation as FujifilmSimulation;
          if (simulation) {
            acc.push({
              simulation,
              simulationKey: simulation.toString(),
              count: 1,
            });
          }
        }
      } catch (error) {
        console.error('Error processing simulation:', error);
      }
    }
    return acc;
  }, []);

  return (
    <PhotoGridPage
      {...{
        photos,
        photosCount,
        tags,
        cameras,
        simulations,
      }}
    />
  );
}