# Hasil pengujian white box 20 kelompok

Waktu UTC: 2026-11-13T21:23:29.011Z
Node.js: v22.23.4

Real imported functions executed in Node.js; parameter and rule inputs supplied directly; no browser or network used.

| ID | Variasi | Lulus | Status |
|---|---:|---:|---|
| WB-01 | 1 | 1 | Lulus |
| WB-02 | 1 | 1 | Lulus |
| WB-03 | 4 | 4 | Lulus |
| WB-04 | 8 | 8 | Lulus |
| WB-05 | 3 | 3 | Lulus |
| WB-06 | 2 | 2 | Lulus |
| WB-07 | 1 | 1 | Lulus |
| WB-08 | 1 | 1 | Lulus |
| WB-09 | 3 | 3 | Lulus |
| WB-10 | 3 | 3 | Lulus |
| WB-11 | 1 | 1 | Lulus |
| WB-12 | 1 | 1 | Lulus |
| WB-13 | 3 | 3 | Lulus |
| WB-14 | 3 | 3 | Lulus |
| WB-15 | 3 | 3 | Lulus |
| WB-16 | 2 | 2 | Lulus |
| WB-17 | 10 | 10 | Lulus |
| WB-18 | 2 | 2 | Lulus |
| WB-19 | 6 | 6 | Lulus |
| WB-20 | 2 | 2 | Lulus |

