import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { BRAND_REGISTRY, BRAND_REGISTRY_STATS, registryEntry, registryEntryByName, registryLookalikeKey } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/brand/brand-registry.js';
import { BRAND_REGISTRY as curated } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/brand/brand-registry-curated.js';
import { IMPORTED_BRANDS } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/brand/brand-registry-imported.js';
import { analyzeBrandEvidence } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/brand/brand-evidence.js';
import { collectParameters } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/parameters.js';
import { evaluateRules } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/heuristic-rules.js';
import { decide, hasVerifiedOfficialDomain } from '../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/decision-policy.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'extension/HeuriShield-URL20-XGBoost/src/analyzer/brand');
let previous = fs.readFileSync(path.join(root, 'tests/fixtures/backup_registry_20261112/brand-evidence.js'), 'utf8');
previous = previous.replace(/from\s+"([^"]+)"/g, (_, specifier) => {
  const target = specifier === './brand-registry.js' ? './brand-registry-curated.js' : specifier;
  return `from ${JSON.stringify(pathToFileURL(path.resolve(directory, target)).href)}`;
});
const { analyzeBrandEvidence: oldAnalyze } = await import(`data:text/javascript;base64,${Buffer.from(previous).toString('base64')}`);
const checks = [];
async function check(name, fn) { await fn(); checks.push({ name, passed: true }); }
const compact = x => x.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
function oneEdit(a, b) {
  if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return edits + a.length - i + b.length - j === 1;
}
const unavailable = async () => ({ lookup_success: false, found: false, candidates: [] });
const offline = { lookup: unavailable, domainSearch: unavailable, domainLookup: unavailable, verifyLookup: unavailable };
const snapshot = name => ({ title: `${name} Login`, headings: [{ text: name }], logos: [{ text: name, context: 'primary' }],
  password_fields: [{}], sensitive_fields: [], controls: [{ type: 'native_login' }], forms: [] });
const main = brand => Object.fromEntries(['brand_in_title','brand_in_heading','brand_in_logo','claimed_brand','claimed_brand_status',
  'verified_reference_domain','host_brand_claim','official_domain_match','brand_domain_mismatch'].map(key => [key, brand[key]]));

