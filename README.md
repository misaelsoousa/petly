# Petly Pet Shop

Site de um pet shop com adoção de pets, feito para testar o **Nexus CMS** num projeto real. Todo o conteúdo (pets, serviços, dicas, depoimentos, textos das páginas e formulários) é editado no painel do Nexus e consumido pelas rotas públicas da API.

## Como rodar tudo junto

Pré-requisitos: Node 20+, .NET 10, PostgreSQL rodando e os projetos `nexus` (painel) e `nexus-api` clonados ao lado deste:

```
projects/
├── nexus/        painel do CMS
├── nexus-api/    API do CMS
└── petly/        este site
```

```bash
cp .env.example .env.local   # preencha NEXUS_SEED_EMAIL / NEXUS_SEED_PASSWORD
npm install
npm run dev:all              # sobe API + painel + site num terminal só
npm run seed                 # (1ª vez) cria tipos de post, formulários, páginas e conteúdo de exemplo
```

| Endereço | O quê |
| --- | --- |
| http://localhost:3001 | site do petshop |
| http://localhost:3001/admin | painel do Nexus |
| http://localhost:5144/scalar | documentação da API |

Por padrão o painel roda **compilado** (`next build` + `next start`, ~100 MB de memória; o build leva ~1 min na primeira vez). Para mexer no código do painel com hot reload, use `npm run dev:all -- --panel-dev`.

Se os projetos do Nexus estiverem em outras pastas, ajuste `NEXUS_API_DIR` e `NEXUS_PANEL_DIR` no `.env.local`. Para subir só o site (com a API já rodando): `npm run dev`.

### Como o painel vira uma rota do site

O painel continua sendo um app separado (padrão [multi-zones](https://nextjs.org/docs/app/guides/multi-zones) do Next):

- o painel roda com `NEXUS_BASE_PATH=/admin` (todas as rotas dele ficam sob `/admin`) e `NEXUS_ALLOWED_ORIGINS=localhost:3001` (libera as server actions vindas do site);
- este site tem um `rewrite` de `/admin/*` para o painel (`next.config.ts`, origem em `NEXUS_PANEL_ORIGIN`).

Para o navegador é tudo um endereço só, com a mesma sessão. Sem essas variáveis, o painel roda sozinho, como antes.

## O que foi criado no Nexus (`npm run seed`)

O seed é idempotente: pode rodar de novo, ele atualiza o que já existe.

| Tipo | Nome | Usado em |
| --- | --- | --- |
| Tipo de post | `pets` — Pets para adoção | `/adote`, `/adote/[slug]`, página inicial |
| Tipo de post | `servicos` — Serviços | `/servicos`, página inicial |
| Tipo de post | `dicas` — Dicas (campo de referência para `pets`) | `/dicas`, `/dicas/[slug]` |
| Tipo de post | `depoimentos` — Depoimentos (referência para `pets`) | página inicial, `/sobre` |
| Formulário | `adocao` — Solicitação de adoção | `/adote/[slug]` (pet preenchido automaticamente) |
| Formulário | `agendamento` — Agendamento de serviço | `/servicos#agendar` |
| Formulário | `doacao` — Quero doar um pet (com upload de foto) | `/doar` |
| Formulário | `contato` — Fale conosco | `/contato` |
| Formulário | `newsletter` — Newsletter | rodapé |
| Página | `petshop-inicio` | destaque, números e chamada da página inicial |
| Página | `petshop-sobre` | `/sobre` |
| Página | `petshop-contato` | rodapé, `/contato`, nome da loja e **cor da marca** do site |

As fotos ficam em `seed/photos` e vêm do Wikimedia Commons (domínio público, CC0, CC BY e CC BY-SA). Autor, licença e link de cada uma estão em `seed/photos/CREDITS.md`; o seed grava esse crédito no campo "Crédito da imagem" de cada conteúdo, e o site o exibe junto da foto, como as licenças CC BY exigem.

## Como o site consome o Nexus

Tudo em `lib/nexus.ts`, só com rotas públicas (sem login):

- `GET /api/content/{tipo}` e `/api/content/{tipo}/{slug}`: posts publicados
- `GET /api/page/{nome}`: conteúdo das páginas
- `GET /api/form/{nome}`: estrutura do formulário. O `components/DynamicForm.tsx` monta os campos sozinho a partir dela, então um campo novo criado no painel aparece no site sem mexer no código
- `POST /api/form/{nome}/submissions`: envio feito direto do navegador (multipart, com arquivos)
- `GET /api/media/{id}/file`: imagem de um campo do tipo Mídia

O conteúdo fica em cache por 30 segundos: depois de editar algo no painel, recarregue o site após esse tempo.
