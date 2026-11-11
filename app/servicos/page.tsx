/* eslint-disable @next/next/no-img-element -- imagens vêm do Nexus em localhost */
import type { Metadata } from "next";
import DynamicForm from "@/components/DynamicForm";
import { ClockIcon } from "@/components/Icons";
import Paragraphs from "@/components/Paragraphs";
import PhotoCredit from "@/components/PhotoCredit";
import { formatPrice, getServices } from "@/lib/content";
import { getForm, mediaUrl } from "@/lib/nexus";

export const metadata: Metadata = {
    title: "Serviços",
    description: "Banho, tosa, consulta veterinária, hotelzinho e adestramento.",
};

export default async function ServicesPage({ searchParams }: PageProps<"/servicos">) {
    const { servico } = await searchParams;
    const [services, form] = await Promise.all([getServices(), getForm("agendamento")]);
    const selected = typeof servico === "string" ? servico : undefined;

    return (
        <div className="container-site py-12">
            <header className="mb-10 max-w-2xl">
                <p className="eyebrow">Serviços</p>
                <h1 className="title mt-1">Cuidado completo, do banho à consulta</h1>
                <p className="mt-2 text-lg text-muted">Profissionais carinhosos, produtos de qualidade e horário marcado para seu pet não ficar esperando.</p>
            </header>

            <div className="grid gap-6">
                {services.map((service, index) => (
                    <article key={service.id} className="card grid overflow-hidden md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        <div className="relative">
                            <img src={mediaUrl(service.fields.imagem)!} alt="" loading={index < 2 ? "eager" : "lazy"} className="aspect-[4/3] size-full object-cover md:aspect-auto" />
                            <PhotoCredit text={service.fields.credito} url={service.fields.credito_url} />
                        </div>
                        <div className="grid content-center gap-3 p-6 sm:p-8">
                            <h2 className="font-display text-3xl font-bold">{service.title}</h2>
                            <p className="text-lg font-semibold">{service.fields.resumo}</p>
                            <Paragraphs text={service.fields.descricao} className="text-muted" />
                            <div className="mt-2 flex flex-wrap items-center gap-4">
                                {service.fields.preco !== undefined && (
                                    <p>
                                        a partir de <strong className="font-display text-2xl text-brand">{formatPrice(service.fields.preco)}</strong>
                                    </p>
                                )}
                                {service.fields.duracao && (
                                    <p className="inline-flex items-center gap-1.5 text-muted">
                                        <ClockIcon /> {service.fields.duracao}
                                    </p>
                                )}
                                <a href={`/servicos?servico=${encodeURIComponent(service.title)}#agendar`} className="btn btn-primary ml-auto">
                                    Agendar {service.title.toLowerCase()}
                                </a>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {form && (
                <section id="agendar" className="mx-auto mt-16 max-w-3xl scroll-mt-24">
                    <p className="eyebrow">Agendamento</p>
                    <h2 className="title mt-1 mb-2">Agende um horário</h2>
                    <p className="mb-6 text-muted">Escolha o serviço e a data. Confirmamos o horário exato pelo WhatsApp.</p>
                    <DynamicForm
                        key={selected ?? "nenhum"}
                        form={form}
                        initial={selected ? { servico: selected } : {}}
                        submitLabel="Solicitar agendamento"
                        successTitle="Pedido de agendamento enviado!"
                        successText="Vamos confirmar o horário com você pelo WhatsApp em breve."
                    />
                </section>
            )}
        </div>
    );
}
