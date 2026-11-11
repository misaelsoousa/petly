// Cliente das rotas PÚBLICAS do Nexus (sem login). O conteúdo é editado no painel.
//   GET  /content/{tipo}            lista posts publicados
//   GET  /content/{tipo}/{slug}     post publicado
//   GET  /page/{nome}               conteúdo de uma página
//   GET  /form/{nome}               estrutura de um formulário
//   POST /form/{nome}/submissions   envio (feito direto do navegador, ver DynamicForm)
//   GET  /media/{id}/file           redireciona para o arquivo de uma mídia

export const NEXUS_API_URL = (process.env.NEXT_PUBLIC_NEXUS_API_URL ?? "http://localhost:5144/api/").replace(/\/?$/, "/");

/** Segundos que o conteúdo fica em cache antes de buscar de novo no Nexus. */
const REVALIDATE = 30;

export type FieldDefinition = {
    key: string;
    label: string;
    type: number;
    required: boolean;
    options: { choices?: string[]; postType?: string } | null;
};

export type PublicPost<TFields> = {
    id: string;
    type: string;
    title: string;
    slug: string;
    language: string;
    fields: TFields;
    publishedAt: string | null;
    updatedAt: string;
};

export type PostList<TFields> = {
    language: string;
    languages: string[];
    posts: PublicPost<TFields>[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};

export type PublicPage<TFields> = {
    name: string;
    language: string;
    fields: TFields;
    updatedAt: string;
};

export type PublicForm = {
    name: string;
    displayName: string;
    fields: FieldDefinition[];
};

async function get<T>(path: string, tags: string[]): Promise<T | null> {
    let response: Response;

    try {
        response = await fetch(new URL(path, NEXUS_API_URL), { next: { revalidate: REVALIDATE, tags } });
    } catch (error) {
        throw new Error(`Não foi possível conectar ao Nexus em ${NEXUS_API_URL}. A API está rodando?`, { cause: error });
    }

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Nexus respondeu ${response.status} em ${path}`);

    return response.json() as Promise<T>;
}

export async function getPosts<TFields>(postType: string, pageSize = 100) {
    const list = await get<PostList<TFields>>(`content/${postType}?pageSize=${pageSize}`, [`content:${postType}`]);
    return list?.posts ?? [];
}

export function getPost<TFields>(postType: string, slug: string) {
    return get<PublicPost<TFields>>(`content/${postType}/${encodeURIComponent(slug)}`, [`content:${postType}`]);
}

export function getPage<TFields>(name: string) {
    return get<PublicPage<TFields>>(`page/${name}`, [`page:${name}`]);
}

export function getForm(name: string) {
    return get<PublicForm>(`form/${name}`, [`form:${name}`]);
}

/** URL de uma mídia do Nexus a partir do id salvo nos campos do tipo "Mídia". */
export function mediaUrl(id: string | null | undefined) {
    return id ? new URL(`media/${id}/file`, NEXUS_API_URL).toString() : null;
}

export function formSubmitUrl(name: string) {
    return new URL(`form/${name}/submissions`, NEXUS_API_URL).toString();
}
