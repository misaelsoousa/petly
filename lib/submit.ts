import { formSubmitUrl } from "./nexus";

export type SubmitResult = { ok: true; message: string } | { ok: false; errors: string[] };

/** Envia um formulário público do Nexus (multipart, aceita arquivos). Roda no navegador. */
export async function submitForm(name: string, data: FormData): Promise<SubmitResult> {
    let response: Response;

    try {
        response = await fetch(formSubmitUrl(name), { method: "POST", body: data });
    } catch {
        return { ok: false, errors: ["Não foi possível enviar agora. Verifique sua conexão e tente novamente."] };
    }

    if (response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        return { ok: true, message: body?.message ?? "Recebemos seu envio!" };
    }

    if (response.status === 429) {
        return { ok: false, errors: ["Muitos envios em pouco tempo. Aguarde um minuto e tente de novo."] };
    }

    const body = (await response.json().catch(() => null)) as { errors?: string[] } | null;
    return { ok: false, errors: body?.errors?.length ? body.errors : [`Erro ao enviar (código ${response.status}).`] };
}
