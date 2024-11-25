import { Button } from '@/components/ui/button'
import { GitBranchPlus, X } from 'lucide-react'

export function SocialLoginButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="outline" onClick={() => {/* TODO: Implement GitHub login */}}>
        <GitBranchPlus className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button variant="outline" onClick={() => {/* TODO: Implement Twitter login */}}>
        <X className="mr-2 h-4 w-4" />
        Twitter
      </Button>
    </div>
  )
}