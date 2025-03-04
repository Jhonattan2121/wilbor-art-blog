interface MediaContent {
  type: 'image' | 'video';
  url: string;
  thumbnailSrc?: string;
}

export class MarkdownRenderer {
  static extractMediaFromHive(post: any): MediaContent[] {
    const mediaItems: MediaContent[] = [];

    if (!post?.body) return [];

    // Extract images from markdown
    const imagePattern = /!\[.*?\]\((.*?)\)/g;
    const images = [...post.body.matchAll(imagePattern)].map(match => match[1]);

    // Extract direct image URLs
    const directImagePattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gi;
    const directImages = [...post.body.matchAll(directImagePattern)].map(match => match[1]);

    // Add found images
    [...new Set([...images, ...directImages])].forEach(url => {
      mediaItems.push({
        type: 'image',
        url: url
      });
    });

    // Extract YouTube videos
    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/g;
    const youtubeMatches = [...post.body.matchAll(youtubePattern)];
    youtubeMatches.forEach(match => {
      const videoId = match[1];
      mediaItems.push({
        type: 'video',
        url: `https://www.youtube.com/embed/${videoId}`,
        thumbnailSrc: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      });
    });

    // Extract Skatehype videos
    const skatehypePattern = /skatehype\.com\/(?:ifplay\.php\?v=|v\/[^\/]+\/)(\d+)/g;
    const skatehypeMatches = [...post.body.matchAll(skatehypePattern)];
    skatehypeMatches.forEach(match => {
      const videoId = match[1];
      mediaItems.push({
        type: 'video',
        url: `https://www.skatehype.com/ifplay.php?v=${videoId}`,
        thumbnailSrc: `https://www.skatehype.com/tempimg/wilbor-${videoId}-hive.jpg`
      });
    });

    return mediaItems;
  }
}