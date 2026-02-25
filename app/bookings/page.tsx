'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Booking } from '@/lib/types/booking'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Package, MapPin, Phone, DollarSign } from 'lucide-react'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBookings = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[v0] Error fetching bookings:', error)
      } else {
        setBookings(data || [])
      }
      setIsLoading(false)
    }

    fetchBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold text-green-900 dark:text-green-100">
              Farmer Dashboard
            </h1>
            <p className="mt-2 text-green-700 dark:text-green-300">
              View and track all your equipment rentals
            </p>
          </div>
          <Button onClick={() => router.push('/equipment')} variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
            Browse Equipment
          </Button>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by browsing available equipment
              </p>
              <Button onClick={() => router.push('/equipment')} className="bg-green-600 hover:bg-green-700">
                Browse Equipment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{booking.equipment_name}</CardTitle>
                      <CardDescription>{booking.equipment_type}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge
                        variant={booking.payment_status === 'paid' ? 'default' : 'outline'}
                        className={
                          booking.payment_status === 'paid'
                            ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                        }
                      >
                        {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {booking.booking_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rental Period */}
                  <div className="flex items-start gap-3">
                    <Calendar className="size-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Rental Period</p>
                      <p className="text-muted-foreground">
                        {new Date(booking.rental_start_date).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}{' '}
                        -{' '}
                        {new Date(booking.rental_end_date).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Delivery Location</p>
                      <p className="text-muted-foreground">{booking.renter_location}</p>
                    </div>
                  </div>

                  {/* Owner Contact */}
                  <div className="flex items-start gap-3">
                    <Phone className="size-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Owner Contact</p>
                      <p className="text-muted-foreground">
                        {booking.owner_name} - {booking.owner_phone}
                      </p>
                    </div>
                  </div>

                  {/* Total Cost */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                    </div>
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                      ₹{booking.total_cost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Payment Status Message */}
                  {booking.payment_status === 'pending' && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3">
                      <p className="text-xs text-amber-900 dark:text-amber-100">
                        Please pay the owner in cash when the equipment is delivered
                      </p>
                    </div>
                  )}

                  {booking.payment_status === 'paid' && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3">
                      <p className="text-xs text-green-900 dark:text-green-100">
                        Payment completed. Thank you for your business!
                      </p>
                    </div>
                  )}

                  {/* Booking Info */}
                  <div className="text-xs text-muted-foreground">
                    Booking ID: {booking.id.slice(0, 8).toUpperCase()} •{' '}
                    {new Date(booking.created_at).toLocaleDateString('en-IN')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
