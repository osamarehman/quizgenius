import snoowrap from 'snoowrap'

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

export interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  score: number
  created_utc: number
  subreddit: string
  permalink: string
  url: string
}

export interface RedditComment {
  id: string
  body: string
  author: string
  score: number
  created_utc: number
  replies?: RedditComment[]
}

interface RedditSearchResponse {
  data: {
    children: Array<{
      data: RedditPost
    }>
  }
}

interface RedditCommentResponse {
  data: {
    children: Array<{
      data: RedditComment
    }>
  }
}

export async function searchReddit(
  query: string, 
  subreddit: string | null | undefined, 
  timeFilter: string = 'all', 
  sort: string = 'relevance'
): Promise<RedditPost[]> {
  const client = await getRedditClient()
  const response = await client.get<RedditSearchResponse>('/search.json', {
    params: {
      q: query,
      restrict_sr: subreddit ? 1 : 0,
      t: timeFilter,
      sort,
      limit: 25,
      ...(subreddit && { subreddit })
    }
  })
  return response.data.data.children.map(child => child.data)
}

export async function getRedditComments(
  postId: string,
  subreddit: string
): Promise<RedditComment[]> {
  const client = await getRedditClient()
  const response = await client.get<[RedditSearchResponse, RedditCommentResponse]>(
    `/r/${subreddit}/comments/${postId}.json`
  )
  return response.data[1].data.children
    .map(child => child.data)
    .filter(comment => comment.body && comment.author)
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