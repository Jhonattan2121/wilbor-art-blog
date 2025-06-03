"use client";
import { Photo, PhotoDateRange } from '@/photo';
import PhotoGridContainer from '@/photo/PhotoProjectsContainer';
import { FilmSimulation } from '.';
import FilmSimulationHeader from './FilmSimulationHeader';
import { useState } from 'react';

export default function FilmSimulationOverview({
  simulation,
  photos,
  count,
  dateRange,
  animateOnFirstLoadOnly,
}: {
  simulation: FilmSimulation,
  photos: Photo[],
  count: number,
  dateRange?: PhotoDateRange,
  animateOnFirstLoadOnly?: boolean,
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <PhotoGridContainer
      media={[]}
   
      header={
        <FilmSimulationHeader
          simulation={simulation}
          photos={photos}
          count={count}
          dateRange={dateRange}
        />
      }
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
    />
  );
}
