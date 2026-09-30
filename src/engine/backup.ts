// Back-up-code: alle profielen met hun voortgang en achtergrond in één (gecomprimeerde)
// tekst, om over te zetten naar een ander apparaat. Geen server nodig. Terugzetten voegt
// samen: profielen uit de code komen erbij of worden bijgewerkt, andere blijven staan.

const VOORVOEGSEL = 'LL1-';
const PROFIELEN = 'leren-lezen:profielen';
// Apparaatinstellingen (zoals geluid uit) gaan bewust niet mee.
const MEE = [/^leren-lezen:profielen$/, /^leren-lezen:voortgang:/, /^leren-lezen:achtergrond:/];

interface Backup {
  v: 1;
  data: Record<string, string>;
}

function naarBase64Url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function vanBase64Url(tekst: string): Uint8Array {
  const b64 = tekst.replace(/-/g, '+').replace(/_/g, '/');
  const s = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function comprimeer(tekst: string, richting: 'in' | 'uit'): Promise<Uint8Array> {
  const invoer = richting === 'in' ? new TextEncoder().encode(tekst) : vanBase64Url(tekst);
  const stroom = new Blob([invoer as Uint8Array<ArrayBuffer>]).stream().pipeThrough(
    richting === 'in' ? new CompressionStream('deflate-raw') : new DecompressionStream('deflate-raw'),
  );
  return new Uint8Array(await new Response(stroom).arrayBuffer());
}

export async function maakBackupCode(): Promise<string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const sleutel = localStorage.key(i)!;
    if (MEE.some((r) => r.test(sleutel))) data[sleutel] = localStorage.getItem(sleutel)!;
  }
  const backup: Backup = { v: 1, data };
  return VOORVOEGSEL + naarBase64Url(await comprimeer(JSON.stringify(backup), 'in'));
}

/** Leest een code; geeft de profielnamen terug om te laten bevestigen, of gooit bij onzin. */
export async function leesBackupCode(code: string): Promise<{ backup: Backup; namen: string[] }> {
  const schoon = code.replace(/\s+/g, '');
  if (!schoon.startsWith(VOORVOEGSEL)) throw new Error('Dit is geen back-up-code.');
  const json = new TextDecoder().decode(await comprimeer(schoon.slice(VOORVOEGSEL.length), 'uit'));
  const backup = JSON.parse(json) as Backup;
  if (backup.v !== 1 || typeof backup.data !== 'object') throw new Error('Onbekende back-up.');
  const profielen = JSON.parse(backup.data[PROFIELEN] ?? '[]') as { id: string; naam: string }[];
  return { backup, namen: profielen.map((p) => p.naam) };
}

export function zetBackupTerug(backup: Backup): void {
  const hier = JSON.parse(localStorage.getItem(PROFIELEN) ?? '[]') as { id: string }[];
  const daar = JSON.parse(backup.data[PROFIELEN] ?? '[]') as { id: string }[];
  const samen = [...hier.filter((p) => !daar.some((d) => d.id === p.id)), ...daar];
  localStorage.setItem(PROFIELEN, JSON.stringify(samen));
  for (const [sleutel, waarde] of Object.entries(backup.data)) {
    if (sleutel !== PROFIELEN && MEE.some((r) => r.test(sleutel))) localStorage.setItem(sleutel, waarde);
  }
}
