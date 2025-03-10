import { Photo, PhotoDateRange } from '@/photo';
import PhotoGridContainer from '@/photo/PhotoProjectsContainer';
import { FilmSimulation } from '.';
import FilmSimulationHeader from './FilmSimulationHeader';

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
  return (
    <PhotoGridContainer media={[]} {...{
      cacheKey: `simulation-${simulation}`,
      photos,
      count,
      simulation,
      header: <FilmSimulationHeader {...{
        simulation,
        photos,
        count,
        dateRange,
      }} />,
      animateOnFirstLoadOnly,

    }} />
  );
}
