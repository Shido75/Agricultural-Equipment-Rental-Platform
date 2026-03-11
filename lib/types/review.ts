export interface Review {
    id: string
    booking_id: string
    equipment_id: string
    reviewer_id: string
    rating: number
    comment?: string
    created_at: string
}
