import snoowrap from 'snoowrap'
import { redditConfig } from './config'

// Reddit API client singleton
let redditClient: snoowrap | null = null

export function getRedditClient() {
  if (!redditClient) {
   

    redditClient = new snoowrap({
      userAgent: 'usermughal',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: "iPhone7plus123!@#"
    })

    // Configure snoowrap
    redditClient.config({
      requestDelay: 1000,
      continueAfterRatelimitError: true,
      retryErrorCodes: [502, 503, 504, 522],
      maxRetryAttempts: 3
    })
  }
  return redditClient
}

export async function searchReddit(
  query: string, 
  subreddit: string | null | undefined, 
  timeFilter: string = 'all', 
  sort: string = 'relevance'
) {
  const reddit = getRedditClient()
  
  try {
    let searchOptions: any = {
      query,
      time: timeFilter,
      sort,
      limit: 25
    }

    let posts
    if (subreddit && subreddit !== 'all') {
      posts = await reddit.getSubreddit(subreddit).search(searchOptions)
    } else {
      posts = await reddit.search(searchOptions)
    }

    return formatPosts(posts)
  } catch (error) {
    console.error('Reddit search error:', error)
    throw error
  }
}

export async function getSubreddits(where: 'popular' | 'new' = 'popular', limit: number = 25) {
  const reddit = getRedditClient()
  try {
    let subreddits
    if (where === 'popular') {
      subreddits = await reddit.getPopularSubreddits({ limit })
    } else {
      subreddits = await reddit.getNewSubreddits({ limit })
    }
    return subreddits
  } catch (error) {
    console.error('Error fetching subreddits:', error)
    throw error
  }
}

async function formatPosts(posts: any[]) {
  return Promise.all(posts.map(async (post) => {
    const fullPost = await post.fetch()
    return {
      id: fullPost.id,
      title: fullPost.title,
      selftext: fullPost.selftext,
      created_utc: fullPost.created_utc,
      subreddit: fullPost.subreddit.display_name,
      url: fullPost.url,
      score: fullPost.score,
      num_comments: fullPost.num_comments,
      preview_text: fullPost.selftext.substring(0, 200) + '...',
      author: fullPost.author.name
    }
  }))
}

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'hot', label: 'Hot' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'comments', label: 'Most Comments' }
]

export const TIME_FILTERS = [
  { value: 'hour', label: 'Past Hour' },
  { value: 'day', label: 'Past 24 Hours' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'year', label: 'Past Year' },
  { value: 'all', label: 'All Time' }
]

export const SUPPORTED_SUBREDDITS = [
  'olevels',
  'gcse',
  'alevel',
  'ExamQuestions',
  'askscience',
  'learnmath',
  'chemistry',
  'biology',
  'physics'
] as const 