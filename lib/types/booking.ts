export type BookingStatus = 'confirmed' | 'delivered' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid'

export interface Booking {
  id: string
  equipment_id?: string
  renter_id?: string
  owner_id?: string
  equipment_name: string
  equipment_type: string
  rental_start_date: string
  rental_end_date: string
  total_cost: number
  booking_status: BookingStatus
  payment_status: PaymentStatus
  renter_name: string
  renter_phone: string
  renter_location: string
  owner_name: string
  owner_phone: string
  created_at: string
  updated_at: string
}

export interface BookingFormData {
  equipment_id?: string
  owner_id?: string
  equipment_name: string
  equipment_type: string
  rental_start_date: string
  rental_end_date: string
  total_cost: number
  renter_name: string
  renter_phone: string
  renter_location: string
  owner_name: string
  owner_phone: string
}
