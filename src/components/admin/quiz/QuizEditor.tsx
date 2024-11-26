import { toast } from '@/hooks/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { ImageUpload } from '@/components/ui/image-upload'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { checkAdminStatus } from '@/lib/supabase/client'
import { useState, useEffect, ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

interface User {
  id: string
  email?: string
  role?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string | null
  education_system_id?: string
  created_at?: string
  updated_at?: string
}

interface EducationSystem {
  id: string
  name: string
  slug: string
  description?: string
}

interface QuizEditorProps {
  quizId?: string
}

interface FormData {
  title: string
  description: string
  category: string
  subCategory: string
  educationSystem: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeLimit: number
  passingScore: number
  imageUrl?: string
}

export function QuizEditor({ quizId }: QuizEditorProps) {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  
  // Form setup
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    educationSystem: '',
    difficulty: 'beginner',
    timeLimit: 30,
    passingScore: 70,
    imageUrl: ''
  })

  // State
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [educationSystems, setEducationSystems] = useState<EducationSystem[]>([])
  const [selectedEducationSystem, setSelectedEducationSystem] = useState<string>('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isCreatingSubCategory, setIsCreatingSubCategory] = useState(false)
  const [isCreatingEducationSystem, setIsCreatingEducationSystem] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newSubCategoryName, setNewSubCategoryName] = useState('')
  const [newSubCategoryDescription, setNewSubCategoryDescription] = useState('')
  const [newEducationSystemName, setNewEducationSystemName] = useState('')
  const [newEducationSystemDescription, setNewEducationSystemDescription] = useState('')

  // Auth check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await checkAdminStatus()
        if (!user) {
          router.push('/auth/admin/login')
          return
        }
        setUser(user)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/auth/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router])

  // Fetch education systems
  useEffect(() => {
    let isMounted = true

    const fetchEducationSystems = async () => {
      try {
        const { data: educationSystemsData, error } = await supabase
          .from('education_systems')
          .select('*')
          .order('name')

        if (error) throw error

        if (isMounted && educationSystemsData) {
          setEducationSystems(educationSystemsData)
        }
      } catch (error) {
        console.error('Error fetching education systems:', error)
      }
    }

    fetchEducationSystems()

    return () => {
      isMounted = false
    }
  }, [supabase])

  // Update categories fetch to filter by education system
  useEffect(() => {
    let isMounted = true

    const fetchCategories = async () => {
      if (!selectedEducationSystem) {
        setCategories([])
        return
      }

      try {
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('*')
          .eq('education_system_id', selectedEducationSystem)
          .is('parent_id', null)
          .order('name')

        if (error) throw error

        if (isMounted && categoriesData) {
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()

    return () => {
      isMounted = false
    }
  }, [selectedEducationSystem, supabase])

  // Fetch subcategories based on selected category
  useEffect(() => {
    let isMounted = true

    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategories([])
        return
      }

      try {
        const { data: subCategoriesData, error } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', selectedCategory)
          .order('name')

        if (error) throw error

        if (isMounted && subCategoriesData) {
          setSubCategories(subCategoriesData)
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error)
      }
    }

    fetchSubCategories()

    return () => {
      isMounted = false
    }
  }, [selectedCategory, supabase])

  // Handle category change
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedCategory(value)
    // Reset sub-category when category changes
    setFormData((prev) => ({ ...prev, subCategory: '' }))
  }

  // Handle education system change
  const handleEducationSystemChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedEducationSystem(value)
    // Reset category and sub-category when education system changes
    setSelectedCategory('')
    setFormData((prev) => ({ ...prev, category: '', subCategory: '' }))
  }

  // Image upload handler
  const handleImageUpload = async (file: File): Promise<void> => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload images",
          variant: "destructive"
        })
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("File size must be less than 2MB")
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error("File must be an image (JPEG, PNG, or WebP)")
      }

      // Create unique filename
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${timestamp}.${fileExt}`
      const filePath = `quiz-covers/${fileName}`

      // Delete old image if exists and updating
      if (formData.imageUrl) {
        const oldPath = formData.imageUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('quiz-assets')
            .remove([`quiz-covers/${oldPath}`])
        }
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('quiz-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quiz-assets')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      setFormData(prev => ({ ...prev, imageUrl: publicUrl }))
    } catch (error) {
      const err = error as Error
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!formData.title || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const quizData = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      if (quizId) {
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', quizId)

        if (error) throw error

        toast({
          title: "Success",
          description: "Quiz updated successfully"
        })
      } else {
        const { error } = await supabase
          .from('quizzes')
          .insert([{ ...quizData, created_at: new Date().toISOString() }])

        if (error) throw error

        toast({
          title: "Success",
          description: "Quiz created successfully"
        })
      }

      router.push('/dashboard/quizzes')
    } catch (error) {
      const err = error as Error | SupabaseError
      toast({
        title: "Error",
        description: 'message' in err ? err.message : "Failed to save quiz",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to create new category
  const handleCreateCategory = async () => {
    try {
      if (!selectedEducationSystem) {
        toast({
          title: "Error",
          description: "Please select an education system first",
          variant: "destructive"
        })
        return
      }

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert([{
          name: newCategoryName,
          description: newCategoryDescription,
          education_system_id: selectedEducationSystem,
          slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
          parent_id: null
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Category created successfully"
      })

      // Update categories list
      setCategories(prev => [...prev, newCategory])
      // Select the new category
      setSelectedCategory(newCategory.id)
      setFormData((prev) => ({ ...prev, category: newCategory.id }))
      // Reset form
      setNewCategoryName('')
      setNewCategoryDescription('')
      setIsCreatingCategory(false)
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      })
    }
  }

  // Function to create new sub-category
  const handleCreateSubCategory = async () => {
    try {
      if (!selectedCategory) {
        toast({
          title: "Error",
          description: "Please select a main category first",
          variant: "destructive"
        })
        return
      }

      const { data: newSubCategory, error } = await supabase
        .from('categories')
        .insert([{
          name: newSubCategoryName,
          description: newSubCategoryDescription,
          education_system_id: selectedEducationSystem,
          slug: newSubCategoryName.toLowerCase().replace(/\s+/g, '-'),
          parent_id: selectedCategory
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Sub-category created successfully"
      })

      // Update sub-categories list
      setSubCategories(prev => [...prev, newSubCategory])
      // Select the new sub-category
      setFormData((prev) => ({ ...prev, subCategory: newSubCategory.id }))
      // Reset form
      setNewSubCategoryName('')
      setNewSubCategoryDescription('')
      setIsCreatingSubCategory(false)
    } catch (error) {
      console.error('Error creating sub-category:', error)
      toast({
        title: "Error",
        description: "Failed to create sub-category",
        variant: "destructive"
      })
    }
  }

  // Function to create new education system
  const handleCreateEducationSystem = async () => {
    try {
      if (!newEducationSystemName) {
        toast({
          title: "Error",
          description: "Education system name is required",
          variant: "destructive"
        })
        return
      }

      const { data: newEducationSystem, error } = await supabase
        .from('education_systems')
        .insert([{
          name: newEducationSystemName,
          description: newEducationSystemDescription || null,
          slug: newEducationSystemName.toLowerCase().replace(/\s+/g, '-'),
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Education system created successfully"
      })

      // Update education systems list
      setEducationSystems(prev => [...prev, newEducationSystem])
      // Select the new education system
      setSelectedEducationSystem(newEducationSystem.id)
      setFormData((prev) => ({ ...prev, educationSystem: newEducationSystem.id }))
      // Reset form
      setNewEducationSystemName('')
      setNewEducationSystemDescription('')
      setIsCreatingEducationSystem(false)
    } catch (error) {
      console.error('Error creating education system:', error)
      toast({
        title: "Error",
        description: "Failed to create education system",
        variant: "destructive"
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
        </div>
      </div>
    )
  }

  // Render form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {quizId ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Quiz Cover Image</Label>
          <div className="space-y-2">
            {imageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Quiz cover"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            )}
            <ImageUpload
              endpoint="imageUploader"
              onUpload={handleImageUpload}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Recommended: 1200x630px. Max size: 2MB. Supported formats: JPEG, PNG, WebP
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Education System</label>
          <div className="flex gap-2">
            <select
              value={formData.educationSystem}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setIsCreatingEducationSystem(true)
                  return
                }
                handleEducationSystemChange(e)
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select education system</option>
              {educationSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
              <option value="new">+ Create New Education System</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsCreatingCategory(true)
                    return
                  }
                  handleCategoryChange(e)
                }}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedEducationSystem}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="new">+ Create New Category</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sub Category</label>
            <div className="flex gap-2">
              <select
                value={formData.subCategory}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsCreatingSubCategory(true)
                    return
                  }
                  setFormData((prev) => ({ ...prev, subCategory: e.target.value }))
                }}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedCategory}
              >
                <option value="">Select sub category</option>
                {subCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="new">+ Create New Sub-Category</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
          <Input 
            type="number" 
            min="1"
            value={formData.timeLimit}
            onChange={(e) => setFormData((prev) => ({ ...prev, timeLimit: e.target.value }))}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !formData.title || !formData.category}
        className="w-full"
      >
        {isSubmitting ? 'Saving...' : quizId ? 'Update Quiz' : 'Create Quiz'}
      </Button>

      {/* Create Category Dialog */}
      <Dialog open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Enter category description"
              />
            </div>
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCategoryName}
            >
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Sub-Category Dialog */}
      <Dialog open={isCreatingSubCategory} onOpenChange={setIsCreatingSubCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sub-Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder="Enter sub-category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newSubCategoryDescription}
                onChange={(e) => setNewSubCategoryDescription(e.target.value)}
                placeholder="Enter sub-category description"
              />
            </div>
            <Button
              type="button"
              onClick={handleCreateSubCategory}
              disabled={!newSubCategoryName}
            >
              Create Sub-Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Education System Dialog */}
      <Dialog open={isCreatingEducationSystem} onOpenChange={setIsCreatingEducationSystem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Education System</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newEducationSystemName}
                onChange={(e) => setNewEducationSystemName(e.target.value)}
                placeholder="Enter education system name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newEducationSystemDescription}
                onChange={(e) => setNewEducationSystemDescription(e.target.value)}
                placeholder="Enter education system description"
              />
            </div>
            <Button
              type="button"
              onClick={handleCreateEducationSystem}
              disabled={!newEducationSystemName}
            >
              Create Education System
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}