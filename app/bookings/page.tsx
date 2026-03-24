'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Booking } from '@/lib/types/booking'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Package, MapPin, Phone, DollarSign, Star } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function BookingsPage() {
  const { t } = useLanguage()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const fetchBookings = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/bookings')
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
        // Fetch which bookings have already been reviewed
        if (data && data.length > 0) {
          const bookingIds = data.map(b => b.id)
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('booking_id')
            .in('booking_id', bookingIds)
            .eq('reviewer_id', user.id)

          if (reviewsData) {
            setReviewedBookings(new Set(reviewsData.map(r => r.booking_id)))
          }
        }
      }
      setIsLoading(false)
    }

    fetchBookings()
  }, [])

  const openReviewModal = (booking: Booking) => {
    setSelectedBookingForReview(booking)
    setReviewRating(0)
    setReviewComment('')
    setIsReviewModalOpen(true)
  }

  const submitReview = async () => {
    if (!selectedBookingForReview || reviewRating === 0) return
    setIsSubmittingReview(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('reviews').insert({
      booking_id: selectedBookingForReview.id,
      equipment_id: selectedBookingForReview.equipment_id,
      reviewer_id: user.id,
      rating: reviewRating,
      comment: reviewComment
    })

    if (error) {
      if (error.code === '23505') {
        alert(t('book.alreadyReviewed'))
        setReviewedBookings(new Set(reviewedBookings).add(selectedBookingForReview.id))
        setIsReviewModalOpen(false)
      } else {
        console.error("Error submitting review:", error)
        alert("Failed to submit review.")
      }
    } else {
      setReviewedBookings(new Set([...reviewedBookings, selectedBookingForReview.id]))
      setIsReviewModalOpen(false)
    }

    setIsSubmittingReview(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">{t('book.loading')}</p>
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
              {t('book.pageTitle')}
            </h1>
            <p className="mt-2 text-green-700 dark:text-green-300">
              {t('equip.pageSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button onClick={() => router.push('/equipment')} variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
              {t('book.browseEquipment')}
            </Button>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('book.noBookingsTitle')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('book.noBookingsDesc')}
              </p>
              <Button onClick={() => router.push('/equipment')} className="bg-green-600 hover:bg-green-700">
                {t('book.browseEquipment')}
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
                        {booking.payment_status === 'paid' ? t('status.completed') : t('status.pending')}
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
                      <p className="font-medium">{t('book.rental')}</p>
                      <p className="text-muted-foreground">
                        {new Date(booking.rental_start_date).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}{' '}
                        {t('book.to')}{' '}
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
                      <p className="font-medium">{t('book.location')}</p>
                      <p className="text-muted-foreground">{booking.renter_location}</p>
                    </div>
                  </div>

                  {/* Owner Contact */}
                  <div className="flex items-start gap-3">
                    <Phone className="size-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">{t('book.ownerContact')}</p>
                      <p className="text-muted-foreground">
                        {booking.owner_name} - {booking.owner_phone}
                      </p>
                    </div>
                  </div>

                  {/* Total Cost */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t('book.totalCost')}</span>
                    </div>
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                      ₹{booking.total_cost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Payment Status Message */}
                  {booking.payment_status === 'pending' && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3">
                      <p className="text-xs text-amber-900 dark:text-amber-100">
                        {t('book.payOnArrival')}
                      </p>
                    </div>
                  )}

                  {booking.payment_status === 'paid' && (
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3">
                        <p className="text-xs text-green-900 dark:text-green-100">
                          {t('status.completed')} ✓
                        </p>
                      </div>

                      {reviewedBookings.has(booking.id) ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                          <Star className="size-4 fill-green-600 text-green-600" />
                          {t('book.alreadyReviewed')}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => openReviewModal(booking)}
                          className="w-full sm:w-auto"
                        >
                          <Star className="size-4 mr-2" />
                          {t('book.leaveReview')}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Booking Info */}
                  <div className="text-xs text-muted-foreground">
                    {t('book.dateBooked')}: {booking.id.slice(0, 8).toUpperCase()} •{' '}
                    {new Date(booking.created_at).toLocaleDateString('en-IN')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('book.writeReview')}</DialogTitle>
            <DialogDescription>
              {selectedBookingForReview?.equipment_name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-10 ${reviewRating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-600'
                      }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2 mt-4">
              <label htmlFor="comment" className="text-sm font-medium">
                {t('book.reviewPlaceholder')}
              </label>
              <Textarea
                id="comment"
                placeholder={t('book.reviewPlaceholder')}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              {t('book.cancel')}
            </Button>
            <Button
              type="button"
              onClick={submitReview}
              disabled={reviewRating === 0 || isSubmittingReview}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmittingReview ? '...' : t('book.submitReview')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
