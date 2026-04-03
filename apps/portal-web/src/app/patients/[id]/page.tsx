'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Phone, MapPin, CreditCard, ExternalLink, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patientApi, type Patient } from '@/lib/api';
import { mockPatients, mockCases, mockStudies } from '@/lib/mock-data';
import { getViewerUrl } from '@/lib/viewer';
import { useLocale } from '@/lib/locale-context';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await patientApi.get(id);
        if (!cancelled) setPatient(res.data);
      } catch {
        const mock = mockPatients.find((p) => p.id === id);
        if (!cancelled) {
          setPatient(
            mock ? { ...mock, organizationId: '', updatedAt: mock.createdAt } : null,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">{t('common.table.loading')}</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">{t('patient.error.notFound')}</p>
      </div>
    );
  }

  const patientCases =
    patient.cases !== undefined
      ? patient.cases
      : mockCases.filter((c) => c.patientId === patient.id);
  const patientStudies =
    patient.studies !== undefined
      ? patient.studies
      : mockStudies.filter((s) => s.patientId === patient.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patient.fullName}</h1>
          <p className="font-mono text-sm text-muted-foreground">{patient.mrn}</p>
        </div>
        <Badge className={patient.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
          {patient.status === 'active' ? t('common.status.active') : t('common.status.stopped')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{t('patient.detail.personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(patient.dob).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</span>
              <span className="text-muted-foreground">
                ({patient.gender === 'male' ? t('patient.field.gender.male') : t('patient.field.gender.female')})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{patient.nationalId ?? ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone ?? ''}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>{patient.address ?? ''}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('patient.detail.cases', { count: String(patientCases.length) })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientCases.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('patient.detail.casesEmpty')}</p>
            )}
            {patientCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {(c as { description?: string }).description ?? ''}
                  </p>
                </div>
                <Badge variant="secondary">{c.status.replace('_', ' ')}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            {t('patient.detail.studies', { count: String(patientStudies.length) })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patientStudies.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('patient.detail.studiesEmpty')}</p>
          )}
          {patientStudies.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.description ?? ''}</p>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-1.5 text-[10px] px-1.5 py-0">{s.modality}</Badge>
                  {s.studyDate ?? ''} &middot; {s.numSeries} {t('common.unit.series')} &middot; {s.numInstances} {t('common.label.images')}
                </p>
              </div>
              <a
                href={getViewerUrl({
                  studyInstanceUid: s.studyInstanceUid,
                  patientName: patient.fullName,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="default" className="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('common.action.openViewer')}
                </Button>
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
