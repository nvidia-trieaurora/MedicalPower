'use client';

import Link from 'next/link';
import { LogIn, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useLocale } from '@/hooks/use-locale';

export function LandingRedirect() {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white">
      <img
        src="/images/hero.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <Logo size="md" className="text-white" />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="gap-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10"
          >
            <Globe className="h-4 w-4" />
            {locale === 'vi' ? 'VI' : 'EN'}
          </Button>
          <Link href="/login">
            <Button className="gap-1.5">
              <LogIn className="h-4 w-4" />
              {t('auth.login.submit')}
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-violet-600 to-violet-400 shadow-2xl shadow-violet-500/30 backdrop-blur-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 drop-shadow-lg">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
          {t('auth.landing.title')}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base text-slate-300 sm:text-lg">
          {t('auth.landing.subtitle')}
        </p>
        <Link href="/login">
          <Button size="lg" className="gap-2 px-8 text-base shadow-lg shadow-primary/25">
            <LogIn className="h-5 w-5" />
            {t('auth.landing.cta')}
          </Button>
        </Link>

        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur transition-colors hover:bg-white/10">
            <img src="/images/feature-ai.png" alt="" className="mb-4 h-14 w-14 rounded-lg" />
            <h3 className="mb-1 text-base font-semibold">{t('auth.landing.feature.ai')}</h3>
            <p className="text-sm text-slate-400">{t('auth.landing.feature.aiDesc')}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur transition-colors hover:bg-white/10">
            <img src="/images/feature-workflow.png" alt="" className="mb-4 h-14 w-14 rounded-lg" />
            <h3 className="mb-1 text-base font-semibold">{t('auth.landing.feature.workflow')}</h3>
            <p className="text-sm text-slate-400">{t('auth.landing.feature.workflowDesc')}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur transition-colors hover:bg-white/10">
            <img src="/images/feature-admin.png" alt="" className="mb-4 h-14 w-14 rounded-lg" />
            <h3 className="mb-1 text-base font-semibold">{t('auth.landing.feature.admin')}</h3>
            <p className="text-sm text-slate-400">{t('auth.landing.feature.adminDesc')}</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-slate-600">
        &copy; 2026 MedicalPower
      </footer>
    </div>
  );
}
