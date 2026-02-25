'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Truck, DollarSign, User, Phone, MapPin, Package, AlertCircle } from 'lucide-react'
import { Equipment } from '@/lib/types/equipment'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function CheckoutForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<any>(null)
  const [renterProfile, setRenterProfile] = useState<any>(null)

  // Form selection
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => {
    const tmrw = new Date()
    tmrw.setDate(tmrw.getDate() + 1)
    return tmrw.toISOString().split('T')[0]
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const equipmentId = searchParams.get('equipment')
  const supabase = createClient()

  useEffect(() => {
    const fetchDetails = async () => {
      if (!equipmentId) {
        setError("No equipment selected for booking.")
        setIsLoading(false)
        return
      }

      try {
        // 1. Get logged in renter
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/auth/login?redirect=/booking/checkout?equipment=' + equipmentId)
          return
        }

        const { data: renterData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setRenterProfile(renterData)

        // 2. Get equipment details
        const { data: eqData, error: eqError } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', equipmentId)
          .single()

        if (eqError || !eqData) {
          throw new Error("Equipment not found or no longer available.")
        }
        setEquipment(eqData)

        // 3. Get equipment owner details
        const { data: ownerData, error: ownerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', eqData.owner_id)
          .single()

        if (!ownerError && ownerData) {
          setOwnerProfile(ownerData)
        }

      } catch (err: any) {
        console.error('[Checkout] Error:', err)
        setError(err.message || "An unexpected error occurred.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [equipmentId, router, supabase])

  // Calculations
  const start = new Date(startDate)
  const end = new Date(endDate)
  const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const totalCost = equipment ? equipment.price_per_day * durationDays : 0

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    setError(null)
    console.log('[v0] Starting booking confirmation...')

    try {
      if (!equipment || !renterProfile) {
        throw new Error("Missing required data to complete booking.")
      }

      if (start >= end) {
        throw new Error("End date must be after the start date.")
      }

      // Construct booking
      const newBooking = {
        equipment_id: equipment.id,
        owner_id: equipment.owner_id,
        renter_id: renterProfile.id,
        equipment_name: equipment.name,
        equipment_type: equipment.category,
        rental_start_date: startDate,
        rental_end_date: endDate,
        total_cost: totalCost,
        booking_status: 'confirmed',
        payment_status: 'pending',
        renter_name: renterProfile.full_name || 'AgriRental User',
        renter_phone: renterProfile.phone || 'N/A',
        renter_location: equipment.location, // Delivering to equipment's region for now
        owner_name: ownerProfile?.full_name || 'Equipment Owner',
        owner_phone: ownerProfile?.phone || 'N/A',
      }

      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert([newBooking])
        .select()
        .single()

      if (insertError) {
        console.error('[v0] Booking error:', insertError)
        throw new Error('Failed to create booking. Please try again.')
      }

      console.log('[v0] Booking created successfully:', data)
      router.push(`/dashboard`) // Redirect to dashboard / bookings page upon success (could be a success page too)

    } catch (err: any) {
      console.error('[v0] Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground text-green-800 dark:text-green-200">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <div className="mx-auto max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Cannot Process Booking</AlertTitle>
            <AlertDescription>{error || "Equipment not found."}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4 w-full" variant="outline">Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold text-green-900 dark:text-green-100">
            Review Your Booking
          </h1>
          <p className="mt-2 text-green-700 dark:text-green-300">
            Please select your dates and confirm your equipment rental
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-5 text-green-600" />
                  Equipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">{equipment.name}</p>
                    <p className="text-sm text-muted-foreground">{equipment.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700 dark:text-green-400">₹{equipment.price_per_day.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rental Period Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5 text-green-600" />
                  Select Rental Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-between items-center text-sm border-t">
                  <span className="text-muted-foreground">Total Duration:</span>
                  <span className="font-bold">{durationDays} {durationDays === 1 ? 'day' : 'days'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Profiles grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Renter Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="size-4 text-green-600" />
                    Your Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="size-3 text-muted-foreground" />
                    <span>{renterProfile?.full_name || 'AgriRental User'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{renterProfile?.phone || '(No phone provided)'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="size-4 text-green-600" />
                    Owner Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="size-3 text-muted-foreground" />
                    <span>{ownerProfile?.full_name || 'Equipment Owner'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{ownerProfile?.phone || '(Number hidden until booked)'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="size-3 text-muted-foreground mt-0.5" />
                    <span>{equipment.location}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pricing & Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="size-5 text-green-600" />
                  Payment Summary
                </CardTitle>
                <CardDescription>Cash on Delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span>₹{equipment.price_per_day.toLocaleString('en-IN')} / day</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>x {durationDays} days</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-green-700 dark:text-green-400">₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Pay on Arrival
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    Payment will be collected in cash when the equipment is delivered to your location
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting || !!error}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  )
}

