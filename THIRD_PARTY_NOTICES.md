# Komponen dan data pihak ketiga

Komponen dan data di bawah ini tetap memakai lisensi aslinya, bukan lisensi MIT repositori ini.

| Komponen | Lokasi | Lisensi | Sumber |
|---|---|---|---|
| tldts (bundel minified) | `extension/HeuriShield-URL20-XGBoost/src/shared/tldts.js` | MIT, © Rémi Berson | https://github.com/remusao/tldts |
| Public Suffix List (snapshot 2026-10-29) | `extension/HeuriShield-URL20-XGBoost/src/model/public_suffix_list_2026-10-29.dat` | Mozilla Public License 2.0 | https://publicsuffix.org |
| Daftar TLD IANA (snapshot 2026-10-29) | `extension/HeuriShield-URL20-XGBoost/src/model/iana_tld_2026-10-29.txt` | Data publik IANA | https://data.iana.org/TLD/ |
| Open Company Database, sampel (Fliar BI / Radar API) | `data/brand_registry_source/`, `extension/HeuriShield-URL20-XGBoost/src/analyzer/brand/brand-registry-imported.js` | CC BY-NC 4.0, © 2026 Fliar BI | https://github.com/Busineessfree/open-company-database |
| PhreshPhish (sebagian besar baris dataset) | `data/dataset_url20_training.csv.gz` | CC BY 4.0, khusus untuk riset anti-phishing | https://arxiv.org/abs/2507.10854 |

Dataset pelatihan juga memuat baris dari dua dataset URL pelengkap. Asal tiap baris tercatat di kolom `source`.

Data registri brand dan turunannya **tidak boleh dipakai untuk tujuan komersial** (CC BY-NC 4.0).
