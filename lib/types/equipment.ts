export interface Equipment {
    id: string
    owner_id: string
    name: string
    description: string
    category: string
    price_per_day: number
    location: string
    image_url: string | null
    is_available: boolean
    created_at: string
    updated_at: string
}

export interface EquipmentFormData {
    name: string
    description: string
    category: string
    price_per_day: number
    location: string
    image_url?: string
}

export const EQUIPMENT_CATEGORIES = [
    'Tractor',
    'Harvester',
    'Implement',
    'Seeder',
    'Irrigation',
    'Other'
] as const;

export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[number];
