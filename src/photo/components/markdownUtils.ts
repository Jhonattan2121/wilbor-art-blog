export function extractImagesFromMarkdown(markdown: string): string[] {
  // Regex pega o link completo, incluindo parâmetros e query string
  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push(match[1]); // link completo, com token e parâmetros
  }
  return images;
}