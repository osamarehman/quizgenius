import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { sql } from '@vercel/postgres'

export async function addTemplateTag(templateId: string, tag: string) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('templates')
    .update({
      tags: sql`array_append(tags, ${tag})`
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeTemplateTag(templateId: string, tag: string) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('templates')
    .update({
      tags: sql`array_remove(tags, ${tag})`
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTemplateCategory(templateId: string, category: string) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('templates')
    .update({ category })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTemplatesByCategory(category: string) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('category', category)

  if (error) throw error
  return data
}

export async function searchTemplatesByTags(tags: string[]) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .contains('tags', tags)

  if (error) throw error
  return data
} 