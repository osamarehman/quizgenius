import { PromptTemplate } from '../types'

interface ExportedTemplate {
  version: 1
  templates: PromptTemplate[]
  metadata: {
    exportedAt: string
    exportedBy: string
  }
}

export function exportTemplates(templates: PromptTemplate[]): string {
  const exportData: ExportedTemplate = {
    version: 1,
    templates,
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'user' // Replace with actual user ID
    }
  }

  return JSON.stringify(exportData, null, 2)
}

export async function importTemplates(jsonData: string): Promise<PromptTemplate[]> {
  try {
    const importData: ExportedTemplate = JSON.parse(jsonData)
    
    // Validate version
    if (importData.version !== 1) {
      throw new Error('Unsupported template format version')
    }

    // Validate structure
    if (!Array.isArray(importData.templates)) {
      throw new Error('Invalid template format')
    }

    const supabase = createClientComponentClient()

    // Import templates
    const { data, error } = await supabase
      .from('templates')
      .insert(
        importData.templates.map(template => ({
          ...template,
          id: undefined, // Let DB generate new IDs
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select()

    if (error) throw error
    return data

  } catch (error) {
    throw new Error(`Failed to import templates: ${error.message}`)
  }
} 