import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { collectParameters } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/parameters.js';
import { evaluateRules } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/heuristic-rules.js';
import { decide } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/decision-policy.js';
import { urlFileExtension, EXECUTABLE_FILE_EXTENSIONS } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/url/download-file-extension.js';
import { normalizeManualDomain } from '../extension/HeuriShield-URL20-XGBoost/src/storage/settings.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const startedAt = new Date();
const startTime = performance.now();
const args = process.argv.slice(2);
const detail = args.includes('--detail');
const groupIndex = args.indexOf('--group');
const selectedGroup = groupIndex < 0 ? null : args[groupIndex + 1];
if (groupIndex >= 0 && !/^WB-(?:0[1-9]|1[0-9]|20)$/.test(selectedGroup || '')) {
  console.error('Gunakan --group WB-01 sampai --group WB-20.');
  process.exit(2);
}
const groups = new Map();
function test(id, variation, inputs, expected, execute) {
  let actual, error;
  try { actual = execute(); } catch (e) { error = e.message; }
  const passed = !error && isDeepStrictEqual(actual, expected);
  if (!groups.has(id)) groups.set(id, []);
  groups.get(id).push({ variation, inputs, expected, actual, error, status: passed ? 'Lulus' : 'Gagal' });
}
const base = collectParameters({
  brand: { claimed_brand: { name: 'Contoh' }, claimed_brand_status: 'identified', official_domain_match: false,
    brand_domain_mismatch: false, brand_in_title: false, brand_in_heading: false, brand_in_logo: false },
  dom: { has_password_field: false, has_sensitive_input: false, form_cross_domain: false, download_file_extensions: [] },
  domainAgeDays: 42, urlFileExtension: null
});
function rule(id, target, change, expected, label) {
  const inputs = { ...base, ...change };
  test(id, label, inputs, expected, () => evaluateRules(inputs).find(r => r.id === target).status);
}
const official = { claimed_brand_status: 'identified', official_domain_match: true, brand_in_title: true,
  brand_in_heading: false, brand_in_logo: false, has_password_field: false, has_sensitive_input: false,
  form_cross_domain: false, domain_age_days: 4000 };
const results = (p = [], l = []) => [...p.map(id => ({ id, decision: 'phishing', status: 'matched' })),
  ...l.map(id => ({ id, decision: 'legitimate', status: 'matched' }))];

test('WB-01', 'Temuan tidak tersedia', {}, {
  brand_in_title: 'unknown', brand_in_heading: 'unknown', brand_in_logo: 'unknown', claimed_brand: null,
  claimed_brand_status: 'unknown', verified_reference_domain: null, host_brand_claim: 'unknown',
  official_domain_match: 'unknown', brand_domain_mismatch: 'unknown', has_password_field: 'unknown',
  has_sensitive_input: 'unknown', form_cross_domain: 'unknown', login_button_detected: 'unknown',
  login_redirect_detected: 'unknown', has_download_link: 'unknown', download_file_extensions: 'unknown',
  download_target_cross_domain: 'unknown', domain_age_days: null, url_file_extension: 'unknown'
}, () => collectParameters());
test('WB-02', 'Pemindaian belum lengkap', { extensions: ['pdf'], scan: 'download_scan_incomplete' },
  ['pdf', 'unknown'], () => collectParameters({ dom: { download_file_extensions: ['pdf'],
    download_unresolved_checks: ['download_scan_incomplete'] } }).download_file_extensions);
for (const [label, value] of [['Negatif', -1], ['NaN', NaN], ['Infinity', Infinity], ['Tidak tersedia', undefined]]) {
  test('WB-03', label, { domainAge: String(value) }, null, () => collectParameters({ domainAgeDays: value }).domain_age_days);
}
for (const [url, expected] of [['https://unduh.example/setup.exe', 'exe'],
  ['https://unduh.example/login', null], ['https://unduh.example/login?file=setup.exe', null]]) {
  test('WB-04', 'Akhiran URL', { url }, expected, () => urlFileExtension(url));
}
for (const [ext, expected] of [['zip', true], ['iso', true], ['lnk', true], ['apk', true], ['pdf', false]]) {
  test('WB-04', 'Keanggotaan jenis berkas', { extension: ext }, expected, () => EXECUTABLE_FILE_EXTENSIONS.has(ext));
}
for (const [value, expected] of [[true, 'matched'], [false, 'not_matched'], ['unknown', 'undetermined']])
  rule('WB-05', 'P1', { brand_domain_mismatch: value }, expected, `Konflik ${value}`);
for (const [value, expected] of [[true, 'matched'], [false, 'not_matched']])
  rule('WB-06', 'P2', { has_password_field: true, form_cross_domain: value }, expected, `Tujuan lintas domain ${value}`);
