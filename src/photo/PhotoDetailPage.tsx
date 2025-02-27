import CameraHeader from '@/camera/CameraHeader';
import AnimateItems from '@/components/AnimateItems';
import SiteGrid from '@/components/SiteGrid';
import FocalLengthHeader from '@/focal/FocalLengthHeader';
import { FujifilmSimulation } from '@/platforms/fujifilm';
import FilmSimulationHeader from '@/simulation/FilmSimulationHeader';
import { TAG_HIDDEN } from '@/tag';
import HiddenHeader from '@/tag/HiddenHeader';
import TagHeader from '@/tag/TagHeader';
import { JSX } from 'react';
import { PhotoDateRange, PhotoSetCategory } from '.';
import { ImageMedia, Photo, VideoMedia } from '../../app/grid/types';
import PhotoGrid from './PhotoGrid';
import PhotoHeader from './PhotoHeader';
import PhotoLarge from './PhotoLarge';

function adaptPhoto(photo: Photo) {
  if (photo.type === 'video') {
    return {
      ...photo,
      camera: photo.camera ?? null,
      simulation: photo.simulation as FujifilmSimulation | null ?? null,
      blurData: photo.blurData || '',
      type: 'video' as const,
    } satisfies VideoMedia;
  }
  
  return {
    ...photo,
    type: 'image' as const,
    camera: photo.camera ?? null,
    simulation: photo.simulation as FujifilmSimulation | null ?? null,
    blurData: photo.blurData || '',
  } satisfies ImageMedia;
}

export default function PhotoDetailPage({
  photo,
  photos,
  photosGrid,
  tag,
  camera,
  simulation,
  focal,
  indexNumber,
  count,
  dateRange,
  shouldShare,
  includeFavoriteInAdminMenu,
}: {
  photo: Photo
  photos: Photo[]
  photosGrid?: Photo[]
  indexNumber?: number
  count?: number
  dateRange?: PhotoDateRange
  shouldShare?: boolean
  includeFavoriteInAdminMenu?: boolean
} & PhotoSetCategory) {
  let customHeader: JSX.Element | undefined;

  if (tag) {
    customHeader = tag === TAG_HIDDEN
      ? <HiddenHeader
        photos={photos}
        selectedPhoto={photo}
        indexNumber={indexNumber}
        count={count ?? 0}
      />
      : <TagHeader
        key={tag}
        tag={tag}
        photos={photos}
        selectedPhoto={photo}
        indexNumber={indexNumber}
        count={count}
        dateRange={dateRange}
      />;
  } else if (camera) {
    customHeader = <CameraHeader
      camera={camera}
      photos={photos}
      selectedPhoto={photo}
      indexNumber={indexNumber}
      count={count}
      dateRange={dateRange}
    />;
  } else if (simulation) {
    customHeader = <FilmSimulationHeader
      simulation={simulation}
      photos={photos}
      selectedPhoto={photo}
      indexNumber={indexNumber}
      count={count}
      dateRange={dateRange}
    />;
  } else if (focal) {
    customHeader = <FocalLengthHeader
      focal={focal}
      photos={photos}
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
        contentMain={customHeader ?? <PhotoHeader
          selectedPhoto={photo}
          photos={photos}
        />}
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
            showSimulation={!simulation}
            shouldShare={shouldShare}
            shouldShareTag={tag !== undefined}
            shouldShareCamera={camera !== undefined}
            shouldShareSimulation={simulation !== undefined}
            includeFavoriteInAdminMenu={includeFavoriteInAdminMenu}
          />,
        ]}
      />
      <SiteGrid
        sideFirstOnMobile
        contentMain={<PhotoGrid
          photos={
            photosGrid 
              ? photosGrid.map(adaptPhoto) 
              : photos.map(adaptPhoto)
          }
          selectedPhoto={photo ? adaptPhoto(photo) : undefined}

          tag={tag}
          camera={camera}
          simulation={simulation}
          focal={focal}
          animateOnFirstLoadOnly
        />}
      />
    </div>
  );
}
