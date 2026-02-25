'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { EQUIPMENT_CATEGORIES } from '@/lib/types/equipment'

export default function AddEquipmentPage() {
    const router = useRouter()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price_per_day: '',
        location: '',
        image_url: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({ ...prev, category: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // 1. Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                throw new Error('You must be logged in to add equipment')
            }

            // 2. Validate form data
            if (!formData.name || !formData.category || !formData.price_per_day || !formData.location) {
                throw new Error('Please fill in all required fields')
            }

            const price = parseFloat(formData.price_per_day)
            if (isNaN(price) || price <= 0) {
                throw new Error('Price must be a valid positive number')
            }

            // 3. Insert equipment
            const { error: insertError } = await supabase
                .from('equipment')
                .insert({
                    owner_id: user.id,
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    price_per_day: price,
                    location: formData.location,
                    image_url: formData.image_url || null,
                    is_available: true
                })

            if (insertError) {
                console.error('[Add Equipment] Insert error:', insertError)
                throw new Error('Failed to add equipment. Please try again.')
            }

            // 4. Redirect on success
            router.push('/owner/dashboard')
            router.refresh()

        } catch (err: any) {
            console.error('[Add Equipment] Setup error:', err)
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="text-blue-700 dark:text-blue-300">
                        <Link href="/owner/dashboard">
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <Card className="border-blue-200 dark:border-blue-800 shadow-xl dark:shadow-blue-900/20">
                    <CardHeader className="space-y-1 bg-white dark:bg-slate-900 rounded-t-xl">
                        <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            List New Equipment
                        </CardTitle>
                        <CardDescription>
                            Add details about your agricultural equipment to list it for rental
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 pt-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="size-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Equipment Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. John Deere 8R 310 Tractor"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category} onValueChange={handleCategoryChange} required>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select equipment category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EQUIPMENT_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price_per_day">Price per Day (₹) *</Label>
                                    <Input
                                        id="price_per_day"
                                        name="price_per_day"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        placeholder="e.g. 1500"
                                        value={formData.price_per_day}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="location">Location (Area, City) *</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="e.g. Green Valley Farm, Pune"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe the condition, features, and any requirements..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="image_url">Image URL (Optional)</Label>
                                    <Input
                                        id="image_url"
                                        name="image_url"
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Provide a direct link to an image of the equipment. We'll add image uploading later.
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 rounded-b-xl border-t px-6 py-4">
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Listing Equipment...
                                    </>
                                ) : (
                                    'List Equipment'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
