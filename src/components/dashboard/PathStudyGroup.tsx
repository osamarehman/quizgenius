'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAchievements } from "@/contexts/AchievementContext"
import {
  Users,
  MessageSquare,
  Share2,
  Calendar,
  Plus,
  Video,
  UserPlus,
  Settings
} from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  avatar?: string
  role: 'leader' | 'member'
  status: 'online' | 'offline' | 'studying'
  lastActive?: string
}

interface StudySession {
  id: string
  title: string
  date: string
  duration: number
  type: 'group' | 'pair' | 'lecture'
  participants: GroupMember[]
}

interface PathStudyGroupProps {
  pathId: string
  groupId: string
  members: GroupMember[]
  sessions: StudySession[]
  onCreateSession: (session: Omit<StudySession, 'id'>) => Promise<void>
  onInviteMember: (email: string) => Promise<void>
  onJoinSession: (sessionId: string) => Promise<void>
}

export function PathStudyGroup({
  pathId,
  groupId,
  members,
  sessions,
  onCreateSession,
  onInviteMember,
  onJoinSession
}: PathStudyGroupProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [newSession, setNewSession] = useState({
    title: '',
    date: '',
    duration: 60,
    type: 'group' as const
  })
  const { toast } = useToast()
  const { checkAchievement } = useAchievements()

  const handleInviteMember = async () => {
    if (!inviteEmail) return

    try {
      await onInviteMember(inviteEmail)
      
      // Check for social achievements
      await checkAchievement('GROUP_INTERACTION', {
        pathId,
        groupId,
        action: 'invite',
        memberCount: members.length + 1
      })

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      })
      setInviteEmail('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    }
  }

  const handleCreateSession = async () => {
    try {
      await onCreateSession({
        ...newSession,
        participants: [members[0]] // Add current user as first participant
      })

      // Check for session creation achievements
      await checkAchievement('GROUP_SESSION', {
        pathId,
        groupId,
        sessionCount: sessions.length + 1,
        sessionType: newSession.type
      })

      toast({
        title: "Success",
        description: "Study session created successfully",
      })
      setShowCreateSession(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'studying':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Study Group</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateSession(!showCreateSession)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          <h3 className="font-medium">Members ({members.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                        getStatusColor(member.status)
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="space-y-4">
          <h3 className="font-medium">Upcoming Sessions</h3>
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{session.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div>{session.duration} min</div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.participants.length}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onJoinSession(session.id)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Create Session Form */}
        {showCreateSession && (
          <Card className="p-4 border-2 border-primary">
            <div className="space-y-4">
              <Input
                placeholder="Session title..."
                value={newSession.title}
                onChange={(e) => setNewSession(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  value={newSession.date}
                  onChange={(e) => setNewSession(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
                />
                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newSession.duration}
                  onChange={(e) => setNewSession(prev => ({
                    ...prev,
                    duration: parseInt(e.target.value)
                  }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateSession(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateSession}>
                  Create Session
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  )
} 