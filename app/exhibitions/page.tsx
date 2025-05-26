import { createMetadata } from '@/utility/metadata';
import { Metadata } from 'next/types';
import ViewSwitcher from '../../src/app/ViewSwitcher';
import JsonLd from '../components/JsonLd';

export const dynamic = 'force-static';
export const maxDuration = 60;

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Exposições e Exibições',
    description: 'Exposições, exibições e prêmios de Wilson Domingues "Wilbor", incluindo mostras internacionais na Europa, Ásia e América do Norte, e participações em festivais de cinema.',
    path: '/exhibitions'
  });
}

export default function ExhibitionsPage() {
  return (
    <>
      <ViewSwitcher currentSelection="exhibitions" />
      <div className="w-full px-4 sm:px-8 pt-4 md:px-12 py-12  dark:text-gray-200 text-left">
        <JsonLd
          type="breadcrumb"
          data={{
            path: '/exhibitions',
            currentPage: 'Exposições e Exibições'
          }}
        />
        <JsonLd
          type="article"
          data={{
            title: 'Exposições, Exibições e Prêmios - Wilbor Art',
            description: 'Histórico de exposições, exibições e prêmios de Wilson Domingues "Wilbor", artista multifacetado do Rio de Janeiro',
            datePublished: '2023-01-01T00:00:00Z'
          }}
        />

        <div className="max-w-4xl w-full text-left space-y-4 sm:space-y-6 mx-0">
          <div className="space-y-12 text-left">

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">07/05/22</div>
              <h2 className="text-2xl font-bold">MULTIVERSO COLABORATIVO</h2>
              <h3 className="text-xl font-semibold mb-2">IMAGINÁRIO PERIFÉRICO - 20 anos</h3>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Instalação &quot;Rap do Surfista&quot;</p>
              <p className="text-gray-500 dark:text-gray-400">Centro Cultural Capiberibe 27</p>
              <p className="text-gray-500 dark:text-gray-400">Santo Cristo - Rio de Janeiro - RJ</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">21/03/21</div>
              <h2 className="text-2xl font-bold">ARQUIVO PANDEMIA</h2>
              <p className="mb-2 text-gray-700 dark:text-gray-300">Diários íntimos, recortes poéticos, históricos, geográficos, políticos, antropológicos, artísticos, psicossociais do isolamento.</p>
              <p className="text-gray-500 dark:text-gray-400">UNIVERSIDADE FEDERAL DE MINAS GERAIS</p>
              <p className="text-gray-500 dark:text-gray-400">EDITORA UFMG</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">17/07/2018</div>
              <h2 className="text-2xl font-bold">UniVERSOS</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Cinema estação NET RIO</p>
              <p className="text-gray-700 dark:text-gray-300">Documentário</p>
              <p className="text-gray-700 dark:text-gray-300">Mv Bill/Baco Exu do Blues/Sant/ADL</p>
              <p className="text-gray-500 dark:text-gray-400">17min HD áudio 5.1</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">14/05/2018</div>
              <h2 className="text-2xl font-bold">Absurdo é ter medo</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Galeria Novos Pretos de Arte Contemporãnea</p>
              <p className="text-gray-500 dark:text-gray-400">Curadodor Marco Antônio Teobaldo</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">28/01/2018</div>
              <h2 className="text-2xl font-bold">SKATE ART ATTACK</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Exposição coletiva</p>
              <p className="text-gray-500 dark:text-gray-400">Espaço cultural Glicerina</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">02/2017</div>
              <h2 className="text-2xl font-bold">Obra Utopia</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Estréia no Canal Biz</p>
              <p className="text-gray-700 dark:text-gray-300">Musical com a banda Braza</p>
              <p className="text-gray-500 dark:text-gray-400">22min HD Stereo</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">01/2017</div>
              <h2 className="text-2xl font-bold">Brasil Observer - London - UK</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Selected to make the cover of the &quot;Brasil Observer&quot; magazine</p>
              <p className="text-gray-500 dark:text-gray-400">and expose the original work in London in February 2018</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">01/2017</div>
              <h2 className="text-2xl font-bold">Despina - Largo das Artes Gallery - Rio de Janeiro - Brazil</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Self Service</p>
              <p className="text-gray-700 dark:text-gray-300">Collective Exhibition with resident artists</p>
              <p className="text-gray-500 dark:text-gray-400">Frottage, audio</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">01/2017</div>
              <h2 className="text-2xl font-bold">Graffiti on Debate</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Tatoo Week - Rio de Janeiro - Brasil</p>
              <p className="text-gray-500 dark:text-gray-400">Debate about public interventions</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">12/2016</div>
              <h2 className="text-2xl font-bold">Seminar on Tourism of Urban Parks and Cultural Centers</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Federal Fluminense University - Rio de Janeiro - Brazil</p>
              <p className="text-gray-500 dark:text-gray-400">Debate about public interventions</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">12/2016</div>
              <h2 className="text-2xl font-bold">Celeiro Gallery - Niterói - Rio de Janeiro - Brazil</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Atual</p>
              <p className="text-gray-700 dark:text-gray-300">Collective Exhibition</p>
              <p className="text-gray-500 dark:text-gray-400">Prints</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">12/2016</div>
              <h2 className="text-2xl font-bold">No Quintal Gallery - Rio de Janeiro - Brazil</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Pegada Gráfica</p>
              <p className="text-gray-500 dark:text-gray-400">Collective Exhibition with Fernando Mira</p>
            </div>
          </div>

          <div className="space-y-12 text-left">
            {/* Segunda coluna de exposições */}
            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">10/2016</div>
              <h2 className="text-2xl font-bold">Arte Core - Museum of Modern Art - Rio de Janeiro - Brasil</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Collective - XV Collective of Skateboard Community</p>
              <p className="text-gray-500 dark:text-gray-400">Wood with griptape peace, Matrices and Prints</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">08/2016</div>
              <h2 className="text-2xl font-bold">Cidades Invisíveis / Frete Grátis - Despina / Largo das Artes</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Rio de Janeiro - Brasil</p>
              <p className="text-gray-700 dark:text-gray-300">Collective</p>
              <p className="text-gray-500 dark:text-gray-400">Draw, T-shirt and Vídeo Box</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">02/2016</div>
              <h2 className="text-2xl font-bold">The Skateboard Museum - Berlin - Germany</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Collective - The Art of Skateboarding</p>
              <p className="text-gray-500 dark:text-gray-400">Print donated to The Skateboard Museum collection</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">02/2016</div>
              <h2 className="text-2xl font-bold">Focus Tatoo Cine - Tatoo Week - Rio de Janeiro - Brasil</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Festival of Independent Films</p>
              <p className="text-gray-500 dark:text-gray-400">O Processo #2 - 3:46min</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">04/2015</div>
              <h2 className="text-2xl font-bold">Black Bear - Brooklyn - New York - EUA</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Carve / Solo</p>
              <p className="text-gray-500 dark:text-gray-400">Matrices, prints and videos</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">04/2014</div>
              <h2 className="text-2xl font-bold">GaleRio - Mural commissioned by the city of Rio de Janeiro</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Situated on metro line in Coelho Neto in the North Zone of Rio</p>
              <p className="text-gray-500 dark:text-gray-400">15m x 3m</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">02/2014</div>
              <h2 className="text-2xl font-bold">MAR- Art Museum of Rio</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Deslize Surf / Skate - international collective exhibition</p>
              <p className="text-gray-500 dark:text-gray-400">Curator and film screenings</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">11/2013</div>
              <h2 className="text-2xl font-bold">Bethahaus – Moritsplatz – Berlin - Germany</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Mocambo – Partnership with photographer Bocarras - Mozambique</p>
              <p className="text-gray-500 dark:text-gray-400">Matrices and prints</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">10/2013</div>
              <h2 className="text-2xl font-bold">Skateboard Museum Stuttgart - Alemanha</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">2 pieces to the collection</p>
              <p className="text-gray-700 dark:text-gray-300">Print - processo #2</p>
              <p className="text-gray-500 dark:text-gray-400">Skateboard Deck with griptape - coquetel molotov</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">10/2013</div>
              <h2 className="text-2xl font-bold">II Hong Kong Open Printshop – China</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">Print – Mahmundi</p>
              <p className="text-gray-500 dark:text-gray-400">Exhibition and catalog</p>
            </div>

            <div className="exhibition-item text-left">
              <div className="text-red-500 font-semibold mb-2">07/2013</div>
              <h2 className="text-2xl font-bold">Art Museum of Prahova – Romênia</h2>
              <p className="mb-1 text-gray-700 dark:text-gray-300">X International Biennial of Contemporary Engraving</p>
              <p className="text-gray-500 dark:text-gray-400">Exhibition and catalog</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6 text-left">PUBLICAÇÕES</h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 text-left">
            <li>
              <span className="font-semibold">2015 - </span>
              Dumbo Magazine - <a href="https://dumbomagazine.com/2015/05/01/wilbor/" className="text-red-500 hover:text-red-600" target="_blank" rel="noopener noreferrer">https://dumbomagazine.com/2015/05/01/wilbor/</a>
            </li>
            <li>
              <span className="font-semibold">2014 - </span>
              Das Artes - issue 30 - Materia sobre a coletiva Deslize
            </li>
            <li>
              <span className="font-semibold">2012 - </span>
              Vista – issue 43 - Page 38 until 45
            </li>
            <li>
              <span className="font-semibold">2011 - </span>
              Inside The World Of Board Graphics - Publishing Modern Dog USA
            </li>
          </ul>
        </div>

        <div className="flex justify-start mt-12 mb-8">
          <a
            href="/about"
            className="group bg-black/70 hover:bg-black/90 text-white px-8 py-3 rounded-full text-lg font-medium transition-all flex items-center gap-2"
          >
            Saiba mais sobre o artista →
          </a>
        </div>
      </div>
    </>
  );
}