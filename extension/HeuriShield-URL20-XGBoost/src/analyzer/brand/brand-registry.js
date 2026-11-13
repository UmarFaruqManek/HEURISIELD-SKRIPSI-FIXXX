/* Curated brands plus attributed public-directory candidates. Imported entries
 * do not verify ownership or list every official domain of a company. */
import { BRAND_REGISTRY as CURATED_BRANDS } from './brand-registry-curated.js';
import { IMPORTED_BRANDS } from './brand-registry-imported.js';

const compact = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
export const BRAND_REGISTRY = new Map(CURATED_BRANDS);
const byName = new Map([...CURATED_BRANDS.values()].map(entry => [compact(entry.name), entry]));
const aliasOwners = new Map();
for (const imported of IMPORTED_BRANDS) {
  const entry = Object.freeze({ ...imported, domains: Object.freeze([...imported.domains]) });
  const name = compact(entry.name);
  if (byName.has(name)) continue;
  byName.set(name, entry);
  if (!BRAND_REGISTRY.has(name)) BRAND_REGISTRY.set(name, entry);
  const alias = compact(entry.key);
  if (aliasOwners.has(alias) && aliasOwners.get(alias) !== entry) aliasOwners.set(alias, null);
  else aliasOwners.set(alias, entry);
}
for (const [alias, entry] of aliasOwners) {
  if (entry && !BRAND_REGISTRY.has(alias)) BRAND_REGISTRY.set(alias, entry);
}
const keys = Object.freeze([...BRAND_REGISTRY.keys()]);
const byLength = new Map();
for (const key of keys) {
  if (!byLength.has(key.length)) byLength.set(key.length, []);
  byLength.get(key.length).push(key);
}
export const BRAND_REGISTRY_STATS = Object.freeze({
  curated_names: new Set([...CURATED_BRANDS.values()].map(e => compact(e.name))).size,
  imported_names: IMPORTED_BRANDS.length,
  distinct_names: byName.size,
  lookup_keys: keys.length
});
export function registryEntry(token) { return BRAND_REGISTRY.get(compact(token)) || null; }
export function registryEntryByName(name) { return byName.get(compact(name)) || null; }
export function registryKeys() { return keys; }

// Curated matches retain priority. Imported lookalikes must identify one company.
export function registryLookalikeKey(token, oneEditApart) {
  const value = compact(token);
  for (const key of CURATED_BRANDS.keys()) if (oneEditApart(value, key)) return key;
  let selected = null, identity = null;
  for (const length of [value.length - 1, value.length, value.length + 1]) {
    for (const key of byLength.get(length) || []) {
      if (!oneEditApart(value, key)) continue;
      const candidate = BRAND_REGISTRY.get(key);
      if (identity && identity !== candidate) return null;
      identity = candidate; selected = key;
    }
  }
  return selected;
}
