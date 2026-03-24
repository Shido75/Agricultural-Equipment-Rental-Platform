'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Equipment, EQUIPMENT_CATEGORIES } from '@/lib/types/equipment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Tractor, Filter, X, LogIn, LogOut, User, LayoutDashboard, ChevronDown, Star } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface UserProfile {
    id: string
    full_name: string | null
    email: string | null
    role: 'farmer' | 'owner' | 'admin' | null
    phone: string | null
}

export default function BrowseEquipmentPage() {
    const { t } = useLanguage()
    const [equipments, setEquipments] = useState<Equipment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationQuery, setLocationQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [authChecked, setAuthChecked] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchEquipment()
        checkAuth()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const checkAuth = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name, role, phone')
                .eq('id', user.id)
                .single()

            setUserProfile({
                id: user.id,
                full_name: profile?.full_name || null,
                email: user.email || null,
                role: profile?.role || null,
                phone: profile?.phone || null,
            })
        }
        setAuthChecked(true)
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setUserProfile(null)
        setProfileOpen(false)
    }

    const fetchEquipment = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('equipment')
            .select('*, reviews(rating)')
            .eq('is_available', true)
            .order('created_at', { ascending: false })

        if (error) console.error('[Browse] Error fetching equipment:', error)
        else setEquipments(data || [])
        setIsLoading(false)
    }

    const filteredEquipment = equipments.filter(eq => {
        const matchesSearch =
            !searchQuery ||
            eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (eq.description && eq.description.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesLocation =
            !locationQuery ||
            eq.location.toLowerCase().includes(locationQuery.toLowerCase())
        const matchesCategory = selectedCategory ? eq.category === selectedCategory : true
        return matchesSearch && matchesLocation && matchesCategory
    })

    const hasActiveFilters = searchQuery || locationQuery || selectedCategory
    const clearAllFilters = () => { setSearchQuery(''); setLocationQuery(''); setSelectedCategory(null) }

    const isLoggedIn = authChecked && userProfile !== null

    // Get initials for avatar
    const getInitials = (name: string | null, email: string | null) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return email?.[0]?.toUpperCase() || 'U'
    }

    const getDashboardLink = (role: string | null) => {
        if (role === 'owner') return '/owner/dashboard'
        if (role === 'admin') return '/admin/dashboard'
        return '/bookings'
    }

    const getRoleBadgeColor = (role: string | null) => {
        if (role === 'owner') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        if (role === 'admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
            <div className="mx-auto max-w-7xl px-4 py-8">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-balance text-3xl font-bold text-green-900 dark:text-green-100">
                            {t('equip.pageTitle')}
                        </h1>
                        <p className="mt-2 text-green-700 dark:text-green-300">
                            {t('equip.pageSubtitle')}
                        </p>
                    </div>

                    {/* Right side: Language + Profile or Login */}
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        {!authChecked ? (
                            // Loading skeleton
                            <div className="size-10 rounded-full bg-green-200 dark:bg-green-800 animate-pulse" />
                        ) : isLoggedIn ? (
                            // Profile Dropdown
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 rounded-full border-2 border-green-200 dark:border-green-700 bg-white dark:bg-slate-900 px-3 py-1.5 hover:border-green-400 dark:hover:border-green-500 transition-colors shadow-sm"
                                >
                                    {/* Avatar circle */}
                                    <div className="size-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {getInitials(userProfile!.full_name, userProfile!.email)}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">
                                            {userProfile!.full_name || 'My Account'}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize leading-none mt-0.5">
                                            {userProfile!.role || 'user'}
                                        </p>
                                    </div>
                                    <ChevronDown className={`size-4 text-muted-foreground transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Panel */}
                                {profileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden">
                                        {/* Profile Header */}
                                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                    {getInitials(userProfile!.full_name, userProfile!.email)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                        {userProfile!.full_name || 'AgriRental User'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground truncate">{userProfile!.email}</p>
                                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 capitalize ${getRoleBadgeColor(userProfile!.role)}`}>
                                                        {userProfile!.role || 'user'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Info */}
                                        <div className="p-3 space-y-1 border-b border-slate-100 dark:border-slate-800">
                                            {userProfile!.phone && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1">
                                                    <span className="text-xs">📞</span>
                                                    <span>{userProfile!.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="p-2">
                                            <Link
                                                href={getDashboardLink(userProfile!.role)}
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                                            >
                                                <LayoutDashboard className="size-4 text-green-600" />
                                                <span>
                                                    {userProfile!.role === 'owner' ? 'Owner Dashboard' :
                                                        userProfile!.role === 'admin' ? 'Admin Dashboard' :
                                                            'My Bookings'}
                                                </span>
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-red-600 dark:text-red-400 mt-1"
                                            >
                                                <LogOut className="size-4" />
                                                <span>{t('equip.logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Guest: Login button
                            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
                                <Link href="/auth/login">
                                    <LogIn className="size-4" />
                                    {t('equip.loginToBook')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Guest notice banner */}
                {authChecked && !isLoggedIn && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm">
                        <LogIn className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span className="text-amber-800 dark:text-amber-200">
                            You&apos;re browsing as a guest.{' '}
                            <Link href="/auth/login" className="font-semibold underline underline-offset-2 hover:text-amber-900">Login</Link>
                            {' '}or{' '}
                            <Link href="/auth/signup/farmer" className="font-semibold underline underline-offset-2 hover:text-amber-900">Sign up</Link>
                            {' '}to book equipment.
                        </span>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder={t('equip.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white dark:bg-slate-900"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        <div className="relative sm:w-64">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder={t('equip.locationPlaceholder')}
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                className="pl-10 bg-white dark:bg-slate-900"
                            />
                            {locationQuery && (
                                <button onClick={() => setLocationQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        <Filter className="size-4 text-muted-foreground mr-1 flex-shrink-0" />
                        <Badge
                            variant={selectedCategory === null ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(null)}
                        >
                            {t('equip.allCategories')}
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

                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                                Showing {filteredEquipment.length} of {equipments.length} equipment
                                {locationQuery && <span> in <strong className="text-green-700 dark:text-green-400">&quot;{locationQuery}&quot;</strong></span>}
                            </span>
                            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-0 text-green-600 hover:text-green-700 underline">
                                {t('equip.clearFilters')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Equipment Grid */}
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent" />
                        <p className="mt-4 text-muted-foreground">{t('equip.loading')}</p>
                    </div>
                ) : filteredEquipment.length === 0 ? (
                    <Card className="border-dashed border-2 bg-transparent">
                        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                            <Tractor className="size-16 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-medium text-green-900 dark:text-green-100 mb-2">{t('equip.noResultsTitle')}</h3>
                            <p className="text-muted-foreground max-w-md">
                                {locationQuery
                                    ? `No equipment available in "${locationQuery}". Try a different location.`
                                    : t('equip.noResultsDesc')}
                            </p>
                            {hasActiveFilters && (
                                <Button variant="link" onClick={clearAllFilters} className="mt-4 text-green-600">
                                    {t('equip.clearFilters')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredEquipment.map((item) => (
                            <BrowseEquipmentCard key={item.id} equipment={item} isLoggedIn={isLoggedIn} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function BrowseEquipmentCard({ equipment, isLoggedIn }: { equipment: Equipment; isLoggedIn: boolean }) {
    const router = useRouter()
    const { t } = useLanguage()

    const reviewCount = equipment.reviews?.length || 0
    const averageRating = reviewCount > 0
        ? equipment.reviews!.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
        : 0

    const handleBookNow = () => {
        if (!isLoggedIn) {
            router.push(`/auth/login?redirect=/booking/checkout?equipment=${equipment.id}`)
            return
        }
        router.push(`/booking/checkout?equipment=${equipment.id}`)
    }

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
                <div className="h-48 w-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <Tractor className="size-16 text-green-200 dark:text-green-800" />
                </div>
            )}

            <CardHeader className="pb-3 flex-none">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1 text-lg">{equipment.name}</CardTitle>
                    {reviewCount > 0 && (
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded text-xs font-medium border border-amber-200 dark:border-amber-800 flex-shrink-0">
                            <Star className="size-3 fill-amber-500 text-amber-500" />
                            <span>{averageRating.toFixed(1)}</span>
                            <span className="text-muted-foreground ml-0.5">({reviewCount})</span>
                        </div>
                    )}
                </div>
                <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                    <MapPin className="size-3 flex-shrink-0" />
                    <span className="truncate">{equipment.location}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pb-3 flex-grow">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    {equipment.category}
                </Badge>
                {equipment.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{equipment.description}</p>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t p-4 bg-slate-50 dark:bg-slate-900/20 mt-auto flex-none">
                <div className="flex w-full items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('equip.perDay')}</span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                        ₹{equipment.price_per_day.toLocaleString('en-IN')}
                    </span>
                </div>
                <Button
                    onClick={handleBookNow}
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                    {!isLoggedIn ? (
                        <><LogIn className="size-4" /> {t('equip.loginToBook')}</>
                    ) : (
                        t('equip.bookNow')
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
