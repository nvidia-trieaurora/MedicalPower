# Infrastructure Guide

## Database Connection

### PostgreSQL

PostgreSQL runs in Docker but is accessible from your local machine via port 5432.

**Connection Details:**
```
Host:     localhost (or 127.0.0.1)
Port:     5432
User:     mp_admin
Password: mp_secret_dev
```

**Databases:**

| Database | Purpose | Managed By |
|----------|---------|------------|
| `medicalpower` | Application data (patients, cases, tasks, annotations) | Prisma migrations |
| `orthanc` | DICOM index and metadata | Orthanc (do not modify) |
| `keycloak` | Authentication data | Keycloak (do not modify) |

### Connecting with GUI Tools

You can use any PostgreSQL client:

| Tool | Platform | Free? |
|------|----------|-------|
| pgAdmin | Web/Desktop | Yes |
| DBeaver | All | Yes |
| TablePlus | Mac/Win | Free tier |
| DataGrip | All | Paid (JetBrains) |
| VS Code Database Client | VS Code/Cursor | Yes |

**VS Code/Cursor Database Client settings:**

```
Server Type: PostgreSQL
Host:        127.0.0.1
Port:        5432
Username:    mp_admin
Password:    mp_secret_dev
Database:    medicalpower
SSL:         Off
```

### Connecting via Command Line

```bash
# Direct (requires psql installed)
psql -h localhost -p 5432 -U mp_admin -d medicalpower

# Via Docker
docker exec -it docker-postgres-1 psql -U mp_admin -d medicalpower
```

## Orthanc (DICOM Server)

**Web UI:** http://localhost:8042/ui/app/ (Orthanc Explorer 2)
**Credentials:** admin / mp_admin_2026
**DICOMweb:** http://localhost:8042/dicom-web/
**DICOM Port:** 4242 (for C-STORE)

### Upload DICOM Data

```bash
# Using the upload script
./scripts/upload-dicom.sh /path/to/dicom/folder

# Using curl (single file)
curl -u admin:mp_admin_2026 -X POST -H "Content-Type: application/dicom" \
  --data-binary @/path/to/file.dcm http://localhost:8042/instances
```

## Docker Services

### Starting Infrastructure

```bash
cd infra/docker

# Core services (PostgreSQL, Redis, Orthanc)
docker compose -f docker-compose.dev.yml up -d postgres redis orthanc

# All services (includes RabbitMQ, MinIO, Keycloak)
docker compose -f docker-compose.dev.yml up -d

# With GPU (MONAI Label)
docker compose -f docker-compose.dev.yml --profile gpu up -d
```

### Service Ports

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | `psql -h localhost -p 5432` |
| Redis | 6379 | `redis-cli -h localhost -p 6379` |
| Orthanc Web | 8042 | http://localhost:8042/ui/app/ |
| Orthanc DICOM | 4242 | DICOM C-STORE |
| RabbitMQ | 5672 | AMQP protocol |
| RabbitMQ Admin | 15672 | http://localhost:15672 |
| MinIO API | 9000 | S3-compatible |
| MinIO Console | 9001 | http://localhost:9001 |
| Keycloak | 8080 | http://localhost:8080 |
| MONAI Label | 8000 | http://localhost:8000 (GPU required) |

### Stopping Infrastructure

```bash
cd infra/docker

# Stop all
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: deletes all data)
docker compose -f docker-compose.dev.yml down -v
```

## Data Persistence

All data is stored in Docker volumes on your local machine:

| Volume | Data |
|--------|------|
| `pg_data` | PostgreSQL databases |
| `redis_data` | Redis cache |
| `orthanc_data` | DICOM files |
| `minio_data` | Object storage (segmentation masks) |
| `rabbitmq_data` | Message queue state |
| `monai_data` | AI model weights and data |