await check('10,031 distinct names, not 10,000 aliases', () => {
  assert.equal(BRAND_REGISTRY_STATS.distinct_names, 10031);
  assert.equal(new Set([...BRAND_REGISTRY.values()].map(e => compact(e.name))).size, 10031);
  assert.equal(IMPORTED_BRANDS.length, 10000);
});
await check('All curated lookup keys and official domains preserved', () => {
  for (const [key, entry] of curated) assert.deepEqual(registryEntry(key), entry);
});
await check('Claude official domain can correct a phishing classification', async () => {
  const url = 'https://claude.ai/login';
  const brand = await analyzeBrandEvidence(null, url, {
    ...offline,
    lookup: async () => ({ lookup_success: true, candidates: [
      { name: 'Claude', domain: 'claude.com', verified: true }
    ] })
  });
  const dom = { form_cross_domain: 'unknown' };
  const verified = hasVerifiedOfficialDomain(url, url, brand, dom);
  assert.equal(brand.verified_reference_domain, 'claude.ai');
  assert.equal(verified, true);
  assert.equal(decide('DANGEROUS', [], null, verified).source, 'verified_official_domain');
  assert.equal(decide('DANGEROUS', [{ id: 'P1', decision: 'phishing', status: 'matched' }], null, verified).verdict, 'DANGEROUS');
  assert.equal(hasVerifiedOfficialDomain(url, url, { ...brand, reference_provider_attested: false }, dom), false);
  assert.equal(hasVerifiedOfficialDomain(url, url, brand, { form_cross_domain: true }), false);
  assert.equal(hasVerifiedOfficialDomain('https://claude.ai.example.com/', url, brand, dom), false);
  const spoof = 'https://claude.ai.example.com/';
  assert.equal(hasVerifiedOfficialDomain(spoof, spoof, brand, dom), false);
  const form = 'https://docs.google.com/forms/d/e/example/viewform';
  assert.equal(hasVerifiedOfficialDomain(form, form, { ...brand, verified_reference_domain: 'google.com' }, dom), false);
});
await check('Every imported name is searchable and remains untrusted', () => {
  for (const entry of IMPORTED_BRANDS) {
    assert.equal(registryEntryByName(entry.name)?.trusted, false);
    assert.equal(registryEntry(entry.name)?.name, entry.name);
    assert.equal(registryEntryByName(entry.name).domains_complete, false);
  }
});
await check('Curated lookalike Tokopedia retains priority', () => {
  assert.equal(registryLookalikeKey('t0kopedia', oneEdit), 'tokopedia');
});
await check('Ambiguous imported lookalikes do not select the first arbitrary brand', () => {
  // Compare the indexed matcher with exhaustive distinct-identity search.
  for (const entry of IMPORTED_BRANDS.slice(0, 40)) {
    const token = `x${entry.key.slice(1)}`;
    const curatedMatch = [...curated.keys()].find(key => oneEdit(token, key));
    const matches = [...BRAND_REGISTRY].filter(([key]) => oneEdit(token, key));
    const identities = new Set(matches.map(([, e]) => e));
    if (!curatedMatch && identities.size > 1) assert.equal(registryLookalikeKey(token, oneEdit), null);
  }
});
for (const entry of new Map([...curated.values()].map(e => [e.name, e])).values()) {
  await check(`Curated regression: ${entry.name}`, async () => {
    for (const url of [`https://${entry.domains[0]}/login`, `https://${entry.domains[0]}.example.net/login`]) {
      const before = await oldAnalyze(snapshot(entry.name), url, offline);
      const after = await analyzeBrandEvidence(snapshot(entry.name), url, offline);
      assert.deepEqual(main(after), main(before));
      const dom = { has_password_field: true, has_sensitive_input: false, form_cross_domain: true, download_file_extensions: [] };
      const parameters = collectParameters({ brand: after, dom, domainAgeDays: 42, urlFileExtension: null });
      const oldParameters = collectParameters({ brand: before, dom, domainAgeDays: 42, urlFileExtension: null });
      assert.deepEqual(decide('SAFE', evaluateRules(parameters)), decide('SAFE', evaluateRules(oldParameters)));
    }
  });
}
await check('Imported reference alone cannot activate legitimate or phishing rules', async () => {
  const entry = IMPORTED_BRANDS.find(e => e.name === '8Mlights');
  for (const url of [`https://${entry.domains[0]}/login`, `https://${entry.domains[0].split('.')[0]}.example.net/login`]) {
    const result = await analyzeBrandEvidence(snapshot(entry.name), url, offline);
    assert.equal(result.official_domain_match, 'unknown');
    assert.ok(result.candidates.some(c => c.source === 'local_company_directory' && c.verified === false));
    const dom = { has_password_field: true, has_sensitive_input: false, form_cross_domain: false, download_file_extensions: [] };
    const rules = evaluateRules(collectParameters({ brand: result, dom, domainAgeDays: 4000, urlFileExtension: null }));
    assert.equal(rules.filter(r => r.status === 'matched').length, 0);
    assert.equal(decide('DANGEROUS', rules).source, 'url_model');
  }
});
const start = performance.now();
for (let i = 0; i < 1000; i++) registryLookalikeKey(`zzzz${String(i).padStart(4,'0')}`, oneEdit);
const report = { kind: 'registry data validation and controlled brand-analysis regression; not a live accuracy evaluation',
  registry: BRAND_REGISTRY_STATS, total: checks.length, passed: checks.length, checks,
  benchmark: { lookalike_queries: 1000, elapsed_ms: Math.round(performance.now() - start) } };
fs.writeFileSync(path.join(root, 'hasil_pengujian/registry/hasil_uji_registry_10000.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
