'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Booking } from '@/lib/types/booking'
import { Equipment } from '@/lib/types/equipment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Package, MapPin, Phone, User, DollarSign, CheckCircle2, Tractor, Plus } from 'lucide-react'
import Link from 'next/link'

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchData = async () => {
    const supabase = createClient()

    // Get currently logged in user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    // Fetch bookings
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (bookingError) {
      console.error('[v0] Error fetching bookings:', bookingError)
    } else {
      setBookings(bookingData || [])
    }

    // Fetch equipment
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('equipment')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (equipmentError) {
      console.error('[v0] Error fetching equipment:', equipmentError)
    } else {
      setEquipments(equipmentData || [])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMarkAsPaid = async (bookingId: string) => {
    setUpdatingId(bookingId)
    console.log('[v0] Marking booking as paid:', bookingId)

    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        booking_status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) {
      console.error('[v0] Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
    } else {
      console.log('[v0] Booking updated successfully')
      // Refresh data
      await fetchData()
    }

    setUpdatingId(null)
  }

  const handleToggleAvailability = async (equipmentId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('equipment')
      .update({ is_available: !currentStatus })
      .eq('id', equipmentId)

    if (error) {
      console.error('[v0] Error updating equipment:', error)
      alert('Failed to update equipment availability.')
    } else {
      await fetchData()
    }
  }

  const pendingBookings = bookings.filter(b => b.payment_status === 'pending')
  const paidBookings = bookings.filter(b => b.payment_status === 'paid')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold text-blue-900 dark:text-blue-100">
              Owner Dashboard
            </h1>
            <p className="mt-2 text-blue-700 dark:text-blue-300">
              Manage your equipment rentals and payments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
              <Link href="/equipment">Browse Equipment</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
              <DollarSign className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{pendingBookings.reduce((sum, b) => sum + b.total_cost, 0).toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{paidBookings.reduce((sum, b) => sum + b.total_cost, 0).toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="equipment">My Equipment</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-8">
            {/* Pending Bookings */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                Pending Payments ({pendingBookings.length})
              </h2>
              {pendingBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending payments
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onMarkAsPaid={handleMarkAsPaid}
                      isUpdating={updatingId === booking.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Paid Bookings */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                Completed Bookings ({paidBookings.length})
              </h2>
              {paidBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No completed bookings yet
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {paidBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Listed Equipment ({equipments.length})
              </h2>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/owner/equipment/add">
                  <Plus className="mr-2 size-4" />
                  Add New Equipment
                </Link>
              </Button>
            </div>

            {equipments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 flex flex-col items-center text-center">
                  <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                    <Tractor className="size-8 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">No equipment listed yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    List your unused farming equipment to start earning rental income from local farmers.
                  </p>
                  <Button asChild>
                    <Link href="/owner/equipment/add">
                      Start Listing Equipment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {equipments.map((item) => (
                  <EquipmentCard
                    key={item.id}
                    equipment={item}
                    onToggleAvailability={() => handleToggleAvailability(item.id, item.is_available)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface BookingCardProps {
  booking: Booking
  onMarkAsPaid?: (id: string) => void
  isUpdating?: boolean
}

function BookingCard({ booking, onMarkAsPaid, isUpdating }: BookingCardProps) {
  const isPending = booking.payment_status === 'pending'

  return (
    <Card className={isPending ? 'border-amber-200 dark:border-amber-800' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.equipment_name}</CardTitle>
            <CardDescription>{booking.equipment_type}</CardDescription>
          </div>
          <Badge variant={isPending ? 'outline' : 'default'} className={isPending ? 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100' : 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'}>
            {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Renter Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-muted-foreground" />
            <span className="font-medium">{booking.renter_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span>{booking.renter_phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{booking.renter_location}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm border-t pt-3">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {new Date(booking.rental_start_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            {' - '}
            {new Date(booking.rental_end_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <span className="text-lg font-bold">₹{booking.total_cost.toLocaleString('en-IN')}</span>
        </div>

        {/* Action Button */}
        {isPending && onMarkAsPaid && (
          <Button
            onClick={() => onMarkAsPaid(booking.id)}
            disabled={isUpdating}
            className="w-full"
            size="sm"
          >
            {isUpdating ? 'Updating...' : 'Mark as Paid'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function EquipmentCard({ equipment, onToggleAvailability }: { equipment: Equipment, onToggleAvailability: () => void }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {equipment.image_url ? (
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 relative">
          {/* Using img instead of next/image since URLs will be external initially */}
          <img
            src={equipment.image_url}
            alt={equipment.name}
            className="w-full h-full object-cover"
          />
          <Badge
            variant={equipment.is_available ? "default" : "secondary"}
            className={`absolute top-2 right-2 ${equipment.is_available ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {equipment.is_available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      ) : (
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
          <Tractor className="size-16 text-slate-300 dark:text-slate-600" />
          <Badge
            variant={equipment.is_available ? "default" : "secondary"}
            className={`absolute top-2 right-2 ${equipment.is_available ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {equipment.is_available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 flex-none">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="line-clamp-1">{equipment.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="size-3" />
              <span className="truncate">{equipment.location}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3 flex-grow">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {equipment.category}
          </Badge>
        </div>

        {equipment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {equipment.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4 bg-slate-50 dark:bg-slate-900/50 mt-auto flex-none">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
            ₹{equipment.price_per_day.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-muted-foreground mt-1">/day</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAvailability}
        >
          {equipment.is_available ? 'Mark Unavailable' : 'Mark Available'}
        </Button>
      </CardFooter>
    </Card>
  )
}
