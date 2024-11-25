'use client'

import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default function AuthPage() {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[400px] p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Welcome to Quiz Platform</h1>
          <p className="text-muted-foreground">Your learning journey starts here</p>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'sign_in' | 'sign_up')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sign_in">Sign In</TabsTrigger>
            <TabsTrigger value="sign_up">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="sign_in">
            <Auth
              supabaseClient={supabase}
              view="sign_in"
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(var(--primary))',
                      brandAccent: 'rgb(var(--primary))',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90',
                  input: 'rounded-md',
                }
              }}
              theme="light"
              showLinks={false}
              providers={['google']}
              redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/`}
            />
          </TabsContent>

          <TabsContent value="sign_up">
            <Auth
              supabaseClient={supabase}
              view="sign_up"
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(var(--primary))',
                      brandAccent: 'rgb(var(--primary))',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90',
                  input: 'rounded-md',
                }
              }}
              theme="light"
              showLinks={false}
              providers={['google']}
              redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/`}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
