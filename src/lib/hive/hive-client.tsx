import { Photo } from '@/photo/components/types';
import { Client, Discussion, PrivateKey } from '@hiveio/dhive';

const client = new Client(['https://api.hive.blog']);

interface PostsResponse {
  formattedPosts: Photo[];
  originalPosts: Discussion[];
}

interface HiveUser {
  id: string;
  name: string;
  posting_json_metadata: string;

  profile?: {
    profile_image?: string;
    name?: string;
    about?: string;
    location?: string;
    website?: string;
  }
}

export class HiveAuth {
  private client: Client;

  constructor() {
    this.client = new Client(['https://api.hive.blog']);
  }

  async authenticateUser(username: string, postingKey: string): Promise<HiveUser | null> {
    try {
      const [account] = await this.client.database.getAccounts([username]);

      if (!account) {
        return null;
      }

      try {
        const publicKey = PrivateKey.from(postingKey).createPublic();
        const postingPubKey = account.posting.key_auths[0][0];

        if (publicKey.toString() !== postingPubKey) {
          console.warn('Invalid posting key for user:', username);
          return null;
        }
      } catch (e) {
        console.warn('Invalid posting key format:', e);
        return null;
      }

      let profile = {};
      try {
        const metadata = JSON.parse(account.posting_json_metadata);
        profile = metadata.profile || {};
      } catch (e) {
        console.warn('Error parsing user metadata:', e);
      }

      return {
        id: account.id.toString(),
        name: username,
        posting_json_metadata: account.posting_json_metadata,
        profile
      };

    } catch (error) {
      console.error('Hive authentication error:', error);
      return null;
    }
  }

  async getUserPosts(username: string, limit = 20): Promise<any[]> {
    try {
      console.log(`Fetching posts for user: ${username}`);

      const startPermlink = '';
      const beforeDate = new Date().toISOString().split('.')[0];

      const posts = await this.client.database.call(
        'get_discussions_by_author_before_date',
        [username, startPermlink, beforeDate, limit]
      );

      console.log(`Posts found: ${posts.length}`);

      const validPosts = posts.filter((post: any) => {
        try {
          const metadata = JSON.parse(post.json_metadata);
          return metadata && (metadata.image || metadata.images);
        } catch (e) {
          console.warn('Invalid post metadata:', post.id);
          return false;
        }
      });

      console.log(`Valid posts with images: ${validPosts.length}`);
      return validPosts;

    } catch (error) {
      console.error('Detailed error when fetching posts:', error);
      return [];
    }
  }
}

export async function getPostsByAuthor(username: string, permlink?: string): Promise<PostsResponse> {
  try {
    let posts: Discussion[];
    
    if (permlink) {
      const post = await client.database.call('get_content', [username, permlink]);
      posts = [post as Discussion];
    } else {
      posts = await client.database.getDiscussions('blog', {
        tag: username,
        limit: 20
      });
    }

    const formattedPosts = posts.flatMap(post => {
      try {
        const metadata = JSON.parse(post.json_metadata || '{}');
        const postTags = metadata.tags || [];
        
        if (postTags.includes('hidden')) {
          return [];
        }

        const mediaItems = extractMedia(post.body);
        
        return [...mediaItems.images, ...mediaItems.videos].map(url => ({
          id: `${post.author}/${post.permlink}/${url}`,
          title: post.title,
          url: `/p/${post.author}/${post.permlink}`,
          type: getMediaType(url),
          src: url,
          blurData: '',
          takenAt: new Date(post.created),
          takenAtNaive: post.created,
          takenAtNaiveFormatted: new Date(post.created).toLocaleDateString(),
          updatedAt: new Date(post.last_update),
          createdAt: new Date(post.created),
          aspectRatio: 1.5,
          priority: false,
          tags: postTags,
          cameraKey: 'hive',
          camera: null,
          simulation: null,
          width: 0,
          height: 0,
          extension: url.split('.').pop() || '',
          author: post.author,
          permlink: post.permlink,
        } as Photo));
      } catch (error) {
        console.error('Error processing post:', error);
        return [];
      }
    });

    return {
      formattedPosts,
      originalPosts: posts
    };
  } catch (error) {
    console.error('Erro ao buscar posts do Hive:', error);
    return {
      formattedPosts: [],
      originalPosts: []
    };
  }
}

