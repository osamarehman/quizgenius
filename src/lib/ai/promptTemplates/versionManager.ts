import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PromptTemplate } from '../types'


export async function createTemplateVersion(
  templateId: string,
  changes: string
): Promise<PromptTemplate> {
  const supabase = createClientComponentClient()

  // Get current template
  const { data: currentTemplate } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (!currentTemplate) {
    throw new Error('Template not found')
  }

  // Create new version
  const { data: newVersion, error } = await supabase
    .from('templates')
    .insert({
      ...currentTemplate,
      id: undefined, // Let DB generate new ID
      parent_id: templateId,
      version: currentTemplate.version + 1,
      metadata: {
        ...currentTemplate.metadata,
        versionHistory: [
          ...(currentTemplate.metadata?.versionHistory || []),
          {
            version: currentTemplate.version,
            changes,
            createdAt: new Date().toISOString(),
            createdBy: (await supabase.auth.getUser()).data.user?.id
          }
        ]
      }
    })
    .select()
    .single()

  if (error) throw error
  return newVersion
}

export async function getTemplateVersions(templateId: string) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .or(`id.eq.${templateId},parent_id.eq.${templateId}`)
    .order('version', { ascending: false })

  if (error) throw error
  return data
} 