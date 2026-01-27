export async function GET() {
  return new Response('influx-indexnow-key-2026-abc123', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
