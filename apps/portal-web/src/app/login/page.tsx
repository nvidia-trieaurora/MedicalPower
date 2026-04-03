'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, LogIn, AlertCircle, Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/hooks/use-locale';

export default function LoginPage() {
  const { t, locale, toggleLocale } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    if (success) {
      window.location.href = '/';
    } else {
      setError(t('auth.login.error'));
    }
    setLoading(false);
  };

  const quickLogin = async (qEmail: string, qPassword: string) => {
    setEmail(qEmail);
    setPassword(qPassword);
    setError('');
    setLoading(true);
    const success = await login(qEmail, qPassword);
    if (success) window.location.href = '/';
    else setError('Login failed');
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900">
      <img
        src="/images/login-bg.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="pointer-events-none absolute inset-0 bg-slate-900/40" />

      <Link href="/" className="absolute left-6 top-6 z-20 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        {t('common.action.back')}
      </Link>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white">{t('common.app.name')}</h1>
          <p className="mt-1 text-sm text-slate-400">{t('common.app.tagline')}</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">{t('auth.login.title')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-1 text-xs text-slate-400 hover:text-white">
                <Globe className="h-3.5 w-3.5" />
                {locale === 'vi' ? 'VI' : 'EN'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">{t('auth.login.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-primary"
                  placeholder="admin@medicalpower.dev"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">{t('auth.login.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <LogIn className="h-4 w-4" />
                {loading ? t('auth.login.submitting') : t('auth.login.submit')}
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-700 pt-4">
              <p className="mb-2 text-center text-xs text-slate-500">{t('auth.login.quickLogin')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => quickLogin('admin@medicalpower.dev', 'admin123')} className="rounded-md bg-slate-700 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-600">Admin</button>
                <button onClick={() => quickLogin('lead@medicalpower.dev', 'lead123')} className="rounded-md bg-slate-700 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-600">Clinical Lead</button>
                <button onClick={() => quickLogin('annotator@medicalpower.dev', 'anno123')} className="rounded-md bg-slate-700 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-600">Annotator</button>
                <button onClick={() => quickLogin('radiologist@medicalpower.dev', 'radio123')} className="rounded-md bg-slate-700 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-600">Radiologist</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