export async function getPostsByPermlink(author: string, permlink: string) {
  try {
    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_content',
        params: [author, permlink],
        id: 1
      })
    });

    const data = await response.json();
    const post = data.result;

    console.log('Post do Hive:', post);

    if (!post?.body) return [];

    let jsonMetadata;
    try {
      jsonMetadata = JSON.parse(post.json_metadata);
      console.log('JSON Metadata:', jsonMetadata); // Debug
    } catch (e) {
      console.warn('Erro ao parsear json_metadata');
    }

    const imageUrls = new Set<string>();

    if (jsonMetadata?.image?.length) {
      jsonMetadata.image.forEach((img: string) => imageUrls.add(img));
    }

    const bodyText = post.body;

    const patterns = [
      /!\[.*?\]\((https?:\/\/[^)]+)\)/g,  // Markdown
      /<img[^>]+src=["'](https?:\/\/[^"']+)["']/g,  // HTML
      /https?:\/\/[^\s<>"']+?\.(?:jpg|jpeg|gif|png|webp)/g,  // URLs diretas
      /https?:\/\/ipfs\.skatehive\.app\/ipfs\/[a-zA-Z0-9]+/g  // IPFS específico
    ];

    patterns.forEach(pattern => {
      const matches = bodyText.matchAll(pattern);
      for (const match of matches) {
        const url = match[1] || match[0];
        imageUrls.add(url);
      }
    });

    const medias = Array.from(imageUrls).map(url => {
      const ipfsHash = url.includes('ipfs/') ? url.split('ipfs/').pop() : url;
      return {
        ipfsHash,
        title: post.title,
        author: post.author
      };
    });

    // Debug
    console.log('Imagens encontradas:', medias);

    return medias;

  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return [];
  }
}

export async function getPost(author: string, permlink: string): Promise<Discussion | null> {
  try {
    const post = await client.database.call('get_content', [author, permlink]);

    if (!post || !post.body) {
      return null;
    }

    return post as Discussion;
  } catch (error) {
    console.error('Erro ao buscar post do Hive:', error);
    return null;
  }
}

export function extractMedia(body: string) {
  const images = extractImages(body);
  const videos = extractVideos(body);
  return { images, videos };
}

function extractImages(body: string): string[] {
  const patterns = [
    /https?:\/\/[^\s<>"']+?\.(?:jpg|jpeg|gif|png|webp)(?:\?[^\s<>"']*)?/gi,
    /!\[.*?\]\((.*?)\)/g,
    /<img.*?src=["'](.*?)["']/g
  ];

  const images = new Set<string>();
  let match;

  patterns.forEach(pattern => {
    while ((match = pattern.exec(body)) !== null) {
      try {
        const url = match[1] || match[0];
        if (url.match(/\.(jpg|jpeg|gif|png|webp)(\?.*)?$/i)) {
          images.add(url);
        }
      } catch (e) {
        console.error('Erro ao processar URL de imagem:', e);
      }
    }
  });

  return Array.from(images);
}

function extractVideos(body: string): string[] {
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    /https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/g,
    /https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/g
  ];

  const videoIds = new Set<string>();

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(body)) !== null) {
      videoIds.add(match[1]);
    }
  });

  return Array.from(videoIds);
}

function getMediaType(url: string): string {
  if (url.includes('ipfs.skatehive.app/ipfs/')) {
    return 'iframe';
  }

  const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/);
  if (isVideo) return 'video';

  return 'photo';
}
