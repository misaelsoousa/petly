// Cria/atualiza no Nexus tudo que o site do petshop usa: mídias, tipos de post, posts, formulários e páginas.
// Usa as mesmas rotas do painel (com login). Pode ser executado várias vezes: encontra o que já existe e atualiza.
//   npm run seed
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const API = (process.env.NEXUS_API_URL ?? "http://localhost:5144/api/").replace(/\/?$/, "/");
const EMAIL = process.env.NEXUS_SEED_EMAIL;
const PASSWORD = process.env.NEXUS_SEED_PASSWORD;

if (!EMAIL || !PASSWORD) {
    console.error("Defina NEXUS_SEED_EMAIL e NEXUS_SEED_PASSWORD no .env.local (veja .env.example).");
    process.exit(1);
}

// Tipos de campo (espelham Domain/Enums/FieldType.cs)
const F = { Text: 0, RichText: 1, Number: 2, Boolean: 3, Date: 4, Select: 5, Media: 6, Reference: 7, Color: 8, Section: 9, Email: 10, Phone: 11, Url: 12, File: 13 };
const PUBLISHED = 1;

let token = "";

async function api(method, path, body) {
    const isForm = body instanceof FormData;
    const response = await fetch(new URL(path, API), {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${method} ${path} -> ${response.status}: ${text}`);
    }

    return response.status === 204 ? null : response.json();
}

const field = (key, label, type, required = false, options) => ({ key, label, type, required, ...(options ? { options } : {}) });
const select = (key, label, choices, required = false) => field(key, label, F.Select, required, { choices });
const section = (key, label) => field(key, label, F.Section);

// ---------------------------------------------------------------- mídias

// Fotos do Wikimedia Commons (seed/photos). credits.json traz autor, licença e link de cada uma:
// as licenças CC BY / CC BY-SA exigem crédito, que vai para o campo "Crédito da imagem" de cada conteúdo.
const CREDITS = JSON.parse(await readFile(resolve("seed/photos/credits.json"), "utf8"));
const MEDIA = Object.keys(CREDITS).map((name) => ({ name, path: `seed/photos/${name}.jpg`, fileName: `petshop-${name}.jpg`, type: "image/jpeg" }));

/** Valores dos campos de crédito de uma foto (prefixo para páginas com mais de uma imagem). */
const credit = (name, prefix = "") => ({ [`${prefix}credito`]: CREDITS[name].credito, [`${prefix}credito_url`]: CREDITS[name].url });
const creditFields = (prefix = "") => [
    field(`${prefix}credito`, "Crédito da imagem", F.Text),
    field(`${prefix}credito_url`, "Link do crédito (página original)", F.Url),
];

async function seedMedia() {
    const existing = await api("GET", "media");
    const byName = new Map(existing.map((media) => [media.fileName, media.id]));
    const ids = {};

    for (const item of MEDIA) {
        if (!byName.has(item.fileName)) {
            const bytes = await readFile(resolve(item.path));
            const form = new FormData();
            form.append("file", new Blob([bytes], { type: item.type }), item.fileName);
            const media = await api("POST", "media", form);
            byName.set(item.fileName, media.id);
            console.log(`  mídia enviada: ${item.fileName}`);
        }

        ids[item.name] = byName.get(item.fileName);
    }

    return ids;
}

// ---------------------------------------------------------------- tipos de post

const SERVICE_NAMES = ["Banho", "Tosa", "Consulta veterinária", "Hotelzinho", "Adestramento"];

const POST_TYPES = [
    {
        name: "pets",
        displayName: "Pets para adoção",
        fields: [
            field("foto", "Foto", F.Media, true),
            ...creditFields(),
            select("especie", "Espécie", ["Cachorro", "Gato"], true),
            select("sexo", "Sexo", ["Macho", "Fêmea"], true),
            field("idade", "Idade (ex.: 2 anos)", F.Text, true),
            select("porte", "Porte", ["Pequeno", "Médio", "Grande"], true),
            select("situacao", "Situação", ["Disponível", "Reservado", "Adotado"], true),
            section("detalhes", "Detalhes"),
            field("raca", "Raça", F.Text),
            field("peso", "Peso (kg)", F.Number),
            field("cor", "Cor de destaque no site", F.Color),
            field("chegada", "Chegou ao abrigo em", F.Date),
            field("temperamento", "Temperamento (separe por vírgula)", F.Text),
            section("saude", "Saúde"),
            field("vacinado", "Vacinado", F.Boolean),
            field("castrado", "Castrado", F.Boolean),
            field("vermifugado", "Vermifugado", F.Boolean),
            section("historia_secao", "História"),
            field("historia", "História", F.RichText, true),
        ],
    },
    {
        name: "servicos",
        displayName: "Serviços",
        fields: [
            field("imagem", "Imagem", F.Media, true),
            ...creditFields(),
            field("resumo", "Resumo", F.Text, true),
            field("descricao", "Descrição", F.RichText, true),
            field("preco", "Preço a partir de (R$)", F.Number),
            field("duracao", "Duração", F.Text),
            field("ordem", "Ordem de exibição", F.Number),
            field("destaque", "Destacar na página inicial", F.Boolean),
        ],
    },
    {
        name: "dicas",
        displayName: "Dicas",
        fields: [
            field("capa", "Capa", F.Media, true),
            ...creditFields(),
            select("categoria", "Categoria", ["Adoção", "Saúde", "Alimentação", "Comportamento"], true),
            field("resumo", "Resumo", F.Text, true),
            field("conteudo", "Conteúdo", F.RichText, true),
            field("autor", "Autor", F.Text),
            field("pet_relacionado", "Pet relacionado", F.Reference, false, { postType: "pets" }),
        ],
    },
    {
        name: "depoimentos",
        displayName: "Depoimentos",
        fields: [
            field("tutor", "Nome do tutor", F.Text, true),
            field("pet", "Nome do pet", F.Text, true),
            field("texto", "Depoimento", F.RichText, true),
            field("cidade", "Cidade", F.Text),
            field("adotado", "Pet adotado aqui", F.Reference, false, { postType: "pets" }),
        ],
    },
];

async function seedPostTypes() {
    const existing = await api("GET", "posttype");
    const ids = {};

    for (const type of POST_TYPES) {
        let current = existing.find((item) => item.name === type.name);

        if (!current) {
            current = await api("POST", "posttype", { name: type.name, displayName: type.displayName });
            console.log(`  tipo de post criado: ${type.name}`);
        }

        await api("PUT", `posttype/${current.id}`, { displayName: type.displayName });
        await api("PUT", `posttype/${current.id}/fields`, { fields: type.fields });
        ids[type.name] = current.id;
    }

    return ids;
}

// ---------------------------------------------------------------- posts

function pets(m) {
    const pet = (slug, title, image, fields) => ({ slug, title, fields: { foto: m[image], ...credit(image), ...fields } });

    return [
        pet("thor", "Thor", "cao-thor", {
            especie: "Cachorro", sexo: "Macho", idade: "3 anos", porte: "Médio", situacao: "Disponível",
            raca: "SRD (vira-lata caramelo)", peso: 14, cor: "#c98b4f", chegada: "2026-08-12",
            temperamento: "brincalhão, leal, adora crianças", vacinado: true, castrado: true, vermifugado: true,
            historia: "O Thor foi encontrado perto de um posto de gasolina, esperando alguém voltar.\n\nAqui no abrigo ele virou o melhor amigo de todo mundo: aprendeu a sentar, dar a pata e é o primeiro a receber os voluntários no portão. Procura uma família ativa, que goste de passeios.",
        }),
        pet("luna", "Luna", "gato-luna", {
            especie: "Gato", sexo: "Fêmea", idade: "1 ano", porte: "Pequeno", situacao: "Disponível",
            raca: "SRD", peso: 3.5, cor: "#8a8f98", chegada: "2026-09-30",
            temperamento: "calma, carinhosa, curiosa", vacinado: true, castrado: true, vermifugado: true,
            historia: "A Luna chegou com dois meses, resgatada de um telhado depois de uma chuva forte.\n\nHoje é uma gata tranquila que adora janelas e colo no fim da tarde. Ideal para apartamento telado.",
        }),
        pet("pipoca", "Pipoca", "cao-pipoca", {
            especie: "Cachorro", sexo: "Fêmea", idade: "8 meses", porte: "Pequeno", situacao: "Disponível",
            raca: "SRD", peso: 6, cor: "#d6336c", chegada: "2026-10-05",
            temperamento: "agitada, sociável, inteligente", vacinado: true, castrado: false, vermifugado: true,
            historia: "Pipoca é filhote e tem energia de sobra! Já sabe fazer xixi no tapete higiênico e se dá bem com outros cães.\n\nA castração está agendada e será feita antes da adoção.",
        }),
        pet("mel", "Mel", "cao-mel", {
            especie: "Cachorro", sexo: "Fêmea", idade: "5 anos", porte: "Grande", situacao: "Reservado",
            raca: "Mistura de pastor", peso: 26, cor: "#2b9348", chegada: "2026-05-20",
            temperamento: "protetora, dócil, obediente", vacinado: true, castrado: true, vermifugado: true,
            historia: "A Mel viveu anos em uma chácara e foi entregue quando a família se mudou.\n\nÉ uma companheira serena e obediente — já tem uma família em processo de adoção.",
        }),
        pet("frajola", "Frajola", "gato-frajola", {
            especie: "Gato", sexo: "Macho", idade: "2 anos", porte: "Médio", situacao: "Disponível",
            raca: "SRD (frajola)", peso: 5, cor: "#2e2e33", chegada: "2026-07-01",
            temperamento: "independente, brincalhão, conversador", vacinado: true, castrado: true, vermifugado: true,
            historia: "O Frajola mia para conversar e adora caçar bolinhas de papel.\n\nConvive bem com outros gatos e procura um lar com bastante espaço para explorar.",
        }),
        pet("bob", "Bob", "cao-bob", {
            especie: "Cachorro", sexo: "Macho", idade: "9 anos", porte: "Médio", situacao: "Disponível",
            raca: "SRD", peso: 16, cor: "#e4572e", chegada: "2026-03-14",
            temperamento: "tranquilo, carinhoso, preguiçoso", vacinado: true, castrado: true, vermifugado: true,
            historia: "O Bob é um senhorzinho que só quer um sofá e cafuné.\n\nAdotar um pet idoso é dar a ele os melhores anos da vida — e o Bob retribui com muito amor.",
        }),
        pet("nina", "Nina", "gato-nina", {
            especie: "Gato", sexo: "Fêmea", idade: "4 anos", porte: "Pequeno", situacao: "Disponível",
            raca: "SRD (laranja)", peso: 4, cor: "#e9893b", chegada: "2026-06-18",
            temperamento: "dengosa, tímida no início, fiel", vacinado: true, castrado: true, vermifugado: true,
            historia: "A Nina é tímida nos primeiros dias, mas depois não sai do seu lado.\n\nPrecisa de uma casa sem cães e com paciência para a adaptação.",
        }),
        pet("max", "Max", "cao-max", {
            especie: "Cachorro", sexo: "Macho", idade: "2 anos", porte: "Grande", situacao: "Disponível",
            raca: "Mistura de dálmata", peso: 24, cor: "#2f80ed", chegada: "2026-09-02",
            temperamento: "atlético, festeiro, aprende rápido", vacinado: true, castrado: true, vermifugado: true,
            historia: "O Max ama correr e buscar bolinha. Está fazendo aulas de adestramento com a nossa equipe e já anda bem na guia.\n\nIdeal para casa com quintal e tutores que gostam de atividades ao ar livre.",
        }),
        pet("amora", "Amora", "gato-amora", {
            especie: "Gato", sexo: "Fêmea", idade: "6 meses", porte: "Pequeno", situacao: "Disponível",
            raca: "SRD (tricolor)", peso: 2.2, cor: "#2f6fb3", chegada: "2026-10-20",
            temperamento: "curiosa, brincalhona, sapeca", vacinado: true, castrado: false, vermifugado: true,
            historia: "A Amora é uma filhote cheia de energia que adora brinquedos de varinha.\n\nSerá castrada assim que completar a idade indicada pelo veterinário.",
        }),
        pet("pacoca", "Paçoca", "cao-pacoca", {
            especie: "Cachorro", sexo: "Macho", idade: "4 anos", porte: "Médio", situacao: "Adotado",
            raca: "SRD", peso: 13, cor: "#b07a45", chegada: "2026-01-10",
            temperamento: "companheiro, calmo, educado", vacinado: true, castrado: true, vermifugado: true,
            historia: "O Paçoca encontrou sua família em outubro! Ele agora mora com a Júlia e passeia todo dia no parque.",
        }),
    ];
}

function services(m) {
    return [
        { slug: "banho", title: "Banho", fields: { imagem: m["servico-banho"], ...credit("servico-banho"), resumo: "Banho completo com produtos hipoalergênicos, secagem e perfume.", descricao: "Usamos shampoos neutros e hipoalergênicos, escolhidos de acordo com o tipo de pelagem.\n\nO banho inclui limpeza de ouvidos, corte de unhas e secagem com soprador em temperatura controlada.", preco: 50, duracao: "1h a 1h30", ordem: 1, destaque: true } },
        { slug: "tosa", title: "Tosa", fields: { imagem: m["servico-tosa"], ...credit("servico-tosa"), resumo: "Tosa higiênica, na máquina ou na tesoura, do jeito que seu pet gosta.", descricao: "Fazemos tosa higiênica, tosa bebê, tosa da raça e tosa na tesoura.\n\nNossas tosadoras são certificadas e trabalham com calma para o pet não se estressar.", preco: 70, duracao: "1h30 a 2h", ordem: 2, destaque: true } },
        { slug: "consulta-veterinaria", title: "Consulta veterinária", fields: { imagem: m["servico-veterinario"], ...credit("servico-veterinario"), resumo: "Clínico geral, vacinas e check-up com veterinários parceiros.", descricao: "Consultas de rotina, aplicação de vacinas, vermífugos e exames básicos.\n\nAtendemos cães e gatos de todas as idades, com horário marcado.", preco: 150, duracao: "40 min", ordem: 3, destaque: true } },
        { slug: "hotelzinho", title: "Hotelzinho", fields: { imagem: m["servico-hotel"], ...credit("servico-hotel"), resumo: "Hospedagem com monitoramento, passeios e muito carinho.", descricao: "Vai viajar? Seu pet fica em baias individuais, com passeios diários, alimentação no horário e fotos enviadas por WhatsApp.", preco: 90, duracao: "Diária", ordem: 4, destaque: false } },
        { slug: "adestramento", title: "Adestramento", fields: { imagem: m["servico-adestramento"], ...credit("servico-adestramento"), resumo: "Aulas com reforço positivo para filhotes e adultos.", descricao: "Comandos básicos, passeio na guia, socialização e correção de comportamentos.\n\nPacotes de 4 ou 8 aulas, em grupo ou individuais.", preco: 120, duracao: "50 min por aula", ordem: 5, destaque: false } },
    ];
}

function tips(m, petIds) {
    return [
        { slug: "primeiros-dias-do-pet-adotado", title: "Os primeiros dias do pet adotado em casa", fields: { capa: m["dica-adaptacao"], ...credit("dica-adaptacao"), categoria: "Adoção", resumo: "Como preparar a casa e ajudar seu novo amigo a se sentir seguro.", autor: "Equipe Petly", pet_relacionado: petIds.thor, conteudo: "Os primeiros dias são de descoberta. Deixe um cantinho tranquilo com caminha, água e alguns brinquedos.\n\nEvite muitas visitas na primeira semana e mantenha uma rotina previsível de passeios e refeições.\n\nPaciência é tudo: alguns pets se soltam em horas, outros levam semanas." } },
        { slug: "calendario-de-vacinas", title: "Calendário de vacinas para cães e gatos", fields: { capa: m["dica-vacinas"], ...credit("dica-vacinas"), categoria: "Saúde", resumo: "Quais vacinas tomar e quando reforçar cada uma.", autor: "Dra. Camila Rocha", conteudo: "Filhotes de cães tomam a V8 ou V10 a partir dos 45 dias, em três doses, além da antirrábica.\n\nGatos recebem a V3, V4 ou V5 e também a antirrábica.\n\nDepois, os reforços são anuais. Leve sempre a carteirinha nas consultas!" } },
        { slug: "alimentacao-natural-ou-racao", title: "Alimentação natural ou ração?", fields: { capa: m["dica-alimentacao"], ...credit("dica-alimentacao"), categoria: "Alimentação", resumo: "Vantagens, cuidados e como fazer a transição com segurança.", autor: "Dra. Camila Rocha", conteudo: "As duas opções podem ser saudáveis, desde que balanceadas.\n\nA alimentação natural precisa ser formulada por um veterinário nutrólogo. Já a ração deve ser de boa qualidade e adequada à idade e ao porte.\n\nQualquer troca deve ser gradual, em 7 a 10 dias." } },
        { slug: "gatos-em-apartamento", title: "Gatos em apartamento: como deixá-los felizes", fields: { capa: m["dica-gatos-apartamento"], ...credit("dica-gatos-apartamento"), categoria: "Comportamento", resumo: "Telas, arranhadores e brincadeiras para gatos que vivem em espaços menores.", autor: "Equipe Petly", pet_relacionado: petIds.luna, conteudo: "Tele todas as janelas e varandas — é a regra número um.\n\nOfereça prateleiras e arranhadores para o gato explorar a altura, e reserve 15 minutos por dia para brincar com varinhas.\n\nCaixas de papelão também fazem sucesso!" } },
    ];
}

function testimonials(petIds) {
    return [
        { slug: "julia-e-pacoca", title: "Júlia e Paçoca", fields: { tutor: "Júlia Martins", pet: "Paçoca", cidade: "Campinas - SP", adotado: petIds.pacoca, texto: "O processo de adoção foi super cuidadoso. O Paçoca chegou educado, vacinado e hoje é o xodó da família!" } },
        { slug: "rafael-e-bidu", title: "Rafael e Bidu", fields: { tutor: "Rafael Souza", pet: "Bidu", cidade: "Valinhos - SP", texto: "Levo o Bidu no banho e tosa toda semana. Ele volta cheiroso e feliz — e eu recebo foto no WhatsApp." } },
        { slug: "ana-e-mia", title: "Ana e Mia", fields: { tutor: "Ana Lima", pet: "Mia", cidade: "Campinas - SP", texto: "Deixei a Mia no hotelzinho durante as férias e fiquei tranquila o tempo todo. Equipe muito atenciosa!" } },
    ];
}

async function upsertPosts(typeName, typeId, posts) {
    const list = await api("GET", `post/type/${typeName}?pageSize=100`);
    const bySlug = new Map(list.posts.map((post) => [post.slug, post.id]));
    const ids = {};

    for (const post of posts) {
        const body = { title: post.title, slug: post.slug, status: PUBLISHED, fields: post.fields };
        const id = bySlug.get(post.slug);

        if (id) {
            await api("PUT", `post/${id}`, body);
            ids[post.slug] = id;
        } else {
            const created = await api("POST", "post", { ...body, postTypeId: typeId });
            ids[post.slug] = created.id;
            console.log(`  post criado: ${typeName}/${post.slug}`);
        }
    }

    return ids;
}

// ---------------------------------------------------------------- formulários

const FORMS = [
    {
        name: "adocao",
        displayName: "Solicitação de adoção",
        fields: [
            field("pet", "Pet de interesse", F.Text, true),
            section("dados", "Seus dados"),
            field("nome", "Nome completo", F.Text, true),
            field("email", "E-mail", F.Email, true),
            field("telefone", "Telefone / WhatsApp", F.Phone, true),
            field("cidade", "Cidade", F.Text, true),
            section("lar", "Sobre o lar"),
            select("moradia", "Tipo de moradia", ["Casa com quintal", "Casa sem quintal", "Apartamento telado", "Apartamento sem tela", "Chácara / sítio"], true),
            select("outros_animais", "Tem outros animais?", ["Não", "Sim, cães", "Sim, gatos", "Sim, cães e gatos", "Sim, outros"], true),
            field("ja_teve_pet", "Já teve pets antes?", F.Boolean),
            field("todos_concordam", "Todos na casa concordam com a adoção?", F.Boolean, true),
            field("motivo", "Por que você quer adotar?", F.RichText, true),
        ],
    },
    {
        name: "agendamento",
        displayName: "Agendamento de serviço",
        fields: [
            select("servico", "Serviço", SERVICE_NAMES, true),
            field("data", "Data desejada", F.Date, true),
            select("periodo", "Período", ["Manhã", "Tarde"], true),
            section("tutor", "Tutor"),
            field("nome", "Seu nome", F.Text, true),
            field("email", "E-mail", F.Email, true),
            field("telefone", "Telefone / WhatsApp", F.Phone, true),
            section("pet", "Pet"),
            field("nome_pet", "Nome do pet", F.Text, true),
            select("especie", "Espécie", ["Cachorro", "Gato"], true),
            select("porte", "Porte", ["Pequeno", "Médio", "Grande"], true),
            field("observacoes", "Observações (alergias, comportamento...)", F.RichText),
        ],
    },
    {
        name: "doacao",
        displayName: "Quero doar um pet",
        fields: [
            section("tutor", "Seus dados"),
            field("nome", "Seu nome", F.Text, true),
            field("email", "E-mail", F.Email, true),
            field("telefone", "Telefone / WhatsApp", F.Phone, true),
            section("pet", "Sobre o pet"),
            field("nome_pet", "Nome do pet", F.Text, true),
            select("especie", "Espécie", ["Cachorro", "Gato"], true),
            field("idade", "Idade aproximada", F.Text, true),
            field("castrado", "É castrado?", F.Boolean),
            field("foto", "Foto do pet", F.File, true),
            field("motivo", "Conte um pouco sobre o pet e o motivo da doação", F.RichText, true),
        ],
    },
    {
        name: "contato",
        displayName: "Fale conosco",
        fields: [
            field("nome", "Nome", F.Text, true),
            field("email", "E-mail", F.Email, true),
            field("telefone", "Telefone", F.Phone),
            select("assunto", "Assunto", ["Dúvida", "Adoção", "Serviços", "Voluntariado", "Parcerias", "Outro"], true),
            field("mensagem", "Mensagem", F.RichText, true),
        ],
    },
    {
        name: "newsletter",
        displayName: "Newsletter",
        fields: [field("email", "E-mail", F.Email, true)],
    },
];

async function seedForms() {
    const existing = await api("GET", "form");

    for (const form of FORMS) {
        let current = existing.find((item) => item.name === form.name);

        if (!current) {
            current = await api("POST", "form", { name: form.name, displayName: form.displayName });
            console.log(`  formulário criado: ${form.name}`);
        }

        await api("PUT", `form/${current.id}`, { displayName: form.displayName, isActive: true, notifyEmails: [], fields: form.fields });
    }
}

// ---------------------------------------------------------------- páginas

function pages(m) {
    return [
        {
            name: "petshop-inicio",
            displayName: "Petshop · Página inicial",
            fields: [
                section("hero", "Destaque"),
                field("hero_titulo", "Título", F.Text, true),
                field("hero_texto", "Texto", F.RichText, true),
                field("hero_imagem", "Imagem", F.Media, true),
                ...creditFields("hero_"),
                field("hero_botao", "Texto do botão", F.Text),
                section("numeros", "Números"),
                field("pets_adotados", "Pets adotados", F.Number),
                field("anos", "Anos de história", F.Number),
                field("clientes", "Clientes atendidos", F.Number),
                section("chamada", "Chamada final"),
                field("cta_titulo", "Título", F.Text),
                field("cta_texto", "Texto", F.RichText),
            ],
            values: {
                hero_titulo: "Cuidado, carinho e um novo lar para cada patinha",
                hero_texto: "Banho e tosa, veterinário, hotelzinho e um programa de adoção responsável — tudo num só lugar.",
                hero_imagem: m.hero,
                ...credit("hero", "hero_"),
                hero_botao: "Conheça os pets para adoção",
                pets_adotados: 412,
                anos: 8,
                clientes: 2300,
                cta_titulo: "Não pode adotar agora?",
                cta_texto: "Você também ajuda sendo voluntário, divulgando nossos pets ou fazendo uma doação de ração.",
            },
        },
        {
            name: "petshop-sobre",
            displayName: "Petshop · Sobre nós",
            fields: [
                field("titulo", "Título", F.Text, true),
                field("texto", "Texto", F.RichText, true),
                field("imagem", "Imagem", F.Media),
                ...creditFields("imagem_"),
                field("missao", "Missão", F.RichText),
                field("valores", "Valores (um por linha)", F.RichText),
            ],
            values: {
                titulo: "Somos a Petly",
                texto: "Começamos em 2018 como um pequeno banho e tosa de bairro. Logo percebemos que muitos animais da região precisavam de um lar, e criamos o nosso programa de adoção.\n\nHoje somos um petshop completo, com clínica parceira, hotelzinho e uma equipe de voluntários apaixonada por bichos.",
                imagem: m.sobre,
                ...credit("sobre", "imagem_"),
                missao: "Cuidar bem de cada pet que passa por aqui e encontrar uma família responsável para cada animal do nosso abrigo.",
                valores: "Bem-estar animal em primeiro lugar\nAdoção responsável\nTransparência com os tutores\nCarinho em cada atendimento",
            },
        },
        {
            name: "petshop-contato",
            displayName: "Petshop · Informações de contato",
            fields: [
                field("nome_loja", "Nome da loja", F.Text, true),
                field("telefone", "Telefone", F.Phone, true),
                field("whatsapp", "WhatsApp", F.Phone),
                field("email", "E-mail", F.Email, true),
                field("endereco", "Endereço", F.Text, true),
                field("horario", "Horário de funcionamento (um por linha)", F.RichText),
                field("instagram", "Instagram", F.Url),
                field("facebook", "Facebook", F.Url),
                field("mapa", "Link do mapa", F.Url),
                field("cor_marca", "Cor da marca", F.Color),
            ],
            values: {
                nome_loja: "Petly Pet Shop",
                telefone: "(19) 3232-4545",
                whatsapp: "(19) 99876-5432",
                email: "contato@petly.example",
                endereco: "Rua das Acácias, 120 - Jardim das Flores, Campinas - SP",
                horario: "Segunda a sexta: 8h às 19h\nSábado: 8h às 14h\nDomingo: fechado",
                instagram: "https://instagram.com/",
                facebook: "https://facebook.com/",
                mapa: "https://www.openstreetmap.org/",
                cor_marca: "#e4572e",
            },
        },
    ];
}

async function seedPages(m) {
    const existing = await api("GET", "page");

    for (const page of pages(m)) {
        let current = existing.find((item) => item.name === page.name);

        if (!current) {
            current = await api("POST", "page", { name: page.name, displayName: page.displayName });
            console.log(`  página criada: ${page.name}`);
        }

        await api("PUT", `page/${current.id}/structure`, { displayName: page.displayName, fields: page.fields });
        await api("PUT", `page/${current.id}/content`, { values: page.values, translations: {} });
    }
}

// ---------------------------------------------------------------- main

const login = await fetch(new URL("auth/login", API), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!login.ok) throw new Error(`Login falhou (${login.status}): ${await login.text()}`);
token = (await login.json()).token;

console.log("Mídias...");
const media = await seedMedia();
console.log("Tipos de post...");
const types = await seedPostTypes();
console.log("Posts...");
const petIds = await upsertPosts("pets", types.pets, pets(media));
await upsertPosts("servicos", types.servicos, services(media));
await upsertPosts("dicas", types.dicas, tips(media, petIds));
await upsertPosts("depoimentos", types.depoimentos, testimonials(petIds));
console.log("Formulários...");
await seedForms();
console.log("Páginas...");
await seedPages(media);
console.log("Pronto! Conteúdo do petshop criado/atualizado no Nexus.");
