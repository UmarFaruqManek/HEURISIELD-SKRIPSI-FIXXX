/*
 * Decision policy: brand/DOM diperiksa lebih dahulu; kelas URL dipakai hanya
 * jika brand/DOM tidak memberikan alasan.
 *   1. Kelas URL tidak tersedia            -> LIMITED (status teknis)
 *   2. Ada rule phishing yang matched       -> DANGEROUS
 *   3. Ada rule legitimate yang matched     -> SAFE
 *   4. Domain resmi terverifikasi tanpa konflik -> SAFE
 *   5. Model menyetujui URL editor tanpa pengaturan tampilan -> SAFE
 *   6. Selain itu                           -> kelas URL
 */
import { domainMatch } from "../brand/brand-evidence.js";
import { isPathHostedUserContent } from "../brand/shared-hosting.js";

export function hasVerifiedOfficialDomain(originalUrl, finalUrl, brand, dom) {
  if (brand?.claimed_brand_status !== "identified" || brand.official_domain_match !== true ||
      brand.reference_provider_attested !== true || brand.brand_domain_mismatch === true ||
      brand.canonical_reference_conflict || brand.self_reference_conflict ||
      brand.api_domain_reference_conflict || dom?.form_cross_domain === true ||
      dom?.credential_exfil_endpoints?.length) return false;

  try {
    const original = new URL(originalUrl);
    const page = new URL(finalUrl);
    return page.protocol === "https:" && !page.port && original.origin === page.origin &&
      !original.username && !original.password && !page.username && !page.password &&
      !isPathHostedUserContent(original.href) && !isPathHostedUserContent(page.href) &&
      domainMatch(page.href, brand.verified_reference_domain);
  } catch {
    return false;
  }
}

export function decide(urlClass, ruleResults = [], platformViewClass = null, verifiedOfficialDomain = false) {
  if (!["SAFE", "DANGEROUS"].includes(urlClass)) return { verdict: "LIMITED", source: "url_unavailable", reasons: [] };
  const matched = decision => ruleResults
    .filter(rule => rule.decision === decision && rule.status === "matched").map(rule => rule.id);
  const phishing = matched("phishing");
  if (phishing.length) return { verdict: "DANGEROUS", source: "brand_dom_phishing", reasons: phishing };
  const legitimate = matched("legitimate");
  if (legitimate.length) return { verdict: "SAFE", source: "brand_dom_legitimate", reasons: legitimate };
  if (urlClass === "DANGEROUS" && verifiedOfficialDomain)
    return { verdict: "SAFE", source: "verified_official_domain", reasons: [] };
  if (urlClass === "DANGEROUS" && platformViewClass === "SAFE")
    return { verdict: "SAFE", source: "platform_view_url", reasons: [] };
  return { verdict: urlClass, source: "url_model", reasons: [] };
}
