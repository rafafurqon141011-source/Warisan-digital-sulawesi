# Panduan Deploy Warisan Digital Sulawesi ke Cloudflare

Proyek ini telah dikonfigurasi dan dipersiapkan secara penuh agar dapat di-deploy ke **Cloudflare Pages** tanpa kendala (Zero-Config SPA + Serverless Edge Functions).

---

## Ringkasan Konfigurasi yang Telah Diterapkan

1. **SPA Routing (`public/_redirects`)**  
   Mencegah error `404 Not Found` saat pengguna me-refresh halaman atau membuka rute langsung.
2. **Optimal Cache & Security Headers (`public/_headers`)**  
   Aset Vite di-cache secara immutable (`max-age=31536000`), dilengkapi header keamanan standar industri.
3. **Versi Node.js Otomatis (`.node-version` & `.nvmrc`)**  
   Mengunci build environment Cloudflare pada **Node.js 20**, mencegah error kompatibilitas Vite dan Tailwind CSS v4.
4. **Cloudflare Pages Edge Functions (`/functions/api/`)**  
   API endpoints (`/api/health`, `/api/structure-story`, `/api/generate-quiz`) siap berjalan langsung di jaringan Edge Cloudflare Workers tanpa memerlukan server Express eksternal.
5. **Favicon & Robots (`public/favicon.svg`, `public/robots.txt`)**  
   Identitas visual khas Sulawesi dan konfigurasi SEO ramah mesin pencari.
6. **Wrangler Configuration (`wrangler.toml`)**  
   Dukungan penuh untuk deploy instan melalui Cloudflare CLI.

---

## Metode 1: Deploy Melalui Dashboard Cloudflare Pages (Rekomendasi via Git)

Metode ini sangat disukai karena setiap kali Anda melakukan `git push`, Cloudflare akan otomatis mem-build dan memperbarui aplikasi Anda secara otomatis.

### Langkah-langkah:
1. **Push Proyek ke Repository Git** (GitHub atau GitLab):
   ```bash
   git init
   git add .
   git commit -m "Siap deploy ke Cloudflare"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO-NAME.git
   git push -u origin main
   ```

2. **Buka Cloudflare Dashboard**:
   - Kunjungi [dash.cloudflare.com](https://dash.cloudflare.com/) dan login.
   - Pada sidebar, klik **Compute (Workers & Pages)**.
   - Klik tombol **Create application**, lalu pilih tab **Pages**.
   - Pilih **Connect to Git** dan hubungkan akun GitHub/GitLab Anda.
   - Pilih repository proyek ini.

3. **Pengaturan Build (Build Settings)**:
   - **Project name**: `warisan-digital-sulawesi` (atau nama pilihan Anda)
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (biarkan kosong / default)

4. **Variabel Lingkungan (Environment Variables)**:
   Buka accordion **Environment variables (advanced)** dan tambahkan jika diperlukan:
   - `NODE_VERSION` = `20`
   - `GEMINI_API_KEY` = `(Kunci Gemini API Anda - opsional untuk fitur AI)`
   - `VITE_SUPABASE_URL` = `https://xjdbpqmjdcbhtszsaafq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGci...`

5. **Deploy**:
   - Klik **Save and Deploy**.
   - Tunggu proses build selama kurang lebih 1-2 menit.
   - Aplikasi Anda langsung aktif dengan domain gratis seperti: `https://warisan-digital-sulawesi.pages.dev` lengkap dengan HTTPS/SSL gratis!

---

## Metode 2: Deploy Cepat Menggunakan Terminal (Wrangler CLI)

Jika Anda ingin langsung men-deploy tanpa menghubungkan ke Git:

1. **Build Proyek**:
   ```bash
   npm run build
   ```

2. **Deploy ke Cloudflare Pages**:
   ```bash
   npx wrangler pages deploy dist --project-name=warisan-digital-sulawesi
   ```
   *(Jika belum login, terminal akan membuka browser untuk otentikasi akun Cloudflare Anda)*

---

## Menghubungkan Domain Kustom (Custom Domain)

Jika Anda memiliki domain sendiri (misalnya `warisansulawesi.id` atau `kearifansulawesi.com`):
1. Buka proyek Anda di Cloudflare Pages Dashboard.
2. Masuk ke tab **Custom domains**.
3. Klik **Set up a custom domain**.
4. Masukkan nama domain Anda. Jika domain Anda sudah menggunakan Cloudflare DNS, aktivasi dan sertifikat SSL akan berjalan otomatis dalam hitungan detik.

---

## Cek Kesehatan (Healthcheck)

Setelah aplikasi online, Anda dapat memeriksa status Cloudflare Edge Functions melalui:
```
https://<domain-anda>.pages.dev/api/health
```
Akan mengembalikan status JSON:
```json
{
  "status": "ok",
  "runtime": "cloudflare-pages-edge",
  "hasGemini": true,
  "appName": "Warisan Digital Sulawesi"
}
```
