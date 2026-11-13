# Hasil pengujian white box HeuriShield v0.7.1

Teknik: branch testing. Dijalankan dengan Node.js terhadap kode extension v0.7.1. Lulus 40 dari 40 kasus.

| ID | Bagian yang diuji | Kondisi pengujian | Hasil yang diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|
| WB-01 | Pengumpulan parameter | Bukti brand, DOM, dan umur domain tidak tersedia | Parameter bernilai unknown/null; umur domain null | Parameter bernilai unknown/null; umur domain null | Lulus |
| WB-02 | Pengumpulan parameter | Pemindaian unduhan tidak lengkap (download_scan_incomplete) | Daftar ekstensi ditambah unknown | Daftar ekstensi ditambah unknown | Lulus |
| WB-03 | Pengumpulan parameter | Umur domain bernilai negatif/tidak valid | domain_age_days = null | domain_age_days = null | Lulus |
| WB-04 | Ekstensi file URL | URL https://unduh.test/setup.exe | exe | exe | Lulus |
| WB-05 | Ekstensi file URL | URL tanpa nama file (https://contoh.test/login) | null | null | Lulus |
| WB-06 | Ekstensi file URL | Nama file hanya pada query (?file=setup.exe) | null | null | Lulus |
| WB-07 | Daftar file berbahaya | Ekstensi zip, iso, lnk, apk dibandingkan pdf | zip/iso/lnk/apk termasuk; pdf tidak | zip/iso/lnk/apk termasuk; pdf tidak | Lulus |
| WB-08 | Rule P1 | brand_domain_mismatch = true | matched | matched | Lulus |
| WB-09 | Rule P1 | brand_domain_mismatch = false | not_matched | not_matched | Lulus |
| WB-10 | Rule P1 | brand_domain_mismatch = unknown | undetermined | undetermined | Lulus |
| WB-11 | Rule P2 | Password, form lintas domain, official_domain_match = false | matched | matched | Lulus |
| WB-12 | Rule P2 | Input sensitif (OTP/kartu), form lintas domain, domain bukan resmi | matched | matched | Lulus |
| WB-13 | Rule P2 | Password dan domain bukan resmi, tetapi form ke domain sendiri | not_matched | not_matched | Lulus |
| WB-14 | Rule P2 | Password dan form lintas domain, official_domain_match = unknown | undetermined | undetermined | Lulus |
| WB-15 | Rule P3 | Umur 42 hari, domain bukan resmi, password | matched | matched | Lulus |
| WB-16 | Rule P3 | Umur tepat 365 hari, domain bukan resmi, password | matched | matched | Lulus |
| WB-17 | Rule P3 | Umur 366 hari, domain bukan resmi, password | not_matched | not_matched | Lulus |
| WB-18 | Rule P3 | Umur domain tidak diketahui, domain bukan resmi, password | undetermined | undetermined | Lulus |
| WB-19 | Rule P4 | Umur 42 hari, domain bukan resmi, tautan .exe | matched | matched | Lulus |
| WB-20 | Rule P4 | Umur 42 hari, domain bukan resmi, URL halaman berakhiran .apk | matched | matched | Lulus |
| WB-21 | Rule P4 | Umur 42 hari, domain bukan resmi, hanya tautan .pdf | not_matched | not_matched | Lulus |
| WB-22 | Rule P4 | Umur 42 hari, domain bukan resmi, pemindaian unduhan tidak lengkap | undetermined | undetermined | Lulus |
| WB-23 | Rule P4 | Domain lama (9.446 hari), domain bukan resmi, tautan .exe | not_matched | not_matched | Lulus |
| WB-24 | Rule L1 | Domain resmi, brand di judul, tanpa input akun, umur 4.000 hari | matched | matched | Lulus |
| WB-25 | Rule L1 | Domain resmi, tetapi ada kolom password | not_matched | not_matched | Lulus |
| WB-26 | Rule L1 | Domain resmi, umur domain 200 hari | not_matched | not_matched | Lulus |
| WB-27 | Rule L1 | Domain resmi, brand tidak tampil di judul/heading/logo | not_matched | not_matched | Lulus |
| WB-28 | Rule L1 | Domain resmi, umur domain tidak diketahui | undetermined | undetermined | Lulus |
| WB-29 | Rule L2 | Domain resmi, password, form ke domain sendiri, umur 4.000 hari | matched | matched | Lulus |
| WB-30 | Rule L2 | Domain resmi, password, form lintas domain | not_matched | not_matched | Lulus |
| WB-31 | Rule L2 | Domain resmi, password, tujuan form tidak terbaca | undetermined | undetermined | Lulus |
| WB-32 | Decision policy | Kelas URL tidak tersedia (null) | LIMITED (url_unavailable) | LIMITED (url_unavailable) | Lulus |
| WB-33 | Decision policy | Kelas URL tidak dikenali ("UNKNOWN") | LIMITED (url_unavailable) | LIMITED (url_unavailable) | Lulus |
| WB-34 | Decision policy | Kelas URL SAFE dan P1 matched | DANGEROUS (brand_dom_phishing) | DANGEROUS (brand_dom_phishing) | Lulus |
| WB-35 | Decision policy | Kelas URL DANGEROUS, P2 dan L2 sama-sama matched | DANGEROUS (brand_dom_phishing) | DANGEROUS (brand_dom_phishing) | Lulus |
| WB-36 | Decision policy | Kelas URL DANGEROUS dan L1 matched | SAFE (brand_dom_legitimate) | SAFE (brand_dom_legitimate) | Lulus |
| WB-37 | Decision policy | Kelas URL DANGEROUS, P3 undetermined, tidak ada rule matched | DANGEROUS (url_model) | DANGEROUS (url_model) | Lulus |
| WB-38 | Decision policy | Kelas URL SAFE, seluruh rule not_matched | SAFE (url_model) | SAFE (url_model) | Lulus |
| WB-39 | Daftar manual | Allowlist/blocklist diisi https://gemini.google.com/app | google.com | google.com | Lulus |
| WB-40 | Daftar manual | Allowlist/blocklist diisi penyewa hosting user.github.io | user.github.io | user.github.io | Lulus |
