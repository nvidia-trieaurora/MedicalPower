import { NextResponse } from 'next/server';

const ORTHANC_URL = process.env.ORTHANC_URL || 'http://localhost:8042';
const ORTHANC_USER = process.env.ORTHANC_USER || 'admin';
const ORTHANC_PASS = process.env.ORTHANC_PASS || 'mp_admin_2026';
const PATIENT_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';

const authHeader = 'Basic ' + Buffer.from(`${ORTHANC_USER}:${ORTHANC_PASS}`).toString('base64');

interface OrthancStudy {
  ID: string;
  MainDicomTags: {
    StudyInstanceUID: string;
    StudyDate?: string;
    StudyDescription?: string;
    AccessionNumber?: string;
    ReferringPhysicianName?: string;
    InstitutionName?: string;
  };
  PatientMainDicomTags: {
    PatientName?: string;
    PatientID?: string;
  };
  Series: string[];
}

interface OrthancSeries {
  MainDicomTags: {
    Modality?: string;
    BodyPartExamined?: string;
  };
  Instances: string[];
}

export async function POST() {
  try {
    const studyIds: string[] = await fetchOrthanc('/studies');

    const results = [];

    for (const orthancId of studyIds) {
      const study: OrthancStudy = await fetchOrthanc(`/studies/${orthancId}`);
      const tags = study.MainDicomTags;
      const patTags = study.PatientMainDicomTags;

      let modality = 'UNKNOWN';
      let bodyPart: string | null = null;
      let totalInstances = 0;

      for (const seriesId of study.Series.slice(0, 5)) {
        const series: OrthancSeries = await fetchOrthanc(`/series/${seriesId}`);
        if (series.MainDicomTags.Modality) modality = series.MainDicomTags.Modality;
        if (series.MainDicomTags.BodyPartExamined) bodyPart = series.MainDicomTags.BodyPartExamined;
        totalInstances += series.Instances.length;
      }

      if (study.Series.length > 5) {
        for (const seriesId of study.Series.slice(5)) {
          const series: OrthancSeries = await fetchOrthanc(`/series/${seriesId}`);
          totalInstances += series.Instances.length;
        }
      }

      results.push({
        orthancId,
        studyInstanceUid: tags.StudyInstanceUID,
        patientName: patTags.PatientName,
        patientId: patTags.PatientID,
        modality,
        studyDate: tags.StudyDate ? parseDate(tags.StudyDate) : null,
        description: tags.StudyDescription || null,
        accessionNumber: tags.AccessionNumber || null,
        institutionName: tags.InstitutionName || null,
        referringPhysician: tags.ReferringPhysicianName || null,
        bodyPart,
        numSeries: study.Series.length,
        numInstances: totalInstances,
      });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      orthancUrl: ORTHANC_URL,
      studyCount: results.length,
      studies: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to sync from Orthanc' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const studyIds: string[] = await fetchOrthanc('/studies');

    const studies = await Promise.all(
      studyIds.map(async (orthancId) => {
        const study: OrthancStudy = await fetchOrthanc(`/studies/${orthancId}`);
        const tags = study.MainDicomTags;
        const patTags = study.PatientMainDicomTags;

        return {
          orthancId,
          studyInstanceUid: tags.StudyInstanceUID,
          patientName: patTags.PatientName,
          patientId: patTags.PatientID,
          studyDate: tags.StudyDate ? parseDate(tags.StudyDate) : null,
          description: tags.StudyDescription || null,
          modality: 'CT',
          numSeries: study.Series.length,
        };
      })
    );

    return NextResponse.json({ studies });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch studies from Orthanc' },
      { status: 500 }
    );
  }
}

async function fetchOrthanc(path: string) {
  const res = await fetch(`${ORTHANC_URL}${path}`, {
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error(`Orthanc ${path}: HTTP ${res.status}`);
  return res.json();
}

function parseDate(dicomDate: string): string {
  if (dicomDate.length === 8) {
    return `${dicomDate.slice(0, 4)}-${dicomDate.slice(4, 6)}-${dicomDate.slice(6, 8)}`;
  }
  return dicomDate;
}
