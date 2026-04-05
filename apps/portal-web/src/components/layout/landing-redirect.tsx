'use client';

import Link from 'next/link';
import { LogIn, Globe, Brain, Workflow, ShieldCheck, ChevronRight, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';
import { Logo } from '@/components/ui/logo';
import { useLocale } from '@/hooks/use-locale';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1 + 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  { icon: Brain, colorClass: 'from-violet-500 to-purple-600', key: 'ai' },
  { icon: Workflow, colorClass: 'from-cyan-500 to-blue-600', key: 'workflow' },
  { icon: ShieldCheck, colorClass: 'from-emerald-500 to-teal-600', key: 'admin' },
];

const stats = [
  { value: '50K+', key: 'studies' },
  { value: '99.2%', key: 'accuracy' },
  { value: '10x', key: 'faster' },
];

export function LandingRedirect() {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <div className="flex min-h-screen flex-col bg-[#030712] text-white selection:bg-violet-500/30">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-600/6 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between border-b border-white/5 px-6 py-4 backdrop-blur-sm sm:px-10"
      >
        <Logo size="md" className="text-white" />
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="gap-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5"
          >
            <Globe className="h-4 w-4" />
            {locale === 'vi' ? 'VI' : 'EN'}
          </Button>
          <Link href="/login">
            <Button size="sm" className="gap-1.5 bg-white text-black hover:bg-white/90 font-medium">
              <LogIn className="h-3.5 w-3.5" />
              {t('auth.login.submit')}
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-6 lg:flex-row lg:items-center lg:gap-8 lg:px-10">
          {/* Left: Text Content */}
          <div className="flex flex-1 flex-col justify-center py-16 lg:py-0">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t('auth.landing.hero.badge')}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                {t('auth.landing.hero.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {t('auth.landing.hero.title2')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                {t('auth.landing.hero.title3')}
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              {t('auth.landing.hero.description')}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link href="/login">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 px-8 text-base font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-purple-500 transition-all duration-300">
                  <LogIn className="h-5 w-5" />
                  {t('auth.landing.cta')}
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="gap-2 text-slate-400 hover:text-white hover:bg-white/5">
                {t('auth.landing.learnMore')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-12 flex gap-8"
            >
              {stats.map((stat) => (
                <div key={stat.key}>
                  <div className="text-2xl font-bold tracking-tight text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500">{t(`auth.landing.stats.${stat.key}`)}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: 3D Spline Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-1 items-center justify-center lg:min-h-[600px]"
          >
            <div className="relative h-[400px] w-full sm:h-[500px] lg:h-[600px]">
              <Spotlight size={300} className="from-violet-200/20 via-purple-200/10 to-transparent" />
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="h-full w-full"
              />
              {/* Subtle glow behind the robot */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {t('auth.landing.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
                {t('auth.landing.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.key}
                    custom={i}
                    variants={scaleIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm transition-colors hover:border-white/10 hover:bg-white/[0.05]"
                  >
                    <Spotlight size={150} className="from-violet-200/15 via-purple-200/5 to-transparent" />
                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.colorClass} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {t(`auth.landing.feature.${feature.key}`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {t(`auth.landing.feature.${feature.key}Desc`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/5 py-10 text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-slate-600">
            {t('auth.landing.trusted')}
          </p>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-30">
            {['MONAI', 'OHIF', 'Orthanc', 'Keycloak', 'NVIDIA'].map((name) => (
              <span key={name} className="text-sm font-semibold tracking-wide text-slate-400">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-10">
          <div className="max-w-xs text-center sm:text-left">
            <Logo size="sm" className="mb-3 justify-center text-white sm:justify-start" />
            <p className="text-xs leading-relaxed text-slate-500">
              {t('auth.landing.footer.description')}
            </p>
          </div>
          <div className="flex gap-16 text-center sm:text-left">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('auth.landing.footer.product')}</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="cursor-pointer hover:text-slate-300 transition-colors">{t('auth.landing.footer.features')}</li>
                <li className="cursor-pointer hover:text-slate-300 transition-colors">{t('auth.landing.footer.pricing')}</li>
                <li className="cursor-pointer hover:text-slate-300 transition-colors">{t('auth.landing.footer.docs')}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('auth.landing.footer.company')}</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="cursor-pointer hover:text-slate-300 transition-colors">{t('auth.landing.footer.about')}</li>
                <li className="cursor-pointer hover:text-slate-300 transition-colors">{t('auth.landing.footer.blog')}</li>
                <li className="cursor-pointer hover:text-slate-300 transition-colors">{t('auth.landing.footer.careers')}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
          &copy; 2026 MedicalPower. {t('auth.landing.footer.rights')}
        </div>
      </footer>
    </div>
  );
}
