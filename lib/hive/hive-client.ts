import { Client } from '@hiveio/dhive';

const HIVE_NODES = [
  'https://api.openhive.network',
  'https://rpc.ecency.com',
  'https://hived.emre.sh',
  'https://api.hive.blog',
  'https://api.hivekings.com'
];

const TIMEOUT = 5000; // 5 seconds timeout

async function fetchWithTimeout(url: string, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

let workingClient: Client | null = null;

async function testNode(client: Client): Promise<boolean> {
  try {
    const startTime = Date.now();
    
   // Quick connection test
    const props = await Promise.race([
      client.database.getDynamicGlobalProperties(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT)
      )
    ]);

   // If it took too long, consider it a failure
    if (Date.now() - startTime > TIMEOUT) {
      console.warn('Node very slow');
      return false;
    }

    // Test the posts functionality
    const testResult = await Promise.race([
      client.database.getDiscussions('blog', {
        tag: 'hive',
        limit: 1
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT)
      )
    ]);

    return Array.isArray(testResult) && testResult.length > 0;
  } catch (error) {
    console.warn('Node test failed:', error.message);
    return false;
  }
}

export async function createWorkingClient(): Promise<Client> {
  if (workingClient) {
    try {
      const isWorking = await testNode(workingClient);
      if (isWorking) {
        return workingClient;
      }
    } catch {
      workingClient = null;
    }
  }

// Shuffle the list of nodes to distribute the load
  const shuffledNodes = [...HIVE_NODES].sort(() => Math.random() - 0.5);

  for (const node of shuffledNodes) {
    try {
      console.log(`Trying to connect to node: ${node}`);
      const client = new Client(node, { timeout: TIMEOUT });
      
      const isWorking = await testNode(client);
      if (isWorking) {
        console.log(`✅  ${node} is working correctly`);
        workingClient = client;
        return client;
      }
      console.warn(`❌  ${node} failed tests`);
    } catch (error) {
      console.warn(`❌ Failed to connect to ${node}: ${error.message}`);
    }
  }
  
  throw new Error('Unable to find a working Hive node after trying all nodes');
}

export async function getPostsByAuthor(username: string) {
  const client = await createWorkingClient();
  try {
    const posts = await client.database.getDiscussions('blog', {
      tag: username,
   
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}