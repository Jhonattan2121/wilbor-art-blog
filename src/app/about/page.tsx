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
        <div className="relative max-w-xl mx-auto">
          <Image
            src={images[currentImageIndex]}
            alt={`Imagem ${currentImageIndex + 1}`}
            width={300}
            height={225}
            className="rounded-lg shadow-lg w-full h-auto object-contain max-h-[400px]"
            priority
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

          <p className="text-lg mb-4">Carioca, artista visual, diretor de filmes e skatista. Dirigiu, atuou e produziu o primeiro vídeo de street skate carioca, <span className="font-semibold">"021 RSRJ"</span> (59 min), lançado em 2002 em VHS. Em 2007, lançou <span className="font-semibold">"Sangue e Suor"</span> (40 min), também sobre a cena do skate carioca, exibido no festival independente <span className="italic">Camera Mundo</span>, na Holanda.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Coletivo XV e Praça XV</h2>
          <p className="mb-4">Fundador do <span className="font-semibold">Coletivo XV</span>, responsável pela legalização do skate na Praça XV, ocupada por skatistas desde 1997. Desde 2011, promove eventos culturais e inclusão de mobiliário urbano para o skate e outros usos.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Atuação nas Artes</h2>
          <p className="mb-4">Foi curador e produtor da exposição <span className="italic">"República do Skate"</span> (2011) no Museu da República. Participou da coletiva internacional <span className="italic">"Deslize"</span> (2013) no Museu de Arte do Rio com xilogravuras feitas em shapes de skate e videoarte, além de curadoria da sessão de filmes de skate. Possui obras no acervo do Skate em Berlim e participou da exposição <span className="italic">"Mocambo"</span> (2013), também em Berlim. Exibiu trabalhos na Romênia, China e, em 2015, fez a individual <span className="italic">"Carve"</span> em Nova York.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Xilogravura e Novos Suportes</h2>
          <p className="mb-4">Desenvolve uma linha de xilogravuras utilizando shapes de skate como matriz. Inspirado na xilogravura nordestina, explora novos suportes como tábuas de carne e discos de vinil. Sua pesquisa busca não apenas formar imagens, mas também explorar o significado e a relação dos objetos com seu cotidiano.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Curadoria e Produção Cultural</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Curadoria e produção no evento <span className="italic">"República do Skate"</span> no Museu da República, com debates, exibição de filmes, bandas e exposição com 56 artistas.</li>
            <li>Participação na coletiva <span className="italic">"Deslize Surfe Skate"</span> (2014) no Museu de Arte do Rio.</li>
            <li>Curadoria de sessões de filmes independentes.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Direção e Produção Audiovisual</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Direção e atuação no primeiro vídeo de skate carioca <span className="italic">"Representando o Skate do Rio"</span> (2002).</li>
            <li>Direção do documentário <span className="italic">"Sangue e Suor"</span> (2007), exibido no Festival de Filme Independente de Roterdã.</li>
            <li>Fundador do coletivo <span className="font-semibold">Zerovinteum Filmes</span>, especializado em vídeos de skate.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3">Gráficos e Produção para Marcas</h2>
          <p className="mb-4">Criou gráficos para marcas de skate aplicados em shapes, rodas e estampas. Entre 2009 e 2013, dirigiu vídeos musicais e chamadas para os shows do Circo Voador, veiculadas na MTV.</p>

          <footer className="mt-8 text-center text-gray-600 text-sm">Fotos por Tio Verde, Alex Carvalho, Cauã Csik, Henrique Madeira, Bianca Moraes, Felipe Tavora.</footer>
        </div>
      </section>
    </div>
  );
}
