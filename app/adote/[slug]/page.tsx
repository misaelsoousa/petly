/* eslint-disable @next/next/no-img-element -- imagens vêm do Nexus em localhost */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PetCard, StatusBadge } from "@/components/Cards";
import DynamicForm from "@/components/DynamicForm";
import { ArrowLeftIcon, CheckIcon, XIcon } from "@/components/Icons";
import Paragraphs from "@/components/Paragraphs";
import PhotoCredit from "@/components/PhotoCredit";
import { formatDate, getPet, getPets } from "@/lib/content";
import { getForm, mediaUrl } from "@/lib/nexus";

export async function generateMetadata({ params }: PageProps<"/adote/[slug]">): Promise<Metadata> {
    const pet = await getPet((await params).slug);
    if (!pet) return { title: "Pet não encontrado" };

    return {
        title: `${pet.title} para adoção`,
        description: `${pet.fields.especie} ${pet.fields.sexo.toLowerCase()}, ${pet.fields.idade}, porte ${pet.fields.porte.toLowerCase()}.`,
    };
}

export default async function PetPage({ params }: PageProps<"/adote/[slug]">) {
    const { slug } = await params;
    const [pet, form, pets] = await Promise.all([getPet(slug), getForm("adocao"), getPets()]);

    if (!pet) notFound();

    const { fields } = pet;
    const others = pets.filter((item) => item.id !== pet.id && item.fields.situacao === "Disponível" && item.fields.especie === fields.especie).slice(0, 3);
    const canAdopt = fields.situacao !== "Adotado";

    const facts = [
        { label: "Espécie", value: fields.especie },
        { label: "Sexo", value: fields.sexo },
        { label: "Idade", value: fields.idade },
        { label: "Porte", value: fields.porte },
        { label: "Raça", value: fields.raca },
        { label: "Peso", value: fields.peso ? `${fields.peso.toLocaleString("pt-BR")} kg` : undefined },
        { label: "No abrigo desde", value: formatDate(fields.chegada) },
    ].filter((fact) => fact.value);

    const health = [
        { label: "Vacinado", ok: fields.vacinado },
        { label: "Castrado", ok: fields.castrado },
        { label: "Vermifugado", ok: fields.vermifugado },
    ];

    return (
        <div className="container-site py-10">
            <Link href="/adote" className="mb-6 inline-flex items-center gap-2 font-display font-semibold text-muted hover:text-brand">
                <ArrowLeftIcon /> Todos os pets
            </Link>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
                <div className="relative self-start overflow-hidden rounded-[2.5rem]" style={{ backgroundColor: fields.cor ?? "var(--brand-soft)" }}>
                    <img src={mediaUrl(fields.foto)!} alt={`Foto de ${pet.title}`} className="aspect-[4/3] w-full object-cover" />
                    <PhotoCredit text={fields.credito} url={fields.credito_url} />
                </div>

                <div className="grid content-start gap-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-5xl font-bold">{pet.title}</h1>
                        <StatusBadge status={fields.situacao} />
                    </div>

                    {fields.temperamento && (
                        <ul className="flex flex-wrap gap-2">
                            {fields.temperamento.split(",").map((trait) => (
                                <li key={trait} className="chip !text-sm">
                                    {trait.trim()}
                                </li>
                            ))}
                        </ul>
                    )}

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {facts.map((fact) => (
                            <div key={fact.label} className="card p-3">
                                <dt className="text-xs font-bold text-muted uppercase">{fact.label}</dt>
                                <dd className="font-display text-lg font-semibold">{fact.value}</dd>
                            </div>
                        ))}
                    </dl>

                    <ul className="flex flex-wrap gap-2" aria-label="Saúde">
                        {health.map((item) => (
                            <li key={item.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${item.ok ? "bg-leaf/15 text-leaf" : "bg-line text-muted"}`}>
                                {item.ok ? <CheckIcon /> : <XIcon />} {item.label}
                            </li>
                        ))}
                    </ul>

                    <section>
                        <h2 className="mb-2 font-display text-2xl font-bold">Minha história</h2>
                        <Paragraphs text={fields.historia} className="text-lg text-muted" />
                    </section>
                </div>
            </div>

            <section id="adotar" className="mx-auto mt-16 max-w-3xl scroll-mt-24">
                {canAdopt && form ? (
                    <>
                        <p className="eyebrow">Solicitação de adoção</p>
                        <h2 className="title mt-1 mb-2">Quero adotar {fields.sexo === "Fêmea" ? "a" : "o"} {pet.title}</h2>
                        <p className="mb-6 text-muted">
                            {fields.situacao === "Reservado"
                                ? `${pet.title} já tem uma adoção em andamento, mas você pode entrar na lista de espera.`
                                : "Responda algumas perguntas sobre você e sua casa. Nossa equipe entra em contato em até 2 dias úteis."}
                        </p>
                        <DynamicForm
                            form={form}
                            initial={{ pet: `${pet.title} (${pet.slug})` }}
                            hidden={["pet"]}
                            submitLabel="Enviar solicitação"
                            successTitle="Solicitação enviada!"
                            successText={`Obrigado por querer dar um lar para ${pet.title}. Vamos te chamar em breve para conversar.`}
                        />
                    </>
                ) : (
                    <div className="card p-8 text-center">
                        <p className="font-display text-2xl font-bold">{pet.title} já encontrou uma família 💛</p>
                        <p className="mt-2 text-muted">Mas temos outros amigos esperando por você.</p>
                    </div>
                )}
            </section>

            {others.length > 0 && (
                <section className="mt-20">
                    <h2 className="title mb-8">Outros {fields.especie === "Gato" ? "gatinhos" : "cãezinhos"} para adoção</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {others.map((item) => (
                            <PetCard key={item.id} pet={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
