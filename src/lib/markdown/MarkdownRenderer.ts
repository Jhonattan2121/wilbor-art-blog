interface MediaContent {
  type: 'image' | 'video' | 'iframe';
  url: string;
  thumbnailSrc?: string;
  iframeHtml?: string;
}

const PINATA_GATEWAY = 'https://lime-useful-snake-714.mypinata.cloud';
const SUPPORTED_IMAGE_TYPES = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)$/i;
const SUPPORTED_VIDEO_TYPES = /\.(mp4|webm|ogg|mov|avi|m4v)$/i;

export class MarkdownRenderer {
  static extractMediaFromHive(post: any): MediaContent[] {
    const mediaItems: Set<string> = new Set();
    const result: MediaContent[] = [];

    if (!post?.body) return [];

    const threeSpeakPatterns = [
      /<center><iframe.*?src="(https:\/\/3speak\.tv\/embed\?v=.*?)".*?><\/iframe><\/center>/g,
      /<iframe.*?src="(https:\/\/3speak\.tv\/embed\?v=.*?)".*?><\/iframe>/g,
      /\[3speak\](.*?)\[\/3speak\]/g,
      /https:\/\/3speak\.tv\/watch\?v=([\w\d\.-]+\/[\w\d\.-]+)/g
    ];

    let videoFound = false;
    for (const pattern of threeSpeakPatterns) {
      if (videoFound) break;
      
      const matches = [...post.body.matchAll(pattern)];
      for (const match of matches) {
        let videoId = match[1];
        
        if (videoId?.includes('3speak.tv')) {
          videoId = videoId.includes('embed?v=')
            ? videoId.split('embed?v=')[1]
            : videoId.split('watch?v=')[1];
        }

        const cleanVideoId = videoId?.split('&')[0]?.trim();
        
        if (cleanVideoId && !mediaItems.has(cleanVideoId)) {
          mediaItems.add(cleanVideoId);
          result.push({
            type: 'iframe',
            url: `https://3speak.tv/embed?v=${cleanVideoId}`,
            iframeHtml: `<iframe src="https://3speak.tv/embed?v=${cleanVideoId}" allowfullscreen></iframe>`
          });
          videoFound = true;
          break;
        }
      }
    }

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
      console.warn('Erro ao parsear json_metadata:', e);
    }

    console.log('Total de mídia encontrada:', {
      videos: result.filter(item => item.type === 'iframe').length,
      imagens: result.filter(item => item.type === 'image').length
    });

    return result;
  }
}