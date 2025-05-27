/* eslint-disable */
'use client';

import { IconX } from "@/components/IconX";
import Image from 'next/image';
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const images = [
  './wilborPhotos/1.jpg',
  './wilborPhotos/2.jpeg',
  './wilborPhotos/3.jpg',
  './wilborPhotos/4.jpg',
  './wilborPhotos/5.jpg',
  './wilborPhotos/6.jpeg',
  './wilborPhotos/7.jpg',
  './wilborPhotos/8.jpg',
];

export default function About() {
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goPrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="w-full flex flex-col items-start">
      <section className="w-full flex flex-col items-start">
        <div className="w-full max-w-2xl text-left mx-0 px-3 sm:px-8 space-y-4 sm:space-y-6">
          <p className="text-lg text-gray-600 dark:text-gray-400 w-full">
            Conhecido como Wilbor, é um artista multifacetado do Rio de Janeiro que une skate, arte e audiovisual. Sua jornada começou em 2002 com a direção do primeiro vídeo de street skate carioca "<span className="font-semibold">021 RSRJ</span>". Em 2007, consolidou sua visão com "<span className="font-semibold">Sangue e Suor</span>", um documentário sobre a cena do skate no Rio, que ganhou reconhecimento internacional no festival <span className="italic">Camera Mundo</span> na Holanda.
          </p>

          <div className="sm:hidden my-3 w-full">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={8}
              slidesPerView={1}
              onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
              className="w-full h-[260px]"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={img}>
                  <div className="relative w-full h-[260px] select-none">
                    <Image
                      src={img}
                      alt={`Imagem ${idx + 1}`}
                      fill={true}
                      priority={idx === 0}
                      sizes="100vw"
                      className="object-contain"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 640) {
                          setFullscreenImg(img);
                          setFullscreenIndex(idx);
                        }
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
                transform: scale(1.15);
              }
            `}</style>
          </div>

          <div className="hidden sm:block my-5 w-full">
            <div className="w-full max-w-2xl mx-0 px-8">
              <div className="relative w-full h-[400px] select-none">
                <Image
                  src={images[currentIndex]}
                  alt={`Imagem ${currentIndex + 1}`}
                  fill={true}
                  priority
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-contain cursor-pointer"
                  onClick={(e) => {
                    const bounds = (e.target as HTMLElement).getBoundingClientRect();
                    const x = (e as React.MouseEvent).clientX - bounds.left;
                    if (x < bounds.width / 3) {
                      goPrev();
                    } else if (x > (2 * bounds.width) / 3) {
                      goNext();
                    } else {
                      if (typeof window !== 'undefined' && window.innerWidth < 640) {
                        setFullscreenImg(images[currentIndex]);
                        setFullscreenIndex(currentIndex);
                      }
                    }
                  }}
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ${idx === currentIndex ? 'bg-red-500 scale-110 shadow-lg' : 'bg-white/20 hover:bg-red-400/40'} `}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Ir para imagem ${idx + 1}`}
                      style={{ boxShadow: 'none', border: 'none', padding: 0, margin: 0 }}
                    >
                    </button>
                  ))}
                </div>
                <button
                  className="absolute left-0 top-0 h-full w-1/3 cursor-pointer z-10 focus:outline-none active:outline-none border-none bg-transparent p-0 m-0"
                  tabIndex={-1}
                  style={{ outline: 'none', border: 'none', boxShadow: 'none', background: 'transparent' }}
                  onClick={goPrev}
                  aria-label="Imagem anterior"
                />
                <button
                  className="absolute right-0 top-0 h-full w-1/3 cursor-pointer z-10 focus:outline-none active:outline-none border-none bg-transparent p-0 m-0"
                  tabIndex={-1}
                  style={{ outline: 'none', border: 'none', boxShadow: 'none', background: 'transparent' }}
                  onClick={goNext}
                  aria-label="Próxima imagem"
                />
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-3 sm:ml-0">Legado na Praça XV</h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4 sm:ml-0">
            Como fundador do <span className="font-semibold">Coletivo XV</span>, Wilbor foi fundamental na legalização do skate na Praça XV, um espaço ocupado pela comunidade skatista desde 1997. Desde 2011, seu trabalho transformou o local em um polo cultural, integrando mobiliário urbano para prática do skate e outras manifestações artísticas.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3 sm:ml-0">Trajetória Artística</h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4 sm:ml-0">
            Sua carreira nas artes visuais inclui marcos importantes como a curadoria da exposição <span className="italic">"República do Skate"</span> (2011) no Museu da República e participação na exposição internacional <span className="italic">"Deslize"</span> (2013) no MAR. Suas obras, que incluem xilogravuras em shapes de skate e videoarte, já foram exibidas em Berlim, Romênia, China e Nova York, onde realizou sua exposição individual <span className="italic">"Carve"</span> em 2015.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3 sm:ml-0">Inovação em Xilogravura</h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4 sm:ml-0">
            Wilbor revoluciona a técnica da xilogravura ao usar shapes de skate como suporte. Inspirado pela tradição nordestina, ele expande suas possibilidades criativas incorporando materiais inusitados como tábuas de carne e discos de vinil. Seu processo artístico vai além da criação de imagens, buscando ressignificar objetos do cotidiano através da arte.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3 sm:ml-0">Produção Cultural</h2>
          <ul className="list-disc ml-4 sm:ml-6 space-y-2 sm:ml-0 text-base text-gray-600 dark:text-gray-400">
            <li>Idealizou e produziu o <span className="italic">"República do Skate"</span>, um evento multidisciplinar no Museu da República que reuniu 56 artistas, debates, exibições e shows ao vivo.</li>
            <li>Contribuiu com obras e curadoria na exposição <span className="italic">"Deslize Surfe Skate"</span> (2014) no MAR.</li>
            <li>Desenvolve curadoria especializada em cinema independente de skate.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-3 sm:ml-0">Cinema e Audiovisual</h2>
          <ul className="list-disc ml-4 sm:ml-6 space-y-2 sm:ml-0 text-base text-gray-600 dark:text-gray-400">
            <li>Pioneiro no audiovisual skatista com <span className="italic">"Representando o Skate do Rio"</span> (2002).</li>
            <li>Diretor do aclamado <span className="italic">"Sangue e Suor"</span> (2007), com reconhecimento no Festival de Roterdã.</li>
            <li>Criador do <span className="font-semibold">Zerovinteum Filmes</span>, produtora especializada em cultura skate.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-3 sm:ml-0">Design e Mídia</h2>
          <p className="text-base mb-4 sm:ml-0 text-gray-600 dark:text-gray-400">
            Sua arte se estende ao design comercial, criando identidades visuais para marcas de skate em shapes, rodas e vestuário. Entre 2009 e 2013, expandiu sua atuação dirigindo conteúdo audiovisual para o Circo Voador, com veiculação na MTV, consolidando sua versatilidade criativa.
          </p>

          <footer className="mt-8 text-sm sm:ml-0">Fotos por Tio Verde, Alex Carvalho, Cauã Csik, Henrique Madeira, Bianca Moraes, Felipe Tavora.</footer>
        </div>
        <div className="flex mt-8 mb-8">
          <a
            href="/projects"
            className="group  px-8 py-3 rounded-md text-lg font-medium transition-all flex items-center gap-2"
          >
            Ver Meus projetos →
          </a>
        </div>
      </section>

      {fullscreenImg && (
        typeof window !== 'undefined' && window.innerWidth < 640 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <button
              className="absolute top-3 right-3 rounded-full p-2.5 z-50 flex items-center justify-center border-2 border-gray-300 shadow-lg  hover:rotate-90 transition-all"
              onClick={() => setFullscreenImg(null)}
              aria-label="Fechar"
              title="Fechar"
              style={{ width: 56, height: 56, background: 'transparent', border: 'none', boxShadow: 'none' }}
            >
              <IconX size={40} />
            </button>

            <div className="flex items-center justify-center h-screen w-screen ">
              <div className="relative w-full h-full flex items-center justify-center" style={{ maxHeight: '90vh', maxWidth: '100vw' }}>
                <div className="sm:hidden w-full h-full">
                  <Swiper
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                    initialSlide={fullscreenIndex}
                    onSlideChange={swiper => {
                      setFullscreenIndex(swiper.activeIndex);
                      setFullscreenImg(images[swiper.activeIndex]);
                    }}
                    className="w-full h-[90vh]"
                  >
                    {images.map((img, idx) => (
                      <SwiperSlide key={img}>
                        <div className="flex items-center justify-center w-full h-[90vh] select-none">
                          <img
                            src={img}
                            alt={`Imagem ${idx + 1}`}
                            className="max-w-full max-h-[90vh] rounded-lg shadow-lg object-contain select-none"
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
                <div className="hidden sm:flex relative w-full h-full items-center justify-center">
                  <img
                    src={fullscreenImg}
                    alt={`Imagem em tela cheia`}
                    className="object-contain max-h-[90vh] max-w-full w-auto h-auto select-none"
                    style={{ pointerEvents: 'none' }}
                  />
                  <button
                    className="absolute left-0 top-0 h-full w-1/3 cursor-pointer z-10 focus:outline-none active:outline-none border-none bg-transparent p-0 m-0"
                    tabIndex={-1}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', background: 'transparent' }}
                    onClick={() => {
                      const prev = fullscreenIndex === 0 ? images.length - 1 : fullscreenIndex - 1;
                      setFullscreenImg(images[prev]);
                      setFullscreenIndex(prev);
                    }}
                    aria-label="Imagem anterior"
                  />
                  <button
                    className="absolute right-0 top-0 h-full w-1/3 cursor-pointer z-10 focus:outline-none active:outline-none border-none bg-transparent p-0 m-0"
                    tabIndex={-1}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', background: 'transparent' }}
                    onClick={() => {
                      const next = fullscreenIndex === images.length - 1 ? 0 : fullscreenIndex + 1;
                      setFullscreenImg(images[next]);
                      setFullscreenIndex(next);
                    }}
                    aria-label="Próxima imagem"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
