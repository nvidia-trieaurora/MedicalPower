import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type LogSource = 'docker' | 'process';

interface ServiceLogConfig {
  source: LogSource;
  container?: string;
  processPort?: number;
  label: string;
}

const SERVICE_MAP: Record<string, ServiceLogConfig> = {
  postgres: { source: 'docker', container: 'docker-postgres-1', label: 'PostgreSQL' },
  redis: { source: 'docker', container: 'docker-redis-1', label: 'Redis' },
  orthanc: { source: 'docker', container: 'docker-orthanc-1', label: 'Orthanc' },
  keycloak: { source: 'docker', container: 'docker-keycloak-1', label: 'Keycloak' },
  rabbitmq: { source: 'docker', container: 'docker-rabbitmq-1', label: 'RabbitMQ' },
  minio: { source: 'docker', container: 'docker-minio-1', label: 'MinIO' },
  'monai-label': { source: 'docker', container: 'docker-monai-label-1', label: 'MONAI Label' },
  'patient-service': { source: 'process', processPort: 4002, label: 'Patient API' },
  'workflow-service': { source: 'process', processPort: 4006, label: 'Workflow API' },
};

const VALID_SERVICES = Object.keys(SERVICE_MAP);

async function getDockerLogs(container: string, tail: number, since?: string): Promise<string> {
  const sinceArg = since ? `--since ${since}` : '';
  const { stdout, stderr } = await execAsync(
    `docker logs ${container} --tail ${tail} --timestamps ${sinceArg} 2>&1`,
    { maxBuffer: 2 * 1024 * 1024, timeout: 10_000 }
  );
  return stdout || stderr;
}

async function getProcessLogs(port: number, tail: number): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `lsof -ti :${port} | head -1`,
      { timeout: 5_000 }
    );
    const pid = stdout.trim();
    if (!pid) return `No process found on port ${port}`;

    const { stdout: logPath } = await execAsync(
      `readlink -f /proc/${pid}/fd/1 2>/dev/null || echo ""`,
      { timeout: 3_000 }
    );

    if (logPath.trim() && logPath.trim() !== '') {
      const { stdout: logs } = await execAsync(
        `tail -n ${tail} "${logPath.trim()}"`,
        { maxBuffer: 2 * 1024 * 1024, timeout: 5_000 }
      );
      return logs;
    }

    const { stdout: psOutput } = await execAsync(
      `ps -p ${pid} -o pid,ppid,etime,args --no-headers 2>/dev/null || ps -p ${pid} -o pid,ppid,etime,command 2>/dev/null`,
      { timeout: 3_000 }
    );

    return [
      `Process running on port ${port} (PID: ${pid})`,
      `Process info: ${psOutput.trim()}`,
      '',
      'stdout/stderr not captured to file — attach via "docker logs" if containerized,',
      'or check the terminal where the service was started.',
    ].join('\n');

  } catch {
    return `Unable to read logs for process on port ${port}. Service may not be running.`;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service');
  const tail = Math.min(Number(searchParams.get('tail') || '200'), 1000);
  const since = searchParams.get('since') || undefined;

  if (!service || !VALID_SERVICES.includes(service)) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_SERVICE',
          message: `Invalid service. Valid: ${VALID_SERVICES.join(', ')}`,
        },
        availableServices: VALID_SERVICES,
      },
      { status: 400 }
    );
  }

  const config = SERVICE_MAP[service];

  try {
    let rawLogs: string;

    if (config.source === 'docker' && config.container) {
      rawLogs = await getDockerLogs(config.container, tail, since);
    } else if (config.source === 'process' && config.processPort) {
      rawLogs = await getProcessLogs(config.processPort, tail);
    } else {
      rawLogs = 'Unknown log source';
    }

    const lines = rawLogs
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => parseLine(line));

    return NextResponse.json({
      service: config.label,
      serviceKey: service,
      source: config.source,
      container: config.container,
      timestamp: new Date().toISOString(),
      lineCount: lines.length,
      lines,
    });
  } catch (err: any) {
    const isNotRunning =
      err.message?.includes('No such container') ||
      err.message?.includes('not running');

    return NextResponse.json(
      {
        service: config.label,
        serviceKey: service,
        source: config.source,
        timestamp: new Date().toISOString(),
        lineCount: 0,
        lines: [],
        error: isNotRunning
          ? 'Container is not running'
          : err.message || 'Failed to retrieve logs',
      },
      { status: isNotRunning ? 200 : 500 }
    );
  }
}

interface LogLine {
  timestamp?: string;
  level: string;
  message: string;
}

function parseLine(raw: string): LogLine {
  const timestampMatch = raw.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(.*)/);
  const message = timestampMatch ? timestampMatch[2] : raw;
  const timestamp = timestampMatch ? timestampMatch[1] : undefined;

  let level = 'INFO';
  const upper = message.toUpperCase();
  if (upper.includes('ERROR') || upper.includes('FATAL') || upper.includes('CRIT')) {
    level = 'ERROR';
  } else if (upper.includes('WARN')) {
    level = 'WARN';
  } else if (upper.includes('DEBUG') || upper.includes('TRACE')) {
    level = 'DEBUG';
  }

  return { timestamp, level, message };
}
