import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mp-dev-secret-change-in-production';

export type UserRole = 'system_admin' | 'org_admin' | 'clinical_lead' | 'radiologist' | 'annotator' | 'qa_reviewer' | 'data_scientist' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
}

export interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function isAdmin(role: UserRole): boolean {
  return role === 'system_admin' || role === 'org_admin';
}

export const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: 'user_admin',
    email: 'admin@medicalpower.dev',
    fullName: 'System Admin',
    role: 'system_admin',
    organizationId: 'org_001',
    organizationName: 'BV Thống Nhất',
    password: 'admin123',
  },
  {
    id: 'user_lead',
    email: 'lead@medicalpower.dev',
    fullName: 'Dr. Đỗ Bảo Ngọc',
    role: 'clinical_lead',
    organizationId: 'org_001',
    organizationName: 'BV Thống Nhất',
    password: 'lead123',
  },
  {
    id: 'user_annotator',
    email: 'annotator@medicalpower.dev',
    fullName: 'Nguyễn Thị Mai',
    role: 'annotator',
    organizationId: 'org_001',
    organizationName: 'BV Thống Nhất',
    password: 'anno123',
  },
  {
    id: 'user_radiologist',
    email: 'radiologist@medicalpower.dev',
    fullName: 'BS. Trần Văn Hùng',
    role: 'radiologist',
    organizationId: 'org_001',
    organizationName: 'BV Thống Nhất',
    password: 'radio123',
  },
];
