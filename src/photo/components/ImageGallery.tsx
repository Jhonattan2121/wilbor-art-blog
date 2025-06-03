'use client';

import { IconX } from '@/components/IconX';
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface ImageGalleryProps {
  images: string[];
  isMobile: boolean;
  initialIndex?: number;
}

export function ImageGallery({ images, isMobile, initialIndex = 0 }: ImageGalleryProps) {
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(initialIndex);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      {isMobile ? (
        <div className="w-full max-w-3xl mx-auto p-0 m-0 mt-3 sm:mt-0">
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="w-full h-[320px]"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={img}>
                <div className="relative w-full h-[260px] select-none">
                  <img
                    src={img}
                    alt={`Imagem ${idx + 1}`}
                    className="object-contain absolute top-0 left-0 w-full h-full cursor-pointer select-none"
                    onClick={() => {
                      setFullscreenImg(img);
                      setFullscreenIndex(idx);
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <style jsx global>{`
            .swiper-pagination-bullet {
              width: 10px !important;
              height: 10px !important;
              margin: 0 3px !important;
              background: #fff;
              opacity: 0.6;
              border: none !important;
              transition: all 0.2s;
            }
            .swiper-pagination-bullet-active {
              background: #e11d48 !important;
              opacity: 1 !important;
            }
          `}</style>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto p-0 m-0 mt-3 sm:mt-0">
          <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] p-0 m-0 flex items-center justify-center">
            <img
              src={images[fullscreenIndex]}
              alt="Imagem do post"
              className="object-contain absolute top-0 left-0 w-full h-full cursor-default select-none"
            />
            <button
              className="absolute left-0 top-0 h-full w-1/3 cursor-pointer z-10 bg-transparent border-none p-0 m-0"
              tabIndex={-1}
              style={{ outline: 'none', border: 'none', background: 'transparent' }}
              onClick={() => setFullscreenIndex(fullscreenIndex === 0 ? images.length - 1 : fullscreenIndex - 1)}
              aria-label="Imagem anterior"
            />
            <button
              className="absolute right-0 top-0 h-full w-1/3 cursor-pointer z-10 bg-transparent border-none p-0 m-0"
              tabIndex={-1}
              style={{ outline: 'none', border: 'none', background: 'transparent' }}
              onClick={() => setFullscreenIndex(fullscreenIndex === images.length - 1 ? 0 : fullscreenIndex + 1)}
              aria-label="Próxima imagem"
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ${
                    idx === fullscreenIndex ? 'bg-red-500 scale-110 shadow-lg' : 'bg-white/20 hover:bg-red-400/40'
                  }`}
                  onClick={() => setFullscreenIndex(idx)}
                  aria-label={`Ir para imagem ${idx + 1}`}
                  style={{ boxShadow: 'none', border: 'none', padding: 0, margin: 0 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {fullscreenImg && isMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <button
            className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 z-50 flex items-center justify-center border-2 border-gray-300 shadow-lg hover:border-red-500 hover:rotate-90 transition-all"
            onClick={() => setFullscreenImg(null)}
            aria-label="Fechar imagem em tela cheia"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
          >
            <IconX size={38} />
          </button>
          <div className="relative w-full max-w-xl flex flex-col items-center">
            <div className="w-full">
              <Swiper
                pagination={{ clickable: true }}
                modules={[Pagination]}
                initialSlide={fullscreenIndex}
                onSlideChange={swiper => setFullscreenIndex(swiper.activeIndex)}
                className="w-full h-[80vh]"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={img}>
                    <div className="flex items-center justify-center w-full h-[80vh] select-none">
                      <img
                        src={img}
                        alt={`Imagem ${idx + 1}`}
                        className="max-w-full max-h-[80vh] rounded-lg shadow-lg object-contain select-none"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <style jsx global>{`
                .swiper-pagination-bullet {
                  width: 10px !important;
                  height: 10px !important;
                  margin: 0 3px !important;
                  background: #fff;
                  opacity: 0.6;
                  border: none !important;
                  transition: all 0.2s;
                }
                .swiper-pagination-bullet-active {
                  background: #e11d48 !important;
                  opacity: 1 !important;
                }
              `}</style>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
