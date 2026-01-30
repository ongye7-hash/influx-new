import { NextResponse } from 'next/server';
import { createSignedGuestValue } from '@/lib/guest-mode';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('influx_guest_mode', createSignedGuestValue(), {
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('influx_guest_mode', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
