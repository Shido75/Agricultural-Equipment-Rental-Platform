import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Sometimes the profile trigger takes a few milliseconds to run after user creation
  // We'll retry a few times to ensure we get the profile
  let profile = null
  let attempts = 0
  const maxAttempts = 5

  while (!profile && attempts < maxAttempts) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      profile = data
      break
    }

    // Wait 500ms before trying again
    await new Promise((resolve) => setTimeout(resolve, 500))
    attempts++
  }

  // Redirect based on role
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  } else if (profile?.role === 'owner') {
    redirect('/owner/dashboard')
  } else if (profile?.role === 'farmer') {
    redirect('/bookings')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>You are logged in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Email: {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            Role: {profile?.role || 'Not set'}
          </p>
          <Button asChild className="w-full">
            <Link href="/">Go to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
