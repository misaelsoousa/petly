// Sobe tudo junto: API do Nexus, painel do Nexus (servido em /admin pelo site) e o site do petshop.
//   npm run dev:all              painel compilado (leve, ~100 MB). Use quando estiver mexendo só no site.
//   npm run dev:all -- --panel-dev   painel em modo dev (hot reload). Use quando for mexer no código do painel.
// As pastas do Nexus vêm de NEXUS_API_DIR / NEXUS_PANEL_DIR no .env.local (padrão: ../nexus-api e ../nexus).
// Pré-requisito: PostgreSQL rodando (o mesmo que o Nexus já usa).
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import concurrently from "concurrently";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const apiDir = resolve(process.env.NEXUS_API_DIR ?? "../nexus-api");
const panelDir = resolve(process.env.NEXUS_PANEL_DIR ?? "../nexus");
const panelDev = process.argv.includes("--panel-dev");

for (const [label, dir] of [["API do Nexus", apiDir], ["painel do Nexus", panelDir]]) {
    if (!existsSync(dir)) {
        console.error(`Não encontrei o ${label} em ${dir}. Ajuste NEXUS_API_DIR / NEXUS_PANEL_DIR no .env.local.`);
        process.exit(1);
    }
}

if (!existsSync(resolve(panelDir, "node_modules"))) {
    console.error(`O painel ainda não tem dependências instaladas. Rode: cd "${panelDir}" && npm install`);
    process.exit(1);
}

// O painel roda "dentro" do site: rotas em /admin e server actions vindas da origem do site.
const panelEnv = { NEXUS_BASE_PATH: "/admin", NEXUS_ALLOWED_ORIGINS: "localhost:3001" };

const panelCommand = panelDev ? "npx next dev --port 3000" : "npx next build && npx next start --port 3000";

const { result } = concurrently(
    [
        { name: "api", command: "dotnet run --project nexus-api.API --launch-profile http", cwd: apiDir, prefixColor: "magenta" },
        { name: "painel", command: panelCommand, cwd: panelDir, env: panelEnv, prefixColor: "cyan" },
        { name: "site", command: "npx next dev --port 3001", prefixColor: "yellow" },
    ],
    { killOthersOn: ["failure"], restartTries: 0 },
);

console.log(`
  Site    http://localhost:3001
  Painel  http://localhost:3001/admin   (${panelDev ? "modo dev" : "compilado — pode levar ~1 min para o build na primeira vez"})
  API     http://localhost:5144/scalar
`);

result.catch(() => process.exit(1));
