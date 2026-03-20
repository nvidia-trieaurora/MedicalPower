# ADR-001: DICOM Backend — Orthanc

**Status:** Accepted  
**Date:** 2026-03-19  
**Decision:** Use Orthanc as the DICOM backend server

## Context

MedicalPower needs a DICOM server to store, retrieve, and serve medical images. The two main options are Orthanc and dcm4chee.

## Decision

Use **Orthanc** with DICOMweb plugin for MVP. Plan migration path to dcm4chee for enterprise scale if needed.

## Rationale

- Simpler setup: single binary, C++, plugin system
- Full DICOMweb support via plugin (WADO-RS, QIDO-RS, STOW-RS)
- Excellent REST API, well-documented
- Explorer 2 UI for admin access
- Sufficient for expected volume (<1M studies)
- Active community, medical imaging focused

## Consequences

- Orthanc lacks built-in HL7v2 adapter (mitigated by integration-service)
- Single-node architecture (mitigated by PostgreSQL index plugin for better query performance)
- If >10M studies needed, evaluate dcm4chee migration

## Alternatives Considered

- **dcm4chee:** More enterprise features but complex Java/WildFly setup
- **Google Cloud Healthcare API:** Good but requires cloud, not self-hosted
