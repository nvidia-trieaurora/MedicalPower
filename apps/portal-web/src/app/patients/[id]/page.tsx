'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Phone, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockPatients, mockCases, mockStudies } from '@/lib/mock-data';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy bệnh nhân</p>
      </div>
    );
  }

  const patientCases = mockCases.filter((c) => c.patientId === patient.id);
  const patientStudies = mockStudies.filter((s) => s.patientId === patient.id);

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
          {patient.status === 'active' ? 'Hoạt động' : 'Ngừng'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(patient.dob).toLocaleDateString('vi-VN')}</span>
              <span className="text-muted-foreground">
                ({patient.gender === 'male' ? 'Nam' : 'Nữ'})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{patient.nationalId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>{patient.address}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Ca bệnh ({patientCases.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientCases.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có ca bệnh nào</p>
            )}
            {patientCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <Badge variant="secondary">{c.status.replace('_', ' ')}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nghiên cứu hình ảnh ({patientStudies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patientStudies.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{s.description}</p>
                <p className="text-xs text-muted-foreground">
                  {s.modality} &middot; {s.studyDate} &middot; {s.numSeries} series, {s.numInstances} instances
                </p>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_OHIF_URL || 'http://localhost:8042'}/ohif/viewer?StudyInstanceUIDs=${s.studyInstanceUid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                Mở Viewer
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
