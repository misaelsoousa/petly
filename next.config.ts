import type { NextConfig } from "next";

// O painel do Nexus é outra aplicação Next (multi-zones): ele roda com basePath "/admin"
// e este site repassa /admin/* para ele. Para o navegador, tudo fica em um endereço só.
const PANEL_ORIGIN = (process.env.NEXUS_PANEL_ORIGIN ?? "http://localhost:3000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            { source: "/admin", destination: `${PANEL_ORIGIN}/admin` },
            { source: "/admin/:path+", destination: `${PANEL_ORIGIN}/admin/:path+` },
        ];
    },
};

export default nextConfig;
