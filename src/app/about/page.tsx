/* eslint-disable */
'use client';

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

  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 ">
      <section>
        <div className="prose prose-lg space-y-4 sm:space-y-6 prose-invert">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
            Wilson Domingues "Wilbor"
          </h1>

          <p className="text-lg mb-4">
             Conhecido como Wilbor, é um artista multifacetado do Rio de Janeiro que une skate, arte e audiovisual. Sua jornada começou em 2002 com a direção do primeiro vídeo de street skate carioca "<span className="font-semibold">021 RSRJ</span>". Em 2007, consolidou sua visão com "<span className="font-semibold">Sangue e Suor</span>", um documentário sobre a cena do skate no Rio, que ganhou reconhecimento internacional no festival <span className="italic">Camera Mundo</span> na Holanda.
          </p>

          <div className="my-6 sm:my-10 -mx-4 sm:mx-0">
            <div className="w-full sm:max-w-2xl">
              <Swiper
                spaceBetween={20}
                slidesPerView={1}
                pagination={{ 
                  clickable: true,
                  bulletActiveClass: 'swiper-pagination-bullet-active bg-white',
                }}
                modules={[Pagination]}
                className="w-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-[300px] md:h-[500px]">
                      <Image
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        fill={true}
                        priority
                        sizes="(max-width: 768px) 100vw, 640px"
                        className="object-contain cursor-pointer"
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.innerWidth < 640) {
                            setFullscreenImg(image);
                            setFullscreenIndex(index);
                          }
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Legado na Praça XV</h2>
          <p className="mb-4">
            Como fundador do <span className="font-semibold">Coletivo XV</span>, Wilbor foi fundamental na legalização do skate na Praça XV, um espaço ocupado pela comunidade skatista desde 1997. Desde 2011, seu trabalho transformou o local em um polo cultural, integrando mobiliário urbano para prática do skate e outras manifestações artísticas.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Trajetória Artística</h2>
          <p className="mb-4">
            Sua carreira nas artes visuais inclui marcos importantes como a curadoria da exposição <span className="italic">"República do Skate"</span> (2011) no Museu da República e participação na exposição internacional <span className="italic">"Deslize"</span> (2013) no MAR. Suas obras, que incluem xilogravuras em shapes de skate e videoarte, já foram exibidas em Berlim, Romênia, China e Nova York, onde realizou sua exposição individual <span className="italic">"Carve"</span> em 2015.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Inovação em Xilogravura</h2>
          <p className="mb-4">
            Wilbor revoluciona a técnica da xilogravura ao usar shapes de skate como suporte. Inspirado pela tradição nordestina, ele expande suas possibilidades criativas incorporando materiais inusitados como tábuas de carne e discos de vinil. Seu processo artístico vai além da criação de imagens, buscando ressignificar objetos do cotidiano através da arte.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Produção Cultural</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Idealizou e produziu o <span className="italic">"República do Skate"</span>, um evento multidisciplinar no Museu da República que reuniu 56 artistas, debates, exibições e shows ao vivo.</li>
            <li>Contribuiu com obras e curadoria na exposição <span className="italic">"Deslize Surfe Skate"</span> (2014) no MAR.</li>
            <li>Desenvolve curadoria especializada em cinema independente de skate.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Cinema e Audiovisual</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Pioneiro no audiovisual skatista com <span className="italic">"Representando o Skate do Rio"</span> (2002).</li>
            <li>Diretor do aclamado <span className="italic">"Sangue e Suor"</span> (2007), com reconhecimento no Festival de Roterdã.</li>
            <li>Criador do <span className="font-semibold">Zerovinteum Filmes</span>, produtora especializada em cultura skate.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Design e Mídia</h2>
          <p className="mb-4">
            Sua arte se estende ao design comercial, criando identidades visuais para marcas de skate em shapes, rodas e vestuário. Entre 2009 e 2013, expandiu sua atuação dirigindo conteúdo audiovisual para o Circo Voador, com veiculação na MTV, consolidando sua versatilidade criativa.
          </p>

          <footer className="mt-8 text-sm text-gray-400">Fotos por Tio Verde, Alex Carvalho, Cauã Csik, Henrique Madeira, Bianca Moraes, Felipe Tavora.</footer>
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

      {/* Modal de fullscreen para mobile */}
      {fullscreenImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <button
            className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 z-50"
            onClick={() => setFullscreenImg(null)}
            aria-label="Fechar imagem em tela cheia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            initialSlide={fullscreenIndex}
            onSlideChange={(swiper) => setFullscreenIndex(swiper.activeIndex)}
            className="w-full h-full"
          >
            {images.map((imgSrc, idx) => (
              <SwiperSlide key={idx}>
                <div className="flex items-center justify-center h-screen w-screen ">
                  <img
                    src={imgSrc}
                    alt={`Imagem ${idx + 1} em tela cheia`}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
