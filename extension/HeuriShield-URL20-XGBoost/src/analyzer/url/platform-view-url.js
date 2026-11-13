import { classifyUrl } from "../../model/xgboost-engine.js";
import { executableExtensionEvidence } from "./download-file-extension.js";
import { extractUrl20Features } from "./url20-features.js";

const GOOGLE_EDITOR_PATH =
  /^\/(?:spreadsheets|document|presentation|drawings)(?:\/u\/\d+)?\/d\/[\w-]{20,}\/edit\/?$/;
const GITHUB_FILE_VIEW_PATH =
  /^\/[\w.-]+\/[\w.-]+\/blob\/(?:[\w.@+-]+\/)+[\w.@+-]+$/;

const GOOGLE_VIEW_PARAMETERS = new Map([
  ["gid", /^\d+$/],
  ["resourcekey", /^[\w-]*$/],
  ["usp", /^[\w-]+$/]
]);
const GITHUB_VIEW_PARAMETERS = new Map([["plain", /^1$/]]);

// Keep the document or file identifier. Only omit recognized view settings
// from the second model pass. Never use this URL for browser navigation.
export function platformViewBaseUrl(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== "https:" || url.port || url.username || url.password) return null;

  let parameters;
  let fragment;
  if (url.hostname === "docs.google.com" && GOOGLE_EDITOR_PATH.test(url.pathname)) {
    parameters = GOOGLE_VIEW_PARAMETERS;
    fragment = /^#gid=\d+$/;
  } else if (url.hostname === "github.com" && GITHUB_FILE_VIEW_PATH.test(url.pathname)) {
    parameters = GITHUB_VIEW_PARAMETERS;
    fragment = /^#L\d+(?:-L\d+)?$/;
  } else return null;

  if (url.hash && !fragment.test(url.hash)) return null;
  for (const [key, val] of url.searchParams) {
    if (!parameters.get(key)?.test(val) || url.searchParams.getAll(key).length !== 1) return null;
  }
  return url.origin + url.pathname;
}
export function classifyPlatformView(model, originalUrl, finalUrl, parameters) {
  if (parameters.has_password_field !== false || parameters.has_sensitive_input !== false ||
      parameters.form_cross_domain !== false || parameters.official_domain_match === false ||
      parameters.brand_domain_mismatch === true ||
      executableExtensionEvidence(parameters.download_file_extensions) === true) return null;
  const base = platformViewBaseUrl(originalUrl);
  if (!base || new URL(originalUrl).href === base || platformViewBaseUrl(finalUrl) !== base) return null;
  return classifyUrl(model, extractUrl20Features(base)) === "legitimate" ? "SAFE" : "DANGEROUS";
}
