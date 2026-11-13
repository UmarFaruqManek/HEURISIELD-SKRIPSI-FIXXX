# Perbaikan bug v0.7.1 (12 Nov 2026)

Sumber temuan: uji live v0.7.0 tanggal 12 Nov 2026 (rincian per URL: [`hasil_pengujian/uji_live/hasil_uji_live_v070.xlsx`](../hasil_pengujian/uji_live/hasil_uji_live_v070.xlsx)).
- Legitimate: 437/492 benar (88,82%), coverage 98,4%.
- Phishing: 123/158 benar (77,85%), coverage 52,67%.

**Hasil uji v0.7.0 tersebut tidak diubah dan tetap menjadi hasil uji independen.**

Model URL v3, threshold 0,50, 19 parameter, rule P1–P4/L1–L2, dan decision policy tidak berubah. Perbaikan hanya pada cara parameter brand dihitung.

## Bug yang diperbaiki

| No | Kasus | Penyebab | Perbaikan | File |
|---|---|---|---|---|
| 1 | `roche.at`, `baxter.se` (legitimate) diblokir oleh P1 | Pemeriksaan referensi kanonik menetapkan `official_domain_match = false` untuk domain negara milik brand sendiri. Ini bertentangan dengan aturan v0.7: label sama dengan akhiran berbeda bernilai `unknown` | Hasilnya kini `unknown`. Dua kondisi tetap `false`: domain kanonik tertanam utuh di hostname (`roblox.com.ml`), dan brand yang terdaftar di registri lokal | `src/analyzer/brand/brand-evidence.js` |
| 2 | `bio.site/<pengguna>` (phishing) diloloskan oleh L1 sebagai "situs resmi Bio" | Platform link-in-bio belum masuk daftar konten pengguna berbasis path | Ditambahkan kategori link-in-bio: bio.site, bio.link, beacons.ai, lnk.bio, solo.to, taplink.cc, campsite.bio | `src/analyzer/brand/shared-hosting.js` |
| 3 | `f005.backblazeb2.com/file/...` (phishing) dianggap milik Backblaze | File unggahan di object storage belum dikenali sebagai konten pengguna | Pencocokan akhiran host (`*.backblazeb2.com/file/`) dan `firebasestorage.googleapis.com/v0/b/` | `src/analyzer/brand/shared-hosting.js` |

Versi dinaikkan menjadi 0.7.1 (`manifest.json`, `package.json`, `ANALYSIS_VERSION`).

## Verifikasi

- **Tes unit:** 29/29 lulus, termasuk tes baru `tests/live-bugfix-v071.mjs`. Tes baru ini juga memastikan `roche.com.ml` tetap terdeteksi P1.
- **Replay** dengan bukti tersimpan, tanpa jaringan (`replay_v071_*.json`):

| | v0.7.0 | v0.7.1 | Keputusan berubah |
|---|---:|---:|---|
| Legitimate | 437/492 | 439/492 | roche.at, baxter.se: DANGEROUS → SAFE |
| Phishing | 123/158 | 124/158 | bio.site/qmogwpnhc: SAFE → DANGEROUS |

  Tidak ada keputusan lain yang berubah (0 regresi).

- **Lab lokal** dengan extension v0.7.1 dan API asli (hasil di [`hasil_pengujian/lab_lokal/`](../hasil_pengujian/lab_lokal/)):
  - clone: 13/13 diblokir (`lab_clone_v071/hasil.json`)
  - penguatan: 8/8 (`lab_penguatan_v071.json`)
  - unduhan: 9/9 (`lab_unduhan_v071.json`)

## Bukan bug (dicatat sebagai keterbatasan)

| Kasus | Keterangan |
|---|---|
| `gop-hq.co` → `app.rebrandly.com/broken-links` | Tautan phishing sudah mati dan dialihkan ke halaman resmi Rebrandly. Halaman akhir memang Rebrandly, sehingga sampel ini tidak valid |
| `amazon-gb-01-iont.std.epremo-akam.com` (tiruan HSBC) | Halaman informasi tanpa formulir kredensial dan unduhan. Di luar cakupan P2–P4 |
| `nft-opensea.com` | OpenSea tidak ada di registri brand. Tidak ditambahkan karena brand ini ditemukan dari data uji |
| Domain lama yang dibobol (`chutneyjacks.co.uk`, `bighouse.cl`) | Usulan P5, belum ditangani |
| 53 false positive dari model URL | Brand atau domain resmi tidak terbukti, atau umur domain tidak tersedia (.jp, .ac.uk), sehingga L1/L2 tidak dapat diterapkan |

## Catatan metodologi

Bug ditemukan dari data uji live v0.7.0. Karena itu angka replay v0.7.1 di atas bukan uji independen. Untuk skripsi:
- laporkan angka v0.7.0 sebagai hasil uji live;
- laporkan perbaikan v0.7.1 sebagai koreksi bug beserta replay-nya.

Angka independen v0.7.1 memerlukan uji live baru.

> Catatan repositori: folder kerja uji live, berkas replay (`replay_v071_*.json`), dan tes `live-bugfix-v071.mjs` yang disebut di atas tidak disertakan di repositori ini.
