import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SharingOptions {
  templateId: string
  userIds?: string[]
  isPublic?: boolean
}

export async function shareTemplate({
  templateId,
  userIds = [],
  isPublic = false
}: SharingOptions) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('templates')
    .update({
      shared_with: userIds,
      is_public: isPublic
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSharedTemplates() {
  const supabase = createClientComponentClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .or(`is_public.eq.true,shared_with.cs.{${user.id}}`)

  if (error) throw error
  return data
} 