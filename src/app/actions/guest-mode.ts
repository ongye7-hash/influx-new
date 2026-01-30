'use server';

import { cookies } from 'next/headers';

export async function enableGuestMode() {
  const cookieStore = await cookies();

  cookieStore.set('influx_guest_mode', 'true', {
    path: '/',
    maxAge: 86400, // 24시간
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return { success: true };
}

export async function disableGuestMode() {
  const cookieStore = await cookies();

  cookieStore.delete('influx_guest_mode');

  return { success: true };
}
