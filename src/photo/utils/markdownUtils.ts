import { formatPinataUrl } from '@/components/MediaUtils';

/**
 * Extrai URLs de imagens de conteúdo Markdown
 * 
 * @param markdown Conteúdo em formato Markdown
 * @returns Array com URLs de imagens encontradas
 */
export function extractImagesFromMarkdown(markdown: string): string[] {
  if (!markdown) return [];
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const imageUrl = formatPinataUrl(match[1]);
    images.push(imageUrl);
  }
  return images;
}
