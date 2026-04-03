import { NextResponse } from 'next/server';

interface ServiceHealth {
  name: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  detail?: string;
}

async function checkHealth(name: string, url: string, port: number, timeoutMs = 3000): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return {
      name,
      port,
      status: res.ok ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - start,
      detail: `HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      name,
      port,
      status: 'unhealthy',
      responseTime: Date.now() - start,
      detail: err.cause?.code || err.message || 'Connection failed',
    };
  }
}

export async function GET() {
  const checks = await Promise.all([
    checkHealth('PostgreSQL', 'http://localhost:5432', 5432).then((r) => ({ ...r, status: 'unknown' as const, detail: 'TCP check not supported via fetch' })),
    checkHealth('Redis', 'http://localhost:6379', 6379).then((r) => ({ ...r, status: 'unknown' as const, detail: 'TCP check not supported via fetch' })),
    checkHealth('Orthanc', 'http://localhost:8042/system', 8042),
    checkHealth('Portal Web', 'http://localhost:3000', 3000),
    checkHealth('Patient API', 'http://localhost:4002/docs', 4002),
    checkHealth('Workflow API', 'http://localhost:4006/docs', 4006),
    checkHealth('MONAI Label', 'http://localhost:8000/info/', 8000),
    checkHealth('Keycloak', 'http://localhost:8080/health/ready', 8080),
    checkHealth('RabbitMQ', 'http://localhost:15672', 15672),
    checkHealth('MinIO', 'http://localhost:9001', 9001),
  ]);

  const healthy = checks.filter((c) => c.status === 'healthy').length;
  const total = checks.length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    summary: { healthy, unhealthy: total - healthy, total },
    services: checks,
  });
}