rule('WB-07', 'P2', { has_password_field: false, has_sensitive_input: true, form_cross_domain: true }, 'matched', 'Masukan sensitif tanpa kata sandi');
rule('WB-08', 'P2', { has_password_field: true, form_cross_domain: true, official_domain_match: 'unknown' }, 'undetermined', 'Kecocokan domain belum diketahui');
for (const [age, expected] of [[365, 'matched'], [366, 'not_matched'], [null, 'undetermined']])
  rule('WB-09', 'P3', { domain_age_days: age, has_password_field: true }, expected, `Domain Age ${age}`);
for (const [label, change, expected] of [['EXE dari DOM', { download_file_extensions: ['exe'] }, 'matched'],
  ['APK dari URL', { url_file_extension: 'apk' }, 'matched'], ['PDF saja', { download_file_extensions: ['pdf'] }, 'not_matched']])
  rule('WB-10', 'P4', change, expected, label);
const incomplete = collectParameters({ dom: { download_file_extensions: [], download_unresolved_checks: ['download_scan_incomplete'] } });
rule('WB-11', 'P4', { download_file_extensions: incomplete.download_file_extensions }, 'undetermined', 'Belum lengkap tanpa ekstensi yang memenuhi aturan');
rule('WB-12', 'P4', { domain_age_days: 4000, download_file_extensions: ['exe'] }, 'not_matched', 'Domain lama dengan EXE');
for (const [label, change, expected] of [['Kedua masukan false', {}, 'matched'],
  ['Kedua masukan unknown', { has_password_field: 'unknown', has_sensitive_input: 'unknown' }, 'matched'],
  ['Kata sandi true', { has_password_field: true }, 'not_matched']])
  rule('WB-13', 'L1', { ...official, ...change }, expected, label);
for (const [label, change, expected] of [['Usia 200 hari', { domain_age_days: 200 }, 'not_matched'],
  ['Brand tidak tampil', { brand_in_title: false }, 'not_matched'],
  ['Usia tidak diketahui', { domain_age_days: null }, 'undetermined']])
  rule('WB-14', 'L1', { ...official, ...change }, expected, label);
for (const [value, expected] of [[false, 'matched'], [true, 'not_matched'], ['unknown', 'undetermined']])
  rule('WB-15', 'L2', { ...official, has_password_field: true, form_cross_domain: value }, expected, `Tujuan lintas domain ${value}`);
for (const urlClass of [null, 'UNKNOWN'])
  test('WB-16', 'Masukan kelas tidak valid', { urlClass }, { verdict: 'LIMITED', source: 'url_unavailable', reasons: [] }, () => decide(urlClass));
for (const urlClass of ['SAFE', 'DANGEROUS']) {
  for (const p of ['P1','P2','P3','P4']) {
    test('WB-17', 'Aturan P terpenuhi', { urlClass, rules: results([p]) },
      { verdict: 'DANGEROUS', source: 'brand_dom_phishing', reasons: [p] }, () => decide(urlClass, results([p])));
  }
  test('WB-17', 'P dan L sama-sama terpenuhi', { urlClass, rules: results(['P2'], ['L2']) },
    { verdict: 'DANGEROUS', source: 'brand_dom_phishing', reasons: ['P2'] }, () => decide(urlClass, results(['P2'], ['L2'])));
}
for (const l of ['L1','L2']) {
  test('WB-18', 'Koreksi menjadi legitimate', { urlClass: 'DANGEROUS', rules: results([], [l]) },
    { verdict: 'SAFE', source: 'brand_dom_legitimate', reasons: [l] }, () => decide('DANGEROUS', results([], [l])));
}
for (const urlClass of ['SAFE', 'DANGEROUS']) {
  for (const status of ['not_matched', 'undetermined', 'empty']) {
    const rules = status === 'empty' ? [] : ['P1','P2','P3','P4','L1','L2'].map(id =>
      ({ id, decision: id.startsWith('P') ? 'phishing' : 'legitimate', status }));
    test('WB-19', 'Tidak ada aturan matched', { urlClass, rules },
      { verdict: urlClass, source: 'url_model', reasons: [] }, () => decide(urlClass, rules));
  }
}
for (const [value, expected] of [['https://gemini.google.com/app', 'google.com'], ['user.github.io', 'user.github.io']])
  test('WB-20', 'Normalisasi domain', { value }, expected, () => normalizeManualDomain(value));

const files = ['src/analyzer/rules/parameters.js', 'src/analyzer/rules/heuristic-rules.js',
  'src/analyzer/rules/decision-policy.js', 'src/analyzer/url/download-file-extension.js', 'src/storage/settings.js'];
