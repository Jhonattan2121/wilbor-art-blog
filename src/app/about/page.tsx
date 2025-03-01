/* eslint-disable */
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SITE_TITLE } from '../config';

const images = [
  'https://payload.cargocollective.com/1/3/100581/1278038/wil_frame_xv_Alex_Carvalho_640.jpg',
  'https://payload.cargocollective.com/1/3/100581/1278038/WIL-GRAVURA-VINIL_670.JPG',
  'https://payload.cargocollective.com/1/3/100581/1278038/07_wilbor_XILO2.jpg',
  'https://payload.cargocollective.com/1/3/100581/1278038/wil_oldschool_tunel_caua_640.jpg',
  'https://payload.cargocollective.com/1/3/100581/1278038/henrique_madeira_expo_hg_220611-37_640.jpg',
  'https://payload.cargocollective.com/1/3/100581/1278038/Wilson%20Domingues%20e%20o%20wallride%20indito%20que%20ele%20mesmo%20descobriu-%20wallride.JPG',
  'https://payload.cargocollective.com/1/3/100581/1278038/wil_na_onda_640.jpg',
  'https://payload.cargocollective.com/1/3/100581/1278038/WIL-WALLRIDE-MORTAL-KOMBAT_640.jpg',
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
        <h1 className="text-4xl font-bold mb-6">Wilson Domingues "Wilbor"</h1>

        <div className="prose prose-lg max-w-none space-y-6">
          <p>
            Wilson Domingues, conhecido como "Wilbor", é um artista visual, diretor de filmes e skatista carioca. Sua relação com o skate e a arte começou cedo, tornando-se um dos principais nomes da cena do street skate no Rio de Janeiro. Em 2002, ele dirigiu, atuou e produziu o primeiro vídeo de street skate carioca, "021 RSRJ" (59 min.), lançado em VHS. Em 2007, Wilbor lançou "Sangue e Suor" (40 min.), um documentário sobre a cena de skate carioca, exibido na Holanda no festival independente Camera Mundo.
          </p>

          <p>
            Wilbor é também fundador do Coletivo XV, um movimento que lutou pela legalização do skate na Praça XV, um local que já era ocupado por skatistas desde 1997. Desde 2011, o coletivo promove eventos no local, incentivando a cultura do skate e promovendo a inclusão de mobiliários urbanos para o esporte e outros usos. O Coletivo XV se transformou na Associação Cultural do Skate, que discute o uso de espaços públicos, desenvolve projetos e fortalece o skate como uma ferramenta de integração social e expressão cultural.
          </p>

          <p>
            No campo da arte, Wilbor se destaca pelo uso de xilogravura, uma técnica tradicional que ele adapta utilizando shapes de skate como matrizes. Ele se inspira na literatura de cordel nordestina, que também utiliza madeira como suporte para gravuras. Sua obra questiona as limitações do material e transforma as adversidades em vantagens criativas. Além disso, ele explora novos suportes, como tábuas de carne e discos de vinil, expandindo sua técnica para outras formas de expressão.
          </p>

          <p>
            Seu trabalho já foi exibido em diversos países, incluindo Alemanha, Romênia, China e Estados Unidos. Entre suas exposições mais notáveis estão:
          </p>
          <ul>
            <li><strong>"República do Skate"</strong> (2011, Museu da República, RJ) - Curadoria e produção de um evento com exposição de 56 artistas, debates e exibições de filmes.</li>
            <li><strong>"Deslize"</strong> (2013, Museu de Arte do Rio – MAR) - Exposição de xilogravuras, videoarte e curadoria da sessão de filmes de skate.</li>
            <li><strong>"Mocambo"</strong> (2013, Berlim) - Coletiva internacional de arte.</li>
            <li><strong>"Carve"</strong> (2015, Nova Iorque) - Exposição individual.</li>
          </ul>

          <p>
            No campo audiovisual, Wilbor trabalhou como diretor de vídeos musicais e produziu chamadas para shows do Circo Voador entre 2009 e 2013, que foram veiculadas na MTV. Ele também desenvolveu gráficos para marcas de skate, aplicados em shapes, rodas e estampas de camisetas. Desde 2010, Wilbor trabalha com o Wilbor Studio, criando arte e vídeos para moda, música, TV, skateboarding e cinema. Ele também colabora com produções no ONErpm Studios e no NAVI Audiovisual Nucleus do Circo Voador.
          </p>

          <h2>Xiloshapes</h2>
          <p>
            O projeto Xiloshapes nasce da ideia de questionar a efemeridade e a industrialização da arte no skate. Ao usar shapes de skate como matrizes de xilogravura, Wilbor inverte o processo tradicional, tornando a prancha de skate a matriz e não apenas o suporte final. Esse projeto provoca uma reflexão sobre o valor da arte e sobre como a prática do skate ressignifica os espaços urbanos, transformando elementos do cotidiano em símbolos de expressão e liberdade.
          </p>

          <h2>Influências Filosóficas</h2>
          <p>
            As influências filosóficas de Wilbor, especialmente as ideias de Nietzsche sobre o conhecimento e a vida, se refletem em seu trabalho artístico. Ele acredita que o skate vai além de um esporte, sendo uma manifestação social e cultural. O uso da cidade como espaço de expressão no skate transforma o cotidiano, permitindo que o ato de "ir contra" as normas seja uma forma de afirmação da vida.
          </p>

          <h2>Vida e Filosofia</h2>
          <p>
            A relação entre vida, conhecimento e arte é central no trabalho de Wilbor. Ele vê o skate como uma prática que desafia os limites do conhecimento convencional e da estética, criando novas formas de ver o mundo. Sua obra artística, que utiliza as pranchas de skate como matrizes de xilogravura, é uma extensão dessa ideia, onde a transgressão e a improvisação geram novas possibilidades para a arte e para a vida.
          </p>

          <p>
            Wilbor continua a explorar novas formas de arte, mantendo sempre a filosofia de que o skate é mais do que um esporte: é uma ferramenta de expressão cultural, social e artística.
          </p>

          <p>Fotos por Tio Verde, Alex Carvalho, Cauã Csik, Henrique Madeira, Bianca Moraes, Felipe Tavora.</p>
        </div>
      </section>
    </div>
  );
}
