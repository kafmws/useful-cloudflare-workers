# 日子有数 · Days Count
### Countdown & Memories PWA

一款精心设计的倒计时与纪念日应用，支持账号同步、中英双语、PWA 安装。  
A beautifully designed countdown & anniversary app with account sync, bilingual UI, and PWA installation.

---

## ✨ Features / 功能

- 📅 **Countdown & Countup** — Track days until or since any date  
  支持正向倒计时（还有几天）和反向计时（已过去几天）
- 🔁 **Annual Events** — Yearly recurring events (birthdays, anniversaries)  
  支持每年重复的周年纪念
- 🔐 **Account Sync** — Supabase Auth + PostgreSQL cloud sync  
  邮箱注册登录，数据云端同步，每账号 10,000 条记录
- 🌍 **Bilingual** — Chinese / English toggle  
  中英文一键切换
- 📱 **PWA** — Install as native app on any device  
  支持"添加到主屏幕"，离线可用
- 📤 **Export / Import** — JSON backup and restore  
  JSON 格式数据导入导出

---

## 🚀 Quick Start / 快速开始

### 1. Set Up Supabase / 配置 Supabase

1. Create a free project at [supabase.com](https://supabase.com)  
   在 supabase.com 创建免费项目
2. Go to **SQL Editor** and run `supabase-setup.sql`  
   在 SQL 编辑器中执行 `supabase-setup.sql`
3. Enable **Email** authentication and **email confirmation**  
   启用邮箱登录，并开启邮箱验证
4. Copy your **Project URL** and **publishable key** from **Settings > API**  
   从 Settings > API 复制项目 URL 和 publishable key
5. Enable **Turnstile CAPTCHA** in **Authentication > Protection**  
   在 Authentication > Protection 中启用 Turnstile
   Add `dayscount.pages.dev` to the Turnstile widget's allowed hostnames.  
   将 `dayscount.pages.dev` 加到 Turnstile widget 允许域名中
6. Enable the **Before User Created** auth hook: `public.restrict_signup_to_qq_email`  
   启用 Before User Created hook，以服务端限制 QQ 邮箱注册
7. Set **Site URL** to `https://dayscount.pages.dev` and add it to **Redirect URLs**  
   将 Site URL 设置为 `https://dayscount.pages.dev`，并加入 Redirect URLs

### 2. Configure the App / 配置应用

Configure public browser settings in Cloudflare Pages environment variables
or `wrangler.toml` `[vars]`. The app reads them from `/api/config` at startup.

```toml
[vars]
SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
SUPABASE_PUBLISHABLE_KEY = "YOUR_PUBLISHABLE_KEY"
TURNSTILE_SITE_KEY = "YOUR_TURNSTILE_SITE_KEY"
AUTH_REDIRECT_URL = "https://dayscount.pages.dev"
```

These values are public client-side config. Never expose Supabase `service_role`
keys or Turnstile secret keys.

For Cloudflare Pages production, configure the same variables in project settings
or deploy with the matching Wrangler Pages configuration:

```text
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
TURNSTILE_SITE_KEY=YOUR_TURNSTILE_SITE_KEY
AUTH_REDIRECT_URL=https://dayscount.pages.dev
```

Bind a Cloudflare Rate Limiting binding named `REGISTER_RATE_LIMITER` for
`/api/register`. Wrangler 4.98.0 rejects `[[ratelimits]]` in Pages deploy
configuration, so configure this binding in the Pages project settings. If the
binding must be managed from `wrangler.toml`, move `/api/register` into a
separate Worker and route registration traffic to that Worker.

### 3. Deploy / 部署

Any static file host works:  
任何静态文件托管都可以使用：

```bash
# Cloudflare Pages
npx wrangler pages deploy .

# Other static hosts can serve the app, but /api/register rate limiting
# requires Cloudflare Pages Functions or an equivalent server endpoint.
```

Or serve locally for development:  
本地开发预览：

```bash
npx wrangler pages dev . --port 8788 \
  -b SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  -b SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY \
  -b TURNSTILE_SITE_KEY=YOUR_TURNSTILE_SITE_KEY

# Visit http://127.0.0.1:8788
```

---

## 📁 File Structure / 文件结构

```
days-count/
├── index.html          # Main app (single file, self-contained)
├── app.css             # Styles
├── app.js              # Application logic
├── _headers            # Cloudflare Pages security headers
├── functions/api/      # Cloudflare Pages registration proxy
├── vendor/             # Vendored third-party browser libraries
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline + caching)
├── icon-192.png        # App icon 192×192
├── icon-512.png        # App icon 512×512
├── supabase-setup.sql  # Database schema & RLS policies
└── README.md           # This file
```

---

## 🛠 Architecture / 技术架构

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Frontend    | Vanilla JS + CSS (no build step)  |
| Auth        | Supabase Auth (email/password)    |
| Database    | Supabase PostgreSQL               |
| Offline     | Service Worker + localStorage     |
| PWA         | Web App Manifest                  |
| Fonts       | Google Fonts (DM Serif + Noto SC) |

**Design principles:**
- Zero build step required — open `index.html` and it works
- Offline-first: localStorage is always the source of truth; Supabase is the sync layer
- Row Level Security enforced both client-side and database-side
- 10,000 record limit enforced via both JS guard and PostgreSQL trigger

---

## 🗄 Database Schema / 数据库结构

```sql
events (
  id           TEXT PRIMARY KEY,       -- client-generated nanoid
  user_id      UUID REFERENCES auth.users,
  name         TEXT NOT NULL,          -- max 60 chars
  date         DATE NOT NULL,
  emoji        TEXT,                   -- single emoji character
  color        TEXT,                   -- orange|red|green|blue|purple|gold|rose
  note         TEXT,                   -- max 200 chars
  is_annual    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ
)
```

RLS policies ensure users can only read/write their own rows.

---

## 📲 PWA Installation / 安装为应用

**iOS (Safari):**  
点击分享按钮 → "添加到主屏幕"  
Tap Share → "Add to Home Screen"

**Android (Chrome):**  
点击浏览器菜单 → "安装应用"  
Tap menu → "Install App"  

**Desktop (Chrome/Edge):**  
地址栏右侧安装图标  
Look for the install icon in the address bar

---

## 📤 Data Format / 数据格式

Export/import JSON schema:

```json
{
  "app": "日子有数 Days Count",
  "version": "1.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "events": [
    {
      "id": "abc123",
      "name": "生日 Birthday",
      "date": "1990-06-15",
      "emoji": "🎂",
      "color": "orange",
      "note": "optional note",
      "isAnnual": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📜 License

MIT — free to use, modify, and deploy.
