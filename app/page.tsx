import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tractor, Sprout, Package, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-green-900 dark:text-green-100 sm:text-6xl">
            Agricultural Equipment
            <br />
            <span className="text-green-700 dark:text-green-400">Rental Platform</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-green-700 dark:text-green-300">
            Access modern farming equipment without the burden of ownership. Pay on delivery, rent by the day, and grow your farm efficiently.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/signup/farmer">Sign Up as Farmer</Link>
            </Button>
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/auth/signup/owner">Sign Up as Owner</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/booking/checkout">View Demo Booking</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/owner/dashboard">Demo Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Tractor className="size-6 text-green-700 dark:text-green-400" />
                </div>
                <CardTitle>Modern Equipment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access a wide range of tractors, harvesters, and specialized farming equipment from verified owners
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                  <Package className="size-6 text-amber-700 dark:text-amber-400" />
                </div>
                <CardTitle>Pay on Arrival</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                No digital payment needed. Pay the owner in cash when the equipment is delivered to your farm
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <CheckCircle className="size-6 text-blue-700 dark:text-blue-400" />
                </div>
                <CardTitle>Simple Booking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review dates and costs, confirm your booking, and the owner will contact you for delivery
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-center text-3xl font-bold text-green-900 dark:text-green-100 mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Browse Equipment', desc: 'Find the right equipment for your needs' },
              { step: '2', title: 'Select Dates', desc: 'Choose your rental period and review costs' },
              { step: '3', title: 'Confirm Booking', desc: 'Complete your booking with one click' },
              { step: '4', title: 'Pay on Delivery', desc: 'Pay the owner in cash when equipment arrives' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-green-900 dark:text-green-100">{item.title}</h3>
                <p className="text-sm text-green-700 dark:text-green-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
            <CardContent className="py-12 text-center">
              <Sprout className="size-16 mx-auto mb-6 text-green-700 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
                Ready to Experience the Platform?
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-8 max-w-2xl mx-auto">
                Try our demo booking flow to see how farmers can rent equipment with cash on delivery payment
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/equipment">Browse Equipment</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/owner/dashboard">Owner Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-green-200 dark:border-green-800 pt-8 text-center text-sm text-green-600 dark:text-green-400">
          <p className="mb-4">
            <strong>Test Credentials:</strong> Farmer: farmer@test.com / farmer123 | Owner: owner@test.com / owner123 | Admin: admin@test.com / admin123
          </p>
          <p className="mb-2">
            For setup instructions and documentation, see{' '}
            <a href="https://github.com/your-repo" className="underline hover:text-green-700 dark:hover:text-green-300">
              README.md
            </a>{' '}
            and{' '}
            <a href="https://github.com/your-repo" className="underline hover:text-green-700 dark:hover:text-green-300">
              SETUP.md
            </a>
          </p>
          <p className="text-xs text-green-500 dark:text-green-500">
            Built with Next.js 16, React 19, Supabase, and Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  )
}
