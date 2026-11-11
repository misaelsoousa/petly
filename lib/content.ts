// Tipos dos campos cadastrados no Nexus (ver scripts/seed.mjs) e consultas usadas pelas páginas.
import { cache } from "react";
import { getPage, getPost, getPosts, type PublicPost } from "./nexus";

export type PetFields = {
    foto: string;
    credito?: string;
    credito_url?: string;
    especie: "Cachorro" | "Gato";
    sexo: "Macho" | "Fêmea";
    idade: string;
    porte: "Pequeno" | "Médio" | "Grande";
    situacao: "Disponível" | "Reservado" | "Adotado";
    raca?: string;
    peso?: number;
    cor?: string;
    chegada?: string;
    temperamento?: string;
    vacinado?: boolean;
    castrado?: boolean;
    vermifugado?: boolean;
    historia: string;
};

export type ServiceFields = {
    imagem: string;
    credito?: string;
    credito_url?: string;
    resumo: string;
    descricao: string;
    preco?: number;
    duracao?: string;
    ordem?: number;
    destaque?: boolean;
};

export type TipFields = {
    capa: string;
    credito?: string;
    credito_url?: string;
    categoria: string;
    resumo: string;
    conteudo: string;
    autor?: string;
    pet_relacionado?: string;
};

export type TestimonialFields = {
    tutor: string;
    pet: string;
    texto: string;
    cidade?: string;
    adotado?: string;
};

export type HomeFields = {
    hero_titulo: string;
    hero_texto: string;
    hero_imagem: string;
    hero_credito?: string;
    hero_credito_url?: string;
    hero_botao?: string;
    pets_adotados?: number;
    anos?: number;
    clientes?: number;
    cta_titulo?: string;
    cta_texto?: string;
};

export type AboutFields = {
    titulo: string;
    texto: string;
    imagem?: string;
    imagem_credito?: string;
    imagem_credito_url?: string;
    missao?: string;
    valores?: string;
};

export type ContactFields = {
    nome_loja: string;
    telefone: string;
    whatsapp?: string;
    email: string;
    endereco: string;
    horario?: string;
    instagram?: string;
    facebook?: string;
    mapa?: string;
    cor_marca?: string;
};

export type Pet = PublicPost<PetFields>;
export type Service = PublicPost<ServiceFields>;
export type Tip = PublicPost<TipFields>;
export type Testimonial = PublicPost<TestimonialFields>;

const STATUS_ORDER: Record<PetFields["situacao"], number> = { Disponível: 0, Reservado: 1, Adotado: 2 };

export const getPets = cache(async () => {
    const pets = await getPosts<PetFields>("pets");
    return pets.toSorted((a, b) => STATUS_ORDER[a.fields.situacao] - STATUS_ORDER[b.fields.situacao]);
});

export const getPet = cache((slug: string) => getPost<PetFields>("pets", slug));

export const getServices = cache(async () => {
    const services = await getPosts<ServiceFields>("servicos");
    return services.toSorted((a, b) => (a.fields.ordem ?? 99) - (b.fields.ordem ?? 99));
});

export const getTips = cache(() => getPosts<TipFields>("dicas"));
export const getTip = cache((slug: string) => getPost<TipFields>("dicas", slug));
export const getTestimonials = cache(() => getPosts<TestimonialFields>("depoimentos"));

export const getContact = cache(async () => (await getPage<ContactFields>("petshop-contato"))?.fields ?? null);
export const getHome = cache(async () => (await getPage<HomeFields>("petshop-inicio"))?.fields ?? null);
export const getAbout = cache(async () => (await getPage<AboutFields>("petshop-sobre"))?.fields ?? null);

/** Encontra um pet pelo id (campos do tipo "Referência" guardam o id do post). */
export async function findPetById(id: string | undefined) {
    if (!id) return null;
    return (await getPets()).find((pet) => pet.id === id) ?? null;
}

export function whatsappLink(phone: string | undefined, text?: string) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function formatPrice(value: number | undefined) {
    return value === undefined ? null : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatDate(value: string | null | undefined) {
    if (!value) return null;
    return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}
