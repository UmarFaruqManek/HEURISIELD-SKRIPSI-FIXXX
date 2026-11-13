# Menjalankan pengujian

Persyaratan: **Node.js 22 atau lebih baru**. Tes memanggil fungsi JavaScript asli extension secara langsung, tanpa pustaka tambahan, browser, atau kredensial. Semua perintah dijalankan dari folder utama repositori.

## Ringkasan perintah

| Perintah | Isi | Butuh internet |
|---|---|---|
| `npm test` | White box + registri brand + URL platform | Tidak |
| `npm run test:whitebox` | White box 20 kelompok / 60 variasi | Tidak |
| `npm run test:registry` | Registri brand 10.031 nama | Tidak |
| `npm run test:platform` | Klasifikasi URL editor Google Docs/GitHub | Tidak |
| `npm run test:network` | Pengecualian tujuan form `portal.merdekasiber.com` | **Ya**, mengunduh satu berkas JavaScript dari situs tersebut |

Tanpa npm, setiap tes juga bisa dijalankan langsung, misalnya `node tests/whitebox-skripsi-20.mjs`.

## White box

```bash
node tests/whitebox-skripsi-20.mjs
```

Ringkasan 20 kelompok dan 60 variasi akan tampil. Untuk melihat masukan, hasil yang diharapkan, hasil aktual, dan status tiap variasi:

```bash
node tests/whitebox-skripsi-20.mjs --detail
```

Untuk rincian satu kelompok saja, misalnya prioritas keputusan phishing:

```bash
node tests/whitebox-skripsi-20.mjs --group WB-17
```

Opsi `--group` hanya menyaring rincian yang **ditampilkan**. Semua 20 kelompok tetap dijalankan, dan ringkasannya tetap mencakup semuanya.

Pengguna Windows juga bisa menjalankan `tools\jalankan-whitebox.cmd` (argumen `--detail` dan `--group` ikut diteruskan).

Laporan diperbarui setiap kali tes dijalankan, dan tersimpan di `hasil_pengujian/white_box/`:

| Berkas | Isi |
|---|---|
| `hasil_white_box_skripsi_20_kelompok.json` | Semua masukan, hasil, status, waktu, dan hash berkas yang diuji |
| `hasil_white_box_skripsi_20_kelompok.md` | Rekap dan hasil tiap variasi |
| `hasil_white_box_skripsi_20_kelompok.txt` | Log lengkap |

Bila ada kegagalan, skrip menampilkan `[GAGAL]` dan keluar dengan exit code 1.

`hasil_white_box_v071.md/.json` adalah generasi sebelumnya dari pengujian yang sama (40 kasus). Skrip penghasilnya tidak disertakan.

## Batas makna hasil

Lulusnya tes menunjukkan keluaran fungsi sesuai harapan pada kondisi yang diuji. Angka ini **bukan** akurasi deteksi situs nyata dan **bukan** ukuran cakupan seluruh kode extension. Hasil uji live dan lab lokal ada di `hasil_pengujian/uji_live/` dan `hasil_pengujian/lab_lokal/`.
