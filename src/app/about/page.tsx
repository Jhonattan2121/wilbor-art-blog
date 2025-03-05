/* eslint-disable */
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SITE_TITLE } from '../config';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{SITE_TITLE}</h1>

      <div className="mb-8">
        <div className="relative w-full h-[400px] max-w-xl mx-auto">
          <Image
            src={images[currentImageIndex]}
            alt={`Imagem ${currentImageIndex + 1}`}
            fill={true}
            className="rounded-lg shadow-lg object-contain"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'contain' }}
          />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={previousImage}
            className="bg-black/70 hover:bg-black/90 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all"
          >
            ← Previous
          </button>

          <button
            onClick={nextImage}
            className="bg-black/70 hover:bg-black/90 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all"
          >
            Next →
          </button>
        </div>
      </div>

      <section className="max-w-3xl mx-auto">

        <div className="prose prose-lg max-w-none space-y-6">
          <h1 className="text-4xl font-bold text-center mb-6">Wilson Domingues "Wilbor"</h1>

          <p className="text-lg mb-4">
            Wilson Domingues, conhecido como Wilbor, é um artista multifacetado do Rio de Janeiro que une skate, arte e audiovisual. Sua jornada começou em 2002 com a direção do primeiro vídeo de street skate carioca "<span className="font-semibold">021 RSRJ</span>". Em 2007, consolidou sua visão com "<span className="font-semibold">Sangue e Suor</span>", um documentário sobre a cena do skate no Rio, que ganhou reconhecimento internacional no festival <span className="italic">Camera Mundo</span> na Holanda.
          </p>

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

          <footer className="mt-8 text-center text-gray-600 text-sm">Fotos por Tio Verde, Alex Carvalho, Cauã Csik, Henrique Madeira, Bianca Moraes, Felipe Tavora.</footer>
        </div>
        <div className="flex justify-center mt-12 mb-8">
          <a
            href="/projects"
            className="group bg-black/70 hover:bg-black/90 text-white px-8 py-3 rounded-full text-lg font-medium transition-all flex items-center gap-2"
          >
            Ver nossos projetos →
          </a>
        </div>
      </section>
    </div>
  );
}
