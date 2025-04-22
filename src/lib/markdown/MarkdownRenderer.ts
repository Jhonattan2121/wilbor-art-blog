interface MediaContent {
  type: 'image' | 'video' | 'iframe';
  url: string;
  thumbnailSrc?: string;
  iframeHtml?: string;
}

const SUPPORTED_IMAGE_TYPES = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)$/i;

export class MarkdownRenderer {
  static extractMediaFromHive(post: any): MediaContent[] {
    const mediaItems: Set<string> = new Set();
    const result: MediaContent[] = [];

    // New flexible regex pattern for IPFS skatehive iframes
    const skatehivePatterns = [
      /<iframe[^>]*src=["'](https?:\/\/ipfs\.skatehive\.app\/ipfs\/[^"']+)["'][^>]*>/i,
      /<iframe[^>]*src=["']([^"']*ipfs\.skatehive\.app[^"']*)["'][^>]*>/i
    ];

    // Search for IPFS skatehive iframes
    for (const pattern of skatehivePatterns) {
      const matches = post.body.match(pattern);
      if (matches) {
        const url = matches[1];
        
        if (!mediaItems.has(url)) {
          mediaItems.add(url);
          result.push({
            type: 'iframe',
            url: url,
            iframeHtml: `<iframe 
              src="${url}?autoplay=1&controls=1&muted=1&loop=1&showinfo=1&modestbranding=1&playsinline=1"
              className="w-full h-full"
              style="aspect-ratio: 1/1;"
              allow="autoplay; fullscreen"
              frameborder="0"
            ></iframe>`
          });
        }
      }
    }

    // Process markdown images
    const markdownImagePattern = /!\[.*?\]\((.*?)\)/g;
    const markdownImages = [...post.body.matchAll(markdownImagePattern)];
    markdownImages.forEach(match => {
      const url = match[1].trim();
      if (url && !mediaItems.has(url) && SUPPORTED_IMAGE_TYPES.test(url)) {
        mediaItems.add(url);
        result.push({ type: 'image', url });
      }
    });

    const htmlImagePattern = /<img.*?src="(.*?)".*?>/g;
    const htmlImages = [...post.body.matchAll(htmlImagePattern)];
    htmlImages.forEach(match => {
      const url = match[1].trim();
      if (url && !mediaItems.has(url) && SUPPORTED_IMAGE_TYPES.test(url)) {
        mediaItems.add(url);
        result.push({ type: 'image', url });
      }
    });

    const urlPattern = /https?:\/\/[^\s<>"']+?\.(?:jpg|jpeg|gif|png|webp)(?:\?[^\s<>"']*)?/gi;
    const urlImages = [...post.body.matchAll(urlPattern)];
    urlImages.forEach(match => {
      const url = match[0].trim();
      if (url && !mediaItems.has(url)) {
        mediaItems.add(url);
        result.push({ type: 'image', url });
      }
    });

    try {
      const metadata = JSON.parse(post.json_metadata);
      const images = metadata.image || [];
      images.forEach((url: string) => {
        if (url && typeof url === 'string' && !mediaItems.has(url)) {
          mediaItems.add(url);
          result.push({ type: 'image', url });
        }
      });
    } catch (e) {
      console.warn('Error parsing json_metadata:', e);
    }

    return result;
  }
}