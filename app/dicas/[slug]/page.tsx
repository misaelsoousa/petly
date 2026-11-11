/* eslint-disable @next/next/no-img-element -- imagens vêm do Nexus em localhost */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PetCard, TipCard } from "@/components/Cards";
import { ArrowLeftIcon } from "@/components/Icons";
import Paragraphs from "@/components/Paragraphs";
import PhotoCredit from "@/components/PhotoCredit";
import { findPetById, formatDate, getTip, getTips } from "@/lib/content";
import { mediaUrl } from "@/lib/nexus";

export async function generateMetadata({ params }: PageProps<"/dicas/[slug]">): Promise<Metadata> {
    const tip = await getTip((await params).slug);
    return tip ? { title: tip.title, description: tip.fields.resumo } : { title: "Dica não encontrada" };
}

export default async function TipPage({ params }: PageProps<"/dicas/[slug]">) {
    const { slug } = await params;
    const tip = await getTip(slug);

    if (!tip) notFound();

    // "Pet relacionado" é um campo do tipo Referência: guarda o id de um post do tipo "pets".
    const [pet, tips] = await Promise.all([findPetById(tip.fields.pet_relacionado), getTips()]);
    const more = tips.filter((item) => item.id !== tip.id).slice(0, 3);

    return (
        <article className="container-site py-10">
            <Link href="/dicas" className="mb-6 inline-flex items-center gap-2 font-display font-semibold text-muted hover:text-brand">
                <ArrowLeftIcon /> Todas as dicas
            </Link>

            <header className="mx-auto max-w-3xl text-center">
                <span className="chip">{tip.fields.categoria}</span>
                <h1 className="title mt-3 sm:!text-5xl">{tip.title}</h1>
                <p className="mt-3 text-lg text-muted">{tip.fields.resumo}</p>
                <p className="mt-3 text-sm text-muted">
                    {tip.fields.autor && <>Por {tip.fields.autor} · </>}
                    {formatDate(tip.publishedAt)}
                </p>
            </header>

            <div className="relative mx-auto my-10 max-w-4xl overflow-hidden rounded-[2.5rem]">
                <img src={mediaUrl(tip.fields.capa)!} alt="" className="aspect-[16/9] w-full object-cover" />
                <PhotoCredit text={tip.fields.credito} url={tip.fields.credito_url} />
            </div>

            <Paragraphs text={tip.fields.conteudo} className="mx-auto max-w-2xl text-lg leading-relaxed" />

            {pet && (
                <aside className="mx-auto mt-14 max-w-sm">
                    <p className="eyebrow mb-3 text-center">Conheça quem inspirou esta dica</p>
                    <PetCard pet={pet} />
                </aside>
            )}

            {more.length > 0 && (
                <section className="mt-20">
                    <h2 className="title mb-8">Leia também</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {more.map((item) => (
                            <TipCard key={item.id} tip={item} />
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}
