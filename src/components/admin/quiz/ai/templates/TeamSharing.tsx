'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Users, Shield, UserPlus, UserMinus } from 'lucide-react'

type Permission = 'view' | 'edit' | 'manage'

interface TeamMember {
  id: string
  email: string
  permission: Permission
  avatar?: string
}

interface TeamSharingProps {
  templateId: string
  members: TeamMember[]
  onUpdate: (members: TeamMember[]) => void
}

export function TeamSharing({ templateId, members, onUpdate }: TeamSharingProps) {
  const [email, setEmail] = useState('')
  const [selectedPermission, setSelectedPermission] = useState<Permission>('view')
  const [isInviting, setIsInviting] = useState(false)
  const { toast } = useToast()

  const handleInvite = async () => {
    try {
      setIsInviting(true)
      // Add new team member
      const newMember: TeamMember = {
        id: Date.now().toString(), // Replace with actual user ID
        email,
        permission: selectedPermission
      }

      onUpdate([...members, newMember])
      setEmail('')
      setSelectedPermission('view')

      toast({
        title: "Success",
        description: "Team member added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handlePermissionChange = (memberId: string, permission: Permission) => {
    const updatedMembers = members.map(member =>
      member.id === memberId ? { ...member, permission } : member
    )
    onUpdate(updatedMembers)
  }

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = members.filter(member => member.id !== memberId)
    onUpdate(updatedMembers)
  }

  const getPermissionBadgeColor = (permission: Permission) => {
    switch (permission) {
      case 'manage':
        return 'bg-purple-100 text-purple-800'
      case 'edit':
        return 'bg-blue-100 text-blue-800'
      case 'view':
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">Team Access</h3>
          <p className="text-sm text-muted-foreground">
            Manage team members and their permissions
          </p>
        </div>
        <Users className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Invite Form */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select
          value={selectedPermission}
          onValueChange={(value: Permission) => setSelectedPermission(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Permission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="edit">Edit</SelectItem>
            <SelectItem value="manage">Manage</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleInvite}
          disabled={!email || isInviting}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <Users className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{member.email}</p>
                  <Badge className={getPermissionBadgeColor(member.permission)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {member.permission}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={member.permission}
                  onValueChange={(value: Permission) => 
                    handlePermissionChange(member.id, value)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="manage">Manage</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <UserMinus className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
} 