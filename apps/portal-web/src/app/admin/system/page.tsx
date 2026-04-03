'use client';

import { useState, useEffect, useCallback } from 'react';
import { MonitorCog, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, Wifi, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/hooks/use-locale';
import { ServiceLogPanel, getServiceKey } from '@/components/admin/ServiceLogPanel';

interface ServiceHealth {
  name: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  detail?: string;
}

interface HealthData {
  timestamp: string;
  summary: { healthy: number; unhealthy: number; total: number };
  services: ServiceHealth[];
}

const statusIcon = {
  healthy: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  unhealthy: <XCircle className="h-5 w-5 text-red-500" />,
  unknown: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

const statusBadge = {
  healthy: 'bg-green-100 text-green-700',
  unhealthy: 'bg-red-100 text-red-700',
  unknown: 'bg-amber-100 text-amber-700',
};

export default function SystemPage() {
  const { t } = useLocale();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [logPanelOpen, setLogPanelOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      if (res.ok) setHealth(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHealth();
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth, autoRefresh]);

  const handleServiceClick = (svc: ServiceHealth) => {
    const key = getServiceKey(svc.name);
    if (!key) return;
    setSelectedService(svc);
    setLogPanelOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <MonitorCog className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('admin.system.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {health
                ? t('admin.system.updatedAt', { time: new Date(health.timestamp).toLocaleTimeString('vi-VN') })
                : t('admin.system.loading')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Wifi className="h-3.5 w-3.5" />
            {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchHealth} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.system.refresh')}
          </Button>
        </div>
      </div>

      {health && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-3xl font-bold text-green-600">{health.summary.healthy}</p>
                <p className="text-sm text-muted-foreground">{t('admin.system.healthy')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <XCircle className="h-10 w-10 text-red-500" />
              <div>
                <p className="text-3xl font-bold text-red-600">{health.summary.unhealthy}</p>
                <p className="text-sm text-muted-foreground">{t('admin.system.unhealthy')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Clock className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-3xl font-bold">
                  {Math.round(
                    health.services.filter((s) => s.responseTime).reduce((a, b) => a + (b.responseTime || 0), 0) /
                      health.services.filter((s) => s.responseTime).length || 0
                  )}
                  ms
                </p>
                <p className="text-sm text-muted-foreground">{t('admin.system.avgResponse')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">{t('admin.system.tab.services')} ({health?.services.length || 0})</TabsTrigger>
          <TabsTrigger value="logs">{t('admin.system.tab.logs')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-3 md:grid-cols-2">
                {health?.services.map((svc) => {
                  const hasLogs = !!getServiceKey(svc.name);
                  return (
                    <button
                      key={svc.name}
                      type="button"
                      onClick={() => handleServiceClick(svc)}
                      disabled={!hasLogs}
                      className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${
                        hasLogs
                          ? 'cursor-pointer hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm active:scale-[0.99]'
                          : 'cursor-default opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {statusIcon[svc.status]}
                        <div>
                          <p className="text-sm font-medium">{svc.name}</p>
                          <p className="text-xs text-muted-foreground">{svc.detail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {svc.responseTime !== undefined && (
                          <span className="font-mono text-xs text-muted-foreground">{svc.responseTime}ms</span>
                        )}
                        <Badge variant="secondary" className={statusBadge[svc.status]}>
                          {t(`admin.system.status.${svc.status}`)}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">:{svc.port}</span>
                        {hasLogs && <Terminal className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <p className="mt-3 text-xs text-muted-foreground text-center">
            {t('admin.system.logs.clickHint')}
          </p>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('admin.system.logs.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('admin.system.logs.selectService')}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {health?.services
                  .filter((svc) => !!getServiceKey(svc.name))
                  .map((svc) => (
                    <button
                      key={svc.name}
                      type="button"
                      onClick={() => handleServiceClick(svc)}
                      className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50 hover:border-primary/30"
                    >
                      <Terminal className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{svc.name}</p>
                        <p className="text-xs text-muted-foreground">:{svc.port}</p>
                      </div>
                      {statusIcon[svc.status]}
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServiceLogPanel
        open={logPanelOpen}
        onOpenChange={setLogPanelOpen}
        serviceKey={selectedService ? getServiceKey(selectedService.name) : null}
        serviceName={selectedService?.name || ''}
        servicePort={selectedService?.port || 0}
      />
    </div>
  );
}
