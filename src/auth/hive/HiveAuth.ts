import { Client, PrivateKey } from '@hiveio/dhive';
import { NextApiRequest, NextApiResponse } from 'next';

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

  async getUserPosts(username: string, limit = 100): Promise<any[]> {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, postingKey } = req.body;

  try {
    const hiveAuth = new HiveAuth();
    const user = await hiveAuth.authenticateUser(username, postingKey);

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Hive auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}