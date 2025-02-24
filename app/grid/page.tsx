import { HiveAuth } from '@/auth/hive/HiveAuth';
import {
  INFINITE_SCROLL_GRID_INITIAL,
  generateOgImageMetaForPhotos,
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
  console.log('HIVE_USERNAME:', HIVE_USERNAME); // Verificar se está vazio
  const hiveAuth = new HiveAuth();
  const posts = await hiveAuth.getUserPosts(
    HIVE_USERNAME,
    INFINITE_SCROLL_GRID_INITIAL,
  );
  console.log('Posts recebidos:', posts?.length);
  const photos: Photo[] = [];

  posts?.forEach((post: any) => {
    if (!post) return;

    try {
      const json = JSON.parse(post.json_metadata || '{}');
      if (json.image && Array.isArray(json.image)) {
        json.image.forEach((url: string) => {
          if (!url) return;

          const now = new Date();
          photos.push({
            id: `${post.id}-${url}`,
            url: json.url || url,
            title: post.title || '',
            createdAt: new Date(post.created || now),
            updatedAt: new Date(post.last_update || now),
            blurData: '',
            tags: Array.isArray(json.tags) ? json.tags : [],
            takenAt: now,
            takenAtNaive: now.toISOString(),
            takenAtNaiveFormatted: now.toLocaleDateString(),
            extension: url.split('.').pop() || '',
            aspectRatio: 1,
            camera: null,
            simulation: null,
          });
        });
      }
    } catch (error) {
      console.error('Error processing post:', error);
    }
  });

  return photos;
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