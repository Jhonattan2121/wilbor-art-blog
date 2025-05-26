/* eslint-disable */
'use client';

import Image from 'next/image';
import { useState } from 'react';

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
    <div className="container px-4  py-6 mx-auto sm:px-8 pt-4 lg:mx-0 lg:max-w-none w-full">
      <section>
        <div className="max-w-4xl w-full text-left space-y-4 sm:space-y-6 mx-0">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight -ml-2 sm:ml-0">
            Wilson Domingues "Wilbor"
          </h1>

          <p className="text-lg mb-4 -ml-2 sm:ml-0">
            Conhecido como Wilbor, é um artista multifacetado do Rio de Janeiro que une skate, arte e audiovisual. Sua jornada começou em 2002 com a direção do primeiro vídeo de street skate carioca "<span className="font-semibold">021 RSRJ</span>". Em 2007, consolidou sua visão com "<span className="font-semibold">Sangue e Suor</span>", um documentário sobre a cena do skate no Rio, que ganhou reconhecimento internacional no festival <span className="italic">Camera Mundo</span> na Holanda.
          </p>

          <div className="my-6 sm:my-10 -mx-4 sm:mx-0">
            <div className="w-full sm:max-w-2xl mx-auto">
              <div className="relative w-full h-[300px] md:h-[500px] select-none">
                <Image
                  src={images[currentIndex]}
                  alt={`Imagem ${currentIndex + 1}`}
                  fill={true}
                  priority
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-contain cursor-pointer"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      setFullscreenImg(images[currentIndex]);
                      setFullscreenIndex(currentIndex);
                    } else {
                      const bounds = (e.target as HTMLElement).getBoundingClientRect();
                      const x = (e as React.MouseEvent).clientX - bounds.left;
                      if (x < bounds.width / 3) {
                        goPrev();
                      } else if (x > (2 * bounds.width) / 3) {
                        goNext();
                      } else {
                        setFullscreenImg(images[currentIndex]);
                        setFullscreenIndex(currentIndex);
                      }
                    }
                  }}
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center transition-all duration-200 ${idx === currentIndex ? 'bg-red-500 scale-110 shadow-lg' : 'bg-transparent'}`}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Ir para imagem ${idx + 1}`}
                    >
                      {idx === currentIndex && (
                        <span className="block w-1.5 h-1.5 bg-white rounded-full" />
                      )}
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

          <h2 className="text-2xl font-semibold mt-6 mb-3 -ml-2 sm:ml-0">Legado na Praça XV</h2>
          <p className="mb-4 -ml-2 sm:ml-0">
            Como fundador do <span className="font-semibold">Coletivo XV</span>, Wilbor foi fundamental na legalização do skate na Praça XV, um espaço ocupado pela comunidade skatista desde 1997. Desde 2011, seu trabalho transformou o local em um polo cultural, integrando mobiliário urbano para prática do skate e outras manifestações artísticas.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 -ml-2 sm:ml-0">Trajetória Artística</h2>
          <p className="mb-4 -ml-2 sm:ml-0">
            Sua carreira nas artes visuais inclui marcos importantes como a curadoria da exposição <span className="italic">"República do Skate"</span> (2011) no Museu da República e participação na exposição internacional <span className="italic">"Deslize"</span> (2013) no MAR. Suas obras, que incluem xilogravuras em shapes de skate e videoarte, já foram exibidas em Berlim, Romênia, China e Nova York, onde realizou sua exposição individual <span className="italic">"Carve"</span> em 2015.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 -ml-2 sm:ml-0">Inovação em Xilogravura</h2>
          <p className="mb-4 -ml-2 sm:ml-0">
            Wilbor revoluciona a técnica da xilogravura ao usar shapes de skate como suporte. Inspirado pela tradição nordestina, ele expande suas possibilidades criativas incorporando materiais inusitados como tábuas de carne e discos de vinil. Seu processo artístico vai além da criação de imagens, buscando ressignificar objetos do cotidiano através da arte.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 -ml-2 sm:ml-0">Produção Cultural</h2>
          <ul className="list-disc ml-4 sm:ml-6 space-y-2 -ml-2 sm:ml-0">
            <li>Idealizou e produziu o <span className="italic">"República do Skate"</span>, um evento multidisciplinar no Museu da República que reuniu 56 artistas, debates, exibições e shows ao vivo.</li>
            <li>Contribuiu com obras e curadoria na exposição <span className="italic">"Deslize Surfe Skate"</span> (2014) no MAR.</li>
            <li>Desenvolve curadoria especializada em cinema independente de skate.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 -ml-2 sm:ml-0">Cinema e Audiovisual</h2>
          <ul className="list-disc ml-4 sm:ml-6 space-y-2 -ml-2 sm:ml-0">
            <li>Pioneiro no audiovisual skatista com <span className="italic">"Representando o Skate do Rio"</span> (2002).</li>
            <li>Diretor do aclamado <span className="italic">"Sangue e Suor"</span> (2007), com reconhecimento no Festival de Roterdã.</li>
            <li>Criador do <span className="font-semibold">Zerovinteum Filmes</span>, produtora especializada em cultura skate.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 -ml-2 sm:ml-0">Design e Mídia</h2>
          <p className="mb-4 -ml-2 sm:ml-0">
            Sua arte se estende ao design comercial, criando identidades visuais para marcas de skate em shapes, rodas e vestuário. Entre 2009 e 2013, expandiu sua atuação dirigindo conteúdo audiovisual para o Circo Voador, com veiculação na MTV, consolidando sua versatilidade criativa.
          </p>

          <footer className="mt-8 text-sm text-gray-400 -ml-2 sm:ml-0">Fotos por Tio Verde, Alex Carvalho, Cauã Csik, Henrique Madeira, Bianca Moraes, Felipe Tavora.</footer>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <button
            className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 z-50 flex items-center justify-center border-2 border-gray-300 shadow-lg hover:border-red-500 hover:rotate-90 transition-all"
            onClick={() => setFullscreenImg(null)}
            aria-label="Fechar imagem em tela cheia"
            style={{ width: 44, height: 44 }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" stroke="#fff" strokeWidth="2" fill="#222" />
              <circle cx="14" cy="14" r="4" stroke="#fff" strokeWidth="2" fill="#d32f2f" />
              <rect x="13" y="7" width="2" height="14" rx="1" fill="#fff" />
              <rect x="7" y="13" width="14" height="2" rx="1" fill="#fff" />
            </svg>
          </button>
          <div className="flex items-center justify-center h-screen w-screen ">
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ maxHeight: '90vh', maxWidth: '100vw' }}
            >
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
      )}
    </div>
  );
}
