'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Wheat, CheckCircle2 } from 'lucide-react'

type ErrorType = 'invalid' | 'network' | 'generic' | null

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ErrorType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Read optional redirect param (e.g. when coming from Book Now)
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null
  const redirectTo = searchParams?.get('redirect') || null

  const getErrorMessage = (errorType: ErrorType) => {
    switch (errorType) {
      case 'invalid':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'network':
        return 'Network error. Please check your internet connection and try again.'
      case 'generic':
        return 'An error occurred. Please try again later.'
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    console.log('[v0] Login attempt for:', email)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log('[v0] Auth response:', { success: !!data.user, error: signInError?.message })

      if (signInError) {
        console.error('[v0] Login error:', signInError.message)

        // Check for specific error types
        if (signInError.message.toLowerCase().includes('invalid')) {
          setError('invalid')
        } else if (signInError.message.toLowerCase().includes('network') ||
          signInError.message.toLowerCase().includes('fetch')) {
          setError('network')
        } else {
          setError('generic')
        }
        setIsLoading(false)
        return
      }

      if (!data.user) {
        console.error('[v0] No user data returned')
        setError('invalid')
        setIsLoading(false)
        return
      }

      console.log('[v0] Login successful, user ID:', data.user.id)

      // Fetch user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      console.log('[v0] Profile fetch:', { role: profile?.role, error: profileError?.message })

      if (profileError) {
        console.error('[v0] Profile fetch error:', profileError.message)
        // Continue anyway with default redirect
      }

      // If there's a redirect URL (e.g. came from Book Now), use it
      if (redirectTo) {
        router.push(redirectTo)
        return
      }

      // Otherwise redirect based on role
      const userRole = profile?.role || 'farmer'
      console.log('[v0] Redirecting user with role:', userRole)

      if (userRole === 'admin') {
        router.push('/admin/dashboard')
      } else if (userRole === 'owner') {
        router.push('/owner/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('[v0] Unexpected error during login:', err)
      setError('generic')
      setIsLoading(false)
    }
  }

  const errorMessage = getErrorMessage(error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Wheat className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-balance text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="mt-2">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">New to the platform?</span>
            </div>
          </div>

          <div className="grid gap-3 w-full sm:grid-cols-2">
            <Button asChild variant="outline" size="lg" disabled={isLoading}>
              <Link href="/auth/signup/farmer">Sign up as Farmer</Link>
            </Button>
            <Button asChild variant="outline" size="lg" disabled={isLoading}>
              <Link href="/auth/signup/owner">Sign up as Owner</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Administrator?{' '}
            <Link
              href="/auth/admin/login"
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium underline underline-offset-4"
            >
              Admin Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
