import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PromptTemplate } from '@/lib/ai/types'

export async function fetchTemplates(category?: string) {
  const supabase = createClientComponentClient()
  
  let query = supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data as PromptTemplate[]
}

export async function createTemplate(template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select()
    .single()

  if (error) throw error
  return data as PromptTemplate
}

export async function updateTemplate(id: string, updates: Partial<PromptTemplate>) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as PromptTemplate
}

export async function deleteTemplate(id: string) {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) throw error
} 