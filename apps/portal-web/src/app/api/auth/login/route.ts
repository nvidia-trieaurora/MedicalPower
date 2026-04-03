import { NextRequest, NextResponse } from 'next/server';
import { MOCK_USERS, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const { password: _, ...userData } = user;
  const token = signToken(userData);

  return NextResponse.json({ token, user: userData });
}
