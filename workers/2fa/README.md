# 2FA Worker

TOTP/HOTP key management and code generation API with a built-in web console.
It runs on Cloudflare Workers with KV storage or locally on Node.js with a JSON file store.

The OTP implementation is self-contained RFC 4226/6238 using Web Crypto HMAC-SHA1. Runtime dependencies are zero; TypeScript, Vitest, Wrangler, and tsx are development tools.

## Features

- Add, list, delete, and generate TOTP/HOTP codes.
- Import `otpauth://` URIs from authenticator apps.
- Return the current OTP immediately after adding a key.
- Generate and persist a per-entry `accessKey` for fetching only that one OTP.
- Serve a self-contained frontend at `/`.
- Serve OpenAPI JSON at `/openapi.json`.
- Log structured JSON request records; local Node also persists logs to disk.

## Architecture

```
src/
├── algo/
│   ├── base32.ts        RFC 4648 Base32 decoder
│   ├── otpauth.ts       otpauth:// URI parser
│   └── otp.ts           HOTP/TOTP implementation
├── api/
│   ├── handlers.ts      API handlers and OpenAPI document
│   ├── response.ts      JSON response helpers
│   └── router.ts        Fetch-based route matcher
├── frontend/
│   └── index.ts         Embedded HTML/CSS/JS console
├── middleware/
│   └── index.ts         API key auth, rate limiting, CORS
├── storage/
│   ├── interface.ts     KV/File store adapters
│   └── keychain.ts      Key entry persistence
├── app.ts               Runtime-agnostic request pipeline
├── cf-worker.ts         Cloudflare Worker entry
├── config.ts            Env/config parsing
└── node-server.ts       Local Node HTTP server
```

## Quickstart: Node.js

```bash
npm install
cp .env.example .env
# edit .env and set ADMIN_API_KEY
npm run dev
```

The server prints the actual URL on startup. By default it binds `0.0.0.0:8001`, unless `PORT` is set in `.env`.

Local files:
- Keychain: `./data/keychain.json`
- Request log: `./data/2fa-worker.log`

## Quickstart: Cloudflare Workers

```bash
npm install

wrangler kv namespace create KEYCHAIN
# put the returned ids into wrangler.toml

wrangler secret put ADMIN_API_KEY
wrangler secret put READONLY_API_KEYS # optional

npm run dev:cf
npm run deploy
```

Cloudflare uses KV for key storage and platform logs for request logs.

## Configuration

| Variable | Default | Runtime | Description |
|---|---:|---|---|
| `ADMIN_API_KEY` | required | Node, CF | Master key for all operations |
| `READONLY_API_KEYS` | empty | Node, CF | Comma-separated keys for OTP generation only |
| `KEYCHAIN_PATH` | `./data/keychain.json` | Node | Local JSON key store |
| `LOG_FILE` | `./data/2fa-worker.log` | Node | Persistent JSONL request log |
| `HOST` | `0.0.0.0` | Node | Bind address |
| `PORT` | `8000` | Node | Bind port |
| `RATE_LIMIT_MAX` | `60` | Node, CF | Max requests per window; `0` disables |
| `RATE_LIMIT_TTL` | `60` | Node, CF | Rate-limit window in seconds |
| `CORS_ORIGINS` | `*` | Node, CF | `*` or comma-separated origins |
| `APP_VERSION` | `1.0.0` | Node, CF | Version reported by `/health` |

Logs include method, path, status, duration, IP, and whether an API key was present. API key values, query strings, and request bodies are not logged.

## Authentication

Pass API keys via header or query parameter:

```text
X-API-Key: your-key
?api_key=your-key
```

| Operation | Admin key | Global readonly key | Per-entry `accessKey` |
|---|---:|---:|---:|
| `POST /api/v1/keys` | yes | no | no |
| `GET /api/v1/keys` | yes | no | no |
| `DELETE /api/v1/keys/{name}` | yes | no | no |
| `GET /api/v1/otp` | yes | yes | no |
| `GET /api/v1/otp/{name}` | yes | yes | only its own `{name}` |

Every newly added 2FA entry gets an `accessKey`. It is persisted with that entry in the keychain and returned to the admin on create/list responses. It can fetch only that entry's OTP.

## API

### Health

```http
GET /health
```

Returns service status, version, and key count. No API key is required.

### Add Key

```http
POST /api/v1/keys
X-API-Key: <admin>
Content-Type: application/json
```

