import { createMetadata } from "@/utility/metadata";
import { Metadata } from "next/types";


export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return createMetadata({
      title: 'social-media',
      description: 'Conecte-se com Wilbor através das redes sociais. Siga no Instagram, assista trabalhos no Vimeo e Odysee, ou visite a loja online para adquirir obras exclusivas. Descubra mais sobre meu trabalho artístico e mantenha-se atualizado com os novos projetos.',
      path: '/social-media'
    });
  }
  

interface SocialMediaLink {
  name: string;
  url: string;
  description: string;
}

export default function SocialMediaPage() {
  const socialMediaLinks: SocialMediaLink[] = [
    {
      name: 'Instagram',
      url: 'https://instagram.com/wilbor_domina',
      description: 'Fotos, histórias e atualizações diárias',
    },
    {
      name: 'Vimeo',
      url: 'https://vimeo.com/wilbor',
      description: 'Filmes, projetos audiovisuais e documentários',
    },
    {
      name: 'Odysee',
      url: 'https://odysee.com/@wilbor',
      description: 'Conteúdo exclusivo e transmissões ao vivo',
    },
    {
      name: 'Shop',
      url: 'https://web.marcelforart.com/wilson_domingues/collections',
      description: 'Adquira impressões exclusivas e produtos de arte',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">Redes Sociais</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Conecte-se através das minhas plataformas e descubra mais sobre meu trabalho e projetos.
        </p>
      </div>

      <div className="space-y-6 mb-16">
        {socialMediaLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-1">{link.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{link.description}</p>
              </div>
              <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
