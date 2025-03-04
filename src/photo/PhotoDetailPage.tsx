import { Camera } from '@/camera';
import CameraHeader from '@/camera/CameraHeader';
import AnimateItems from '@/components/AnimateItems';
import SiteGrid from '@/components/SiteGrid';
import { Photo as BasePhoto } from '@/photo';
import { FujifilmSimulation } from '@/platforms/fujifilm';
import { TAG_HIDDEN } from '@/tag';
import HiddenHeader from '@/tag/HiddenHeader';
import TagHeader from '@/tag/TagHeader';
import Image from 'next/image';
import Link from 'next/link';
import { JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import PhotoGrid from './PhotoGrid';
import PhotoLarge from './PhotoLarge';

interface Photo extends Omit<BasePhoto, 'updatedAt' | 'createdAt' | 'takenAt'> {
  id: string;
  type?: 'video' | 'photo';
  src: string;
  url: string;
  title: string;
  width: number;
  height: number;
  priority?: boolean;
  hiveMetadata?: {
    body: string;
  };
  tags: string[];
  extension: string;
  takenAtNaive: string;
  aspectRatio: number;
  takenAtNaiveFormatted: string;
  updatedAt: Date;
  createdAt: Date;
  takenAt: Date;
  make?: string;
  model?: string;
  permlink?: string;
}

interface PhotoDateRange {
  start: string;
  end: string;
}

interface PhotoSetCategory {
  tag?: string;
  camera?: Camera;
  simulation?: FujifilmSimulation;
  focal?: number;
}

interface PhotoDetailPageProps extends PhotoSetCategory {
  photo: Photo;
  photos?: Photo[];
  photosGrid?: Photo[];
  indexNumber?: number;
  count?: number;
  dateRange?: PhotoDateRange;
  shouldShare?: boolean;
  includeFavoriteInAdminMenu?: boolean;
  previousPhoto?: Photo | null;
  nextPhoto?: Photo | null;
}

const EmptyHeader = () => <div />;

const convertDates = (photo: Partial<Photo>): Photo => {
  return {
    ...photo,
    updatedAt: new Date(photo.updatedAt || ''),
    createdAt: new Date(photo.createdAt || ''),
    takenAt: new Date(photo.takenAt || '')
  } as Photo;
};

export default function PhotoDetailPage({
  photo: rawPhoto,
  photos: rawPhotos,
  photosGrid: rawPhotosGrid,
  tag,
  camera,
  simulation,
  focal,
  indexNumber,
  count,
  dateRange,
  shouldShare,
  includeFavoriteInAdminMenu,
  previousPhoto,
  nextPhoto,
}: PhotoDetailPageProps) {
  const photo = convertDates(rawPhoto);
  const _photos = (rawPhotos || []).map(convertDates);
  const photosGrid = (rawPhotosGrid || []).map(convertDates);

  const isHivePhoto = photo.id.includes('-');
  const youtubeId = photo.type === 'video'
    ? photo.src.split('/').pop()?.split('?')[0]
    : null;

  let customHeader: JSX.Element | undefined;

  if (tag) {
    customHeader = tag === TAG_HIDDEN
      ? <HiddenHeader
        photos={_photos || []}
        selectedPhoto={photo}
        indexNumber={indexNumber}
        count={count ?? 0}
      />
      : <TagHeader
        key={tag}
        tag={tag}
        photos={_photos || []}
        selectedPhoto={photo}
        indexNumber={indexNumber}
        count={count}
        dateRange={dateRange}
      />;
  } else if (camera) {
    customHeader = <CameraHeader
      camera={camera}
      photos={_photos || []}
      selectedPhoto={photo}
      indexNumber={indexNumber}
      count={count}
      dateRange={dateRange}
    />;
  }

  return (
    <div>
      <SiteGrid
        className="mt-1.5 mb-6"
        contentMain={customHeader || <EmptyHeader />}
      />

      <AnimateItems
        className="md:mb-8"
        animateFromAppState
        items={[
          <PhotoLarge
            key={photo.id}
            photo={photo}
            primaryTag={tag}
            priority
            prefetchRelatedLinks
            showTitle={Boolean(customHeader)}
            showTitleAsH1
            showCamera={!camera}
            shouldShare={shouldShare}
            shouldShareTag={tag !== undefined}
            shouldShareCamera={camera !== undefined}
            includeFavoriteInAdminMenu={includeFavoriteInAdminMenu}
          />,
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="relative aspect-video mb-8">
          {photo.type === 'video' ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title={photo.title}
            />
          ) : (
            <Image
              src={photo.src}
              alt={photo.title}
              width={photo.width}
              height={photo.height}
              className="object-cover rounded-lg"
              priority={photo.priority}
            />
          )}
        </div>

        {isHivePhoto && photo.hiveMetadata && (
          <div className="prose max-w-none mb-8">
            <ReactMarkdown>{photo.hiveMetadata.body}</ReactMarkdown>
          </div>
        )}

        <SiteGrid
          sideFirstOnMobile
          contentMain={
            <PhotoGrid
              photos={photosGrid}
              selectedPhoto={photo}
              tag={tag}
              camera={camera}
              simulation={simulation}
              focal={focal}
              animateOnFirstLoadOnly
            />
          }
        />

        <div className="flex justify-between mt-4">
          {previousPhoto && (
            <Link href={previousPhoto.url} className="btn">
              Previous
            </Link>
          )}
          {nextPhoto && (
            <Link href={nextPhoto.url} className="btn">
              Next
            </Link>
          )}
        </div>

        <div className="mt-8">
          <h3>More from this post</h3>
          <PhotoGrid photos={photosGrid} />
        </div>
      </div>
    </div>
  );
}