import { NextResponse } from 'next/server'
import { searchReddit } from '@/lib/reddit/client'
import { redditConfig } from '@/lib/reddit/config'

export async function GET(request: Request) {
  // Verify credentials are available
  if (!redditConfig.clientId || 
      !redditConfig.clientSecret || 
      !redditConfig.username || 
      !redditConfig.password) {
    return NextResponse.json(
      { message: 'Reddit API credentials not configured' },
      { status: 500 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const subreddit = searchParams.get('subreddit')
    const timeFilter = (searchParams.get('time') || 'all') as 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
    const sortBy = searchParams.get('sort') || 'relevance'

    if (!query) {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      )
    }

    const posts = await searchReddit(query, subreddit, timeFilter, sortBy)
    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Reddit search error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to search Reddit', 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
} 