/* eslint-disable @next/next/no-img-element -- imagens vêm do Nexus em localhost */
import type { Metadata } from "next";
import Link from "next/link";
import { HeartIcon, PawIcon } from "@/components/Icons";
import Paragraphs, { splitLines } from "@/components/Paragraphs";
import PhotoCredit from "@/components/PhotoCredit";
import { findPetById, getAbout, getTestimonials } from "@/lib/content";
import { mediaUrl } from "@/lib/nexus";

export const metadata: Metadata = { title: "Sobre nós" };

export default async function AboutPage() {
    const [about, testimonials] = await Promise.all([getAbout(), getTestimonials()]);
    const adoptions = await Promise.all(testimonials.map(async (item) => ({ item, pet: await findPetById(item.fields.adotado) })));

    return (
        <div className="container-site py-12">
            <section className="grid items-center gap-10 md:grid-cols-2">
                <div>
                    <p className="eyebrow">Sobre nós</p>
                    <h1 className="title mt-1 mb-4">{about?.titulo ?? "Sobre nós"}</h1>
                    <Paragraphs text={about?.texto} className="text-lg text-muted" />
                </div>
                {about?.imagem && (
                    <div className="relative overflow-hidden rounded-[2.5rem]">
                        <img src={mediaUrl(about.imagem)!} alt="Nossa loja" className="aspect-[4/3] w-full object-cover" />
                        <PhotoCredit text={about.imagem_credito} url={about.imagem_credito_url} />
                    </div>
                )}
            </section>

            <section className="mt-16 grid gap-6 md:grid-cols-2">
                {about?.missao && (
                    <div className="card p-8">
                        <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-2xl text-brand">
                            <HeartIcon />
                        </span>
                        <h2 className="mt-4 mb-2 font-display text-2xl font-bold">Nossa missão</h2>
                        <Paragraphs text={about.missao} className="text-lg text-muted" />
                    </div>
                )}
                {about?.valores && (
                    <div className="card p-8">
                        <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-2xl text-brand">
                            <PawIcon />
                        </span>
                        <h2 className="mt-4 mb-2 font-display text-2xl font-bold">No que acreditamos</h2>
                        <ul className="grid gap-2 text-lg">
                            {splitLines(about.valores).map((value) => (
                                <li key={value} className="flex items-start gap-2">
                                    <PawIcon className="mt-1.5 shrink-0 text-brand" /> {value}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {adoptions.length > 0 && (
                <section className="mt-16">
                    <p className="eyebrow">Depoimentos</p>
                    <h2 className="title mt-1 mb-8">O que dizem os tutores</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {adoptions.map(({ item, pet }) => (
                            <figure key={item.id} className="card grid content-between gap-4 p-6">
                                <blockquote className="text-lg">“{item.fields.texto}”</blockquote>
                                <figcaption className="text-sm text-muted">
                                    <strong className="font-display text-base text-ink">{item.fields.tutor}</strong> e {item.fields.pet}
                                    {item.fields.cidade && <> · {item.fields.cidade}</>}
                                    {pet && (
                                        <Link href={`/adote/${pet.slug}`} className="mt-2 block font-semibold text-brand hover:underline">
                                            Adotado aqui → conheça a história
                                        </Link>
                                    )}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
