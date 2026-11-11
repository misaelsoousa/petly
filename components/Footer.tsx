import { type ContactFields, whatsappLink } from "@/lib/content";
import { ChatIcon, ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PawIcon, PhoneIcon, PinIcon } from "./Icons";
import NewsletterForm from "./NewsletterForm";
import { splitLines } from "./Paragraphs";

export default function Footer({ contact }: { contact: ContactFields | null }) {
    const whatsapp = whatsappLink(contact?.whatsapp);

    return (
        <footer className="mt-24 bg-ink text-white/85">
            <div className="container-site grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
                <div className="grid content-start gap-4">
                    <p className="flex items-center gap-2 font-display text-2xl font-bold text-white">
                        <span className="grid size-9 place-items-center rounded-full bg-brand text-white">
                            <PawIcon className="size-5" />
                        </span>
                        {contact?.nome_loja ?? "Petly Pet Shop"}
                    </p>
                    <p className="max-w-sm text-white/70">Cuidado de verdade para o seu pet e um lar cheio de amor para quem ainda está esperando.</p>
                    <div className="max-w-sm [&_.input]:border-white/15 [&_.input]:bg-white/10 [&_.input]:text-white [&_.input]:placeholder:text-white/50">
                        <NewsletterForm />
                    </div>
                </div>

                {contact && (
                    <ul className="grid content-start gap-3">
                        <li className="mb-1 font-display text-lg font-semibold text-white">Contato</li>
                        <li className="flex gap-2">
                            <PinIcon className="mt-1 shrink-0" />
                            {contact.endereco}
                        </li>
                        <li>
                            <a className="flex items-center gap-2 hover:text-white" href={`tel:${contact.telefone.replace(/\D/g, "")}`}>
                                <PhoneIcon /> {contact.telefone}
                            </a>
                        </li>
                        {whatsapp && (
                            <li>
                                <a className="flex items-center gap-2 hover:text-white" href={whatsapp} target="_blank" rel="noreferrer">
                                    <ChatIcon /> {contact.whatsapp}
                                </a>
                            </li>
                        )}
                        <li>
                            <a className="flex items-center gap-2 hover:text-white" href={`mailto:${contact.email}`}>
                                <MailIcon /> {contact.email}
                            </a>
                        </li>
                    </ul>
                )}

                <div className="grid content-start gap-3">
                    {contact?.horario && (
                        <>
                            <p className="mb-1 font-display text-lg font-semibold text-white">Horários</p>
                            <ul className="grid gap-1">
                                {splitLines(contact.horario).map((line) => (
                                    <li key={line} className="flex items-center gap-2">
                                        <ClockIcon className="shrink-0" /> {line}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <div className="mt-3 flex gap-2">
                        {contact?.instagram && (
                            <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-full bg-white/10 text-lg hover:bg-brand">
                                <InstagramIcon />
                            </a>
                        )}
                        {contact?.facebook && (
                            <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid size-10 place-items-center rounded-full bg-white/10 text-lg hover:bg-brand">
                                <FacebookIcon />
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="container-site flex flex-wrap justify-between gap-2 py-5 text-sm text-white/55">
                    <p>© {new Date().getFullYear()} {contact?.nome_loja ?? "Petly Pet Shop"}</p>
                    <p>
                        Conteúdo gerenciado pelo{" "}
                        <a href="/admin" className="underline hover:text-white">
                            Nexus CMS
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
