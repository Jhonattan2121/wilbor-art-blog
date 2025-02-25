import { HiveAuth } from '@/auth/hive/HiveAuth';
import {
  generateOgImageMetaForPhotos
} from '@/photo';
import PhotoGridPage from '@/photo/PhotoGridPage';
import { FujifilmSimulation } from '@/platforms/fujifilm';
import { Metadata } from 'next/types';
import { cache } from 'react';
import { Cameras, FilmSimulations, Photo, Tag, Tags } from './types';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

const getPhotosCached = cache(async () => {
  if (!HIVE_USERNAME) {
    console.error('HIVE_USERNAME não configurado');
    return [];
  }

  console.log('Buscando posts para:', HIVE_USERNAME);
  const hiveAuth = new HiveAuth();
  const allPosts = [];

  try {
    const firstBatch = await hiveAuth.getUserPosts(HIVE_USERNAME, 20);
    console.log('Primeira busca:', firstBatch?.length || 0, 'posts');
    allPosts.push(...(firstBatch || []));

    if (firstBatch?.length === 20) {
      const lastPermlink = firstBatch[firstBatch.length - 1].permlink;
      const secondBatch = await hiveAuth.getUserPosts(lastPermlink, 20);
      console.log('Segunda busca:', secondBatch?.length || 0, 'posts');
      allPosts.push(...(secondBatch || []));
      console.log('Segunda busca:', secondBatch?.length || 0, 'posts');
      allPosts.push(...(secondBatch || []));
    }

    console.log('Total de posts encontrados:', allPosts.length);
    const photos: Photo[] = [];

    allPosts.forEach((post: any) => {
      try {
        const json = JSON.parse(post.json_metadata || '{}');
        const images = json.image || [];

        images.forEach((url: string) => {
          if (!url) return;

          photos.push({
            id: `${post.id}-${url}`,
            url: url,
            title: post.title || '',
            createdAt: new Date(post.created),
            updatedAt: new Date(post.last_update),
            blurData: '',
            tags: json.tags || [],
            takenAt: new Date(),
            takenAtNaive: new Date().toISOString(),
            takenAtNaiveFormatted: new Date().toLocaleDateString(),
            extension: url.split('.').pop() || '',
            aspectRatio: 1,
            camera: null,
            simulation: null
          });
        });

      } catch (error) {
        console.error('Error processing post:', error);
      }
    });

    return photos;
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
  const photos = await getPhotosCached();
  const photosCount = photos.length;

  const tags: Tags = photos.reduce<Tag[]>((acc, photo) => {
    photo.tags.forEach(tag => {
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

  const simulations: FilmSimulations =
    photos.reduce<FilmSimulations>((acc, photo) => {
      if (photo?.simulation) {
        try {
          const existingSimulation = acc.find(
            s => s.simulation === photo.simulation
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
      {...{ photos, photosCount, tags, cameras, simulations }}
    />

  );
}