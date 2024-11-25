'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { checkAdminStatus } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  education_system_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface EducationSystem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  time_limit: z.string().transform((val) => parseInt(val, 10)).refine((val) => val >= 1, 'Time limit must be at least 1 minute'),
  category_id: z.string().min(1, 'Category is required'),
  sub_category_id: z.string().min(1, 'Sub-category is required'),
  education_system_id: z.string().min(1, 'Education system is required'),
})

type QuizFormValues = z.infer<typeof quizSchema>

interface QuizEditorProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    time_limit: number;
    image_url?: string;
    category_id?: string;
    education_system_id?: string;
  }
}

// Add interfaces for new category creation
interface NewCategoryFormData {
  name: string;
  description?: string;
  education_system_id: string;
}

interface NewSubCategoryFormData {
  name: string;
  description?: string;
  parent_id: string;
}

interface NewEducationSystemFormData {
  name: string;
  description?: string;
  slug?: string;
}

export function QuizEditor({ initialData }: QuizEditorProps) {
  const router = useRouter()
  
  // Form setup
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      time_limit: initialData?.time_limit?.toString() || '30',
      category_id: initialData?.category_id || '',
      sub_category_id: initialData?.sub_category_id || '',
      education_system_id: initialData?.education_system_id || '',
    }
  })

  // State
  const [imageUrl, setImageUrl] = React.useState<string>(initialData?.image_url || '')
  const [uploading, setUploading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [user, setUser] = React.useState<any>(null)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [subCategories, setSubCategories] = React.useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<string>(
    initialData?.category_id || ''
  )
  const [educationSystems, setEducationSystems] = React.useState<EducationSystem[]>([])
  const [selectedEducationSystem, setSelectedEducationSystem] = React.useState<string>(
    initialData?.education_system_id || ''
  )

  // Add states for new category creation
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false)
  const [isCreatingSubCategory, setIsCreatingSubCategory] = React.useState(false)
  const [newCategoryName, setNewCategoryName] = React.useState('')
  const [newCategoryDescription, setNewCategoryDescription] = React.useState('')
  const [newSubCategoryName, setNewSubCategoryName] = React.useState('')
  const [newSubCategoryDescription, setNewSubCategoryDescription] = React.useState('')

  // Add state for new education system
  const [isCreatingEducationSystem, setIsCreatingEducationSystem] = React.useState(false)
  const [newEducationSystemName, setNewEducationSystemName] = React.useState('')
  const [newEducationSystemDescription, setNewEducationSystemDescription] = React.useState('')

  // Auth check
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const adminUser = await checkAdminStatus()
        console.log('Auth check result:', adminUser)
        
        if (!adminUser) {
          console.log('No admin user found, redirecting...')
          router.push('/auth/admin/login')
          return
        }

        setUser(adminUser)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router])

  // Fetch education systems
  React.useEffect(() => {
    const fetchEducationSystems = async () => {
      try {
        const { data, error } = await supabase
          .from('education_systems')
          .select('*')
          .order('name')

        if (error) throw error
        setEducationSystems(data || [])
      } catch (error) {
        console.error('Error fetching education systems:', error)
        toast({
          title: "Error",
          description: "Failed to load education systems",
          variant: "destructive"
        })
      }
    }

    fetchEducationSystems()
  }, [])

  // Update categories fetch to filter by education system
  React.useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedEducationSystem) {
        setCategories([])
        return
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('education_system_id', selectedEducationSystem)
          .is('parent_id', null)
          .order('name')

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive"
        })
      }
    }

    fetchCategories()
  }, [selectedEducationSystem])

  // Fetch sub-categories when category changes
  React.useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategories([])
        return
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', selectedCategory)
          .order('name')

        if (error) throw error
        setSubCategories(data || [])
      } catch (error) {
        console.error('Error fetching sub-categories:', error)
        toast({
          title: "Error",
          description: "Failed to load sub-categories",
          variant: "destructive"
        })
      }
    }

    fetchSubCategories()
  }, [selectedCategory])

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedCategory(value)
    // Reset sub-category when category changes
    setValue('sub_category_id', '')
  }

  // Handle education system change
  const handleEducationSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedEducationSystem(value)
    // Reset category and sub-category when education system changes
    setSelectedCategory('')
    setValue('category_id', '')
    setValue('sub_category_id', '')
  }

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      
      if (!file.name) {
        setImageUrl('')
        return
      }

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
      if (initialData?.image_url) {
        const oldPath = initialData.image_url.split('/').pop()
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
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  // Form submit handler
  const onSubmit = async (data: QuizFormValues) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a quiz",
          variant: "destructive"
        })
        return
      }

      const quizData = {
        title: data.title,
        description: data.description,
        time_limit: parseInt(data.time_limit, 10),
        image_url: imageUrl || null,
        created_by: user.id,
        is_published: false,
        category_id: data.category_id,
        sub_category_id: data.sub_category_id,
        education_system_id: data.education_system_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      let result;
      
      if (initialData?.id) {
        result = await supabase
          .from('quizzes')
          .update({
            ...quizData,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.id)
          .select()

        // After successful update
        toast({
          title: "Success",
          description: "Quiz updated successfully"
        })
        router.push('/admin/quizzes')
        router.refresh()
      } else {
        result = await supabase
          .from('quizzes')
          .insert([quizData])
          .select()
      }

      if (result.error) throw result.error

      toast({
        title: "Success",
        description: initialData 
          ? "Quiz updated successfully" 
          : "Quiz created successfully. Now let's add some questions!",
      })

      // Redirect to questions step if this is a new quiz
      if (!initialData && result.data?.[0]) {
        router.push(`/admin/quizzes/${result.data[0].id}/questions`)
      } else {
        router.push('/admin/quizzes')
      }
      router.refresh()
    } catch (error: any) {
      console.error('Error saving quiz:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz",
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
      setValue('category_id', newCategory.id)
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
      setValue('sub_category_id', newSubCategory.id)
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
      setValue('education_system_id', newEducationSystem.id)
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quiz Cover Image (Optional)</label>
          <ImageUpload
            onUpload={handleImageUpload}
            value={imageUrl}
            disabled={uploading}
            preview={imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Quiz cover" 
                className="object-cover w-full h-48 rounded-md"
              />
            ) : undefined}
          />
          <p className="text-sm text-gray-500 mt-1">
            Recommended: 1200x630px. Max size: 2MB. Supported formats: JPEG, PNG, WebP
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Education System</label>
          <div className="flex gap-2">
            <select
              {...register('education_system_id')}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setIsCreatingEducationSystem(true)
                  return
                }
                handleEducationSystemChange(e)
                register('education_system_id').onChange(e)
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
          {errors.education_system_id && (
            <p className="text-red-500 text-sm mt-1">{errors.education_system_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="flex gap-2">
              <select
                {...register('category_id')}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsCreatingCategory(true)
                    return
                  }
                  handleCategoryChange(e)
                  register('category_id').onChange(e)
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
                {...register('sub_category_id')}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsCreatingSubCategory(true)
                    return
                  }
                  register('sub_category_id').onChange(e)
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
          <Input {...register('title')} />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea {...register('description')} />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
          <Input 
            type="number" 
            min="1"
            {...register('time_limit')} 
          />
          {errors.time_limit && (
            <p className="text-red-500 text-sm mt-1">{errors.time_limit.message}</p>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={uploading || isSubmitting}
      >
        {uploading ? 'Uploading...' : isSubmitting ? 'Saving...' : initialData ? 'Update Quiz' : 'Create Quiz'}
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