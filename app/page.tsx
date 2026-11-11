/* eslint-disable @next/next/no-img-element -- imagens vêm do Nexus em localhost */
import Link from "next/link";
import { PetCard, SectionHeading, ServiceCard, TipCard } from "@/components/Cards";
import { ArrowRightIcon, HeartIcon, PawIcon } from "@/components/Icons";
import Paragraphs from "@/components/Paragraphs";
import PhotoCredit from "@/components/PhotoCredit";
import { getHome, getPets, getServices, getTestimonials, getTips } from "@/lib/content";
import { mediaUrl } from "@/lib/nexus";

export default async function Home() {
    const [home, pets, services, testimonials, tips] = await Promise.all([getHome(), getPets(), getServices(), getTestimonials(), getTips()]);
    const available = pets.filter((pet) => pet.fields.situacao !== "Adotado").slice(0, 3);
    const featured = services.filter((service) => service.fields.destaque);

    const stats = [
        { value: home?.pets_adotados, label: "pets adotados" },
        { value: home?.anos, label: "anos de história" },
        { value: home?.clientes, label: "clientes felizes" },
    ].filter((stat) => stat.value !== undefined);

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="container-site grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
                    <div className="grid gap-6">
                        <p className="chip justify-self-start !text-sm">
                            <PawIcon /> Pet shop & adoção responsável
                        </p>
                        <h1 className="font-display text-4xl leading-tight font-bold text-balance sm:text-5xl lg:text-6xl">
                            {home?.hero_titulo ?? "Cuidado e carinho para cada patinha"}
                        </h1>
                        <Paragraphs text={home?.hero_texto} className="max-w-xl text-lg text-muted" />
                        <div className="flex flex-wrap gap-3">
                            <Link href="/adote" className="btn btn-primary">
                                <HeartIcon /> {home?.hero_botao ?? "Quero adotar"}
                            </Link>
                            <Link href="/servicos#agendar" className="btn btn-ghost">
                                Agendar banho e tosa
                            </Link>
                        </div>
                        {stats.length > 0 && (
                            <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
                                {stats.map((stat) => (
                                    <div key={stat.label}>
                                        <dt className="sr-only">{stat.label}</dt>
                                        <dd>
                                            <span className="block font-display text-3xl font-bold text-brand">{stat.value!.toLocaleString("pt-BR")}+</span>
                                            <span className="text-sm text-muted">{stat.label}</span>
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>
                    {home?.hero_imagem && (
                        <div className="relative">
                            <div className="absolute -inset-4 -z-10 rotate-3 rounded-[3rem] bg-brand-soft" />
                            <div className="relative overflow-hidden rounded-[2.5rem] shadow-xl">
                                <img src={mediaUrl(home.hero_imagem)!} alt="Cachorro e gato felizes" className="aspect-[4/3] w-full object-cover" />
                                <PhotoCredit text={home.hero_credito} url={home.hero_credito_url} />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="container-site py-12">
                <SectionHeading
                    eyebrow="Adote"
                    title="Eles estão esperando por você"
                    text="Todos vacinados, vermifugados e com muito amor para dar."
                    action={
                        <Link href="/adote" className="btn btn-ghost">
                            Ver todos <ArrowRightIcon />
                        </Link>
                    }
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {available.map((pet) => (
                        <PetCard key={pet.id} pet={pet} />
                    ))}
                </div>
            </section>

            {featured.length > 0 && (
                <section className="container-site py-12">
                    <SectionHeading
                        eyebrow="Serviços"
                        title="Tudo que seu pet precisa"
                        action={
                            <Link href="/servicos" className="btn btn-ghost">
                                Todos os serviços <ArrowRightIcon />
                            </Link>
                        }
                    />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                </section>
            )}

            {testimonials.length > 0 && (
                <section className="bg-brand-soft py-16">
                    <div className="container-site">
                        <SectionHeading eyebrow="Depoimentos" title="Quem já passou por aqui" />
                        <div className="grid gap-6 md:grid-cols-3">
                            {testimonials.map((item) => (
                                <figure key={item.id} className="card grid content-between gap-4 p-6">
                                    <blockquote className="text-lg">“{item.fields.texto}”</blockquote>
                                    <figcaption className="text-sm text-muted">
                                        <strong className="font-display text-base text-ink">{item.fields.tutor}</strong> e {item.fields.pet}
                                        {item.fields.cidade && <> · {item.fields.cidade}</>}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {tips.length > 0 && (
                <section className="container-site py-16">
                    <SectionHeading
                        eyebrow="Dicas"
                        title="Do nosso blog"
                        action={
                            <Link href="/dicas" className="btn btn-ghost">
                                Ver dicas <ArrowRightIcon />
                            </Link>
                        }
                    />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tips.slice(0, 3).map((tip) => (
                            <TipCard key={tip.id} tip={tip} />
                        ))}
                    </div>
                </section>
            )}

            {home?.cta_titulo && (
                <section className="container-site">
                    <div className="grid gap-6 rounded-[2.5rem] bg-ink p-8 text-white sm:p-12 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                            <h2 className="font-display text-3xl font-bold">{home.cta_titulo}</h2>
                            <Paragraphs text={home.cta_texto} className="mt-2 max-w-2xl text-white/75" />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/doar" className="btn btn-primary">
                                Doar um pet
                            </Link>
                            <Link href="/contato?assunto=Voluntariado" className="btn border-2 border-white/25 hover:border-white">
                                Ser voluntário
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