Base32 body:

```json
{
  "name": "ExampleService:demo-user",
  "secret": "JBSWY3DPEHPK3PXP",
  "otpType": "totp",
  "digits": 6
}
```

`otpType` may be `totp` or `hotp`. `digits` may be `6`, `7`, or `8`. HOTP can also provide `counter`.

Create response redacts `secret` and includes the current OTP plus the generated `accessKey`:

```json
{
  "name": "ExampleService:demo-user",
  "otpType": "totp",
  "digits": 6,
  "accessKey": "64-hex-character-random-token",
  "counter": 0,
  "createdAt": "2026-05-28T18:51:22.978Z",
  "code": "123456",
  "validForSeconds": 18
}
```

### Import otpauth URI

`secret` may be an `otpauth://` URI:

```json
{
  "secret": "otpauth://totp/ExampleService%3Ademo-user?secret=JBSWY3DPEHPK3PXP&issuer=ExampleService"
}
```

Import behavior:
- The original `otpauth://` URI is not stored, because it contains the secret.
- The Base32 secret and parsed metadata are stored.
- If the URI label is `issuer:account`, that decoded label becomes `name`.
- If the URI label is only `account` but `issuer` is present, `name` becomes `issuer:account`.
- Parsed metadata may include `otpauthLabel`, `issuer`, and `account`.
- If request body also contains a stale `name`, the URI-derived name wins.

Characters such as `:`, `@`, and spaces are valid key names. When used in URL paths, encode the full name:

```js
encodeURIComponent("ExampleService:demo-user")
```

### List Keys

```http
GET /api/v1/keys
X-API-Key: <admin>
```

Returns key metadata and `accessKey`; never returns `secret`.

### Delete Key

```http
DELETE /api/v1/keys/{encoded-name}
X-API-Key: <admin>
```

### Generate OTP

All TOTP codes:

```http
GET /api/v1/otp
X-API-Key: <admin-or-global-readonly>
```

Single key:

```http
GET /api/v1/otp/{encoded-name}
X-API-Key: <admin-or-global-readonly-or-that-entry-accessKey>
```

For HOTP entries, generating a code increments the stored counter.

### OpenAPI

```http
GET /openapi.json
```

## Frontend

Open `/` in a browser. The console supports:

- API key verify with `admin`, `readonly`, or `fail` status.
- Listing TOTP codes and individual lookup.
- Admin key listing, delete, `accessKey` display, and `accessKey` copy.
- Adding Base32 secrets or `otpauth://` URIs.
- Showing the current OTP immediately after add.
- Copying OTP codes with Clipboard API plus a textarea fallback.

## Storage Format

Node stores key entries in `KEYCHAIN_PATH` as JSON values under `key:<name>`. Example entry value:

```json
{
  "name": "ExampleService:demo-user",
  "secret": "JBSWY3DPEHPK3PXP",
  "accessKey": "64-hex-character-random-token",
  "otpType": "totp",
  "digits": 6,
  "counter": 0,
  "createdAt": "2026-05-28T18:51:22.978Z",
  "otpauthLabel": "ExampleService:demo-user",
  "issuer": "ExampleService",
  "account": "demo-user"
}
```

Local file writes are serialized and use unique temporary files before rename.

## CLI Examples

```bash
# Add a key
curl -X POST http://localhost:8000/api/v1/keys \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"ExampleService:demo-user","secret":"JBSWY3DPEHPK3PXP"}'

# Add from otpauth URI
curl -X POST http://localhost:8000/api/v1/keys \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"secret":"otpauth://totp/ExampleService%3Ademo-user?secret=JBSWY3DPEHPK3PXP&issuer=ExampleService"}'

# Generate one code. Encode names containing ':' or '@'.
NAME="$(node -p 'encodeURIComponent("ExampleService:demo-user")')"
curl "http://localhost:8000/api/v1/otp/$NAME" \
  -H "X-API-Key: $ACCESS_KEY"

# Generate all TOTP codes
curl http://localhost:8000/api/v1/otp \
  -H "X-API-Key: $ADMIN_API_KEY"
```

## Development

```bash
npm run dev       # local Node server
npm run dev:cf    # Wrangler dev
npm run typecheck
npm test
npm run build:cf
```

Current tests cover base32, otpauth parsing, HOTP/TOTP vectors, local file storage, keychain behavior, auth, CRUD, OTP generation, CORS, per-entry access keys, and request pipeline behavior.
