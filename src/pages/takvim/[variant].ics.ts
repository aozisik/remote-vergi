import type { APIRoute, GetStaticPaths } from 'astro';
import {
  type Variant,
  deadlinesFor,
  variants,
} from '../../data/takvim';

// Subscribable iCalendar feeds, one per toggle combination on /vergi-takvimi/.
// Calendar apps re-fetch the URL, so subscribers pick up date changes on the
// next deploy without visiting the site.

export const getStaticPaths: GetStaticPaths = () =>
  (Object.keys(variants) as Variant[]).map((variant) => ({
    params: { variant },
  }));

const escape = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// RFC 5545: lines longer than 75 octets are folded with CRLF + space.
const fold = (line: string): string => {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length;
    if (size + len > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += len;
  }
  parts.push(current);
  return parts.join('\r\n ');
};

const compact = (date: string) => date.replace(/-/g, '');

const nextDay = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return compact(d.toISOString().slice(0, 10));
};

export const GET: APIRoute = ({ params }) => {
  const variant = params.variant as Variant;
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const pageUrl = 'https://remotevergi.com/vergi-takvimi/';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Remote Vergi//Vergi Takvimi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape('Vergi takvimi (Remote Vergi)')}`,
    `X-WR-CALDESC:${escape('Yurt dışına çalışan şahıs şirketleri için son tarihler. remotevergi.com/vergi-takvimi')}`,
    'X-WR-TIMEZONE:Europe/Istanbul',
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
  ];

  for (const d of deadlinesFor(variant)) {
    const summary = `${d.title}${d.estimated ? ' (tahmini)' : ''}`;
    const description = [
      `${d.period}.`,
      d.body,
      d.estimated
        ? 'Tahmini tarih: GİB yılın resmi takvimini yayımlayınca doğrulanacak.'
        : '',
      d.guide ? `${d.guide.label}: https://remotevergi.com${d.guide.href}` : '',
      `Takvim: ${pageUrl}`,
    ]
      .filter(Boolean)
      .join('\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${d.id}@remotevergi.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(d.date)}`,
      `DTEND;VALUE=DATE:${nextDay(d.date)}`,
      `SUMMARY:${escape(summary)}`,
      `DESCRIPTION:${escape(description)}`,
      `URL:${pageUrl}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(`${d.title}: 3 gün kaldı`)}`,
      // All-day events start at 00:00, so this fires at 09:00 three days before.
      'TRIGGER:-P2DT15H',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
