import crypto from 'crypto';

// 서명 키
function getSignKey(): string {
  return process.env.GUEST_MODE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'influx-guest-fallback-key';
}

// 서명 생성
export function signGuestToken(): string {
  const hmac = crypto.createHmac('sha256', getSignKey());
  hmac.update('guest');
  return hmac.digest('hex').slice(0, 16);
}

// 서명된 쿠키 값 생성
export function createSignedGuestValue(): string {
  return `guest.${signGuestToken()}`;
}

// 서명 검증
export function verifyGuestCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  return payload === 'guest' && sig === signGuestToken();
}
