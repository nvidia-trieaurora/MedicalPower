'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { patientApi, type Patient } from '@/lib/api';
import { mockPatients } from '@/lib/mock-data';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchPatients = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientApi.list({ search: searchQuery || undefined, limit: 50 });
      setPatients(res.data);
      setTotal(res.meta.total);
      setUsingMock(false);
    } catch {
      const filtered = mockPatients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setPatients(filtered.map((p) => ({ ...p, organizationId: '', updatedAt: p.createdAt })));
      setTotal(filtered.length);
      setUsingMock(true);
      setError('API chưa sẵn sàng — hiển thị dữ liệu mẫu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients(search);
  }, [fetchPatients, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Bệnh nhân</h1>
          <p className="text-sm text-muted-foreground">
            {total} bệnh nhân
            {usingMock && <span className="ml-2 text-amber-600">(dữ liệu mẫu)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchPatients(search)}>
            <RefreshCw className="mr-1 h-3 w-3" />
            Làm mới
          </Button>
          <Link href="/patients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Bệnh nhân
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, MRN, CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Đang tải...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MRN</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id} className="cursor-pointer hover:bg-accent">
                    <TableCell>
                      <Link
                        href={`/patients/${patient.id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {patient.mrn}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{patient.fullName}</TableCell>
                    <TableCell>
                      {new Date(patient.dob).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {patient.gender === 'male'
                        ? 'Nam'
                        : patient.gender === 'female'
                          ? 'Nữ'
                          : 'Khác'}
                    </TableCell>
                    <TableCell className="text-sm">{patient.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          patient.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }
                      >
                        {patient.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {patients.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không tìm thấy bệnh nhân nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