## WB-01
- Temuan tidak tersedia: expected={"brand_in_title":"unknown","brand_in_heading":"unknown","brand_in_logo":"unknown","claimed_brand":null,"claimed_brand_status":"unknown","verified_reference_domain":null,"host_brand_claim":"unknown","official_domain_match":"unknown","brand_domain_mismatch":"unknown","has_password_field":"unknown","has_sensitive_input":"unknown","form_cross_domain":"unknown","login_button_detected":"unknown","login_redirect_detected":"unknown","has_download_link":"unknown","download_file_extensions":"unknown","download_target_cross_domain":"unknown","domain_age_days":null,"url_file_extension":"unknown"}, actual={"brand_in_title":"unknown","brand_in_heading":"unknown","brand_in_logo":"unknown","claimed_brand":null,"claimed_brand_status":"unknown","verified_reference_domain":null,"host_brand_claim":"unknown","official_domain_match":"unknown","brand_domain_mismatch":"unknown","has_password_field":"unknown","has_sensitive_input":"unknown","form_cross_domain":"unknown","login_button_detected":"unknown","login_redirect_detected":"unknown","has_download_link":"unknown","download_file_extensions":"unknown","download_target_cross_domain":"unknown","domain_age_days":null,"url_file_extension":"unknown"}, status=Lulus
## WB-02
- Pemindaian belum lengkap: expected=["pdf","unknown"], actual=["pdf","unknown"], status=Lulus
## WB-03
- Negatif: expected=null, actual=null, status=Lulus
- NaN: expected=null, actual=null, status=Lulus
- Infinity: expected=null, actual=null, status=Lulus
- Tidak tersedia: expected=null, actual=null, status=Lulus
## WB-04
- Akhiran URL: expected="exe", actual="exe", status=Lulus
- Akhiran URL: expected=null, actual=null, status=Lulus
- Akhiran URL: expected=null, actual=null, status=Lulus
- Keanggotaan jenis berkas: expected=true, actual=true, status=Lulus
- Keanggotaan jenis berkas: expected=true, actual=true, status=Lulus
- Keanggotaan jenis berkas: expected=true, actual=true, status=Lulus
- Keanggotaan jenis berkas: expected=true, actual=true, status=Lulus
- Keanggotaan jenis berkas: expected=false, actual=false, status=Lulus
## WB-05
- Konflik true: expected="matched", actual="matched", status=Lulus
- Konflik false: expected="not_matched", actual="not_matched", status=Lulus
- Konflik unknown: expected="undetermined", actual="undetermined", status=Lulus
## WB-06
- Tujuan lintas domain true: expected="matched", actual="matched", status=Lulus
- Tujuan lintas domain false: expected="not_matched", actual="not_matched", status=Lulus
## WB-07
- Masukan sensitif tanpa kata sandi: expected="matched", actual="matched", status=Lulus
## WB-08
- Kecocokan domain belum diketahui: expected="undetermined", actual="undetermined", status=Lulus
## WB-09
- Domain Age 365: expected="matched", actual="matched", status=Lulus
- Domain Age 366: expected="not_matched", actual="not_matched", status=Lulus
- Domain Age null: expected="undetermined", actual="undetermined", status=Lulus
## WB-10
- EXE dari DOM: expected="matched", actual="matched", status=Lulus
- APK dari URL: expected="matched", actual="matched", status=Lulus
- PDF saja: expected="not_matched", actual="not_matched", status=Lulus
## WB-11
- Belum lengkap tanpa ekstensi yang memenuhi aturan: expected="undetermined", actual="undetermined", status=Lulus
## WB-12
- Domain lama dengan EXE: expected="not_matched", actual="not_matched", status=Lulus
## WB-13
- Kedua masukan false: expected="matched", actual="matched", status=Lulus
- Kedua masukan unknown: expected="matched", actual="matched", status=Lulus
- Kata sandi true: expected="not_matched", actual="not_matched", status=Lulus
## WB-14
- Usia 200 hari: expected="not_matched", actual="not_matched", status=Lulus
- Brand tidak tampil: expected="not_matched", actual="not_matched", status=Lulus
- Usia tidak diketahui: expected="undetermined", actual="undetermined", status=Lulus
## WB-15
- Tujuan lintas domain false: expected="matched", actual="matched", status=Lulus
- Tujuan lintas domain true: expected="not_matched", actual="not_matched", status=Lulus
- Tujuan lintas domain unknown: expected="undetermined", actual="undetermined", status=Lulus
## WB-16
- Masukan kelas tidak valid: expected={"verdict":"LIMITED","source":"url_unavailable","reasons":[]}, actual={"verdict":"LIMITED","source":"url_unavailable","reasons":[]}, status=Lulus
- Masukan kelas tidak valid: expected={"verdict":"LIMITED","source":"url_unavailable","reasons":[]}, actual={"verdict":"LIMITED","source":"url_unavailable","reasons":[]}, status=Lulus
## WB-17
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P1"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P1"]}, status=Lulus
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, status=Lulus
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P3"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P3"]}, status=Lulus
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P4"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P4"]}, status=Lulus
- P dan L sama-sama terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, status=Lulus
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P1"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P1"]}, status=Lulus
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, status=Lulus
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P3"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P3"]}, status=Lulus
- Aturan P terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P4"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P4"]}, status=Lulus
- P dan L sama-sama terpenuhi: expected={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, actual={"verdict":"DANGEROUS","source":"brand_dom_phishing","reasons":["P2"]}, status=Lulus
## WB-18
- Koreksi menjadi legitimate: expected={"verdict":"SAFE","source":"brand_dom_legitimate","reasons":["L1"]}, actual={"verdict":"SAFE","source":"brand_dom_legitimate","reasons":["L1"]}, status=Lulus
- Koreksi menjadi legitimate: expected={"verdict":"SAFE","source":"brand_dom_legitimate","reasons":["L2"]}, actual={"verdict":"SAFE","source":"brand_dom_legitimate","reasons":["L2"]}, status=Lulus
## WB-19
- Tidak ada aturan matched: expected={"verdict":"SAFE","source":"url_model","reasons":[]}, actual={"verdict":"SAFE","source":"url_model","reasons":[]}, status=Lulus
- Tidak ada aturan matched: expected={"verdict":"SAFE","source":"url_model","reasons":[]}, actual={"verdict":"SAFE","source":"url_model","reasons":[]}, status=Lulus
- Tidak ada aturan matched: expected={"verdict":"SAFE","source":"url_model","reasons":[]}, actual={"verdict":"SAFE","source":"url_model","reasons":[]}, status=Lulus
- Tidak ada aturan matched: expected={"verdict":"DANGEROUS","source":"url_model","reasons":[]}, actual={"verdict":"DANGEROUS","source":"url_model","reasons":[]}, status=Lulus
- Tidak ada aturan matched: expected={"verdict":"DANGEROUS","source":"url_model","reasons":[]}, actual={"verdict":"DANGEROUS","source":"url_model","reasons":[]}, status=Lulus
- Tidak ada aturan matched: expected={"verdict":"DANGEROUS","source":"url_model","reasons":[]}, actual={"verdict":"DANGEROUS","source":"url_model","reasons":[]}, status=Lulus
## WB-20
- Normalisasi domain: expected="google.com", actual="google.com", status=Lulus
- Normalisasi domain: expected="user.github.io", actual="user.github.io", status=Lulus