# Registri brand lokal

Registri berisi **10.031 nama unik**:
- **31 nama kurasi**, dari 32 entri di `brand-registry-curated.js` (Steam punya dua kunci);
- **10.000 nama perusahaan/organisasi** dari direktori publik.

Alias pencarian tidak dihitung sebagai nama tambahan. Data impor **bukan** daftar 10.000 merek yang telah diverifikasi manual.

## Sumber dan atribusi

Data impor berasal dari Fliar BI / Radar API, **Open Company Database (5M companies, 2026)**.

- Repositori: https://github.com/Busineessfree/open-company-database
- Snapshot sumber, commit, URL unduhan, dan SHA-256: [`data/brand_registry_source/source.json`](../data/brand_registry_source/source.json)
- Lisensi data: **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**. Teks atribusi dan tautan lisensi ada di [`data/brand_registry_source/LICENSE`](../data/brand_registry_source/LICENSE).
- Sumber berisi 100.000 baris sampel perusahaan, bukan seluruh lima juta entri. Nama dalam sumber dapat mencakup organisasi, dan tidak selalu merupakan nama merek dagang.
- Snapshot CSV asli disimpan sebagai `data/brand_registry_source/open_company_database_sample.csv.gz`. SHA-256 di metadata berlaku untuk isi CSV setelah dekompresi.

## Penyaringan

[`tools/build-brand-registry.mjs`](../tools/build-brand-registry.mjs) memeriksa domain memakai public suffix parser yang sama dengan extension. Sebuah baris hanya dipertimbangkan bila:
- domainnya domain ICANN yang dapat diurai;
- bukan alamat IP, private suffix, atau platform hosting bersama;
- nama perusahaan dan label domainnya berhubungan.

Nama umum tertentu, nama kosong, serta nama/domain yang menduplikasi daftar kurasi dikeluarkan. 10.000 nama unik dipilih berdasarkan kelompok web-rank sumber, lalu urutan domain. Pemilihan **tidak** memakai label atau hasil pengujian phishing. Ringkasan seleksi ada di [`build-summary.json`](../data/brand_registry_source/build-summary.json).

Penyaringan struktural ini bukan verifikasi kepemilikan, keterkinian, atau keterjangkauan setiap situs. Domain impor tidak dikunjungi satu per satu. Daftar domain impor tidak dianggap lengkap, dan tidak membuktikan bahwa domain lain milik merek yang sama adalah peniru.

## Penggunaan dalam extension

| Berkas | Peran |
|---|---|
| `brand-registry-curated.js` | Daftar kurasi. Prioritas dan tingkat kepercayaannya dipertahankan |
| `brand-registry-imported.js` | 10.000 nama tambahan (hasil build). Masing-masing ditandai `trusted: false` dan `domains_complete: false` |
| `brand-registry.js` | Menggabungkan kedua daftar, membangun indeks nama/alias, dan menolak pilihan sewenang-wenang bila kemiripan nama data impor menunjuk ke beberapa identitas |
| `brand-evidence.js` | Memakai data impor sebagai kandidat, bukan otomatis terverifikasi. Pemeriksaan API dan konteks halaman tetap diperlukan |

Perluasan registri tidak menambah parameter utama, model, atau rule P/L. Modul evaluasi rule dan decision policy tidak berubah. Referensi tambahan dapat memengaruhi kandidat brand, sehingga hasil uji live/lab sebelum perluasan bukan evaluasi untuk versi sesudahnya.

## Membangun ulang dan memverifikasi

```bash
node tools/build-brand-registry.mjs
node tests/brand-registry-expanded.mjs
```

Membangun ulang dari snapshot yang sama menghasilkan `brand-registry-imported.js` yang identik.

Tes memeriksa:
- jumlah nama unik;
- pencarian semua entri;
- 32 kunci kurasi tetap ada;
- data impor tidak dinaikkan otomatis menjadi terverifikasi;
- regresi analisis identitas kurasi pada domain sendiri dan domain tiruan, dibandingkan dengan salinan kode sebelum perluasan di `tests/fixtures/backup_registry_20261112/`.

Hasilnya tersimpan di [`hasil_pengujian/registry/hasil_uji_registry_10000.json`](../hasil_pengujian/registry/hasil_uji_registry_10000.json). Ini bukan pengujian akurasi live dan bukan laporan branch coverage seluruh extension.
