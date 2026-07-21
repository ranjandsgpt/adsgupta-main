export async function sendAuthEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.AUTH_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    'AdsGupta <noreply@adsgupta.com>';

  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY is not configured' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { sent: false, reason: body || `Resend HTTP ${res.status}` };
  }

  return { sent: true };
}
