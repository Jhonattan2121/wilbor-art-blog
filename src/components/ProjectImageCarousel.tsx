import React, { useRef, useState } from 'react';

export interface ProjectImage {
  src: string;
  alt?: string;
}

interface ProjectImageCarouselProps {
  images: ProjectImage[];
  initialIndex?: number;
}

const ProjectImageCarousel: React.FC<ProjectImageCarouselProps> = ({ images, initialIndex = 0 }) => {
  const [current, setCurrent] = useState(initialIndex);
  const total = images.length;

  const goTo = (idx: number) => {
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    setCurrent(idx);
  };

  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setDragStartX(e.touches[0].clientX);
    setDragging(true);
    setIsTransitioning(false);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging || dragStartX === null) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    setOffsetX(deltaX);
  };
  const handleTouchEnd = () => {
    setDragging(false);
    setIsTransitioning(true);
    if (Math.abs(offsetX) > 80) {
      if (offsetX > 0) goTo(current - 1);
      else goTo(current + 1);
    }
    setOffsetX(0);
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragStartX(e.clientX);
    setDragging(true);
    setIsTransitioning(false);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || dragStartX === null) return;
    const deltaX = e.clientX - dragStartX;
    setOffsetX(deltaX);
  };
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(false);
    setIsTransitioning(true);
    if (Math.abs(offsetX) > 80) {
      if (offsetX > 0) goTo(current - 1);
      else goTo(current + 1);
    }
    setOffsetX(0);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={carouselRef}
        className="relative w-full flex justify-center items-center h-[420px] max-w-[600px] mx-auto select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className="flex w-full h-full"
          style={{
            transform: `translateX(calc(${-current * 100}% + ${offsetX}px))`,
            transition: isTransitioning ? 'transform 0.3s cubic-bezier(.4,0,.2,1)' : 'none',
          }}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.src}
              alt={img.alt || `Imagem ${idx + 1}`}
              className="rounded-lg object-contain w-full h-full"
              style={{ display: 'block', margin: '0 auto', minWidth: '100%' }}
              draggable={false}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${current === idx ? 'bg-red-500' : 'bg-gray-400'}`}
            onClick={() => goTo(idx)}
            aria-label={`Ir para imagem ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectImageCarousel;
