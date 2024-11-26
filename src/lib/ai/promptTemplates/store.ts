import { create } from 'zustand'
import { PromptTemplate } from '@/lib/ai/types'
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/api/templates'

interface PromptTemplateStore {
  templates: PromptTemplate[]
  isLoading: boolean
  error: Error | null
  fetchTemplates: (category?: string) => Promise<void>
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTemplate: (id: string, template: Partial<PromptTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
}

export const usePromptTemplates = create<PromptTemplateStore>((set) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async (category?: string) => {
    try {
      set({ isLoading: true, error: null })
      const templates = await fetchTemplates(category)
      set({ templates, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  addTemplate: async (template) => {
    try {
      set({ isLoading: true, error: null })
      const newTemplate = await createTemplate(template)
      set(state => ({ 
        templates: [...state.templates, newTemplate],
        isLoading: false 
      }))
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  updateTemplate: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })
      const updatedTemplate = await updateTemplate(id, updates)
      set(state => ({
        templates: state.templates.map(t => 
          t.id === id ? updatedTemplate : t
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  deleteTemplate: async (id) => {
    try {
      set({ isLoading: true, error: null })
      await deleteTemplate(id)
      set(state => ({
        templates: state.templates.filter(t => t.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  }
})) 