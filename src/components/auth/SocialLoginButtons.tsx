import { Button } from '@/components/ui/button'
import { GitBranchPlus, X } from 'lucide-react'

export function SocialLoginButtons() {
  const handleGitHubLogin = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      });
      if (error) {
        console.error('GitHub login error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('GitHub login error:', error);
      throw error;
    }
  }

  const handleTwitterLogin = async (): Promise<void> => {
    try {
      // Placeholder for Twitter login implementation
      console.log('Twitter login not yet implemented')
    } catch (error) {
      console.error('Twitter login failed:', error)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="outline" onClick={handleGitHubLogin}>
        <GitBranchPlus className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button variant="outline" onClick={handleTwitterLogin}>
        <X className="mr-2 h-4 w-4" />
        Twitter
      </Button>
    </div>
  )
}