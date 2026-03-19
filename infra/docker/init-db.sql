-- Initialize databases for MedicalPower services
-- This runs once on first PostgreSQL start

CREATE DATABASE orthanc;
CREATE DATABASE keycloak;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE orthanc TO mp_admin;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO mp_admin;
GRANT ALL PRIVILEGES ON DATABASE medicalpower TO mp_admin;
