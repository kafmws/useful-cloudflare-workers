import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));

export const apps = [
  {
    name: "2fa",
    cwd: appDir,
    script: "dist/node-server.js",
    interpreter: "node",
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "256M",
    time: true,
    merge_logs: true,
    out_file: "./data/pm2-out.log",
    error_file: "./data/pm2-error.log",
    env: {
      NODE_ENV: "production",
      HOST: "0.0.0.0",
      PORT: "8001",
      KEYCHAIN_PATH: "./data/keychain.json",
      LOG_FILE: "./data/2fa-worker.log"
    }
  }
];

export default { apps };
