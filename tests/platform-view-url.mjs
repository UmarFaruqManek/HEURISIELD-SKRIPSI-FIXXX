import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classifyPlatformView, platformViewBaseUrl } from
  "../extension/HeuriShield-URL20-XGBoost/src/analyzer/url/platform-view-url.js";
import { extractUrl20Features } from
  "../extension/HeuriShield-URL20-XGBoost/src/analyzer/url/url20-features.js";
import { classifyUrl } from
  "../extension/HeuriShield-URL20-XGBoost/src/model/xgboost-engine.js";
import { decide } from
  "../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/decision-policy.js";

const model = JSON.parse(readFileSync(new URL(
  "../extension/HeuriShield-URL20-XGBoost/src/model/xgboost-url20.json", import.meta.url
), "utf8"));
const sheet = "https://docs.google.com/spreadsheets/d/1iz2XRnQYEyzgqKpft2MzTvdhHP5vWijXNpA27vAUfLc/edit";
const sheetView = sheet + "?resourcekey=&gid=1538597589#gid=1538597589";
const file = "https://github.com/github/codeql/blob/main/README.md";
const noRisk = {
  has_password_field: false,
  has_sensitive_input: false,
  form_cross_domain: false,
  official_domain_match: "unknown",
  brand_domain_mismatch: "unknown",
  download_file_extensions: []
};

assert.equal(classifyUrl(model, extractUrl20Features(sheetView)), "phishing");
assert.equal(platformViewBaseUrl(sheetView), sheet);
const viewClass = classifyPlatformView(model, sheetView, sheetView, noRisk);
assert.equal(viewClass, "SAFE");
assert.deepEqual(decide("DANGEROUS", [], viewClass), {
  verdict: "SAFE", source: "platform_view_url", reasons: []
});
assert.equal(decide("DANGEROUS", [
  { id: "P1", decision: "phishing", status: "matched" }
], viewClass).verdict, "DANGEROUS");
assert.equal(platformViewBaseUrl(file + "?plain=1#L14-L20"), file);
assert.equal(classifyPlatformView(model, sheet, sheet, noRisk), null);
assert.equal(classifyPlatformView(model, sheetView, "https://example.com/", noRisk), null);

for (const url of [
  sheet + "?continue=https://example.com/",
  sheet + "?gid=1&gid=2",
  sheet + "#https://example.com/",
  sheet.replace("docs.google.com", "docs.google.com.example.com") + "?gid=1",
  sheet.replace("https:", "http:") + "?gid=1",
  "https://docs.google.com/forms/d/e/example/viewform?usp=sharing",
  "https://github.com/github/codeql/raw/main/README.md?plain=1"
]) assert.equal(platformViewBaseUrl(url), null, url);

for (const evidence of [
  { has_password_field: true },
  { has_sensitive_input: "unknown" },
  { form_cross_domain: true },
  { official_domain_match: false },
  { brand_domain_mismatch: true },
  { download_file_extensions: ["exe"] }
]) assert.equal(classifyPlatformView(model, sheetView, sheetView, { ...noRisk, ...evidence }), null);

console.log("Platform URL regression checks passed.");
