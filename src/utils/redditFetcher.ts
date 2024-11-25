import Snoowrap from 'snoowrap';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define interfaces
interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
}

interface RedditConfig {
  userAgent: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

// Validate environment variables
function validateEnvVars(): RedditConfig {
  const required = [
    'REDDIT_USER_AGENT',
    'REDDIT_CLIENT_ID',
    'REDDIT_CLIENT_SECRET',
    'REDDIT_USERNAME',
    'REDDIT_PASSWORD'
  ];

  for (const var_ of required) {
    if (!process.env[var_]) {
      throw new Error(`Missing required environment variable: ${var_}`);
    }
  }

  return {
    userAgent: process.env.REDDIT_USER_AGENT!,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    username: process.env.REDDIT_USERNAME!,
    password: process.env.REDDIT_PASSWORD!
  };
}

// Initialize Snoowrap client
function initializeReddit(): Snoowrap {
  const config = validateEnvVars();
  return new Snoowrap(config);
}

export async function fetchOllamaPosts(hours = 24): Promise<RedditPost[]> {
  try {
    const reddit = initializeReddit();
    
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - (hours * 60 * 60);

    const posts = await reddit.getSubreddit('ollama').getNew().fetch();

    return posts
      .filter(post => post.created_utc > cutoff)
      .map(post => ({
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        createdAt: new Date(post.created_utc * 1000),
        url: `https://reddit.com${post.permalink}`,
      }));

  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
}

// Example usage with error handling
async function main() {
  try {
    const ollamaPosts = await fetchOllamaPosts();
    console.log('Recent Ollama Posts:', ollamaPosts);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch posts:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}