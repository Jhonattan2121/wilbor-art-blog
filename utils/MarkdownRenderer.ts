export class MarkdownRenderer {
  static extractImagesFromMarkdown(content: string): string[] {
    const markdownImages = content.match(/!\[(?:.*?)\]\((.*?)\)/g) || [];
    
    return markdownImages
      .map(img => {
        const match = img.match(/!\[.*?\]\((.*?)\)/);
        return match ? match[1].trim() : null;
      })
      .filter(Boolean) as string[];
  }

  static extractImagesFromHive(post: any): string[] {
    try {
      const json = JSON.parse(post.json_metadata || '{}');
      const body = post.body || '';

      const images = [
        ...(json.image || []),
        ...(json.images || []),
        ...this.extractImagesFromMarkdown(body)
      ];

      return [...new Set(images)].filter(Boolean);
    } catch (error) {
      console.error('Erro ao extrair imagens do post:', error);
      return [];
    }
  }
}