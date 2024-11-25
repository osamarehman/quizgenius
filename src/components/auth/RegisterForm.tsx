'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

type FormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()
  const { toast } = useToast()

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validation
    const newErrors: FormErrors = {}
    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsLoading(true)
      // TODO: Implement registration logic with Supabase
      toast({
        title: "Success!",
        description: "Registration successful. Please complete your profile.",
      })
      // Redirect to dashboard with setup parameter
      router.push('/dashboard?setup=true')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Registration failed. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Register'
        )}
      </Button>
    </form>
  )
}