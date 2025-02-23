import { IS_SITE_READY } from '@/app/config';
import Container from '@/components/Container';
import SiteGrid from '@/components/SiteGrid';
import { clsx } from 'clsx/lite';
import { HiOutlinePhotograph } from 'react-icons/hi';

export default function PhotosEmptyState() {
  return (
    <SiteGrid
      contentMain={
        <Container
          className="min-h-[20rem] sm:min-h-[30rem] px-8"
          padding="loose"
        >
          <HiOutlinePhotograph
            className="text-medium"
            size={24}
          />
          <div className={clsx(
            'font-bold text-2xl',
            'text-gray-700 dark:text-gray-200',
          )}>
            {!IS_SITE_READY ? 'Finish Setup' : 'Setup Complete!'}
          </div>
         
        </Container>}
    />
  );
};
