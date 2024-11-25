import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Quiz App',
  description: 'Login or register for Quiz App',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        {children}
      </div>
    </div>
  )
}