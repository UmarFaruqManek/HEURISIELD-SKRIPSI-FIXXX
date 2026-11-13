// Reviewed public bundle: the form's submit handler passes the account fields
// to the login request with a base URL on the portal's own origin.
const portal = {
  origin: "https://portal.merdekasiber.com",
  scriptPath: "/_next/static/chunks/app/page-fdde07887ecc580b.js",
  scriptBytes: 37523,
  scriptSha256: "a7337eaae186a67d86130087b0ccedacd2105c8c06e93958daf403887fa99f9c"
};

export async function resolveLoginFormDestination(frames, pageUrl, fetchScript = fetch) {
  const [snapshot] = frames;
  if (pageUrl !== `${portal.origin}/` || frames.length !== 1 ||
      snapshot?.page_origin !== portal.origin || snapshot.document_ready_state !== "complete" ||
      snapshot.evidence_incomplete || snapshot.inaccessible_frames ||
      snapshot.credential_exfil_endpoints?.length || snapshot.sensitive_fields?.length ||
      !snapshot.same_origin_script_paths?.includes(portal.scriptPath)) return frames;

  const [form] = snapshot.forms || [];
  const [password] = snapshot.password_fields || [];
  if (snapshot.forms?.length !== 1 || !form.relevant || form.action_known !== false ||
      snapshot.password_fields?.length !== 1 || password.form_index !== 0 ||
      password.visible !== true) return frames;

  try {
    const response = await fetchScript(`${portal.origin}${portal.scriptPath}`, {
      credentials: "omit", redirect: "error", cache: "no-cache",
      signal: AbortSignal.timeout(2500)
    });
    if (!response.ok || !response.body) return frames;
    const reader = response.body.getReader();
    const bytes = new Uint8Array(portal.scriptBytes);
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.byteLength > bytes.length) {
        await reader.cancel();
        return frames;
      }
      bytes.set(value, size);
      size += value.byteLength;
    }
    if (size !== bytes.length) return frames;
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    if (hash !== portal.scriptSha256) return frames;
  } catch {
    return frames;
  }

  return [{ ...snapshot, forms: [{ ...form, action_origin: portal.origin,
    action_known: true, same_origin: true, action_source: "reviewed_login_script" }] }];
}
