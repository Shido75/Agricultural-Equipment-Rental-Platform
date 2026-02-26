'use client'

import { useState, useRef } from 'react'
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
import { AlertCircle, ArrowLeft, Loader2, Upload, ImageIcon, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { EQUIPMENT_CATEGORIES } from '@/lib/types/equipment'

export default function AddEquipmentPage() {
    const router = useRouter()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price_per_day: '',
        location: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({ ...prev, category: value }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, WebP, or GIF).')
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB.')
            return
        }

        setError(null)
        setImageFile(file)

        // Generate preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
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

            // 2. Validate required fields
            if (!formData.name || !formData.category || !formData.price_per_day || !formData.location) {
                throw new Error('Please fill in all required fields')
            }

            // 3. Validate image is required
            if (!imageFile) {
                throw new Error('Please upload at least one image of the equipment. This is required so farmers can see what they are renting.')
            }

            const price = parseFloat(formData.price_per_day)
            if (isNaN(price) || price <= 0) {
                throw new Error('Price must be a valid positive number')
            }

            // 4. Upload image to Supabase Storage
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('equipment-images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('[Add Equipment] Image upload error:', uploadError)
                throw new Error('Failed to upload image. Please try again.')
            }

            // 5. Get public URL of uploaded image
            const { data: urlData } = supabase.storage
                .from('equipment-images')
                .getPublicUrl(fileName)

            const imageUrl = urlData.publicUrl

            // 6. Insert equipment record
            const { error: insertError } = await supabase
                .from('equipment')
                .insert({
                    owner_id: user.id,
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    price_per_day: price,
                    location: formData.location,
                    image_url: imageUrl,
                    is_available: true
                })

            if (insertError) {
                console.error('[Add Equipment] Insert error:', insertError)
                throw new Error('Failed to add equipment. Please try again.')
            }

            // 7. Redirect on success
            router.push('/owner/dashboard')
            router.refresh()

        } catch (err: any) {
            console.error('[Add Equipment] Error:', err)
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
                            Add details and photos of your agricultural equipment to list it for rental
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

                                {/* Image Upload — REQUIRED */}
                                <div className="grid gap-2">
                                    <Label>
                                        Equipment Photo <span className="text-red-500">*</span>
                                    </Label>

                                    {imagePreview ? (
                                        <div className="relative rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-800 group">
                                            <img
                                                src={imagePreview}
                                                alt="Equipment preview"
                                                className="w-full h-56 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                    className="gap-2"
                                                >
                                                    <X className="size-4" />
                                                    Remove Photo
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-2 right-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="gap-2 text-xs"
                                                >
                                                    <Upload className="size-3" />
                                                    Change Photo
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        >
                                            <ImageIcon className="size-10 text-blue-400 dark:text-blue-600 mb-3" />
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                Click to upload a photo
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                JPEG, PNG, WebP, GIF — max 5MB
                                            </p>
                                            <p className="text-xs text-red-500 mt-2 font-medium">
                                                Photo is required for listing
                                            </p>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Equipment Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Equipment Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. John Deere 8R 310 Tractor"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div className="grid gap-2">
                                    <Label htmlFor="category">
                                        Category <span className="text-red-500">*</span>
                                    </Label>
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

                                {/* Price */}
                                <div className="grid gap-2">
                                    <Label htmlFor="price_per_day">
                                        Price per Day (₹) <span className="text-red-500">*</span>
                                    </Label>
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

                                {/* Location */}
                                <div className="grid gap-2">
                                    <Label htmlFor="location">
                                        Location (Area, City) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="e.g. Green Valley Farm, Pune"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Farmers will use this to find equipment near them.
                                    </p>
                                </div>

                                {/* Description */}
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
                                        {imageFile ? 'Uploading & Listing...' : 'Listing Equipment...'}
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