const hashes = Object.fromEntries(files.map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(root, 'extension/HeuriShield-URL20-XGBoost', file))).digest('hex')]));
const rows = [...groups].map(([id, variations]) => ({ id, variations, variation_count: variations.length,
  passed: variations.filter(v => v.status === 'Lulus').length,
  status: variations.every(v => v.status === 'Lulus') ? 'Lulus' : 'Gagal' }));
const report = { executed_at_utc: startedAt.toISOString(), timezone: 'Asia/Makassar',
  node_version: process.version, duration_ms: Math.round(performance.now()-startTime),
  method: 'White-box functional logic checks derived from the thesis test conditions',
  execution: 'Real imported functions executed in Node.js; parameter and rule inputs supplied directly; no browser or network used.',
  limitations: ['No live classification accuracy measurement.', 'No measurement of whole-extension code coverage.',
    'Registry enlargement is not exercised by these direct rule inputs; its separate regression report must be kept distinct.'],
  source_hashes: hashes, groups: rows.length, variations: rows.reduce((n,r) => n+r.variation_count,0),
  passed: rows.reduce((n,r) => n+r.passed,0), rows };
const output = path.join(root, 'hasil_pengujian/white_box/hasil_white_box_skripsi_20_kelompok.json');
fs.writeFileSync(output, JSON.stringify(report, null, 2));
const md = ['# Hasil pengujian white box 20 kelompok', '',
  'Waktu UTC: '+report.executed_at_utc, 'Node.js: '+report.node_version, '', report.execution, '',
  '| ID | Variasi | Lulus | Status |', '|---|---:|---:|---|',
  ...rows.map(r => `| ${r.id} | ${r.variation_count} | ${r.passed} | ${r.status} |`), '',
  ...rows.flatMap(r => [`## ${r.id}`, ...r.variations.map(v =>
    `- ${v.variation}: expected=${JSON.stringify(v.expected)}, actual=${JSON.stringify(v.actual)}, status=${v.status}${v.error ? ', error='+v.error : ''}`)])];
fs.writeFileSync(output.replace(/\.json$/, '.md'), md.join('\n'));
const localTime = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Makassar', dateStyle: 'long', timeStyle: 'medium' }).format(startedAt);
const header = [
  '============================================================',
  ' HASIL PENGUJIAN WHITE BOX - EXTENSION HEURISHIELD',
  '============================================================',
  `Waktu       : ${localTime} WITA`,
  `Node.js     : ${report.node_version}`,
  'Lingkungan  : fungsi asli; masukan pengujian terkontrol',
  'Lingkup     : 20 kelompok / 60 variasi rancangan skripsi',
  'Pemeriksaan : hasil aktual dibandingkan hasil yang diharapkan',
  ''
];
const summary = rows.map(r => `${r.status === 'Lulus' ? '[LULUS]' : '[GAGAL]'} ${r.id}  ${String(r.passed).padStart(2)}/${String(r.variation_count).padEnd(2)} variasi sesuai`);
const detailsFor = chosenRows => chosenRows.flatMap(r => [
  '', `--- ${r.id}: ${r.variation_count} variasi ---`,
  ...r.variations.flatMap((v,i) => [
    `${r.id}.${String(i+1).padStart(2,'0')} ${v.variation}`,
    `  Masukan    : ${JSON.stringify(v.inputs)}`,
    `  Diharapkan : ${JSON.stringify(v.expected)}`,
    `  Aktual     : ${JSON.stringify(v.actual)}`,
    `  Status     : ${v.status}${v.error ? ' / '+v.error : ''}`,
    ''
  ])
]);
const footer = [
  '', '------------------------------------------------------------',
  `Kelompok lulus : ${rows.filter(r=>r.status==='Lulus').length}/${report.groups}`,
  `Variasi lulus  : ${report.passed}/${report.variations}`,
  `Variasi gagal  : ${report.variations-report.passed}`,
  `Durasi         : ${report.duration_ms} ms`,
  'Ini pengujian logika fungsi; bukan pengukuran akurasi situs live.',
  'Tidak menyatakan seluruh kode extension telah tercakup.',
  `Laporan JSON   : ${path.relative(root, output).split(path.sep).join('/')}`,
  `Log lengkap    : ${path.relative(root, output.replace(/\.json$/, '.txt')).split(path.sep).join('/')}`
];
fs.writeFileSync(output.replace(/\.json$/, '.txt'), [...header, ...summary, ...detailsFor(rows), ...footer].join('\n'));
const displayRows = selectedGroup ? rows.filter(r=>r.id===selectedGroup) : rows;
console.log([...header, ...summary,
  ...(selectedGroup ? ['', `Rincian yang ditampilkan: ${selectedGroup}; seluruh 20 kelompok tetap dijalankan.`] : []),
  ...(detail || selectedGroup ? detailsFor(displayRows) : []), ...footer].join('\n'));
if (report.passed !== report.variations) process.exitCode = 1;
