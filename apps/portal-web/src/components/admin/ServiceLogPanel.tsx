'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Download, ArrowDown, Pause, Play, Terminal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useLocale } from '@/hooks/use-locale';

interface LogLine {
  timestamp?: string;
  level: string;
  message: string;
}

interface LogResponse {
  service: string;
  serviceKey: string;
  source: 'docker' | 'process';
  container?: string;
  timestamp: string;
  lineCount: number;
  lines: LogLine[];
  error?: string;
}

interface ServiceLogPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceKey: string | null;
  serviceName: string;
  servicePort: number;
}

const MIN_WIDTH = 400;
const MAX_WIDTH_RATIO = 0.9;
const DEFAULT_WIDTH = 720;

const LEVEL_COLORS: Record<string, string> = {
  ERROR: 'text-red-400',
  WARN: 'text-amber-400',
  INFO: 'text-blue-400',
  DEBUG: 'text-gray-500',
};

const LEVEL_BADGE: Record<string, string> = {
  ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
  WARN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DEBUG: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const SERVICE_KEY_MAP: Record<string, string> = {
  PostgreSQL: 'postgres',
  Redis: 'redis',
  Orthanc: 'orthanc',
  'Portal Web': 'portal-web',
  'Patient API': 'patient-service',
  'Workflow API': 'workflow-service',
  'MONAI Label': 'monai-label',
  Keycloak: 'keycloak',
  RabbitMQ: 'rabbitmq',
  MinIO: 'minio',
};

export function getServiceKey(serviceName: string): string | null {
  return SERVICE_KEY_MAP[serviceName] || null;
}

function useResizable(defaultWidth: number) {
  const [width, setWidth] = useState(defaultWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - ev.clientX;
      const maxW = window.innerWidth * MAX_WIDTH_RATIO;
      const newWidth = Math.min(maxW, Math.max(MIN_WIDTH, startWidth.current + delta));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [width]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    isDragging.current = true;
    startX.current = touch.clientX;
    startWidth.current = width;

    const onTouchMove = (ev: TouchEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - ev.touches[0].clientX;
      const maxW = window.innerWidth * MAX_WIDTH_RATIO;
      const newWidth = Math.min(maxW, Math.max(MIN_WIDTH, startWidth.current + delta));
      setWidth(newWidth);
    };

    const onTouchEnd = () => {
      isDragging.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  }, [width]);

  return { width, onMouseDown, onTouchStart, isDragging };
}

export function ServiceLogPanel({
  open,
  onOpenChange,
  serviceKey,
  serviceName,
  servicePort,
}: ServiceLogPanelProps) {
  const { t } = useLocale();
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [tail, setTail] = useState(200);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { width: panelWidth, onMouseDown: onResizeMouseDown, onTouchStart: onResizeTouchStart } = useResizable(DEFAULT_WIDTH);

  const fetchLogs = useCallback(async () => {
    if (!serviceKey) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/logs?service=${serviceKey}&tail=${tail}`);
      const data: LogResponse = await res.json();

      if (data.error) {
        setError(data.error);
        setLogs(data.lines || []);
      } else {
        setLogs(data.lines);
      }
      setSource(data.source === 'docker' ? `Docker: ${data.container}` : `Process :${servicePort}`);
    } catch {
      setError(t('admin.system.logs.fetchError'));
      setLogs([]);
    }

    setLoading(false);
  }, [serviceKey, tail, servicePort, t]);

  useEffect(() => {
    if (open && serviceKey) {
      fetchLogs();
    } else {
      setLogs([]);
      setError(null);
    }
  }, [open, serviceKey, fetchLogs]);

  useEffect(() => {
    if (open && autoRefresh && serviceKey) {
      intervalRef.current = setInterval(fetchLogs, 5000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [open, autoRefresh, serviceKey, fetchLogs]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs =
    levelFilter === 'all' ? logs : logs.filter((l) => l.level === levelFilter);

  const handleDownload = () => {
    const text = filteredLogs
      .map((l) => `${l.timestamp || ''} [${l.level}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serviceKey}-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  const errorCount = logs.filter((l) => l.level === 'ERROR').length;
  const warnCount = logs.filter((l) => l.level === 'WARN').length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col !max-w-none"
        style={{ width: panelWidth }}
      >
        {/* Resize handle — cạnh trái */}
        <div
          onMouseDown={onResizeMouseDown}
          onTouchStart={onResizeTouchStart}
          className="absolute left-0 top-0 bottom-0 w-2 z-10 cursor-col-resize group flex items-center justify-center hover:bg-primary/10 active:bg-primary/20 transition-colors"
        >
          <div className="h-8 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary/60 group-active:bg-primary transition-colors" />
        </div>

        <SheetHeader className="border-b pb-4 pl-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
              <Terminal className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg">{serviceName}</SheetTitle>
              <SheetDescription className="font-mono text-xs">
                {source} · :{servicePort}
              </SheetDescription>
            </div>
          </div>

          {(errorCount > 0 || warnCount > 0) && (
            <div className="flex gap-2 mt-2">
              {errorCount > 0 && (
                <Badge variant="outline" className={LEVEL_BADGE.ERROR}>
                  {errorCount} {t('admin.system.logs.errors')}
                </Badge>
              )}
              {warnCount > 0 && (
                <Badge variant="outline" className={LEVEL_BADGE.WARN}>
                  {warnCount} {t('admin.system.logs.warnings')}
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        <div className="flex items-center gap-2 py-3 border-b flex-wrap">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-xs"
          >
            <option value="all">{t('admin.system.logs.all')}</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
          </select>

          <select
            value={tail}
            onChange={(e) => setTail(Number(e.target.value))}
            className="rounded-md border bg-background px-2 py-1 text-xs"
          >
            <option value={50}>50 {t('admin.system.logs.lines')}</option>
            <option value={200}>200 {t('admin.system.logs.lines')}</option>
            <option value={500}>500 {t('admin.system.logs.lines')}</option>
            <option value={1000}>1000 {t('admin.system.logs.lines')}</option>
          </select>

          <div className="flex-1" />

          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {autoRefresh ? t('admin.system.logs.pause') : t('admin.system.logs.resume')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={handleDownload}
            disabled={filteredLogs.length === 0}
          >
            <Download className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div
          ref={logContainerRef}
          className="flex-1 min-h-0 overflow-y-auto rounded-lg bg-slate-950 p-3 font-mono text-xs leading-5 select-text"
          onScroll={() => {
            if (!logContainerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
            setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
          }}
        >
          {loading && filteredLogs.length === 0 && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              {t('admin.system.loading')}
            </div>
          )}

          {!loading && filteredLogs.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Terminal className="h-8 w-8 mb-2" />
              <p>{t('admin.system.logs.empty')}</p>
            </div>
          )}

          {filteredLogs.map((line, i) => (
            <div
              key={i}
              className={`flex gap-2 py-px hover:bg-slate-900/50 ${
                line.level === 'ERROR' ? 'bg-red-950/30' : ''
              }`}
            >
              {line.timestamp && (
                <span className="text-slate-600 shrink-0 w-20 truncate" title={line.timestamp}>
                  {formatTimestamp(line.timestamp)}
                </span>
              )}
              <span className={`shrink-0 w-12 ${LEVEL_COLORS[line.level] || 'text-slate-400'}`}>
                {line.level}
              </span>
              <span className="text-slate-200 break-all">{line.message}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between py-2 text-xs text-muted-foreground border-t">
          <span>
            {filteredLogs.length} {t('admin.system.logs.lines')}
            {levelFilter !== 'all' && ` (${levelFilter})`}
          </span>
          <span className="flex items-center gap-1">
            {autoRefresh && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                {t('admin.system.logs.liveUpdates')}
              </>
            )}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts.slice(11, 19);
  }
}
