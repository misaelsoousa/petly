/* eslint-disable @next/next/no-img-element -- imagens vêm do Nexus em localhost; o otimizador do Next bloqueia IPs locais */
import Link from "next/link";
import { formatPrice, type Pet, type Service, type Tip } from "@/lib/content";
import { mediaUrl } from "@/lib/nexus";
import { ArrowRightIcon, HeartIcon } from "./Icons";
import PhotoCredit from "./PhotoCredit";

const STATUS_STYLE: Record<Pet["fields"]["situacao"], string> = {
    Disponível: "bg-leaf text-white",
    Reservado: "bg-sun text-ink",
    Adotado: "bg-ink text-white",
};

export function StatusBadge({ status }: { status: Pet["fields"]["situacao"] }) {
    return <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>{status === "Adotado" ? "Adotado 🎉" : status}</span>;
}

export function PetCard({ pet }: { pet: Pet }) {
    const { fields } = pet;

    return (
        <Link href={`/adote/${pet.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_8px_0_var(--line)]">
            <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: fields.cor ?? "var(--brand-soft)" }}>
                <img src={mediaUrl(fields.foto) ?? ""} alt={`Foto de ${pet.title}`} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute top-3 left-3">
                    <StatusBadge status={fields.situacao} />
                </div>
                <PhotoCredit text={fields.credito} asText />
            </div>
            <div className="grid gap-2 p-5">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-2xl font-bold">{pet.title}</h3>
                    <span className="text-2xl" aria-label={fields.especie}>
                        {fields.especie === "Gato" ? "🐱" : "🐶"}
                    </span>
                </div>
                <p className="text-sm text-muted">
                    {fields.sexo} · {fields.idade} · Porte {fields.porte.toLowerCase()}
                </p>
                {fields.temperamento && (
                    <ul className="flex flex-wrap gap-1.5">
                        {fields.temperamento
                            .split(",")
                            .slice(0, 3)
                            .map((trait) => (
                                <li key={trait} className="chip">
                                    {trait.trim()}
                                </li>
                            ))}
                    </ul>
                )}
                <span className="mt-1 inline-flex items-center gap-1 font-display font-semibold text-brand">
                    {fields.situacao === "Adotado" ? "Ver história" : "Quero conhecer"} <ArrowRightIcon className="transition group-hover:translate-x-1" />
                </span>
            </div>
        </Link>
    );
}

export function ServiceCard({ service }: { service: Service }) {
    const { fields } = service;
    const price = formatPrice(fields.preco);

    return (
        <article className="card flex flex-col overflow-hidden">
            <div className="relative">
                <img src={mediaUrl(fields.imagem) ?? ""} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <PhotoCredit text={fields.credito} url={fields.credito_url} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-display text-xl font-bold">{service.title}</h3>
                <p className="flex-1 text-muted">{fields.resumo}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    {price && (
                        <p className="text-sm">
                            a partir de <strong className="font-display text-lg text-brand">{price}</strong>
                        </p>
                    )}
                    <Link href={`/servicos?servico=${encodeURIComponent(service.title)}#agendar`} className="btn btn-ghost !px-4 !py-1.5 text-sm">
                        Agendar
                    </Link>
                </div>
            </div>
        </article>
    );
}

export function TipCard({ tip }: { tip: Tip }) {
    return (
        <Link href={`/dicas/${tip.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1">
            <div className="relative">
                <img src={mediaUrl(tip.fields.capa) ?? ""} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <PhotoCredit text={tip.fields.credito} asText />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="chip self-start">{tip.fields.categoria}</span>
                <h3 className="font-display text-xl font-bold group-hover:text-brand">{tip.title}</h3>
                <p className="text-muted">{tip.fields.resumo}</p>
            </div>
        </Link>
    );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
    return (
        <div className="card grid place-items-center gap-2 p-10 text-center">
            <HeartIcon className="size-8 text-brand" />
            <p className="font-display text-xl font-bold">{title}</p>
            <p className="text-muted">{text}</p>
        </div>
    );
}

export function SectionHeading({ eyebrow, title, text, action }: { eyebrow: string; title: string; text?: string; action?: React.ReactNode }) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
                <p className="eyebrow">{eyebrow}</p>
                <h2 className="title mt-1">{title}</h2>
                {text && <p className="mt-2 text-lg text-muted">{text}</p>}
            </div>
            {action}
        </div>
    );
}
