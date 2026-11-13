import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveLoginFormDestination } from "../extension/HeuriShield-URL20-XGBoost/src/analyzer/dom/login-form-destination.js";
import { analyzeDomEvidence } from "../extension/HeuriShield-URL20-XGBoost/src/analyzer/dom/dom-evidence.js";
import { extractUrl20Features } from "../extension/HeuriShield-URL20-XGBoost/src/analyzer/url/url20-features.js";
import { classifyUrl } from "../extension/HeuriShield-URL20-XGBoost/src/model/xgboost-engine.js";
import { collectParameters } from "../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/parameters.js";
import { evaluateRules } from "../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/heuristic-rules.js";
import { decide } from "../extension/HeuriShield-URL20-XGBoost/src/analyzer/rules/decision-policy.js";

const origin = "https://portal.merdekasiber.com";
const pageUrl = `${origin}/`;
const response = await fetch(pageUrl, { signal: AbortSignal.timeout(10000) });
assert.ok(response.ok);
const html = await response.text();
const scriptPath = html.match(/src="([^\"]+\/app\/page-[a-f0-9]+\.js)"/)?.[1];
assert.ok(scriptPath);
assert.match(html, /<input\b[^>]*type="password"/i);
assert.match(html, /<form\b(?![^>]*\baction=)[^>]*>/i);
const snapshot = {
  page_origin: origin,
  document_ready_state: "complete",
  inaccessible_frames: 0,
  password_fields: [{ form_index: 0, visible: true }],
  sensitive_fields: [],
  credential_exfil_endpoints: [],
  forms: [{ id: "form-0", relevant: true, action_known: false, action_origin: null }],
  same_origin_script_paths: [scriptPath]
};
const frames = [snapshot];
assert.equal(analyzeDomEvidence(frames).form_cross_domain, "unknown");
const resolved = await resolveLoginFormDestination(frames, pageUrl);
assert.equal(resolved[0].forms[0].action_source, "reviewed_login_script");
const dom = analyzeDomEvidence(resolved);
assert.equal(dom.form_cross_domain, false);

const model = JSON.parse(await readFile(new URL("../extension/HeuriShield-URL20-XGBoost/src/model/xgboost-url20.json", import.meta.url), "utf8"));
assert.equal(classifyUrl(model, extractUrl20Features(pageUrl)), "phishing");
const rdap = await fetch("https://rdap.verisign.com/com/v1/domain/merdekasiber.com", { signal: AbortSignal.timeout(10000) });
assert.ok(rdap.ok);
const data = await rdap.json();
const registration = data.events.find(event => event.eventAction === "registration").eventDate;
const age = Math.floor((Date.now() - Date.parse(registration)) / 86400000);
const params = collectParameters({ dom, domainAgeDays: age, brand: {
  claimed_brand_status: "identified", official_domain_match: true,
  brand_domain_mismatch: false, brand_in_title: true
} });
assert.equal(decide("DANGEROUS", evaluateRules(params)).verdict, "SAFE");
console.log("L2 menghasilkan SAFE dengan bukti tujuan formulir, usia domain dari RDAP, dan fixture identitas yang cocok.");

let unexpectedFetches = 0;
const mustNotFetch = () => { unexpectedFetches++; return new Response(null, { status: 404 }); };
assert.equal(await resolveLoginFormDestination(frames, `${origin}/other`, mustNotFetch), frames);
assert.equal(await resolveLoginFormDestination(frames, "https://portal.merdekasiber.com.example/", mustNotFetch), frames);
const exfil = [{ ...snapshot, credential_exfil_endpoints: ["api.telegram.org"] }];
assert.equal(await resolveLoginFormDestination(exfil, pageUrl, mustNotFetch), exfil);
const cross = [{ ...snapshot, forms: [{ ...snapshot.forms[0], action_known: true, action_origin: "https://other.example" }] }];
assert.equal(await resolveLoginFormDestination(cross, pageUrl, mustNotFetch), cross);
assert.equal(analyzeDomEvidence(cross).form_cross_domain, true);
assert.equal(unexpectedFetches, 0);
assert.equal(await resolveLoginFormDestination(frames, pageUrl, () => new Response(new Uint8Array(37523))), frames);
assert.equal(await resolveLoginFormDestination(frames, pageUrl, () => new Response("changed")), frames);
assert.equal(await resolveLoginFormDestination(frames, pageUrl, () => Promise.reject(new Error("timeout"))), frames);
console.log("Pemeriksaan regresi lulus untuk halaman lain, tujuan lintas domain, indikasi pengumpulan data, dan berkas yang gagal diverifikasi.");
