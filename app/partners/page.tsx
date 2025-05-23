import { createMetadata } from "@/utility/metadata";
import { Metadata } from "next/types";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Parceiros e Colaboradores',
    description: 'Conheça as marcas, artistas, músicos e skatistas que colaboraram com Wilbor em diversos projetos ao longo da carreira.',
    path: '/partners'
  });
}

interface PartnerCategory {
  title: string;
  partners: string[];
}

export default function PartnersPage() {
  const partnerCategories: PartnerCategory[] = [
    {
      title: "Marcas e Empresas",
      partners: [
        "ONErpm",
        "Circo Voador",
        "OffStep",
        "ONEPublishing",
        "Brookfield",
        "Coletivo XV",
        "Skateboarding Museum",
        "Museu de Arte do Rio",
        "Meeting of Favela",
        "Estúdio Baren",
        "Pupila Dilatada",
        "Lado B centro cultural",
        "Sobraderia",
        "Escritório",
        "Capiberibe",
        "Imaginário Periférico",
        "Elemes",
        "Pano Sticker",
        "Betahaus",
        "Black Bear",
        "Move Ya!",
        "Wax Films",
        "Gnars",
        "Skate Hive",
        "Prefeitura do Rio",
        "Disstantes",
        "808 Punks",
        "Katina Surf",
        "A Filial",
        "CarioCaos"
      ]
    },
    {
      title: "Artistas e Músicos",
      partners: [
        "Planet Hemp",
        "Bnegão",
        "Marcelo D2",
        "Barão Vermelho",
        "Pitty",
        "Batman Zavareze",
        "Marcelinho DaLua",
        "Otto",
        "Ramonzin",
        "Braza",
        "Jhafa",
        "Larry Antha",
        "Rita Lee",
        "Guilherme Arantes",
        "Rael",
        "Mano Brown",
        "Racionais MCs",
        "Nação Zumbi",
        "Baco Exu do Blues",
        "Mahmundi",
        "Tony Allen",
        "Skatalites",
        "Lino Krizz",
        "Titi Freak",
        "Thaíde",
        "MV Bill",
        "Filipe Ret",
        "Alabama Shakes",
        "Sublime",
        "Gloria Groove",
        "Letuce",
        "Rincon Sapiência",
        "Erika Ender",
        "Cypher Kids",
        "Rashid",
        "Kamau",
        "Orquestra Voadora",
        "Fishbone",
        "Social Distortion",
        "Digital Dubs",
        "Helinho",
        "Kushaze",
        "Zalon",
        "Warpaint",
        "ADL",
        "IOD",
        "Sant",
        "Mike Muir",
        "Misfits",
        "Pennywise",
        "Mercenárias",
        "Metronomy",
        "Céu",
        "Curumin",
        "Fly",
        "Ah! Mr Dan",
        "Paulo Ricardo",
        "Tribo de Jah",
        "Fresno",
        "Wanessa Camargo",
        "Babado Novo",
        "Adelmo Casé",
        "Sombra",
        "Opanijé",
        "Sampa Crew",
        "Brothers of Brazil",
        "Supla",
        "Tino El Pinguino",
        "Blubell",
        "Quinho",
        "Built To Spill",
        "Bonde da Stronda",
        "Marlyn Carino",
        "Cat Empire",
        "Nitty Scott",
        "Supercombo",
        "Medulla",
        "Rachel Luz",
        "Jake Klair",
        "Gabe Dixon",
        "Megan & Liz",
        "Total Slaker",
        "Sugarbad",
        "Topaz Jones",
        "The Grizzled Mighty"
      ]
    },
    {
      title: "Skatistas",
      partners: [
        "Leo Lopes",
        "Paul Rodriguez",
        "Ishod Wair",
        "Luan de Oliveira",
        "Fabio Cristiano",
        "Leo Rodrigues",
        "Humberto Zero",
        "Nicola Grilo",
        "Jorge Cupim",
        "Marcello Gouvea",
        "Yann Jhy Wu",
        "Emanoel Enxaqueca",
        "Alessandro Ramos",
        "Alan Mesquita",
        "Mera",
        "Sergio Garb",
        "Fabiano Besada",
        "Bate Bola",
        "Palito",
        "Williams Dent"
      ]
    }
  ];

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 py-12 text-gray-800 dark:text-gray-200 text-left">
      <div className="text-left mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200 text-left w-full" style={{maxWidth: 'none'}}>
          Parceiros e Colaboradores
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-left w-full" style={{maxWidth: 'none'}}>
          Tenho a honra de trabalhar com algumas das marcas, artistas e atletas mais criativos e inspiradores.
          Conheça algumas das colaborações que fizeram parte da minha trajetória.
        </p>
      </div>
      <div className="space-y-12 w-full text-left">
        {partnerCategories.map((category) => (
          <div key={category.title} className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 pb-2 border-b border-gray-200 dark:border-gray-800 text-left">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-left">
              {category.partners.map((partner) => (
                <div key={partner} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-300 text-left">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-left w-full">
        <p >
          Esta lista representa apenas uma parte dos parceiros e colaboradores ao longo da minha carreira.
        </p>
      </div>
    </div>
  );
}
