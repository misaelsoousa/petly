import type { Metadata } from "next";
import DynamicForm from "@/components/DynamicForm";
import { ChatIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { splitLines } from "@/components/Paragraphs";
import { getContact, whatsappLink } from "@/lib/content";
import { getForm } from "@/lib/nexus";

export const metadata: Metadata = { title: "Contato" };

export default async function ContactPage({ searchParams }: PageProps<"/contato">) {
    const { assunto } = await searchParams;
    const [contact, form] = await Promise.all([getContact(), getForm("contato")]);
    const whatsapp = whatsappLink(contact?.whatsapp, "Olá! Vim pelo site.");

    return (
        <div className="container-site py-12">
            <header className="mb-10 max-w-2xl">
                <p className="eyebrow">Contato</p>
                <h1 className="title mt-1">Fale com a gente</h1>
                <p className="mt-2 text-lg text-muted">Dúvidas sobre adoção, serviços ou quer ser voluntário? Mande uma mensagem.</p>
            </header>

            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
                {contact && (
                    <aside className="grid content-start gap-4">
                        {[
                            { icon: <PinIcon />, title: "Endereço", content: contact.endereco, href: contact.mapa },
                            { icon: <PhoneIcon />, title: "Telefone", content: contact.telefone, href: `tel:${contact.telefone.replace(/\D/g, "")}` },
                            { icon: <ChatIcon />, title: "WhatsApp", content: contact.whatsapp, href: whatsapp ?? undefined },
                            { icon: <MailIcon />, title: "E-mail", content: contact.email, href: `mailto:${contact.email}` },
                        ]
                            .filter((item) => item.content)
                            .map((item) => (
                                <div key={item.title} className="card flex gap-4 p-5">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xl text-brand">{item.icon}</span>
                                    <div>
                                        <p className="font-display font-semibold">{item.title}</p>
                                        {item.href ? (
                                            <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-muted hover:text-brand">
                                                {item.content}
                                            </a>
                                        ) : (
                                            <p className="text-muted">{item.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        {contact.horario && (
                            <div className="card flex gap-4 p-5">
                                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xl text-brand">
                                    <ClockIcon />
                                </span>
                                <div>
                                    <p className="font-display font-semibold">Horários</p>
                                    <ul className="text-muted">
                                        {splitLines(contact.horario).map((line) => (
                                            <li key={line}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </aside>
                )}

                {form && (
                    <DynamicForm
                        form={form}
                        initial={typeof assunto === "string" ? { assunto } : {}}
                        submitLabel="Enviar mensagem"
                        successTitle="Mensagem enviada!"
                        successText="Respondemos em até 1 dia útil."
                    />
                )}
            </div>
        </div>
    );
}
