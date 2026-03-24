'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tractor, Sprout, Package, CheckCircle, MapPin, Search } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function HomePage() {
  const { t } = useLanguage()

  const steps = [
    { step: '1', titleKey: 'home.step1Title', descKey: 'home.step1Desc' },
    { step: '2', titleKey: 'home.step2Title', descKey: 'home.step2Desc' },
    { step: '3', titleKey: 'home.step3Title', descKey: 'home.step3Desc' },
    { step: '4', titleKey: 'home.step4Title', descKey: 'home.step4Desc' },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="text-center">
          {/* Language switcher — top right of hero */}
          <div className="flex justify-end mb-8">
            <LanguageSwitcher />
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-green-900 dark:text-green-100 sm:text-6xl">
            {t('home.title1')}
            <br />
            <span className="text-green-700 dark:text-green-400">{t('home.title2')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-green-700 dark:text-green-300">
            {t('home.subtitle')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
              <Link href="/equipment">
                <Search className="size-5" />
                {t('home.browseEquipment')}
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/auth/signup/owner">{t('home.listYourEquipment')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">{t('home.login')}</Link>
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/signup/farmer">{t('home.signUpFarmer')}</Link>
            </Button>
            <span className="text-muted-foreground">·</span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/signup/owner">{t('home.signUpOwner')}</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Tractor className="size-6 text-green-700 dark:text-green-400" />
                </div>
                <CardTitle>{t('home.featureModernTitle')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{t('home.featureModernDesc')}</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <MapPin className="size-6 text-blue-700 dark:text-blue-400" />
                </div>
                <CardTitle>{t('home.featureLocationTitle')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{t('home.featureLocationDesc')}</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                  <Package className="size-6 text-amber-700 dark:text-amber-400" />
                </div>
                <CardTitle>{t('home.featurePayTitle')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{t('home.featurePayDesc')}</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-center text-3xl font-bold text-green-900 dark:text-green-100 mb-12">
            {t('home.howItWorksTitle')}
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-green-900 dark:text-green-100">{t(item.titleKey)}</h3>
                <p className="text-sm text-green-700 dark:text-green-300">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
            <CardContent className="py-12 text-center">
              <Sprout className="size-16 mx-auto mb-6 text-green-700 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-8 max-w-2xl mx-auto">
                {t('home.ctaDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
                  <Link href="/equipment">
                    <Search className="size-5" />
                    {t('home.browseEquipment')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/signup/farmer">{t('home.signUpFarmer')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-green-200 dark:border-green-800 pt-8 text-center text-sm text-green-600 dark:text-green-400">
          <p className="text-xs text-green-500 dark:text-green-500">
            Built with Next.js, React, Supabase, and Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  )
}
