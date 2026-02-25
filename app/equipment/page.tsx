'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Equipment, EQUIPMENT_CATEGORIES } from '@/lib/types/equipment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Tractor, Filter } from 'lucide-react'
import Link from 'next/link'

export default function BrowseEquipmentPage() {
    const [equipments, setEquipments] = useState<Equipment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    useEffect(() => {
        fetchEquipment()
    }, [])

    const fetchEquipment = async () => {
        const supabase = createClient()

        // Fetch only available equipment
        const { data, error } = await supabase
            .from('equipment')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[v0] Error fetching equipment:', error)
        } else {
            setEquipments(data || [])
        }

        setIsLoading(false)
    }

    // Filter equipment based on search and category
    const filteredEquipment = equipments.filter(eq => {
        const matchesSearch =
            eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            eq.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (eq.description && eq.description.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = selectedCategory ? eq.category === selectedCategory : true

        return matchesSearch && matchesCategory;
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-balance text-3xl font-bold text-green-900 dark:text-green-100">
                            Browse Equipment
                        </h1>
                        <p className="mt-2 text-green-700 dark:text-green-300">
                            Find and rent agricultural equipment near you
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, location, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 max-w-md bg-white dark:bg-slate-900"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        <Filter className="size-4 text-muted-foreground mr-1" />
                        <Badge
                            variant={selectedCategory === null ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </Badge>
                        {EQUIPMENT_CATEGORIES.map(cat => (
                            <Badge
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "outline"}
                                className={`cursor-pointer ${selectedCategory === cat ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Equipment Grid */}
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading equipment...</p>
                    </div>
                ) : filteredEquipment.length === 0 ? (
                    <Card className="border-dashed border-2 bg-transparent">
                        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                            <Tractor className="size-16 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-medium text-green-900 dark:text-green-100 mb-2">No equipment found</h3>
                            <p className="text-muted-foreground max-w-md">
                                Try adjusting your search or category filters to find what you're looking for.
                            </p>
                            {(searchQuery || selectedCategory) && (
                                <Button
                                    variant="link"
                                    onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                    className="mt-4 text-green-600"
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredEquipment.map((item) => (
                            <BrowseEquipmentCard key={item.id} equipment={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function BrowseEquipmentCard({ equipment }: { equipment: Equipment }) {
    return (
        <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow border-green-100 dark:border-green-900">
            {equipment.image_url ? (
                <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 relative group">
                    <img
                        src={equipment.image_url}
                        alt={equipment.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            ) : (
                <div className="h-48 w-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center relative">
                    <Tractor className="size-16 text-green-200 dark:text-green-800" />
                </div>
            )}

            <CardHeader className="pb-3 flex-none">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle className="line-clamp-1 text-lg">{equipment.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                            <MapPin className="size-3 flex-shrink-0" />
                            <span className="truncate">{equipment.location}</span>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-3 flex-grow">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    {equipment.category}
                </Badge>

                {equipment.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {equipment.description}
                    </p>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t p-4 bg-slate-50 dark:bg-slate-900/20 mt-auto flex-none">
                <div className="flex w-full items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price per day</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-green-700 dark:text-green-400">
                            ₹{equipment.price_per_day.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                    {/* Note: In the future this should point to a dynamic booking page based on equipment ID */}
                    <Link href={`/booking/checkout?equipment=${equipment.id}`}>
                        Book Now
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
